/**
 * Serverless Telemetry Ingest Endpoint
 * Path: /api/analytics/track-step
 * 
 * Lightweight, high-throughput endpoint designed to receive telemetry beacons
 * from the Onboarding Wizard without blocking frontend UI interactions.
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

module.exports = async (req, res) => {
  // CORS & Preflight Handling
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let payload = req.body;

    // Handle text/plain payloads from navigator.sendBeacon
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch (parseErr) {
        // Fallback if not standard JSON
      }
    }

    const {
      sessionId,
      step,
      action = 'step_viewed',
      metadata = {},
      timeSpentSeconds = 0,
      deviceType = 'desktop'
    } = payload || {};

    if (!sessionId || !step) {
      return res.status(400).json({ error: 'Missing required sessionId or step parameter' });
    }

    // Map numerical steps or string names to database enum values
    const stepEnumMap = {
      1: 'step_1_profile',
      2: 'step_2_fuel_exposure',
      3: 'step_3_vision_scanner',
      4: 'step_4_grant_forecast',
      5: 'step_5_checkout_order',
      'step_1_profile': 'step_1_profile',
      'step_2_fuel_exposure': 'step_2_fuel_exposure',
      'step_3_vision_scanner': 'step_3_vision_scanner',
      'step_4_grant_forecast': 'step_4_grant_forecast',
      'step_5_checkout_order': 'step_5_checkout_order'
    };

    const mappedStep = stepEnumMap[step] || 'step_1_profile';

    // Insert into Supabase if configured
    if (supabase) {
      const { error: dbError } = await supabase
        .from('wizard_funnel_events')
        .insert([
          {
            session_id: sessionId,
            step: mappedStep,
            action: action,
            metadata: metadata,
            time_spent_seconds: parseFloat(timeSpentSeconds) || 0,
            device_type: deviceType
          }
        ]);

      if (dbError) {
        console.warn('Telemetry DB write warning:', dbError.message);
      }
    }

    // Return 204 No Content for ultra-fast beacon acknowledgment
    return res.status(204).end();
  } catch (err) {
    console.error('Funnel telemetry error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
