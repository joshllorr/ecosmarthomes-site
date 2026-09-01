/**
 * /api/voice-eimear.js
 * Vercel Serverless Function: Real Estate AI Energy Advisor (Eimear)
 * Powered by Google Gemini 2.5 Flash
 *
 * EIMEAR PERSONA:
 * - Role: Irish Estate Agent Energy Advisor (EcoSmartHomes Ireland)
 * - Audience: Estate agents, auctioneers, valuers, property managers
 * - Tone: Polished, confident, friendly, professional, articulate (Dublin/South-East blend)
 * - Cadence: Rate 1.0 | Pitch 1.05 | en-IE voice priority
 */

const EIMEAR_SCRIPTS = [
  {
    query: "increase property value",
    speechText: "A higher BER doesn't just reduce bills — it increases buyer confidence and improves valuation. Stepping a standard home from G or D to an A rating yields an average of thirty-eight thousand euro in capital equity surge in the Irish market.",
    displayText: "### 📈 Property Valuation Uplift\n\n• **Equity Surge**: +**€38,000** average property valuation uplift.\n• **Buyer Appetite**: 78% of active buyers search for B3+ ratings.\n• **Daft.ie Premium**: A-rated homes sell up to 14 days faster.",
    citation: "DEAP 4.2.2 & ESRI Research",
    recommendedAction: "Estate Agent Energy Pack (€99)"
  },
  {
    query: "green mortgage",
    speechText: "When buyers view a home rated B3 or better, they qualify for green mortgage rates around 3.45 percent. On an average Irish mortgage balance, that saves them about two hundred and thirty euro every month in interest alone.",
    displayText: "### 💼 3.45% Green Mortgage Slasher\n\n• **Green Rate**: 3.45% fixed vs 4.65% standard variable.\n• **Monthly Savings**: ~**€230/month** on €350,000 mortgage.\n• **Lifetime Savings**: Over **€82,000** across 30-year term.",
    citation: "BPFI Green Mortgage Benchmark",
    recommendedAction: "1-Click Property Auditor"
  },
  {
    query: "quickest upgrade",
    speechText: "For this property, the quickest uplift is attic insulation and heating controls. Great value, fast turnaround, and it can bump a D rating up to C or B within days.",
    displayText: "### ⚡ Rapid Pre-Sale BER Boost\n\n1. **300mm Attic Insulation**: 1-day install, €2,500 grant.\n2. **Heating Controls**: €700 grant, immediately cuts primary energy.",
    citation: "SEAI SR54:2024",
    recommendedAction: "Order Estate Agent Pack (€99)"
  },
  {
    query: "estate agent pack",
    speechText: "The Estate Agent Energy Pack is a ninety-nine euro listing-ready dossier. It includes a 2-page marketing summary, buyer-friendly upgrade roadmap, green mortgage savings, and carbon tax shield projections.",
    displayText: "### 📜 Estate Agent Energy Pack (€99 Deliverable)\n\n• **Listing Ready**: 2-Page branded PDF summary for brochures.\n• **Buyer Roadmap**: Itemized SEAI grant deductions applied.\n• **Mortgage Certificate**: Document certifying Green Rate eligibility.",
    citation: "EcoSmartHomes Professional B2B Framework",
    recommendedAction: "Order Pack (€99)"
  }
];

function findEimearScriptMatch(query) {
  if (!query) return null;
  const cleanQ = query.toLowerCase();
  for (const s of EIMEAR_SCRIPTS) {
    if (cleanQ.includes(s.query)) return s;
  }
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, history = [], propertyAddress = 'Irish Property Listing' } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'No message provided' });
    }

    const scriptMatch = findEimearScriptMatch(message);
    if (scriptMatch) {
      return res.status(200).json({
        success: true,
        source: 'EIMEAR_GROUNDED_PACK',
        data: {
          speechText: scriptMatch.speechText,
          displayText: scriptMatch.displayText,
          citation: scriptMatch.citation,
          recommendedAction: scriptMatch.recommendedAction,
          surveyCta: true
        }
      });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    const SYSTEM_PROMPT = `
=== EIMEAR — REAL ESTATE AI ENERGY ADVISOR ===

Core Identity:
You are Eimear, the EcoSmartHomes Estate Agent Energy Advisor.
Audience: Irish estate agents, auctioneers, valuers, and property managers.
Tone: Polished, confident, friendly, articulate, professional (Dublin/South-East Irish blend).
Pace: 1.0 (crisp, structured, no rambling). Pitch: 1.05 (bright, confident).
Purpose: Help agents explain BER ratings, upgrade options, capital valuation uplift (+€38k avg), 3.45% green mortgages, and SEAI grants to buyers and sellers.

Behaviour Matrix:
- Greeting: "Hello, I’m Eimear — your energy advisor for property listings. Let’s make your BER and upgrade options crystal clear for buyers."
- Explaining: "A higher BER doesn’t just reduce bills — it increases buyer confidence and improves valuation. Let me walk you through the uplift."
- Calming: "No stress at all — energy questions are becoming very common in viewings. I’ll help you explain everything simply."
- Advising: "For this property, the quickest uplift is attic insulation and heating controls. Great value, fast turnaround."
- Closing: "If you need a listing-ready energy summary or BER uplift simulation, I’m here anytime."

Technical Grounding:
- DEAP 4.2.2 (Building Energy Rating rules)
- SEAI May 2026 Grants: Deep Retrofit (€35k), Heat Pump (€6.5k/€12.5k), Wrap (€8k), Solar (€2.1k)
- 3.45% Green Mortgage qualification threshold (BER B3 or better)
- Estate Agent Energy Pack (€99 per property)

Response Format:
Return a valid JSON object:
{
  "speechText": "Spoken response in Eimear's crisp, polished Irish voice (2-3 structured sentences for audio).",
  "displayText": "Structured display text with bold headings and bullet points for agent viewings.",
  "citation": "DEAP 4.2.2 | BPFI Green Mortgage Schedule",
  "recommendedAction": "Estate Agent Energy Pack (€99) | 1-Click Property Auditor",
  "surveyCta": true
}

Context Property: ${propertyAddress}
`;

    if (apiKey) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const contents = [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
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
        const rawJson = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJson) {
          try {
            const parsed = JSON.parse(rawJson);
            return res.status(200).json({ success: true, data: parsed });
          } catch (e) {
            console.error('JSON parse error from Eimear:', e);
          }
        }
      }
    }

    // Fallback
    return res.status(200).json({
      success: true,
      data: {
        speechText: "A higher BER doesn't just reduce bills — it increases buyer confidence and improves valuation. Stepping this home to an A rating yields an average of thirty-eight thousand euro in valuation surge in the Irish market.",
        displayText: "### 📈 Property Valuation Uplift (Irish Market)\n\n• **Valuation Impact**: +**€38,000** average property equity surge.\n• **Mortgage Advantage**: Unlocks **3.45% Green Mortgage** rates for prospective buyers.\n• **Listing Dossier**: Available via our Estate Agent Energy Pack (€99).",
        citation: "DEAP 4.2.2 & ESRI Irish Housing Data",
        recommendedAction: "Estate Agent Energy Pack (€99)",
        surveyCta: true
      },
      fallback: true
    });

  } catch (err) {
    console.error('Eimear API Error:', err);
    return res.status(500).json({ error: 'Internal server error in Eimear voice advisor.' });
  }
}
