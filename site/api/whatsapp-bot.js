/**
 * /site/api/whatsapp-bot.js
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

  let bodyText = req.body?.Body || req.body?.message || '';
  const mediaUrl = req.body?.MediaUrl0 || req.body?.mediaUrl || null;
  const mediaType = req.body?.MediaContentType0 || req.body?.mediaType || '';
  const fromPhone = req.body?.From || req.body?.from || 'Unknown User';

  const isTwiML = req.headers['content-type']?.includes('application/x-www-form-urlencoded') || req.query?.format === 'twiml';

  try {
    const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    let aiPrompt = `You are Joe H., founder of EcoSmartHomes Ireland — a certified, 100% independent home energy engineer.
You are replying directly to an Irish homeowner on WhatsApp.
Your tone is neighbourly, friendly, authoritative, and practical (Irish phrasing).

Key Knowledge Base:
- SEAI May 2026 Grants: Air-to-Water Heat Pump (€12,500), External Wall Wrap (€8,000), Attic Insulation (€2,500), Solar PV (€1,800), Heating Controls (€700). 0% VAT on heat pumps and solar.
- Heat Loss Index (HLI): Must be ≤ 2.0 W/K/m² for heat pump grant approval.
- Carbon Tax: Increasing to €100/t by 2030 (+9% double VAT on oil).
- Services: Independent Retrofit Assessment (€49 survey), 1-Click Bank-Grade Roadmap PDF.

Task:
Provide a concise, helpful diagnostic answer (max 3-4 bullet points) addressing the homeowner's voice note, photo, or question.
Always include a clear recommendation and invitation to view their Roadmap or book the €49 survey at https://buy.stripe.com/aFabJ01EGbPz6tn8UYeME00 or https://www.ecosmarthomes.ie/roadmap/`;

    let replyText = "";

    if (geminiKey) {
      try {
        let contents = [];

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
              parts: [{ text: `${aiPrompt}\n\nHomeowner sent a ${mediaType || 'photo/voice note'} with text: "${bodyText}". Please provide your expert assessment.` }]
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
      replyText = `Hi there! 👋 Thanks for reaching out to EcoSmartHomes.

Based on your message:
• *SEAI Grant Support*: You can access up to *€12,500* for an Air-to-Water Heat Pump plus *€2,500* for attic insulation and *€1,800* for solar PV (0% VAT).
• *Pre-Check*: We make sure your home's Heat Loss Index (HLI) is under 2.0 W/K/m² so the heat pump runs efficiently.
• *Carbon Tax Shield*: Switching off oil eliminates up to €498/yr in rising carbon penalties.

👉 *View your certified Roadmap PDF*: https://www.ecosmarthomes.ie/roadmap/
👉 *Book your €49 Independent Survey*: https://buy.stripe.com/aFabJ01EGbPz6tn8UYeME00

Let me know your Eircode and I'll pull the exact property specs! 🏡`;
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
