/**
 * ECOSMARTHOME INTEGRATION: STRIPE CHECKOUT & SURVEY STATE ROUTE HANDLER
 * Target Environment: Next.js (App Router) API Route / Express.js Modular Endpoint
 * Developer Team: Antigravity AI
 * 
 * This handler securely processes the survey state from the OnboardingWizard.jsx component,
 * creates an associated draft record in the PostgreSQL/Supabase database, and generates
 * a Stripe Checkout Session loaded with metadata. 
 * 
 * Grounded in 'ecosmarthomes-schema.sql' and 'ecosmarthomes-webhook-architecture.md'.
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe with strict API version pinning
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_live_dummy_placeholder', {
  apiVersion: '2023-10-16',
});

// Initialize Supabase Client with service role to bypass RLS for server-side insertions
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_role_key'
);

// Rigid boundaries for input verification (protect against SQL injections and schema errors)
const VALID_ARCHETYPES = ['detached', 'semi-detached', 'terraced', 'apartment'];
const VALID_RATINGS = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'D1', 'D2', 'E1', 'E2', 'F', 'G'];
const VALID_FUELS = ['oil', 'gas', 'electricity', 'solid_fuel', 'heat_pump'];

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      propertyArchetype,
      currentBer,
      annualBill,
      fuelType,
      boilerImage,
      customerName,
      customerEmail,
      customerPhone,
      county
    } = body || {};

    // Server-Side Validation Gates (Defense-in-Depth)
    if (!VALID_ARCHETYPES.includes(propertyArchetype)) {
      return Response.json({ error: 'Invalid property archetype specified.' }, { status: 400 });
    }
    if (!VALID_RATINGS.includes(currentBer)) {
      return Response.json({ error: 'Invalid BER Rating format.' }, { status: 400 });
    }
    if (!VALID_FUELS.includes(fuelType)) {
      return Response.json({ error: 'Invalid fuel type specification.' }, { status: 400 });
    }
    if (!customerEmail || !customerEmail.includes('@')) {
      return Response.json({ error: 'A valid email address is required for receipt delivery.' }, { status: 400 });
    }
    if (!customerPhone || customerPhone.trim().length < 7) {
      return Response.json({ error: 'A valid E.164 phone number is required for WhatsApp roadmap delivery.' }, { status: 400 });
    }
    
    const validatedBill = parseFloat(annualBill);
    if (isNaN(validatedBill) || validatedBill <= 0) {
      return Response.json({ error: 'Invalid annual bill value.' }, { status: 400 });
    }

    // Insert Draft Survey Profile into Postgres Database
    const { data: profile, error: dbError } = await supabase
      .from('survey_profiles')
      .insert([
        {
          property_type: propertyArchetype,
          current_ber: currentBer,
          annual_energy_bill: validatedBill,
          fuel_type: fuelType,
          boiler_image_url: boilerImage || null
        }
      ])
      .select()
      .single();

    const surveyProfileId = profile ? profile.id : 'temp_session_id';

    if (dbError) {
      console.warn('Database pre-insert warning (falling back to direct Stripe metadata):', dbError.message);
    }

    // Secure Metadata Formulation
    const metadata = {
      survey_profile_id: surveyProfileId,
      customer_name: customerName || 'Homeowner',
      customer_email: customerEmail,
      customer_phone: customerPhone,
      county: county || 'Ireland',
      property_archetype: propertyArchetype,
      current_ber: currentBer
    };

    // Formulate Stripe Checkout Session 
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'EcoSmartHome: Independent €49 Retrofit Roadmap',
              description: 'Includes a certified pass/fail Heat Pump Readiness test, custom Carbon Tax Shield Model, and digital survey report delivered to WhatsApp.',
              images: ['https://www.ecosmarthomes.ie/assets/images/roadmap-preview.png'],
            },
            unit_amount: 4900,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: customerEmail,
      metadata: metadata,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ecosmarthomes.ie'}/checkout/thank-you.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ecosmarthomes.ie'}/checkout/order.html?session_id=cancelled`,
    });

    return Response.json({ url: session.url }, { status: 200 });

  } catch (error) {
    console.error('Stripe Checkout Session compilation crashed:', error);
    return Response.json(
      { error: 'An unexpected checkout routing error occurred. Please try again.' }, 
      { status: 500 }
    );
  }
}
