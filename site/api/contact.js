/**
 * /api/contact.js
 * Vercel Serverless Function: Inbound Lead Ingestion & Automation Webhook
 * Handles contact forms, town queries, and expressions of interest.
 * Implements 15-min spam deduplication, intent routing, and Make/HubSpot forwarding.
 */

// 15-Minute In-Memory Deduplication Cache
const recentSubmissions = new Map();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const {
      name,
      fullName,
      email,
      phone,
      topic,
      message,
      dwellingType,
      currentBer,
      targetUpgrades,
      county,
      town,
      source = 'Website Contact Form'
    } = req.body || {};

    const cleanEmail = (email || '').trim().toLowerCase();
    const leadName = fullName || name || 'Homeowner';

    if (!cleanEmail && !phone) {
      return res.status(400).json({ error: 'Valid email or phone is required.' });
    }

    // --- 1. Spam & Duplicate Suppression Filter (15-Minute Window) ---
    const now = Date.now();
    const dedupKey = `${cleanEmail}_${phone || ''}`;
    if (recentSubmissions.has(dedupKey)) {
      const lastTime = recentSubmissions.get(dedupKey);
      if (now - lastTime < 15 * 60 * 1000) {
        return res.status(200).json({
          success: true,
          status: 'DUPLICATE_SUPPRESSED',
          message: 'Thank you! Your request was already received and an advisor is reviewing it.'
        });
      }
    }
    recentSubmissions.set(dedupKey, now);

    // --- 2. Intent Classification & Rule Routing ---
    const rawText = `${topic || ''} ${message || ''}`;
    const normalizedText = rawText.toLowerCase();
    
    let inquiryType = 'GENERAL_QUESTION';
    let requiresHumanReview = false;
    let confidenceScore = 0.95;
    let escalationReason = null;

    // Check GDPR / Unsubscribe with word boundary regex (prevent false positive on 'One Stop Shop')
    const isUnsubscribe = /\b(unsubscribe|gdpr|opt-out|remove me|forget me)\b/i.test(rawText) ||
                          (/\bstop\b/i.test(rawText) && !/one\s*stop\s*shop/i.test(rawText));

    if (isUnsubscribe) {
      inquiryType = 'ESCALATE';
      requiresHumanReview = false;
      confidenceScore = 1.0;
      escalationReason = 'GDPR Unsubscribe Request';
    } else if (/\b(scam|rip-off|ripping off|overcharge|overcharged|complain|dispute)\b/i.test(rawText)) {
      inquiryType = 'ESCALATE';
      requiresHumanReview = true;
      confidenceScore = 0.40;
      escalationReason = 'Negative sentiment detected: Routed directly to mobile escalation';
    } else if (/\b(join network|registered installer|contractor network|installer network|claim leads|partner tier|b2b partner|trade account)\b/i.test(rawText)) {
      inquiryType = 'CONTRACTOR_B2B';
    } else if (normalizedText.includes('€49') || normalizedText.includes('survey') || normalizedText.includes('hli') || normalizedText.includes('heat pump')) {
      inquiryType = 'HOMEOWNER_SURVEY';
    } else if (normalizedText.includes('grant') || normalizedText.includes('quote') || normalizedText.includes('solar') || normalizedText.includes('wrap')) {
      inquiryType = 'PRICE_GAUGE';
    }

    // Flag complex or high-risk architectural edge cases
    if (/\b(heritage|stone cottage|solid stone|listed building|commercial|3-phase|industrial)\b/i.test(rawText)) {
      requiresHumanReview = true;
      confidenceScore = 0.55;
      escalationReason = 'Non-standard / Heritage architectural archetype requires engineer sign-off';
    }

    // --- 3. Structured Draft Generation (Ready for Gmail Draft / Make.com Relay) ---
    let emailSubject = '';
    let emailBodyHtml = '';

    if (inquiryType === 'ESCALATE' && escalationReason === 'GDPR Unsubscribe Request') {
      emailSubject = 'EcoSmartHomes Ireland · Communication Preferences Updated';
      emailBodyHtml = `<p>Hello ${leadName},</p><p>You have been successfully opted out from EcoSmartHomes communications. Your details will no longer be contacted.</p><p>Regards,<br><strong>EcoSmartHomes Team</strong><br>083 449 3934 · hello@ecosmarthomes.ie</p>`;
    } else if (inquiryType === 'HOMEOWNER_SURVEY') {
      emailSubject = `Your EcoSmartHomes Energy Survey & SEAI Grant Roadmap (${town || county || 'Ireland'})`;
      emailBodyHtml = `<p>Hello ${leadName},</p>
<p>Thank you for requesting an independent home energy review with <strong>EcoSmartHomes Ireland</strong>.</p>
<p>As 100% independent energy advisors, we do not sell heat pumps, install insulation, or take contractor commissions. Our sole focus is protecting your home and maximizing your official SEAI grants (e.g. up to <strong>€12,500 for heat pumps</strong>, <strong>€8,000 for external wrap</strong>, and <strong>€1,800 for solar PV</strong> under the official 8-band BER scale).</p>
<p><strong>Next Steps:</strong></p>
<ul>
  <li>Our senior technical advisor Joe will review your property details (${dwellingType || 'Domestic Home'}, BER ${currentBer || 'D'}).</li>
  <li>To confirm your in-person technical survey and room-by-room HLI heat loss scan (€49.00), you can book directly at <a href="https://ecosmarthomes.ie/checkout/">ecosmarthomes.ie/checkout/</a>.</li>
</ul>
<p>Feel free to reply directly to this email or call our team at <strong>083 449 3934</strong> (Mon-Fri 09:00 - 17:00).</p>
<p>Warm regards,<br>
<strong>Joe H. & The Advisory Team</strong><br>
EcoSmartHomes Ireland<br>
083 449 3934 · <a href="https://ecosmarthomes.ie">ecosmarthomes.ie</a></p>`;
    } else if (inquiryType === 'CONTRACTOR_B2B') {
      emailSubject = `EcoSmartHomes Pro Network · Partnership Inquiry (${town || county || 'Ireland'})`;
      emailBodyHtml = `<p>Hello ${leadName},</p>
<p>Thank you for reaching out regarding our registered contractor partner network.</p>
<p>EcoSmartHomes provides verified, pre-screened technical expressions of interest to registered SEAI contractors across Ireland, complete with heat loss calculations (NSAI SR50-2), BER assessments, and verified homeowner budgets.</p>
<p>Our team is reviewing your details and will follow up with our contractor on-boarding pack and county coverage schedule.</p>
<p>Regards,<br><strong>Contractor Operations Team</strong><br>EcoSmartHomes Ireland<br>083 449 3934</p>`;
    } else {
      emailSubject = `EcoSmartHomes · Response to Your Home Energy Inquiry`;
      emailBodyHtml = `<p>Hello ${leadName},</p>
<p>Thank you for contacting EcoSmartHomes Ireland. We have received your inquiry regarding energy upgrades and SEAI grant eligibility.</p>
<p>One of our independent advisors is reviewing your request and will provide tailored guidance within 24 business hours.</p>
<p>If your query is urgent, please call us directly on <strong>083 449 3934</strong> (Mon-Fri 09:00 - 17:00).</p>
<p>Kind regards,<br><strong>EcoSmartHomes Advisory Team</strong><br>083 449 3934 · <a href="https://ecosmarthomes.ie">ecosmarthomes.ie</a></p>`;
    }

    // --- 4. Webhook Relay to Make.com / Zapier / HubSpot (if webhook URL configured) ---
    const makeWebhookUrl = process.env.MAKE_LEAD_WEBHOOK_URL || process.env.HUBSPOT_WEBHOOK_URL;
    if (makeWebhookUrl) {
      try {
        await fetch(makeWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            leadName,
            email: cleanEmail,
            phone,
            county,
            town,
            dwellingType,
            currentBer,
            targetUpgrades,
            message,
            source,
            inquiryType,
            confidenceScore,
            requiresHumanReview,
            escalationReason,
            emailSubject,
            emailBodyHtml
          })
        });
      } catch (webhookErr) {
        console.warn('Optional Make/HubSpot webhook relay failed:', webhookErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      status: requiresHumanReview ? 'FLAGGED_FOR_HUMAN_REVIEW' : 'DRAFT_READY',
      data: {
        confidence_score: confidenceScore,
        inquiry_type: inquiryType,
        email_subject: emailSubject,
        email_body_html: emailBodyHtml,
        requires_human_review: requiresHumanReview,
        escalation_reason: escalationReason
      }
    });
  } catch (err) {
    console.error('Contact API Error:', err);
    return res.status(500).json({ error: 'Internal server error processing expression of interest.' });
  }
}
