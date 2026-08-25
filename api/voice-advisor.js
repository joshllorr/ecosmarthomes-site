/**
 * /api/voice-advisor.js
 * Vercel Serverless Function: Voice AI Retrofit Advisor (Aoife)
 * Powered by Gemini 2.5 Flash
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
    const { message, history = [], town = 'Ireland' } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'No message provided' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    const systemPrompt = `
You are "Aoife", the Senior Technical Retrofit Advisor for EcoSmartHomes Ireland (www.ecosmarthomes.ie).
You are speaking directly with an Irish homeowner who is asking via voice about SEAI grants, heat pumps, insulation, solar PV, and home energy upgrades (location context: ${town}).

Key Rules for Your Spoken Voice Persona:
1. Be warm, professional, authentic, and direct. Keep your answers conversational and concise (2 to 4 sentences maximum) because your response will be read aloud via voice synthesis.
2. Use exact May 2026 Irish SEAI grant rates:
   - Air-to-Water Heat Pump: up to €12,500
   - External Wall Insulation (The Wrap): up to €8,000
   - Attic Insulation (300mm): up to €2,500
   - Solar PV Panels: up to €1,800 + Clean Export Guarantee (CEG) payments
   - Heating Controls Upgrade: up to €700
3. If they ask about qualifying for a heat pump, mention the SEAI Heat Loss Index (HLI) requirement (must be under 2.0 W/K/m²).
4. Always advocate for 100% independent advice — EcoSmartHomes never takes installer kickbacks or sales commissions.
5. When relevant, invite them to lock in their roadmap with a "€49 Independent Retrofit Survey".

Return a JSON object in this format without markdown backticks:
{
  "speechText": "Concise conversational text suitable for reading aloud via voice synthesis (2-4 sentences max).",
  "displayText": "Clear formatted text for display on screen with bullet points if helpful.",
  "recommendedAction": "€49 Survey | Solar PV | Attic Insulation | Heat Pump Check",
  "surveyCta": true
}
`;

    if (apiKey) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      
      const contents = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        ...history.slice(-4).map(h => ({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ];

      const geminiRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.3,
            responseMimeType: "application/json"
          }
        })
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const rawJsonText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJsonText) {
          try {
            const parsed = JSON.parse(rawJsonText);
            return res.status(200).json({ success: true, data: parsed });
          } catch (pErr) {
            console.error('JSON parse error from Gemini Voice:', pErr);
          }
        }
      }
    }

    // Fallback response if API key is not configured or direct call failed
    const fallbackResponse = {
      speechText: `Great question! In Ireland, homeowners can claim up to €12,500 for an Air-to-Water Heat Pump, plus €2,500 for attic insulation under the May 2026 SEAI scheme. To ensure your home qualifies for the heat loss requirement, we recommend starting with our independent €49 survey.`,
      displayText: `Under the updated May 2026 SEAI Grant Scheme:\n• **Heat Pump System**: Up to **€12,500** grant\n• **Attic Insulation**: Up to **€2,500** grant\n• **External Wall Wrap**: Up to **€8,000** grant\n\nOur **€49 Independent Retrofit Survey** calculates your exact Heat Loss Index (HLI) so you can claim maximum funding without installer bias.`,
      recommendedAction: "€49 Survey",
      surveyCta: true
    };

    return res.status(200).json({ success: true, data: fallbackResponse });

  } catch (err) {
    console.error('Error in voice-advisor API:', err);
    return res.status(500).json({ error: 'Voice advisor failed: ' + (err.message || err) });
  }
}
