/**
 * /js/persona-router.js
 * EcoSmartHomes Master Persona Switchboard with Persona Memory System
 * Controls dynamic persona switching, voice synthesis parameters, and LocalStorage persistence
 * Supports: Aoife (Homeowner), Eimear (Estate Agent), Declan (Installer)
 */

(function(window) {
  'use strict';

  window.AG = window.AG || {};

  const AGPersonas = {
    aoife: {
      key: "aoife",
      name: "Aoife",
      role: "Homeowner Energy Advisor",
      rate: 0.94,
      pitch: 1.02,
      voiceHint: "en-IE",
      avatar: "👩‍💼",
      avatarBg: "#10b981",
      launcherText: "🎙️ Ask Aoife (Voice AI)",
      greeting: "Dia dhuit! I'm Aoife, your independent energy advisor.",
      systemPrompt: `
You are Aoife, the EcoSmartHomes Homeowner Advisor.
Speak in a warm, friendly Irish accent with gentle pacing.
Your role is to help homeowners understand grants, BER, comfort, radiator sizing, and energy upgrades without any sales pressure.
Ground all advice in Irish standards: SR50, SR54:2024, DEAP 4.2.2, and SEAI May 2026 grants. Be warm, reassuring, and clear.
`,
      samplePrompts: [
        { label: "📉 Lower Heating Bills", query: "How can I lower my heating bills this winter?" },
        { label: "💶 2026 Grant Eligibility", query: "What grants am I eligible for in 2026?" },
        { label: "🔥 Heat Pump Check", query: "Is my home suitable for a heat pump?" },
        { label: "📐 Radiator Sizing", query: "Can you check if my radiators are big enough?" },
        { label: "🏷️ Improve BER Rating", query: "How do I improve my BER rating?" },
        { label: "⚡ Cheapest High-Impact Upgrade", query: "What’s the cheapest upgrade with the biggest impact?" },
        { label: "🛡️ Carbon Tax Projections", query: "Can you explain carbon tax increases for my home?" },
        { label: "☀️ Solar PV Suitability", query: "Is solar worth it for my roof?" }
      ]
    },

    eimear: {
      key: "eimear",
      name: "Eimear",
      role: "Estate Agent Energy Advisor",
      rate: 1.0,
      pitch: 1.05,
      voiceHint: "en-IE",
      avatar: "💼",
      avatarBg: "#f59e0b",
      launcherText: "🎙️ Ask Eimear (Real Estate AI)",
      greeting: "Hello, I’m Eimear — your energy advisor for property listings.",
      systemPrompt: `
You are Eimear, the EcoSmartHomes Estate Agent Energy Advisor.
Speak in a polished, friendly Irish accent with clear professional diction.
Your role is to help estate agents explain BER ratings, upgrade options, valuation uplift, SEAI grants, and energy features to buyers and sellers.
Be confident, concise, and warm — never salesy.
Ground all advice in Irish standards: DEAP 4.2.2, SR54:2024, and SEAI May 2026 grants.
`,
      samplePrompts: [
        { label: "🏷️ Explain BER to Buyers", query: "How do I explain the BER rating to buyers?" },
        { label: "📈 BER Uplift with Insulation", query: "What’s the BER uplift if the homeowner adds insulation?" },
        { label: "📄 Listing Energy Summary", query: "Can you prepare a listing-ready energy summary?" },
        { label: "💎 Energy Valuation Uplift", query: "How do energy upgrades affect valuation?" },
        { label: "💶 Viewing Grant Script", query: "What grants should I mention during viewings?" },
        { label: "✍️ Listing Copywriting", query: "What’s the best way to phrase energy features in a listing?" },
        { label: "💡 Running Cost Queries", query: "How do I answer buyer questions about running costs?" },
        { label: "📊 Simulate BER Uplift", query: "Can you simulate the BER uplift for this property?" }
      ]
    },

    declan: {
      key: "declan",
      name: "Declan",
      role: "Installer Technical Advisor",
      rate: 0.92,
      pitch: 0.98,
      voiceHint: "en-IE",
      avatar: "⚡",
      avatarBg: "#38bdf8",
      launcherText: "🎙️ Ask Declan (Installer AI)",
      greeting: "How’s it going? I’m Declan — here to help with sizing and SR50 checks.",
      systemPrompt: `
You are Declan, the EcoSmartHomes Installer Technical Advisor.
Speak in a friendly Irish tradesman accent with practical, straightforward delivery.
Your role is to help installers with radiator sizing, heat loss, SR50 compliance, flow temperature optimisation, and technical decisions.
Be clear, direct, and efficient — no fluff.
Ground all advice in Irish standards: SR50, SR54:2024, DEAP 4.2.2, and SEAI May 2026 grants.
`,
      samplePrompts: [
        { label: "📐 Room Heat Loss (Watts)", query: "What’s the heat loss for this room?" },
        { label: "🌡️ Rad Sizing at 45°C Flow", query: "Is this radiator big enough at 45 degrees?" },
        { label: "⚡ Heat Pump kW Sizing", query: "What size heat pump does this house need?" },
        { label: "📜 NSAI SR50 Check", query: "Can you check SR50 compliance for this layout?" },
        { label: "🛢️ Buffer Tank Audit", query: "Do I need a buffer tank here?" },
        { label: "📊 Low-Temp Rad Output", query: "What’s the output of this rad at low temp?" },
        { label: "🚰 Primary Pipe Sizing", query: "Is the pipework okay for a heat pump?" },
        { label: "📈 Optimal Flow Temp", query: "Can you give me the proper flow temperature?" }
      ]
    }
  };

  // Aliases
  AGPersonas.homeowner = AGPersonas.aoife;
  AGPersonas.agent = AGPersonas.eimear;
  AGPersonas.installer = AGPersonas.declan;

  window.AGPersonas = AGPersonas;

  // ===============================
  // Persona Memory System
  // ===============================

  // Save persona to memory
  window.AG.savePersona = function(personaName) {
    try {
      localStorage.setItem("ESH_lastPersona", personaName);
    } catch (e) {
      console.warn("LocalStorage unavailable for Persona Memory:", e);
    }
  };

  // Load saved persona from memory
  window.AG.loadSavedPersona = function() {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlPersona = params.get('persona') || params.get('role');
      if (urlPersona && AGPersonas[urlPersona.toLowerCase()]) {
        window.AG.setVoicePersona(urlPersona.toLowerCase(), false);
        return;
      }

      const path = window.location.pathname.toLowerCase();
      if (path.includes('property-auditor') || path.includes('daft-hud') || path.includes('eimear')) {
        window.AG.setVoicePersona('eimear', false);
        return;
      }
      if (path.includes('radiator-sizer') || path.includes('tender-generator') || path.includes('declan')) {
        window.AG.setVoicePersona('declan', false);
        return;
      }

      const saved = localStorage.getItem("ESH_lastPersona");
      if (saved && AGPersonas[saved.toLowerCase()]) {
        window.AG.setVoicePersona(saved.toLowerCase(), false);
      } else {
        window.AG.setVoicePersona("aoife", false); // default fallback
      }
    } catch (e) {
      window.AG.setVoicePersona("aoife", false);
    }
  };

  // ===============================
  // Persona Activation Function
  // ===============================

  window.AG.setVoicePersona = function(personaName, autoSpeak = false) {
    const key = (personaName || 'aoife').toLowerCase();
    const persona = AGPersonas[key] || AGPersonas.aoife;

    window.AG.currentPersona = persona;

    if (typeof window.AG.setVoiceSettings === 'function') {
      window.AG.setVoiceSettings({
        rate: persona.rate,
        pitch: persona.pitch,
        voiceHint: persona.voiceHint
      });
    }

    if (typeof window.AG.setSystemPrompt === 'function') {
      window.AG.setSystemPrompt(persona.systemPrompt);
    }

    // Call underlying Voice Advisor Engine if active
    if (typeof window.setVoicePersona === 'function') {
      window.setVoicePersona(persona.key, false);
    }

    if (autoSpeak && window.AG.voice && typeof window.AG.voice.say === 'function') {
      window.AG.voice.say(persona.greeting);
    }

    // Save persona to persistent memory
    window.AG.savePersona(persona.key);
  };

  // Click Router Helper
  window.AG.onClick = function(elementId, handler) {
    const attach = () => {
      const el = document.getElementById(elementId) || document.querySelector(`[data-persona="${elementId.replace('-hub', '')}"]`);
      if (el) el.addEventListener('click', handler);
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attach);
    } else {
      attach();
    }
  };

  // ===============================
  // Hub Click Routing Bindings
  // ===============================
  window.AG.onClick("homeowner-hub", () => window.AG.setVoicePersona("aoife", false));
  window.AG.onClick("estate-agent-hub", () => window.AG.setVoicePersona("eimear", false));
  window.AG.onClick("installer-hub", () => window.AG.setVoicePersona("declan", false));

  // Auto-bootstrap persona memory on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.AG.loadSavedPersona());
  } else {
    window.AG.loadSavedPersona();
  }

})(window);
