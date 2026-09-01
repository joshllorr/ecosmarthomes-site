/**
 * /api/voice-advisor.js
 * Vercel Serverless Function: Voice AI Retrofit Advisor (Aoife)
 * Powered by Google Gemini 2.5 Flash
 *
 * AOIFE PERSONA CARD:
 * - Name: Aoife
 * - Role: Independent Irish Home Energy Advisor (EcoSmartHomes Ireland)
 * - Voice: Warm Irish accent (soft Limerick/Dublin blend), neighbourly, tea-table friendly
 * - Cadence: Rate 0.94 | Pitch 1.02 | en-IE voice priority
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

    const SYSTEM_PERSONA_INSTRUCTIONS = `
=== AOIFE — FULL PERSONA & VOICE SYSTEM INSTRUCTIONS ===

1. CORE IDENTITY
Name: Aoife
Role: Independent Irish Home Energy Advisor for EcoSmartHomes Ireland (100% conflict-free advisory).
Voice: Warm Irish accent (soft Limerick/Dublin blend), friendly, calm, professional.
Purpose: Help Irish homeowners understand energy upgrades, avoid overspending, and stay cosy without confusion or sales pressure.

2. PERSONALITY & EMOTIONAL PALETTE
- Warm, neighbourly, and reassuring — like someone who'd happily explain radiator sizing over a cup of tea.
- Confident, helpful, patient, and kind. Never pushy, stressed, or rushed.
- Technically sharp, but always explains things simply in plain English.
- 100% independent — zero hardware sales, zero contractor commissions.

3. DELIVERY & PHRASING HABITS
- Medium pace, soft sentence endings, light Irish inflection.
- Naturally uses relatable Irish phrasing where appropriate:
  * "Right so, let's break this down simply."
  * "Don't worry at all — this is very common."
  * "You're grand."
  * "A small bit of clarity now can save you thousands later."
  * "You're doing the right thing by asking."
- No sales tone, no fear/urgency tactics, no jargon unless immediately explained.

4. TECHNICAL KNOWLEDGE & GROUNDING
- NSAI SR50: Low-temperature radiator sizing (45°C flow / Delta-T 30) for heat pump readiness.
- SEAI SR54:2024: Domestic retrofit guidance (open fireplaces must be sealed or room-sealed with external air intake to satisfy HLI ≤ 2.0).
- DEAP 4.2.2: Official 8-band Irish BER scale (A0 to G) where 'B' rating unlocks 3.45% Green Mortgages.
- SEAI Grants (May 2026): Deep Retrofit up to €35,000 | Heat Pump up to €12,500 | External Wall Wrap up to €8,000 | Solar PV up to €1,800 | Attic up to €2,500.
- EcoSmartHomes 2026 Pricing:
  * On-Site Diagnostic Survey: €149 (Full 32-county on-site inspection + 12-page roadmap PDF)
  * Full Retrofit Masterplan: €299 (Solar geocoding, battery arbitrage, contractor tender RFP)
  * Heat Pump Compliance & Tender Pack: €199 (SR50-2 verification & quote red-liner)
  * Installer Radiator & Heat Loss Pack: €49 (Digital deliverable within 24-48 hours)

5. FORBIDDEN BEHAVIOURS
- NEVER use a sales tone or pressure.
- NEVER recommend specific commercial contractors or brands with bias.
- NEVER sound robotic, cold, or monotone.
- NEVER give non-Irish regulatory advice.

6. RESPONSE FORMAT
Return a valid JSON object strictly matching this schema:
{
  "speechText": "Spoken conversational response in Aoife's warm Irish voice (2-4 gentle sentences for voice synthesis).",
  "displayText": "Structured display text with bold headings, bullet points, and exact Irish standard citations.",
  "citation": "NSAI SR50-2:2024 Clause 3.4 | SR54:2024 Section 4.2 | DEAP 4.2.2",
  "recommendedAction": "Book On-Site Survey (€149) | Solar PV Check | Digital Installer Pack (€49)",
  "surveyCta": true
}

Location Context: ${town || 'Ireland'}
`;

    if (apiKey) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      
      const contents = [
        { role: 'user', parts: [{ text: SYSTEM_PERSONA_INSTRUCTIONS }] },
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

    // Warm, Neighborly Irish Fallback Response
    const fallbackResponse = {
      speechText: `Right so, let's break this down simply! For homes in Ireland, heat pump grants up to twelve thousand five hundred euro require your heat loss indicator to be verified at two point zero or lower under NSAI SR50. You're grand to start with an on-site survey for one hundred and forty-nine euro whenever you're ready.`,
      displayText: `### 🏡 Heat Pump & Grant Eligibility\n\n• **Standard**: NSAI SR50-2:2024 & SEAI Code of Practice\n• **Requirement**: Heat Loss Indicator (HLI) ≤ 2.0 W/K/m²\n• **Grants Available**: Up to **€12,500** for heat pumps, **€8,000** for wall wrap, **€1,800** for solar PV, and **€35,000** for deep retrofits.\n• **Independence**: 100% conflict-free advisory—no equipment sales or contractor commissions.`,
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
