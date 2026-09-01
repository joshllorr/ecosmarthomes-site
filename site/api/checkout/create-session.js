/**
 * /api/checkout/create-session.js
 * Serverless API endpoint to create Stripe Checkout Sessions with dynamic 2026 pricing tiers
 */

const TIER_PRICES = {
  'survey': { name: 'Home Energy Diagnostic Survey (On-Site)', amount: 14900, desc: 'Full 32-county on-site inspection, SR50-2 radiator sizing & 12-page roadmap.' },
  'masterplan': { name: 'Full Retrofit Masterplan (Full House)', amount: 29900, desc: 'Deep retrofit advisory, Solar PV geocoding, battery arbitrage & tender RFP.' },
  'tender': { name: 'Heat Pump Compliance & Tender Pack', amount: 19900, desc: 'Independent quote red-lining, SR50-2 compliance check & milestone contract template.' },
  'installer': { name: 'Installer Radiator & Heat Loss Pack (Digital)', amount: 4900, desc: 'Digital room-by-room heat loss & radiator sizing spec sheet (24-48h turnaround).' },
  'ber-report': { name: 'BER Upgrade Simulator Report (Digital)', amount: 2900, desc: 'Instant 8-band BER uplift simulation, property equity surge & green mortgage savings.' },
  'solar-report': { name: 'Solar PV + Battery Yield Report (Digital)', amount: 2900, desc: 'Instant regional solar yield, CEG 24c/kWh export income & battery ROI timeline.' },
  'estate-agent': { name: 'Estate Agent Energy Pack', amount: 9900, desc: 'Listing-ready marketing summary and buyer upgrade roadmap.' },
  'developer-audit': { name: 'Developer Pre-Retrofit Audit', amount: 49900, desc: 'Full building engineering audit and NZEB Part L zero-emission roadmap.' }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { property_profile, financials, scanner_data, customer, tier = 'survey' } = req.body || {};

    const tierConfig = TIER_PRICES[tier] || TIER_PRICES['survey'];

    const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
    
    if (STRIPE_KEY) {
      const stripe = require('stripe')(STRIPE_KEY);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'eur',
            product_data: {
              name: tierConfig.name,
              description: tierConfig.desc,
            },
            unit_amount: tierConfig.amount,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `https://www.ecosmarthomes.ie/checkout/thank-you.html?session_id={CHECKOUT_SESSION_ID}&tier=${tier}`,
        cancel_url: 'https://www.ecosmarthomes.ie/pricing/',
        customer_email: customer?.email || undefined,
        metadata: {
          tier: tier,
          package_name: tierConfig.name,
          customer_name: customer?.full_name || 'Homeowner',
          customer_phone: customer?.phone_number || '',
          customer_county: customer?.county || 'Ireland',
          property_archetype: property_profile?.archetype || 'semi-detached',
          ber_start: property_profile?.ber_start || 'D',
          boiler_image: scanner_data?.boiler_image_url || 'none'
        }
      });

      return res.status(200).json({ id: session.id, url: session.url });
    }

    // Direct success URL fallback if STRIPE_SECRET_KEY not mounted in environment
    const directUrl = `/checkout/thank-you.html?name=${encodeURIComponent(customer?.full_name || 'Homeowner')}&tier=${tier}&eircode=${encodeURIComponent(customer?.county || 'Ireland')}&price=${(tierConfig.amount / 100).toFixed(2)}`;
    return res.status(200).json({ id: 'DIRECT-RESERVE', url: directUrl });

  } catch (err) {
    console.error('Stripe session creation error:', err);
    return res.status(500).json({ error: 'Checkout session initialization failed: ' + err.message });
  }
}
