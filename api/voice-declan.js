/**
 * /api/voice-declan.js
 * Vercel Serverless Function: Installer AI Technical Advisor (Declan)
 * Powered by Google Gemini 2.5 Flash
 *
 * DECLAN PERSONA:
 * - Role: Installer Technical Advisor (EcoSmartHomes Ireland)
 * - Audience: Heat pump installers, plumbers, electricians, retrofit contractors
 * - Tone: Practical, straight-talking, friendly tradesman (Limerick/Cork blend)
 * - Cadence: Rate 0.92 | Pitch 0.98 | en-IE voice priority
 */

const DECLAN_SCRIPTS = [
  {
    query: "calculate radiator output",
    speechText: "Standard radiator catalogs quote outputs at Delta T 50, which is 75 degrees flow. For a heat pump running at 45 degrees flow with 35 return, you're at Delta T 30. Multiply the catalog rating by zero point five one to get your true output.",
    displayText: "### 📐 SR50 Delta-T Conversion Formula\n\n• **Standard**: $\\Delta T 50^{\\circ}\\text{C}$ (75°C flow).\n• **Heat Pump**: $\\Delta T 30^{\\circ}\\text{C}$ (45°C flow).\n• **Formula**: $\\text{Output}_{45^{\\circ}\\text{C}} = \\text{Catalog Watts} \\times 0.51$.\n• **Example**: 2,000W catalog rad delivers **1,020 Watts** at 45°C flow.",
    citation: "NSAI SR50-1:2021",
    recommendedAction: "Radiator Sizer Engine"
  },
  {
    query: "hli rule",
    speechText: "SEAI rules require the Heat Loss Indicator to be at two point zero Watts per Kelvin per square metre or lower. If the home has solid walls or single glazing, you'll need fabric upgrades first to pass.",
    displayText: "### 🛡️ SEAI Heat Loss Indicator (HLI) Rule\n\n• **Threshold**: $\\text{HLI} \\le 2.0\\text{ W/K/m}^2$ (or $\\le 2.3$ with committed fabric roadmap).\n• **Seasonal COP**: Guarantees $\\text{SPF} \\ge 3.0$.\n• **Sign-Off**: Requires independent technical advisor assessment.",
    citation: "SEAI Domestic Technical Guidance SR50-2",
    recommendedAction: "Upload Room Data (€49)"
  },
  {
    query: "buffer tank",
    speechText: "Only if your system minimum water volume is below fifty litres when zone valves close. If you have open zones or a volumiser bottle, you can skip the buffer tank and save the homeowner twelve hundred euro.",
    displayText: "### 🛢️ Buffer Tank vs Volumiser Decision\n\n• **Rule of Thumb**: 10–12 litres system volume per kW of compressor capacity.\n• **When to Omit**: If 2+ zones (hallway/bathrooms) are permanently open without valve interlock.\n• **Cost Advantage**: Eliminates unnecessary secondary circulation pump and €1,200 hardware markups.",
    citation: "NSAI SR50-2 Hydraulic Design",
    recommendedAction: "Quote Red-Liner Tool"
  },
  {
    query: "pipe size",
    speechText: "For units up to 9 kW, 28mm copper or 32mm multilayer is your best bet to keep water velocity under one metre per second. 22mm is only grand for smaller 5 kW units or short boiler replacements.",
    displayText: "### 🚰 Primary Flow & Return Sizing\n\n• **5 kW – 6 kW**: 22mm copper (~14 l/min).\n• **8 kW – 12 kW**: **28mm copper** / 32mm multilayer (~22–28 l/min).\n• **Velocity Limit**: $< 1.0\\text{ m/s}$ to prevent pipe noise and pump strain.",
    citation: "NSAI SR50 Clause 6.2",
    recommendedAction: "Heat Pump Tender Pack (€199)"
  },
  {
    query: "installer pack",
    speechText: "You send us room dimensions and photos. We send you back room-by-room heat loss in Watts, radiator sizing for 45 degrees, pipe recommendations, and an installer-ready PDF in twenty-four to forty-eight hours.",
    displayText: "### 📦 €49 Digital Installer Pack\n\n• **Turnaround**: 24–48 hours from upload.\n• **Deliverables**: Room-by-room Watts calculation, Delta-T30 radiator sizes, flow rates, and pre-formatted grant compliance documentation.",
    citation: "EcoSmartHomes Technical Advisory",
    recommendedAction: "Upload Room Data (€49)"
  }
];

function findDeclanScriptMatch(query) {
  if (!query) return null;
  const cleanQ = query.toLowerCase();
  for (const s of DECLAN_SCRIPTS) {
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
    const { message, history = [], town = 'Ireland' } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'No message provided' });
    }

    const scriptMatch = findDeclanScriptMatch(message);
    if (scriptMatch) {
      return res.status(200).json({
        success: true,
        source: 'DECLAN_GROUNDED_PACK',
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
=== DECLAN — INSTALLER TECHNICAL ADVISOR ===

Core Identity:
You are Declan, the EcoSmartHomes Installer Technical Advisor.
Audience: Heat pump installers, plumbers, electricians, retrofit contractors, and technical advisors.
Tone: Practical, straight-talking, friendly, straightforward, efficient, no nonsense (Irish tradesman Limerick/Cork blend).
Pace: 0.92 (steady, practical, direct). Pitch: 0.98 (warm, grounded).
Purpose: Provide quick, accurate technical guidance for radiator sizing (Delta-T 30), SR50 compliance, hydraulic balancing, flow temperature optimization, and installation decisions.

Behaviour Matrix:
- Greeting: "How's it going? I'm Declan — here to help with sizing, SR50 checks, and anything technical you need."
- Explaining: "That room needs 1.2 kW at 45 degrees. Your current rad is giving about 900 watts, so you'll need to bump it up a size."
- Calming: "No hassle — this is a quick fix. We'll run the numbers and you'll know exactly what's needed."
- Advising: "Go with the 6 kW unit here — the heat loss supports it, and it'll run nicely at low flow temps."
- Closing: "If you need outputs, pipe sizing, or a quick SR50 check, just shout."

Technical Grounding:
- NSAI SR50 (Heat pump wet central heating design, Delta-T 30°C output factors)
- SEAI SR54:2024 (Domestic retrofit guidance, chimney sealing, HLI <= 2.0)
- DEAP 4.2.2 (Seasonal COP calculations)
- Digital Installer Pack (€49 output pack in 24-48h)
- Contractor Tender Pack (€199 RFP & quote red-liner)

Response Format:
Return a valid JSON object:
{
  "speechText": "Spoken response in Declan's straight-talking Irish tradesman voice (2-3 direct, practical sentences).",
  "displayText": "Structured technical display text with formulas, bullet points, and exact standard citations.",
  "citation": "NSAI SR50-1:2021 | NSAI SR50-2:2024 | SEAI SR54:2024",
  "recommendedAction": "Radiator Sizer | Upload Data (€49) | Tender Pack (€199)",
  "surveyCta": true
}

Location Context: ${town || 'Ireland'}
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
            console.error('JSON parse error from Declan:', e);
          }
        }
      }
    }

    // Fallback
    return res.status(200).json({
      success: true,
      data: {
        speechText: "That room needs 1.2 kW at 45 degrees flow. Standard catalog rads are rated at Delta T 50, so multiply by zero point five one to get your true output under NSAI SR50.",
        displayText: "### 📐 SR50 Radiator Sizing Rule\n\n• **Formula**: $\\text{Output}_{45^{\\circ}\\text{C}} = \\text{Catalog Watts} \\times 0.51$.\n• **Target**: Heat pump running at 45°C flow / 35°C return ($\Delta T 30^{\\circ}\\text{C}$).\n• **Deliverable**: Full room calculation via our €49 Installer Pack.",
        citation: "NSAI SR50-1:2021",
        recommendedAction: "Upload Room Data (€49)",
        surveyCta: true
      },
      fallback: true
    });

  } catch (err) {
    console.error('Declan API Error:', err);
    return res.status(500).json({ error: 'Internal server error in Declan voice advisor.' });
  }
}
