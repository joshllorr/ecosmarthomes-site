/**
 * EcoSmartHome Weekly Funnel Performance Reporter (Vercel Serverless Cron Endpoint)
 * 
 * Triggered every Monday morning via Vercel Crons. Queries Supabase telemetry views,
 * compiles a markdown/HTML digest, and dispatches to Joe's inbox via Resend or SendGrid.
 * 
 * Environment Variables required in Vercel:
 *   - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   - RESEND_API_KEY (or SENDGRID_API_KEY)
 *   - CRON_SECRET
 *   - JOE_EMAIL
 */

const { createClient } = require('@supabase/supabase-js');
const { timingSafeEqual } = require('crypto');

// Lazy-load email providers to avoid crashes if not installed
let Resend, sgMail;
try { Resend = require('resend').Resend; } catch (e) { /* Resend not installed */ }
try { sgMail = require('@sendgrid/mail'); } catch (e) { /* SendGrid not installed */ }

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Initialize Mail Clients
const resend = process.env.RESEND_API_KEY && Resend ? new Resend(process.env.RESEND_API_KEY) : null;
if (process.env.SENDGRID_API_KEY && sgMail) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Timing-safe secret comparison to prevent side-channel attacks
function verifySecret(provided, expected) {
  if (!provided || !expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

module.exports = async (req, res) => {
  // 1. Secure the endpoint against unauthorized execution
  const authHeader = req.headers?.authorization || '';
  if (process.env.NODE_ENV === 'production') {
    const expectedAuth = `Bearer ${process.env.CRON_SECRET || ''}`;
    if (!verifySecret(authHeader, expectedAuth)) {
      return res.status(401).json({ error: 'Unauthorized Cron Trigger' });
    }
  }

  if (!supabase) {
    console.error('FATAL: Supabase credentials not configured for cron report.');
    return res.status(500).json({ error: 'Database not configured.' });
  }

  try {
    console.log('📊 Querying EcoSmartHome telemetry views...');

    // 2. Query the conversion funnel view (returns a single summary row)
    const { data: funnelData, error: funnelError } = await supabase
      .from('v_wizard_conversion_funnel')
      .select('*');

    if (funnelError) throw funnelError;
    const funnel = funnelData && funnelData.length > 0 ? funnelData[0] : null;

    // 3. Query the drop-off bottlenecks view (returns one row per step)
    const { data: bottlenecks, error: bottleneckError } = await supabase
      .from('v_wizard_dropoff_bottlenecks')
      .select('*')
      .order('step', { ascending: true });

    if (bottleneckError) throw bottleneckError;

    // 4. Generate the report content
    const reportDate = new Date().toLocaleDateString('en-IE', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const emailSubject = `📊 EcoSmartHome Funnel Report — Monday, ${new Date().toLocaleDateString('en-IE')}`;

    let markdownBody;

    if (!funnel) {
      // Handle zero-traffic weeks gracefully
      markdownBody = `
# 📊 Weekly Onboarding Funnel Performance Digest
**EcoSmartHome Ireland — Independent Retrofit Advisory**  
*Report generated on: ${reportDate}*

---

### ℹ️ No Funnel Data Available This Week

No user sessions were recorded in the onboarding wizard during this reporting period. This could indicate:
- The site was under maintenance
- Traffic was routed to a different landing page
- Telemetry ingestion may need verification

*Check the admin console at /admin/analytics for live metrics.*
`;
    } else {
      markdownBody = `
# 🚀 Weekly Onboarding Funnel Performance Digest
**EcoSmartHome Ireland — Independent Retrofit Advisory**  
*Report generated on: ${reportDate}*

---

### 📈 Conversion Funnel Progression Scorecard

| Step | Page View / Action | Users | Retention |
| :---: | :--- | :---: | :---: |
| **Step 1** | Property Profiler (Archetype & BER) | ${funnel.step_1_property_profile_users || 0} | — |
| **Step 2** | Fuel & Carbon Tax Calculator | ${funnel.step_2_fuel_tax_users || 0} | ${funnel.s1_to_s2_retention_pct || 0}% |
| **Step 3** | Gemini Vision Boiler Scanner | ${funnel.step_3_gemini_scanner_users || 0} | ${funnel.s2_to_s3_retention_pct || 0}% |
| **Step 4** | SEAI Savings & Grant Estimator | ${funnel.step_4_seai_payback_users || 0} | ${funnel.s3_to_s4_retention_pct || 0}% |
| **Step 5** | Actionable Roadmap Checkout | ${funnel.step_5_roadmap_offer_users || 0} | ${funnel.s4_to_s5_retention_pct || 0}% |
| **CTA** | Stripe €49 Checkout Clicks | ${funnel.stripe_49_cta_clicks || 0} | **${funnel.total_funnel_conversion_pct || 0}% overall** |

---

### ⚠️ Step-by-Step Drop-Off Analysis

| Step | Total Entered | Completed | Abandoned | Avg Time (s) |
| :--- | :---: | :---: | :---: | :---: |
${(bottlenecks || []).map(row => {
  const stepName = getStepFriendlyName(row.step);
  return `| ${stepName} | ${row.total_sessions_entered || 0} | ${row.completed_sessions || 0} | ${row.explicit_exits || 0} | ${row.avg_time_spent_seconds ? Number(row.avg_time_spent_seconds).toFixed(1) : '—'} |`;
}).join('\n')}

---

### 💡 Joe's Action Items
1. **Step 3 (Photo Upload):** If drop-offs exceed 20%, add a "Skip for now" bypass.
2. **Step 5 (Checkout):** Display trust badges (Conflict-Free, No Kickbacks) above Stripe CTA.
3. **Step 2 (Bill Slider):** Test simplified Low/Medium/High toggle.

*This report is automatically dispatched via Vercel Crons every Monday at 08:00 UTC.*
`;
    }

    // 5. Convert to styled HTML
    const htmlBody = convertMarkdownToHtml(markdownBody, emailSubject);

    // 6. Send the email
    const recipient = process.env.JOE_EMAIL || 'joe@ecosmarthomes.ie';
    const sender = 'reports@ecosmarthomes.ie';

    if (resend) {
      console.log('✉️ Dispatching via Resend API...');
      await resend.emails.send({
        from: `EcoSmartHome Analytics <${sender}>`,
        to: recipient,
        subject: emailSubject,
        html: htmlBody,
        text: markdownBody,
      });
    } else if (process.env.SENDGRID_API_KEY && sgMail) {
      console.log('✉️ Dispatching via SendGrid API...');
      await sgMail.send({
        to: recipient,
        from: sender,
        subject: emailSubject,
        html: htmlBody,
        text: markdownBody,
      });
    } else {
      console.log('⚠️ No email provider configured. Report preview:');
      console.log(markdownBody);
    }

    return res.status(200).json({ success: true, timestamp: new Date().toISOString() });

  } catch (error) {
    console.error('❌ Failed to run weekly cron email:', error);
    return res.status(500).json({ error: error.message });
  }
};

function getStepFriendlyName(step) {
  const names = {
    'step_1_profile': 'Step 1: Property Profiler',
    'step_2_fuel_exposure': 'Step 2: Fuel & Tax Calculator',
    'step_3_vision_scanner': 'Step 3: Vision Scanner',
    'step_4_grant_forecast': 'Step 4: Grant Estimator',
    'step_5_checkout_order': 'Step 5: Checkout'
  };
  return names[step] || `Step: ${step}`;
}

function convertMarkdownToHtml(md, title) {
  let html = md
    .replace(/^# (.*$)/gim, '<h1 style="color: #020617; font-family: sans-serif; font-size: 24px; font-weight: 800; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">$1</h1>')
    .replace(/^### (.*$)/gim, '<h3 style="color: #1e293b; font-family: sans-serif; font-size: 14px; font-weight: 700; margin-top: 18px; margin-bottom: 8px;">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Convert tables
  const lines = html.split('\n');
  let insideTable = false;
  let tableRows = [];
  const outputLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|')) {
      if (!insideTable) {
        insideTable = true;
        tableRows = [];
      }
      if (line.includes('---')) continue; // Skip alignment row
      const cells = line.split('|').filter(c => c.trim() !== '').map(c => c.trim());
      const isHeader = tableRows.length === 0;
      let rowHtml = '<tr style="' + (isHeader ? 'background-color: #f8fafc; border-bottom: 2px solid #cbd5e1;' : 'border-bottom: 1px solid #e2e8f0;') + '">';
      cells.forEach(cell => {
        rowHtml += isHeader
          ? `<th style="padding: 10px 12px; text-align: left; font-family: sans-serif; font-size: 11px; font-weight: bold; color: #475569; text-transform: uppercase;">${cell}</th>`
          : `<td style="padding: 10px 12px; font-family: sans-serif; font-size: 12px; color: #334155;">${cell}</td>`;
      });
      rowHtml += '</tr>';
      tableRows.push(rowHtml);
    } else {
      if (insideTable) {
        insideTable = false;
        outputLines.push(`<table style="width: 100%; border-collapse: collapse; margin: 12px 0 24px; border: 1px solid #e2e8f0;">${tableRows.join('')}</table>`);
        tableRows = [];
      }
      outputLines.push(line);
    }
  }
  // Flush any trailing table
  if (insideTable && tableRows.length > 0) {
    outputLines.push(`<table style="width: 100%; border-collapse: collapse; margin: 12px 0 24px; border: 1px solid #e2e8f0;">${tableRows.join('')}</table>`);
  }

  html = outputLines.filter(l => l !== '').join('\n')
    .replace(/^\d+\. (.*$)/gim, '<li style="margin-bottom: 6px; font-family: sans-serif; font-size: 13px; color: #334155;">$1</li>')
    .replace(/^(?!<h|<li|<ul|<table|<tr|<th|<td|<div|<strong)(.*\S.*)$/gim, '<p style="font-family: sans-serif; font-size: 13px; color: #334155; line-height: 1.6; margin-bottom: 14px;">$1</p>');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="background-color: #f1f5f9; padding: 24px; margin: 0; -webkit-font-smoothing: antialiased;">
<div style="max-width: 680px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
${html}
</div></body></html>`;
}
