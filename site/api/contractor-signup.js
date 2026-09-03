/**
 * /api/contractor-signup.js
 * Vercel Serverless Function: SEAI Contractor Lead Network Registration
 */

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
    const {
      companyName,
      contactPerson,
      email,
      phone,
      seaiNumber,
      trades = [],
      counties = [],
      pricingTier = 'pro'
    } = req.body || {};

    if (!companyName || !email || !phone) {
      return res.status(400).json({ error: 'Company name, email, and phone number are required.' });
    }

    const partnerId = 'SEAI-' + Math.floor(100000 + Math.random() * 900000);
    const timestamp = new Date().toISOString();

    console.log(`[Contractor Signup] New SEAI Installer Partner Registered: ${companyName} (${partnerId}) in ${counties.join(', ')}`);

    // Prepare response payload
    const partnerData = {
      partnerId,
      companyName,
      contactPerson: contactPerson || companyName,
      email,
      phone,
      seaiNumber: seaiNumber || 'Pending Verification',
      trades,
      counties,
      pricingTier,
      status: 'Active · Onboarding Verified',
      registeredAt: timestamp
    };

    return res.status(200).json({
      success: true,
      message: `Thank you, ${contactPerson || companyName}! Your installer application has been received. Our team will verify your SEAI registration and configure your lead feed within 4 business hours.`,
      data: partnerData
    });

  } catch (err) {
    console.error('Contractor signup error:', err);
    return res.status(500).json({ error: 'Failed to register contractor: ' + (err.message || err) });
  }
}
