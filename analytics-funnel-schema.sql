-- ==============================================================================
-- EcoSmartHome: Lightweight Onboarding Funnel Analytics & Drop-off Tracker
-- ==============================================================================
-- Designed for PostgreSQL & Supabase to track Step 1 -> Step 5 conversion drop-offs.
-- Privacy-first: Uses ephemeral session UUIDs with no PII stored until checkout.

-- 1. Create Enums for Funnel Steps and Event Types
DO $$ BEGIN
    CREATE TYPE wizard_step_enum AS ENUM (
        'step_1_profile',
        'step_2_fuel_exposure',
        'step_3_vision_scanner',
        'step_4_grant_forecast',
        'step_5_checkout_order'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE funnel_action_enum AS ENUM (
        'step_viewed',
        'step_completed',
        'photo_uploaded',
        'stripe_cta_clicked',
        'wizard_abandoned'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create the Funnel Events Table
CREATE TABLE IF NOT EXISTS public.wizard_funnel_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    step wizard_step_enum NOT NULL,
    action funnel_action_enum NOT NULL DEFAULT 'step_viewed',
    
    -- Diagnostic context collected up to this step (anonymized metadata)
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Engagement telemetry
    time_spent_seconds NUMERIC(6, 2) DEFAULT 0,
    device_type VARCHAR(20) DEFAULT 'desktop', -- 'mobile', 'tablet', 'desktop'
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for rapid aggregation queries by session and step
CREATE INDEX IF NOT EXISTS idx_funnel_session_step ON public.wizard_funnel_events (session_id, step, action);
CREATE INDEX IF NOT EXISTS idx_funnel_created_at ON public.wizard_funnel_events (created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.wizard_funnel_events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts via public API key (write-only for telemetry)
CREATE POLICY "Allow public telemetry ingestion" 
    ON public.wizard_funnel_events 
    FOR INSERT 
    TO anon, authenticated 
    WITH CHECK (true);

-- Restrict read access to service role / dashboard admins
CREATE POLICY "Admins can view funnel metrics" 
    ON public.wizard_funnel_events 
    FOR SELECT 
    TO service_role 
    USING (true);

-- ==============================================================================
-- 3. Real-Time Conversion & Drop-off Analytics View for Joe
-- ==============================================================================
CREATE OR REPLACE VIEW public.v_wizard_conversion_funnel AS
WITH step_counts AS (
    SELECT 
        COUNT(DISTINCT session_id) FILTER (WHERE step = 'step_1_profile' AND action IN ('step_viewed', 'step_completed')) AS s1_views,
        COUNT(DISTINCT session_id) FILTER (WHERE step = 'step_2_fuel_exposure' AND action IN ('step_viewed', 'step_completed')) AS s2_views,
        COUNT(DISTINCT session_id) FILTER (WHERE step = 'step_3_vision_scanner' AND action IN ('step_viewed', 'step_completed')) AS s3_views,
        COUNT(DISTINCT session_id) FILTER (WHERE step = 'step_4_grant_forecast' AND action IN ('step_viewed', 'step_completed')) AS s4_views,
        COUNT(DISTINCT session_id) FILTER (WHERE step = 'step_5_checkout_order' AND action IN ('step_viewed', 'step_completed')) AS s5_views,
        COUNT(DISTINCT session_id) FILTER (WHERE action = 'stripe_cta_clicked') AS checkout_clicks
    FROM public.wizard_funnel_events
)
SELECT 
    s1_views AS step_1_property_profile_users,
    s2_views AS step_2_fuel_tax_users,
    ROUND(100.0 * s2_views / NULLIF(s1_views, 0), 1) AS s1_to_s2_retention_pct,
    
    s3_views AS step_3_gemini_scanner_users,
    ROUND(100.0 * s3_views / NULLIF(s2_views, 0), 1) AS s2_to_s3_retention_pct,
    
    s4_views AS step_4_seai_payback_users,
    ROUND(100.0 * s4_views / NULLIF(s3_views, 0), 1) AS s3_to_s4_retention_pct,
    
    s5_views AS step_5_roadmap_offer_users,
    ROUND(100.0 * s5_views / NULLIF(s4_views, 0), 1) AS s4_to_s5_retention_pct,
    
    checkout_clicks AS stripe_49_cta_clicks,
    ROUND(100.0 * checkout_clicks / NULLIF(s1_views, 0), 1) AS total_funnel_conversion_pct
FROM step_counts;

-- ==============================================================================
-- 4. Step Drop-off Bottleneck Finder View
-- ==============================================================================
CREATE OR REPLACE VIEW public.v_wizard_dropoff_bottlenecks AS
SELECT 
    step,
    COUNT(DISTINCT session_id) AS total_sessions_entered,
    COUNT(DISTINCT session_id) FILTER (WHERE action = 'step_completed') AS completed_sessions,
    COUNT(DISTINCT session_id) FILTER (WHERE action = 'wizard_abandoned') AS explicit_exits,
    AVG(time_spent_seconds) FILTER (WHERE time_spent_seconds > 0) AS avg_time_spent_seconds
FROM public.wizard_funnel_events
GROUP BY step
ORDER BY step;
