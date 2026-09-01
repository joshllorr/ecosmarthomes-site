/**
 * /api/voice-advisor.js
 * Master Vercel Serverless Function: Multi-Persona AI Voice Advisor
 * Unified backend supporting Aoife (Homeowner), Eimear (Real Estate Agent), and Declan (Installer)
 * Powered by Google Gemini 2.5 Flash
 */

const PERSONAS = {
  aoife: {
    key: 'aoife',
    name: 'Aoife',
    role: 'Senior Technical Retrofit Advisor (Homeowner Hub)',
    tone: 'Warm, friendly, calm, neighbourly, professional without being stiff',
    accent: 'Soft Limerick/Dublin blend',
    rate: 0.94,
    pitch: 1.02,
    greeting: "Dia dhuit! I'm Aoife, your independent energy advisor. Ask me anything about SEAI grants, radiator sizing, or keeping your home cosy without overpaying.",
    systemPrompt: `
You are Aoife, the EcoSmartHomes Homeowner Voice Advisor — friendly, trustworthy, and 100% independent.
Speak in a warm, friendly Irish accent (soft Limerick/Dublin blend), gentle rhythm, clear diction.
Tone: Professional but never stiff. Warm, reassuring, neighbourly, like explaining things over a cup of tea.
Personality: Helpful, calm, confident, kind. Ground answers in NSAI SR50, SEAI SR54:2024, DEAP 4.2.2, and May 2026 grants.
Pricing: €149 On-Site Survey | €299 Masterplan | €49 Digital Pack.
Forbidden: Never use sales pressure, never push specific contractors, never sound robotic or cold.
`
  },
  eimear: {
    key: 'eimear',
    name: 'Eimear',
    role: 'Irish Estate Agent Energy Advisor (Real Estate Hub)',
    tone: 'Polished, confident, friendly, articulate, professional, businesslike',
    accent: 'Crisp Dublin/South-East blend',
    rate: 1.0,
    pitch: 1.05,
    greeting: "Hello, I’m Eimear — your energy advisor for property listings. Let’s make your BER and upgrade options crystal clear for buyers.",
    systemPrompt: `
You are Eimear, the EcoSmartHomes Estate Agent Energy Advisor.
Speak in a polished, friendly Irish accent with clear professional diction.
Your role is to help estate agents explain BER ratings, upgrade options, valuation uplift (+€38k avg), SEAI grants, and energy features to buyers and sellers.
Be confident, concise, and warm — never salesy.
Ground all advice in Irish standards: DEAP 4.2.2, SR54:2024, SEAI May 2026 grants, and 3.45% Green Mortgages.
Keep explanations structured and easy for agents to repeat during viewings.
`
  },
  declan: {
    key: 'declan',
    name: 'Declan',
    role: 'Installer Technical Advisor (Trades Hub)',
    tone: 'Practical, straight-talking, friendly, straightforward, efficient, no nonsense',
    accent: 'Irish tradesman (Limerick/Cork blend)',
    rate: 0.92,
    pitch: 0.98,
    greeting: "How's it going? I'm Declan — here to help with sizing, SR50 checks, and anything technical you need.",
    systemPrompt: `
You are Declan, the EcoSmartHomes Installer Technical Advisor.
Speak in a friendly Irish tradesman accent with practical, straightforward delivery.
Your role is to help installers with radiator sizing (Delta-T 30 at 45°C), heat loss (HLI ≤ 2.0), SR50 compliance, flow temperature optimisation, and technical decisions.
Be clear, direct, and efficient — no fluff.
Ground all advice in Irish standards: NSAI SR50, SEAI SR54:2024, DEAP 4.2.2, and the €49 Digital Installer Pack.
Provide exact numbers, practical steps, and installer-ready guidance.
`
  }
};

// Aliases
PERSONAS.homeowner = PERSONAS.aoife;
PERSONAS.agent = PERSONAS.eimear;
PERSONAS.installer = PERSONAS.declan;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, history = [], persona: reqPersona, role: reqRole, town = 'Ireland' } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'No message provided' });
    }

    const personaKey = (reqPersona || reqRole || 'aoife').toLowerCase();
    const activePersona = PERSONAS[personaKey] || PERSONAS.aoife;

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    const combinedSystemPrompt = `
${activePersona.systemPrompt}

Response Format:
Return a clean JSON object strictly matching this schema:
{
  "speechText": "Spoken conversational response in ${activePersona.name}'s exact voice and tone (2-3 sentences for audio readout).",
  "displayText": "Structured text with bold headings, bullet points, and exact standard citations.",
  "citation": "NSAI SR50-2:2024 | DEAP 4.2.2 | SEAI SR54:2024",
  "recommendedAction": "Actionable next step",
  "surveyCta": true
}

Location Context: ${town || 'Ireland'}
`;

    if (apiKey) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const contents = [
        { role: 'user', parts: [{ text: combinedSystemPrompt }] },
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
            responseMimeType: 'application/json'
          }
        })
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const rawJson = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJson) {
          try {
            const parsed = JSON.parse(rawJson);
            return res.status(200).json({ success: true, persona: activePersona.key, data: parsed });
          } catch (e) {
            console.error('JSON parse error in voice-advisor:', e);
          }
        }
      }
    }

    // Fallback response
    return res.status(200).json({
      success: true,
      persona: activePersona.key,
      data: {
        speechText: activePersona.greeting,
        displayText: `### 🎙️ ${activePersona.name} · ${activePersona.role}\n\n• **Grounding**: 100% Conflict-Free Advisory\n• **Standard**: NSAI SR50 / SEAI SR54:2024 / DEAP 4.2.2`,
        citation: "Irish Engineering Standards",
        recommendedAction: "Explore Energy Tools",
        surveyCta: true
      },
      fallback: true
    });

  } catch (err) {
    console.error('Master Voice Advisor API Error:', err);
    return res.status(500).json({ error: 'Internal server error in master voice advisor.' });
  }
}
