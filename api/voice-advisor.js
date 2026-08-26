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

    // SEAI Grounded Engineering Knowledge Base (SR50, SR54:2024, DEAP 4.2.2, May 2026 Code of Practice)
    const SEAI_GROUNDING_DATABASE = `
[SEAI TECHNICAL CITATIONS KNOWLEDGE BASE]:
1. Open Fireplace & Chimneys with Heat Pumps:
   - Citation: SEAI Technical Guidance SR54:2024 Section 4.2 & DEAP 4.2.2 Rule 3.4
   - Rule: Open flues cause massive uncontrolled ventilation and draft losses. To qualify for a heat pump grant (HLI <= 2.0 W/K/m²), open fireplaces must be permanently sealed or fitted with room-sealed / balanced-flue appliances with dedicated external air intake.
2. Heat Loss Indicator (HLI) 2.0 Requirement:
   - Citation: SEAI Domestic Technical Guidance SR50-2 Clause 3.4
   - Rule: Prior to heat pump grant approval, a registered Technical Advisor must certify HLI <= 2.0 W/K/m² (or <= 2.3 with fabric roadmap) to ensure Seasonal Performance Factor (SPF) >= 3.0.
3. Low-Temperature Radiator Sizing (Delta T 30):
   - Citation: NSAI SR50-1:2021 Code of Practice for Domestic Wet Central Heating Systems
   - Rule: Heat pumps run at 45°C flow / 35°C return (Delta T 30°C). Existing radiators must be audited; undersized single-panel radiators must be replaced with high-output double-panel convector (Type 22) units.
4. External Wall Insulation (The Wrap):
   - Citation: SEAI May 2026 Code of Practice & NSAI Agrément I.S. EN 13163 / SR54 Clause 5.3
   - Rule: EWI wrap must achieve U-Value <= 0.18 W/m²K with NSAI Agrément certified insulation.
5. Attic Insulation & Ventilation:
   - Citation: SEAI Domestic Technical Guidance SR54 Clause 6.1 & BS 5250
   - Rule: 300mm mineral wool (U <= 0.16 W/m²K) with a mandatory 50mm continuous eaves ventilation gap.
6. Solar PV & Clean Export Guarantee (CEG):
   - Citation: Commission for Regulation of Utilities (CRU) Decision & Finance Act 2023 0% VAT
   - Rule: Suppliers pay ~24c/kWh for exported power under CEG. Permanent 0% VAT applies to domestic solar.
7. May 2026 Grant Rates:
   - Heat Pump: €12,500 | Wall Wrap: €8,000 | Attic: €2,500 | Solar PV: €1,800 | Heating Controls: €700.
`;

    const systemPrompt = `
You are "Aoife", Senior Technical Retrofit Advisor for EcoSmartHomes Ireland (www.ecosmarthomes.ie).
You are answering an Irish homeowner asking via voice/chat about SEAI energy upgrades (location context: ${town}).

Core Directive:
Ground your answers directly in official Irish engineering standards (SR54:2024, SR50-1, SR50-2, DEAP 4.2.2, May 2026 SEAI rates).
When answering technical questions, cite the exact SEAI/NSAI standard (e.g. "Under SEAI Technical Guidance SR54 Section 4.2...").

Tone & Style:
- Professional, authentic, warm, and direct.
- Keep "speechText" conversational and concise (2-4 sentences max) for clear voice readout.
- In "displayText", include the exact standard citation and structured bullet points.
- Always highlight 100% independent advisory (no installer kickbacks).
- Invite them to order our €49 Independent Retrofit Survey for their exact calculations.

${SEAI_GROUNDING_DATABASE}

Return a JSON object in this format without markdown backticks:
{
  "speechText": "Spoken conversational response (2-4 sentences max) citing key standard if relevant.",
  "displayText": "Structured display text with bold headings, bullet points, and exact clause citation (e.g. '• **Standard**: SR54:2024 Section 4.2').",
  "citation": "SR54:2024 Section 4.2 | SR50-2 Clause 3.4 | DEAP 4.2.2",
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
            temperature: 0.2,
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

    // High-fidelity grounded fallback response
    const msgLower = (message || '').toLowerCase();
    let fallback = {
      speechText: `Under SEAI Technical Guidance SR54 and May 2026 grant rules, Irish homeowners can access up to €12,500 for a heat pump, €8,000 for wall insulation, and €1,800 for solar PV. To guarantee your home qualifies for the Heat Loss Index limit of 2.0, we recommend our €49 independent survey.`,
      displayText: `Under **SEAI Technical Guidance SR54:2024 & May 2026 Code of Practice**:\n• **Heat Pump System**: Up to **€12,500** grant (Requires HLI ≤ 2.0 W/K/m²)\n• **External Wall Insulation (Wrap)**: Up to **€8,000** grant (U-Value ≤ 0.18 W/m²K)\n• **Attic Insulation**: Up to **€2,500** grant (300mm minimum)\n• **Solar PV Panels**: Up to **€1,800** grant + 24c/kWh Clean Export (0% VAT)\n\n• **Standard Reference**: NSAI SR50-1 & SR54:2024 Clause 3.4`,
      citation: "SR54:2024 Section 4.2 / SR50-2",
      recommendedAction: "€49 Survey",
      surveyCta: true
    };

    if (msgLower.includes('fireplace') || msgLower.includes('chimney') || msgLower.includes('open fire')) {
      fallback.speechText = `Under SEAI Technical Guidance SR54 Section 4.2, open fireplaces cannot remain in use with a heat pump because of excessive draft losses. The chimney must be permanently sealed or fitted with a room-sealed appliance to meet the Heat Loss requirement.`;
      fallback.displayText = `**Open Fireplaces & SEAI Heat Pump Rules**:\n• **Official Standard**: *SEAI Technical Guidance SR54:2024 Section 4.2 & DEAP 4.2.2 Rule 3.4*\n• **Rule**: Open flues create massive uncontrolled ventilation heat loss. To achieve the required **Heat Loss Indicator (HLI ≤ 2.0 W/K/m²)**, open fireplaces must be permanently sealed at the throat or replaced with a room-sealed stove with dedicated external air intake.\n• **Advisory**: Our **€49 Independent Survey** inspects your chimneys and ventilation pathways to guarantee grant compliance.`;
      fallback.citation = "SR54:2024 Section 4.2";
    }

    return res.status(200).json({ success: true, data: fallback });

  } catch (err) {
    console.error('Error in voice-advisor API:', err);
    return res.status(500).json({ error: 'Voice advisor failed: ' + (err.message || err) });
  }
}
