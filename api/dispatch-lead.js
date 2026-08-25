/**
 * /api/dispatch-lead.js
 * Vercel Serverless Function: Autonomous Retrofit Lead Dispatcher
 * Broadcasts qualified homeowner leads via Twilio WhatsApp
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
      town = 'Castletroy',
      county = 'Limerick',
      dwellingType = '1990s 4-Bed Semi-Detached',
      currentBer = 'D1',
      targetUpgrades = 'Air-to-Water Heat Pump & Solar PV',
      grantAmount = '€12,500',
      estimatedJobValue = '€16,500',
      homeownerName = 'John O\'Connor',
      homeownerPhone = '+353871234567',
      homeownerEmail = 'john.oconnor@example.ie',
      address = '14 Butterfield Close, Castletroy, Limerick',
      eircode = 'V94 X7Y2'
    } = req.body || {};

    const townSlug = town.toLowerCase().replace(/[^a-z0-9]/g, '');
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const leadId = `LEAD-${townSlug.toUpperCase()}-${randNum}`;
    const timestamp = new Date().toISOString();

    const claimUrl = `https://www.ecosmarthomes.ie/claim-lead.html?leadId=${leadId}`;

    const whatsappMessage = `🔔 *NEW PRE-ASSESSED RETROFIT LEAD: ${town}, Co. ${county}*
• *Dwelling*: ${dwellingType}
• *Current BER*: ${currentBer} (HLI pre-screened)
• *Target Measures*: ${targetUpgrades}
• *SEAI Grant Budget*: ${grantAmount}
• *Est. Job Budget*: ${estimatedJobValue}

👉 *Tap here to claim this exclusive lead (€35)*:
${claimUrl}

_EcoSmartHomes Ireland · 100% Conflict-Free B2B Lead Marketplace_`;

    // Attempt Twilio Dispatch if configured
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioSender = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
    const joePhone = 'whatsapp:+353899590537';

    let twilioSent = false;
    if (twilioSid && twilioAuth) {
      try {
        const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
        const params = new URLSearchParams();
        params.append('From', twilioSender);
        params.append('To', joePhone);
        params.append('Body', whatsappMessage);

        const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        });

        if (twilioRes.ok) {
          twilioSent = true;
        }
      } catch (tErr) {
        console.warn('Twilio dispatch warning:', tErr);
      }
    }

    // Return sanitized public lead summary
    return res.status(200).json({
      success: true,
      data: {
        leadId,
        town,
        county,
        dwellingType,
        currentBer,
        targetUpgrades,
        grantAmount,
        estimatedJobValue,
        status: 'OPEN · AWAITING CONTRACTOR',
        claimPriceEur: 35,
        claimUrl,
        whatsappBroadcast: twilioSent ? 'Dispatched' : 'Simulated',
        createdAt: timestamp,
        // Redacted for unverified preview
        homeownerPreview: {
          name: homeownerName.charAt(0) + '*** ' + (homeownerName.split(' ')[1]?.charAt(0) || '') + '*****',
          phone: homeownerPhone.slice(0, 7) + ' *** ****',
          address: '*** ' + town + ', Co. ' + county
        }
      }
    });

  } catch (err) {
    console.error('Lead dispatch error:', err);
    return res.status(500).json({ error: 'Failed to dispatch lead: ' + (err.message || err) });
  }
}
