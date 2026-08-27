/**
 * /api/whatsapp-bot.js
 * Vercel Serverless Function: Multimodal WhatsApp Inbound AI Bot
 * Powered by Gemini 2.5 Flash for Audio, Vision & Text Comprehension
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle both JSON and URL-encoded Twilio Webhooks
  let bodyText = req.body?.Body || req.body?.message || '';
  const mediaUrl = req.body?.MediaUrl0 || req.body?.mediaUrl || null;
  const mediaType = req.body?.MediaContentType0 || req.body?.mediaType || '';
  const fromPhone = req.body?.From || req.body?.from || 'Unknown User';

  const isTwiML = req.headers['content-type']?.includes('application/x-www-form-urlencoded') || req.query?.format === 'twiml';

  try {
    const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    const SEAI_GROUNDING_DATABASE = `
[OFFICIAL SEAI TECHNICAL STANDARDS & CITATIONS]:
1. Open Fireplaces & Chimney Flues:
   - Citation: SEAI Technical Guidance SR54:2024 Section 4.2 & DEAP 4.2.2 Rule 3.4
   - Rule: Open flues cause massive uncontrolled ventilation and draft losses. To qualify for a heat pump grant (HLI <= 2.0 W/K/m²), open fireplaces must be permanently sealed or fitted with room-sealed / balanced-flue appliances with dedicated external air intake.
2. Heat Loss Indicator (HLI) 2.0 Requirement:
   - Citation: SEAI Domestic Technical Guidance SR50-2 Clause 3.4
   - Rule: Heat pump grant approval mandates dwelling HLI <= 2.0 W/K/m² (or <= 2.3 with fabric roadmap) to ensure Seasonal Performance Factor (SPF) >= 3.0.
3. Low-Temperature Radiators (Delta T 30):
   - Citation: NSAI SR50-1:2021 Code of Practice for Domestic Wet Central Heating Systems
   - Rule: Heat pumps run at 45°C flow / 35°C return. Existing radiators must be audited; undersized single-panel units must be upgraded to high-output double-panel convector (Type 22) radiators.
4. External Wall Insulation (The Wrap):
   - Citation: SEAI May 2026 Code of Practice & NSAI Agrément I.S. EN 13163 / SR54 Clause 5.3
   - Rule: Finished U-Value <= 0.18 W/m²K with certified NSAI Agrément insulation.
5. Attic Insulation:
   - Citation: SEAI Domestic Technical Guidance SR54 Clause 6.1
   - Rule: 300mm mineral wool (U <= 0.16 W/m²K) with a 50mm continuous eaves ventilation gap.
6. May 2026 Grants:
   - Heat Pump: €12,500 | Wall Wrap: €8,000 | Attic: €2,500 | Solar PV: €1,800 + 24c/kWh Clean Export (0% VAT).
`;

    let aiPrompt = `You are Joe H., founder of EcoSmartHomes Ireland — a certified, 100% independent home energy engineer.
You are replying directly to an Irish homeowner on WhatsApp.
Your tone is neighbourly, friendly, authoritative, and practical (Irish phrasing).

Core Instruction:
Ground your answers in official Irish engineering standards (SR54:2024, SR50-1, SR50-2, DEAP 4.2.2, May 2026 SEAI rates).
When answering technical questions, cite the exact standard (e.g. "Under SEAI Guidance SR54 Section 4.2...").

${SEAI_GROUNDING_DATABASE}

Task:
Provide a concise, helpful diagnostic answer (max 3-4 bullet points) addressing the homeowner's voice note, photo, or question.
Always include a clear recommendation and invitation to view their Roadmap or book the €49 survey at /checkout/ or https://www.ecosmarthomes.ie/roadmap/`;

    let replyText = "";

    if (geminiKey) {
      try {
        let contents = [];

        // If media is attached (Image or Audio)
        if (mediaUrl) {
          try {
            const mediaRes = await fetch(mediaUrl);
            const arrayBuffer = await mediaRes.arrayBuffer();
            const base64Data = Buffer.from(arrayBuffer).toString('base64');

            contents.push({
              parts: [
                { text: aiPrompt + "\n\nUser Question/Caption: " + (bodyText || "Analyze this image/audio from the homeowner:") },
                {
                  inline_data: {
                    mime_type: mediaType || 'image/jpeg',
                    data: base64Data
                  }
                }
              ]
            });
          } catch (mErr) {
            console.warn('Could not fetch media url:', mErr);
            contents.push({
              parts: [{ text: `${aiPrompt}\n\nHomeowner sent a ${mediaType || 'photo/voice note'} with text: "${bodyText}". Please provide your expert assessment citing relevant SEAI standards.` }]
            });
          }
        } else {
          contents.push({
            parts: [{ text: `${aiPrompt}\n\nHomeowner WhatsApp Message: "${bodyText || 'Hi Joe, how much SEAI grants can I get for my 1990s house?'}"` }]
          });
        }

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents })
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        }
      } catch (gErr) {
        console.warn('Gemini API call failed, using fallback:', gErr);
      }
    }

    if (!replyText) {
      const msgLower = (bodyText || '').toLowerCase();
      if (msgLower.includes('fireplace') || msgLower.includes('chimney') || msgLower.includes('open fire')) {
        replyText = `Hi there! 👋 Great question regarding open fireplaces.

Under *SEAI Technical Guidance SR54:2024 Section 4.2 & DEAP 4.2.2 Rule 3.4*:
• *The Rule*: Open flues create massive uncontrolled ventilation heat loss. To qualify for the *€12,500 Heat Pump Grant*, your home's Heat Loss Indicator (HLI) must be ≤ 2.0 W/K/m².
• *Compliance*: Open fireplaces must be permanently sealed at the throat or fitted with a room-sealed stove with dedicated external combustion air.
• *Next Step*: During our *€49 Independent Survey*, I check your chimney pathways and measure exact room heat loss to guarantee grant sign-off.

👉 *Book your €49 Survey*: https://www.ecosmarthomes.ie/checkout/`;
      } else {
        replyText = `Hi there! 👋 Thanks for reaching out to EcoSmartHomes.

Under *SEAI May 2026 Code of Practice & NSAI SR50/SR54 Standards*:
• *Heat Pump Grant*: Up to *€12,500* (Requires Heat Loss Index HLI ≤ 2.0 W/K/m² as per SR50-2 Clause 3.4)
• *External Wall Wrap*: Up to *€8,000* (NSAI Agrément certified, U-Value ≤ 0.18 W/m²K)
• *Attic Insulation*: Up to *€2,500* (300mm cross-layered mineral wool)
• *Solar PV*: Up to *€1,800* + 24c/kWh Clean Export Guarantee (0% VAT permanent)

👉 *View your certified Roadmap PDF*: https://www.ecosmarthomes.ie/roadmap/
👉 *Book your €49 Independent Survey*: https://www.ecosmarthomes.ie/checkout/`;
      }
    }

    if (isTwiML) {
      res.setHeader('Content-Type', 'text/xml');
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${replyText}</Message>
</Response>`;
      return res.status(200).send(twiml);
    }

    return res.status(200).json({
      success: true,
      sender: fromPhone,
      reply: replyText
    });

  } catch (err) {
    console.error('WhatsApp bot handler error:', err);
    return res.status(500).json({ error: 'Failed to process WhatsApp message: ' + (err.message || err) });
  }
}
