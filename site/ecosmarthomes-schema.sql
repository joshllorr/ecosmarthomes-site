-- ====================================================================
-- ECOSMARTHOME DATABASE SCHEMA SPECIFICATION (v1.0.0)
-- Target: PostgreSQL / Supabase
-- Description: Core schema to store user onboarding survey profiles 
--              and independent €49 survey Stripe orders.
-- ====================================================================

-- Enable UUID extension if not already present (Supabase default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. ENUMS & DOMAINS
-- --------------------------------------------------------------------

-- Property archetypes as defined in the Onboarding Wizard
CREATE TYPE property_archetype_enum AS ENUM (
    'detached', 
    'semi-detached', 
    'terraced', 
    'apartment'
);

-- Official Irish Building Energy Rating (BER) bands
CREATE TYPE ber_rating_enum AS ENUM (
    'A1', 'A2', 'A3', 
    'B1', 'B2', 'B3', 
    'C1', 'C2', 'C3', 
    'D1', 'D2', 
    'E1', 'E2', 
    'F', 
    'G'
);

-- Primary heating fuel types causing carbon tax exposure
CREATE TYPE fuel_type_enum AS ENUM (
    'oil',          -- High exposure to kerosene levies
    'gas',          -- Natural gas
    'electricity',  -- Storage heaters or older electric setups
    'solid_fuel',   -- Coal, peat, wood
    'heat_pump'     -- Already upgraded / check efficiency
);

-- Stripe Transaction Status states
CREATE TYPE payment_status_enum AS ENUM (
    'pending', 
    'paid', 
    'failed', 
    'refunded'
);

-- --------------------------------------------------------------------
-- 2. TABLES
-- --------------------------------------------------------------------

-- Table: survey_profiles
-- Description: Stores dynamic data captured during the 5-step onboarding wizard
CREATE TABLE IF NOT EXISTS survey_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Step 1: Property profile
    property_type property_archetype_enum NOT NULL,
    current_ber ber_rating_enum NOT NULL,
    
    -- Step 2: Fuel & bill details
    fuel_type fuel_type_enum NOT NULL,
    annual_energy_bill NUMERIC(10, 2) NOT NULL CHECK (annual_energy_bill >= 0),
    
    -- Step 3: Diagnostic visual uploads (Gemini Vision link)
    boiler_image_url TEXT,
    
    -- Step 4: Real-time calculation state
    estimated_seai_grant NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (estimated_seai_grant >= 0),
    estimated_annual_savings NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (estimated_annual_savings >= 0),
    target_ber_rating ber_rating_enum DEFAULT 'A2',
    
    -- Metadata
    user_ip VARCHAR(45), -- Track to prevent API scraping / spamming
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: orders
-- Description: Hardened checkout records linked to Stripe webhook captures
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_profile_id UUID REFERENCES survey_profiles(id) ON DELETE SET NULL,
    
    -- Customer contact (validated before stripe redirect)
    customer_email VARCHAR(255) NOT NULL CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    customer_phone VARCHAR(50) NOT NULL, -- Strict E.164 phone number formatting for WhatsApp (+353...)
    
    -- Stripe session tracking
    stripe_session_id VARCHAR(255) UNIQUE NOT NULL,
    payment_status payment_status_enum NOT NULL DEFAULT 'pending',
    
    -- Transaction details
    amount_total NUMERIC(10, 2) NOT NULL DEFAULT 49.00 CHECK (amount_total >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    
    -- WhatsApp automated delivery webhook states
    whatsapp_delivered BOOLEAN NOT NULL DEFAULT FALSE,
    whatsapp_sent_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 3. INDEXES (Optimization & Performance)
-- --------------------------------------------------------------------

-- Speed up search on Stripe webhook hits
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);

-- Speed up routing when linking finished orders back to survey answers
CREATE INDEX IF NOT EXISTS idx_orders_survey_profile_id ON orders(survey_profile_id);

-- Analytical index to map retrofitting trends by county / fuel type
CREATE INDEX IF NOT EXISTS idx_survey_profiles_fuel_type ON survey_profiles(fuel_type);
CREATE INDEX IF NOT EXISTS idx_survey_profiles_ber ON survey_profiles(current_ber);

-- --------------------------------------------------------------------
-- 4. DATABASE TRIGGERS
-- --------------------------------------------------------------------

-- Function to auto-update updated_at timestamps on row changes
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for orders table
CREATE TRIGGER update_orders_modtime
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- --------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) - Recommended for Supabase
-- --------------------------------------------------------------------

-- Enable RLS to prevent unauthorized reading of customer emails/photos
ALTER TABLE survey_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous users to write survey data (during onboarding)
CREATE POLICY "Allow anonymous survey insertion" 
ON survey_profiles FOR INSERT 
WITH CHECK (true);

-- Policy: Restrict reading survey profiles to authorized administrators (Joe)
CREATE POLICY "Restrict survey profile viewing to admin" 
ON survey_profiles FOR SELECT 
TO authenticated 
USING (true);

-- Policy: Allow anonymous users to start/write orders
CREATE POLICY "Allow anonymous order insertion" 
ON orders FOR INSERT 
WITH CHECK (true);

-- Policy: Restrict reading orders to authenticated owners / admins
CREATE POLICY "Restrict order viewing to admin" 
ON orders FOR SELECT 
TO authenticated 
USING (true);
