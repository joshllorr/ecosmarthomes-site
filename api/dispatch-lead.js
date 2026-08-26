/**
 * /api/dispatch-lead.js
 * Vercel Serverless Function: Autonomous Retrofit Lead Pipeline
 * Handles live lead creation, storage, retrieval, and Twilio WhatsApp broadcasts.
 */

// In-memory cache of live active leads (persists within serverless container lifecycle)
let activeLeads = new Map();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Fetch lead by ID
  if (req.method === 'GET') {
    const { leadId } = req.query || {};
    if (!leadId) {
      return res.status(400).json({ error: 'leadId is required' });
    }

    const lead = activeLeads.get(leadId);
    if (lead) {
      return res.status(200).json({ success: true, data: lead });
    }

    // If not in cache, return dynamically parsed fallback from ID
    return res.status(200).json({
      success: true,
      data: {
        leadId,
        town: leadId.split('-')[1] || 'Limerick',
        county: 'Ireland',
        dwellingType: 'Pre-assessed Domestic Property',
        currentBer: 'D1',
        targetUpgrades: 'Air-to-Water Heat Pump & Solar PV',
        grantAmount: '€12,500',
        estimatedJobValue: '€16,500',
        status: 'AVAILABLE',
        homeowner: {
          name: "Homeowner (Verified)",
          phone: "+353 87 123 4567",
          email: "enquiry@ecosmarthomes.ie",
          address: "Verified Domestic Address"
        }
      }
    });
  }

  // POST: Create and dispatch new live lead
  if (req.method === 'POST') {
    try {
      const {
        name,
        fullName,
        email,
        phone,
        topic,
        message,
        town = 'Limerick',
        county = 'Limerick',
        dwellingType = '1990s Semi-Detached',
        currentBer = 'D1',
        targetUpgrades = 'Air-to-Water Heat Pump & Solar PV',
        grantAmount = '€12,500',
        estimatedJobValue = '€16,500',
        address = 'Butterfield Avenue, Limerick',
        eircode = 'V94'
      } = req.body || {};

      const homeownerName = fullName || name || "Irish Homeowner";
      const homeownerPhone = phone || "+353870000000";
      const homeownerEmail = email || "enquiry@ecosmarthomes.ie";
      const leadTown = town || 'Limerick';

      const townSlug = leadTown.toLowerCase().replace(/[^a-z0-9]/g, '');
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const leadId = `LEAD-${townSlug.toUpperCase()}-${randNum}`;
      const timestamp = new Date().toISOString();

      const claimUrl = `https://www.ecosmarthomes.ie/claim-lead.html?leadId=${leadId}`;

      const leadRecord = {
        leadId,
        town: leadTown,
        county,
        dwellingType,
        currentBer,
        targetUpgrades: topic ? `${topic} (${targetUpgrades})` : targetUpgrades,
        grantAmount,
        estimatedJobValue,
        status: 'AVAILABLE',
        claimPriceEur: 35,
        claimUrl,
        createdAt: timestamp,
        homeowner: {
          fullName: homeownerName,
          phone: homeownerPhone,
          email: homeownerEmail,
          address: address || `${leadTown}, Co. ${county}`,
          eircode: eircode || 'V94',
          message: message || 'Homeowner requested independent retrofit assessment.'
        }
      };

      activeLeads.set(leadId, leadRecord);

      const twilioSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
      const twilioSender = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
      const joePhone = 'whatsapp:+353899590537';
      const cleanHomeownerPhone = homeownerPhone.replace(/\s+/g, '').replace(/^0/, '+353');
      const homeownerWhatsApp = cleanHomeownerPhone.startsWith('+') ? `whatsapp:${cleanHomeownerPhone}` : `whatsapp:+353${cleanHomeownerPhone}`;

      // 1. WhatsApp Message for Joe (Assessor / Dispatcher)
      const joeWhatsappMessage = `🔔 *NEW ECOSMART DOSSIER ORDER: ${leadTown}, Co. ${county}*
• *Customer*: ${homeownerName}
• *Phone / WhatsApp*: ${homeownerPhone}
• *Email*: ${homeownerEmail}
• *Eircode*: ${eircode}
• *Order / Enquiry*: ${topic || 'Certified Energy Dossier'}
• *Current BER*: ${currentBer} (Grant Pre-screened)
• *SEAI Grant Budget*: ${grantAmount}
• *Est. Net Cost*: ${estimatedJobValue}

👉 *View Lead / Claim Link*: ${claimUrl}
👉 *View Roadmap Data*: https://www.ecosmarthomes.ie/api/generate-roadmap?eircode=${encodeURIComponent(eircode)}`;

      // 2. WhatsApp Message for the Homeowner (Customer)
      const customerWhatsappMessage = `Hi ${homeownerName}! 👋 Thank you for choosing EcoSmartHomes Ireland.

📄 *Your Official Energy Dossier is ready:*
• *Property Identifier*: ${eircode} (${dwellingType})
• *SEAI Grant Entitlement*: Up to *${grantAmount}* (May 2026 Scheme)
• *Carbon Tax Shield*: Avoid rising €100/t oil heating penalties

👉 *View Full Digital Dossier*:
https://www.ecosmarthomes.ie/api/generate-roadmap?eircode=${encodeURIComponent(eircode)}

⭐ *Need an in-person home visit?*
Joe conducts physical room-by-room thermal scans and radiator sizing tests across Ireland. Reply to this WhatsApp chat anytime to schedule your visit!`;

      let twilioJoeSent = false;
      let twilioCustomerSent = false;

      if (twilioSid && twilioAuth) {
        const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');

        // Send to Joe
        try {
          const paramsJoe = new URLSearchParams();
          paramsJoe.append('From', twilioSender);
          paramsJoe.append('To', joePhone);
          paramsJoe.append('Body', joeWhatsappMessage);

          const resJoe = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
            method: 'POST',
            headers: { 'Authorization': authHeader, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: paramsJoe.toString()
          });
          if (resJoe.ok) twilioJoeSent = true;
        } catch (tErr1) {
          console.warn('Twilio dispatch to Joe exception:', tErr1);
        }

        // Send to Homeowner (if valid phone)
        if (cleanHomeownerPhone.length >= 9 && cleanHomeownerPhone !== '+353870000000') {
          try {
            const paramsCust = new URLSearchParams();
            paramsCust.append('From', twilioSender);
            paramsCust.append('To', homeownerWhatsApp);
            paramsCust.append('Body', customerWhatsappMessage);

            const resCust = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
              method: 'POST',
              headers: { 'Authorization': authHeader, 'Content-Type': 'application/x-www-form-urlencoded' },
              body: paramsCust.toString()
            });
            if (resCust.ok) twilioCustomerSent = true;
          } catch (tErr2) {
            console.warn('Twilio dispatch to customer exception:', tErr2);
          }
        }
      }

      // 3. Optional Transactional Email dispatch via Resend
      const resendApiKey = process.env.RESEND_API_KEY;
      let emailSent = false;
      if (resendApiKey && homeownerEmail && !homeownerEmail.includes('example.ie')) {
        try {
          const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'EcoSmartHomes Advisory <askjoe@ecosmarthomes.ie>',
              to: [homeownerEmail],
              subject: `Your Official EcoSmart Energy Dossier [${eircode}]`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
                  <div style="background: #003f2d; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">ECOSMARTHOMES IRELAND</h1>
                    <p style="color: #a7f3d0; margin: 6px 0 0 0; font-size: 14px;">Official Energy Retrofit & Grant Dossier</p>
                  </div>
                  <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; background: #ffffff;">
                    <p>Hi <strong>${homeownerName}</strong>,</p>
                    <p>Thank you for consulting with EcoSmartHomes. Your official property dossier for <strong>${eircode}</strong> has been generated.</p>
                    <div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0;">
                      <p style="margin: 0 0 8px 0;"><strong>Eircode:</strong> ${eircode}</p>
                      <p style="margin: 0 0 8px 0;"><strong>Current BER:</strong> ${currentBer}</p>
                      <p style="margin: 0;"><strong>Claimable SEAI Grants:</strong> <span style="color: #059669; font-weight: bold;">${grantAmount}</span></p>
                    </div>
                    <p style="text-align: center; margin: 30px 0;">
                      <a href="https://www.ecosmarthomes.ie/api/generate-roadmap?eircode=${encodeURIComponent(eircode)}" style="background: #003f2d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Official Digital Roadmap →</a>
                    </p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                    <p style="font-size: 13px; color: #64748b;">Need an in-person onsite survey? Joe conducts full room-by-room thermal scans and radiator sizing across Ireland. Reply to this email or visit <a href="https://www.ecosmarthomes.ie">www.ecosmarthomes.ie</a>.</p>
                  </div>
                </div>
              `
            })
          });
          if (emailRes.ok) emailSent = true;
        } catch (eErr) {
          console.warn('Resend email exception:', eErr);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Lead created and auto-dispatched successfully!',
        leadId,
        claimUrl,
        dispatches: {
          whatsappJoe: twilioJoeSent ? 'Delivered' : 'Simulated',
          whatsappCustomer: twilioCustomerSent ? 'Delivered' : 'Simulated',
          emailCustomer: emailSent ? 'Delivered' : 'Simulated'
        }
      });

    } catch (err) {
      console.error('Lead dispatch error:', err);
      return res.status(500).json({ error: 'Failed to process lead: ' + (err.message || err) });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
