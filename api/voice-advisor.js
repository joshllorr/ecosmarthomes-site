/**
 * /api/voice-advisor.js
 * Vercel Serverless Function: Voice AI Retrofit Advisor (Aoife)
 * Powered by Google Gemini 2.5 Flash
 * Persona: Warm, friendly Irish energy advisor (Limerick/Dublin soft blend)
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

    // SEAI Grounded Engineering Knowledge Base (SR50, SR54:2024, DEAP 4.2.2, May 2026 Code of Practice)
    const SEAI_GROUNDING_DATABASE = `
[SEAI TECHNICAL CITATIONS & KNOWLEDGE BASE]:
1. Open Fireplace & Chimneys with Heat Pumps:
   - Citation: SEAI Technical Guidance SR54:2024 Section 4.2 & DEAP 4.2.2 Rule 3.4
   - Rule: Open flues cause massive uncontrolled ventilation and draft losses. To qualify for a heat pump grant (HLI <= 2.0 W/K/m²), open fireplaces must be permanently sealed or fitted with room-sealed appliances with dedicated external air intake.
2. Heat Loss Indicator (HLI) 2.0 Requirement:
   - Citation: SEAI Domestic Technical Guidance SR50-2 Clause 3.4
   - Rule: Technical Advisor must certify HLI <= 2.0 W/K/m² (or <= 2.3 with fabric roadmap) to ensure Seasonal Performance Factor (SPF) >= 3.0.
3. Low-Temperature Radiator Sizing (Delta T 30):
   - Citation: NSAI SR50-1:2021 Code of Practice for Domestic Wet Central Heating Systems
   - Rule: Heat pumps run at 45°C flow / 35°C return (Delta T 30°C). Undersized single-panel radiators must be upgraded to double-panel convector (Type 22) units.
4. External Wall Insulation (The Wrap):
   - Citation: SEAI May 2026 Code of Practice & NSAI Agrément I.S. EN 13163 / SR54 Clause 5.3
   - Rule: EWI wrap must achieve U-Value <= 0.18 W/m²K with NSAI Agrément certified insulation.
5. Attic Insulation & Ventilation:
   - Citation: SEAI Domestic Technical Guidance SR54 Clause 6.1 & BS 5250
   - Rule: 300mm mineral wool (U <= 0.16 W/m²K) with mandatory 50mm continuous eaves ventilation.
6. Solar PV & Clean Export Guarantee (CEG):
   - Citation: Commission for Regulation of Utilities (CRU) Decision & Finance Act 2023 0% VAT
   - Rule: Suppliers pay ~24c/kWh for exported power under CEG. Permanent 0% VAT applies.
7. May 2026 Grant Rates & Pricing Framework:
   - Grants: Heat Pump up to €12,500 | Wall Wrap up to €8,000 | Attic up to €2,500 | Solar PV up to €1,800 | Deep Retrofit up to €35,000.
   - EcoSmartHomes Advisory: On-Site Diagnostic Survey (€149) | Full Masterplan (€299) | Digital Installer Pack (€49) | 100% Conflict-Free.
`;

    const systemPrompt = `
=== SYSTEM VOICE STYLE & PERSONA INSTRUCTIONS ===

Identity:
You are Aoife, the EcoSmartHomes voice advisor — friendly, trustworthy, and 100% independent (no equipment sales, no contractor commissions).

Voice Style:
Speak in a warm, friendly Irish accent — soft Limerick/Dublin blend, gentle rhythm, clear diction.

Tone:
Professional but never stiff. Warm, reassuring, neighbourly, and easy to listen to.

Personality:
Helpful, calm, confident, and kind. Sound like a knowledgeable Irish energy advisor who genuinely wants to help homeowners save money and feel comfortable.

Delivery:
- Medium pace
- Soft edges on sentences
- Light Irish inflection (e.g. natural, friendly phrasing like "Now, the first thing we look at...", "You're in good shape there", "Not to worry")
- Warm vocal colour
- No sales tone
- No jargon unless explaining it clearly and simply

Behaviour:
- Always explain things simply and clearly
- Keep homeowners at ease
- Stay positive and encouraging
- Maintain professional engineering accuracy citing official Irish standards (SR54, SR50, DEAP)

Response Format Requirement:
You must return a valid JSON object with:
1. "speechText": The exact words Aoife speaks aloud (2-4 gentle, clear, conversational sentences formatted for natural speech synthesis).
2. "displayText": A nicely formatted text answer with bullet points, bold highlights, and standard citations for the screen.
3. "citation": Exact Irish engineering standard (e.g. "SR54:2024 Section 4.2").
4. "recommendedAction": Practical next step (e.g. "On-Site Survey (€149)", "Solar Check", "Radiator Sizing").
5. "surveyCta": true or false.

Location Context: ${town || 'Ireland'}

${SEAI_GROUNDING_DATABASE}
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
            temperature: 0.25,
            responseMimeType: "application/json"
          }
        })
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const rawJson = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJson) {
          try {
            const parsed = JSON.parse(rawJson);
            return res.status(200).json({ success: true, data: parsed });
          } catch (pErr) {
            console.error('JSON parse error from Gemini Voice Advisor:', pErr);
          }
        }
      }
    }

    // Warm Irish Fallback Response
    const fallbackResponse = {
      speechText: `Hello there! I'm Aoife from EcoSmartHomes. For homes in Ireland, heat pump grants up to twelve thousand five hundred euro require your heat loss indicator to be verified at two point zero or lower under NSAI SR50-2. We can check your radiators and grants during an on-site survey whenever you're ready.`,
      displayText: `### 🏡 Heat Pump & Grant Eligibility\n\n• **Standard**: NSAI SR50-2:2024 & SEAI Code of Practice\n• **Requirement**: Heat Loss Indicator (HLI) ≤ 2.0 W/K/m²\n• **Grant Available**: Up to **€12,500** for heat pumps + **€8,000** for external wall wrap.\n• **Independence**: 100% conflict-free advisory—no contractor kickbacks.`,
      citation: "NSAI SR50-2:2024 Clause 3.4",
      recommendedAction: "Book On-Site Survey (€149)",
      surveyCta: true
    };

    return res.status(200).json({ success: true, data: fallbackResponse, fallback: true });

  } catch (err) {
    console.error('Voice Advisor API Error:', err);
    return res.status(500).json({ error: 'Internal server error in voice advisor.' });
  }
}
