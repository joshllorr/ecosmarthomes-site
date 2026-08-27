/**
 * /api/checkout/create-session.js
 * Serverless API endpoint to create Stripe Checkout Sessions with survey metadata
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_live_dummy_placeholder');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { property_profile, financials, scanner_data, customer } = req.body || {};

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Independent Retrofit Roadmap & Survey',
            description: '100% Conflict-Free Energy Assessment completed by Joe.',
          },
          unit_amount: 4900, // €49.00 in cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://www.ecosmarthomes.ie/checkout/thank-you.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://www.ecosmarthomes.ie/checkout/order.html',
      customer_email: customer?.email || undefined,
      metadata: {
        customer_name: customer?.full_name || 'Homeowner',
        customer_phone: customer?.phone_number || '',
        customer_county: customer?.county || 'Ireland',
        property_archetype: property_profile?.archetype || 'semi-detached',
        ber_start: property_profile?.ber_start || 'D',
        annual_bill: (financials?.annual_heating_bill || 3500).toString(),
        estimated_savings: (financials?.estimated_savings || 2850).toString(),
        eligible_grants: (financials?.eligible_grants || 18500).toString(),
        boiler_image: scanner_data?.boiler_image_url || 'none'
      }
    });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (err) {
    console.error('Stripe session creation error:', err);
    return res.status(500).json({ error: 'Checkout session initialization failed: ' + err.message });
  }
}
