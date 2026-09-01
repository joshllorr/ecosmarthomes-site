/**
 * /js/persona-router.js
 * EcoSmartHomes Master Persona Switchboard with Persona Memory & Onboarding System
 * Controls dynamic persona switching, voice synthesis parameters, dynamic colour themes, and first-time onboarding
 * Supports: Aoife (Homeowner), Eimear (Estate Agent), Declan (Installer)
 */

(function(window) {
  'use strict';

  window.AG = window.AG || {};

  const AGPersonas = {
    aoife: {
      key: "aoife",
      personaKey: "homeowner",
      name: "Aoife",
      title: "Homeowner Energy Advisor",
      role: "Homeowner Energy Advisor",
      rate: 0.94,
      pitch: 1.02,
      voiceHint: "en-IE",
      avatar: "👩‍💼",
      avatarBg: "#10b981",
      accentColor: "#34f5c5",
      glowColor: "rgba(52, 245, 197, 0.4)",
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
      personaKey: "agent",
      name: "Eimear",
      title: "Estate Agent Energy Advisor",
      role: "Estate Agent Energy Advisor",
      rate: 1.0,
      pitch: 1.05,
      voiceHint: "en-IE",
      avatar: "💼",
      avatarBg: "#f59e0b",
      accentColor: "#fbbf24",
      glowColor: "rgba(251, 191, 36, 0.4)",
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
      personaKey: "installer",
      name: "Declan",
      title: "Installer Technical Advisor",
      role: "Installer Technical Advisor",
      rate: 0.92,
      pitch: 0.98,
      voiceHint: "en-IE",
      avatar: "⚡",
      avatarBg: "#38bdf8",
      accentColor: "#38bdf8",
      glowColor: "rgba(56, 189, 248, 0.4)",
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
  // Dynamic Colour Theming Engine
  // ===============================
  function applyPersonaTheme(persona) {
    if (!persona) return;
    document.documentElement.style.setProperty('--persona-accent', persona.accentColor);
    document.documentElement.style.setProperty('--persona-glow', persona.glowColor);

    const launcher = document.getElementById('voice-launcher');
    if (launcher) {
      launcher.style.boxShadow = `0 4px 20px ${persona.glowColor}`;
      launcher.style.borderColor = persona.accentColor;
    }

    const pulse = document.querySelector('.voice-launcher-pulse');
    if (pulse) {
      pulse.style.background = persona.accentColor;
    }

    const avatar = document.getElementById('voice-advisor-avatar');
    if (avatar) {
      avatar.style.background = persona.avatarBg;
      avatar.innerText = persona.avatar;
    }
  }

  // ===============================
  // Persona Memory System
  // ===============================
  window.AG.savePersona = function(personaName) {
    try {
      localStorage.setItem("ESH_lastPersona", personaName);
    } catch (e) {
      console.warn("LocalStorage unavailable for Persona Memory:", e);
    }
  };

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
        window.AG.setVoicePersona("aoife", false);
        checkFirstTimeOnboarding();
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

    applyPersonaTheme(persona);

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

    if (typeof window.setVoicePersona === 'function') {
      window.setVoicePersona(persona.personaKey, false);
    }

    if (autoSpeak && window.AG.voice && typeof window.AG.voice.say === 'function') {
      window.AG.voice.say(persona.greeting);
    }

    window.AG.savePersona(persona.key);
  };

  // ===============================
  // First-Time Persona Onboarding Modal
  // ===============================
  function checkFirstTimeOnboarding() {
    try {
      const hasSeen = localStorage.getItem("ESH_hasSeenOnboarding");
      const isHome = window.location.pathname === '/' || window.location.pathname.endsWith('index.html') || window.location.pathname === '';
      if (!hasSeen && isHome) {
        setTimeout(renderOnboardingModal, 1200);
      }
    } catch (e) {}
  }

  function renderOnboardingModal() {
    if (document.getElementById('esh-persona-onboarding-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'esh-persona-onboarding-modal';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 18, 13, 0.88);
      backdrop-filter: blur(16px);
      z-index: 99999;
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
      animation: eshFadeIn 0.3s ease-out forwards;
    `;

    modal.innerHTML = `
      <style>
        @keyframes eshFadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        .esh-onboarding-card {
          background: #00241b; border: 1.5px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 22px 18px;
          cursor: pointer; transition: all 0.25s ease; text-align: left; display: flex; flex-direction: column; justify-content: space-between;
        }
        .esh-onboarding-card:hover {
          transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.5);
        }
        .card-homeowner:hover { border-color: #34f5c5; box-shadow: 0 0 25px rgba(52,245,197,0.25); }
        .card-agent:hover { border-color: #fbbf24; box-shadow: 0 0 25px rgba(251,191,36,0.25); }
        .card-installer:hover { border-color: #38bdf8; box-shadow: 0 0 25px rgba(56,189,248,0.25); }
      </style>
      <div style="background: #001f17; border: 1.5px solid rgba(52, 245, 197, 0.35); border-radius: 28px; max-width: 860px; width: 100%; padding: clamp(24px, 4vw, 40px); box-shadow: 0 25px 60px rgba(0,0,0,0.8); text-align: center; position: relative;">
        <button onclick="dismissOnboarding('aoife')" style="position: absolute; top: 20px; right: 20px; background: none; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer;">✕</button>
        
        <div style="font-size: 0.78rem; font-weight: 800; color: #34f5c5; text-transform: uppercase; font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.08em; margin-bottom: 6px;">
          Welcome to EcoSmartHomes Ireland
        </div>
        <h2 style="color: #ffffff; font-size: clamp(1.6rem, 3.5vw, 2.2rem); font-weight: 900; margin: 0 0 10px 0;">
          Who are you exploring for today?
        </h2>
        <p style="color: #cbd5e1; font-size: 0.95rem; max-width: 620px; margin: 0 auto 30px auto; line-height: 1.5;">
          Select your role to personalize your tools and activate your dedicated 100% conflict-free Irish AI Energy Advisor.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 16px; margin-bottom: 24px;">
          
          <!-- Homeowner -->
          <div class="esh-onboarding-card card-homeowner" onclick="dismissOnboarding('aoife')">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                <span style="font-size: 2rem;">🏡</span>
                <span style="background: rgba(52,245,197,0.15); color: #34f5c5; font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border-radius: 8px; font-family: 'IBM Plex Mono', monospace;">Aoife</span>
              </div>
              <h3 style="color: #ffffff; font-size: 1.15rem; font-weight: 800; margin: 0 0 6px 0;">Homeowner</h3>
              <p style="color: #94a3b8; font-size: 0.82rem; line-height: 1.4; margin: 0;">
                Lower heating bills, size radiators, and claim up to €35,000 in SEAI retrofit grants.
              </p>
            </div>
            <div style="margin-top: 16px; font-size: 0.8rem; color: #34f5c5; font-weight: 800;">
              Select Homeowner →
            </div>
          </div>

          <!-- Estate Agent -->
          <div class="esh-onboarding-card card-agent" onclick="dismissOnboarding('eimear')">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                <span style="font-size: 2rem;">💼</span>
                <span style="background: rgba(251,191,36,0.15); color: #fbbf24; font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border-radius: 8px; font-family: 'IBM Plex Mono', monospace;">Eimear</span>
              </div>
              <h3 style="color: #ffffff; font-size: 1.15rem; font-weight: 800; margin: 0 0 6px 0;">Estate Agent / Valuer</h3>
              <p style="color: #94a3b8; font-size: 0.82rem; line-height: 1.4; margin: 0;">
                Explain BER uplift, unlock +€38k valuation equity surge, and highlight 3.45% green mortgages.
              </p>
            </div>
            <div style="margin-top: 16px; font-size: 0.8rem; color: #fbbf24; font-weight: 800;">
              Select Estate Agent →
            </div>
          </div>

          <!-- Installer -->
          <div class="esh-onboarding-card card-installer" onclick="dismissOnboarding('declan')">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                <span style="font-size: 2rem;">⚡</span>
                <span style="background: rgba(56,189,248,0.15); color: #38bdf8; font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border-radius: 8px; font-family: 'IBM Plex Mono', monospace;">Declan</span>
              </div>
              <h3 style="color: #ffffff; font-size: 1.15rem; font-weight: 800; margin: 0 0 6px 0;">Installer / Trades</h3>
              <p style="color: #94a3b8; font-size: 0.82rem; line-height: 1.4; margin: 0;">
                NSAI SR50 low-temperature radiator sizing, heat loss formulas, and €49 digital data packs.
              </p>
            </div>
            <div style="margin-top: 16px; font-size: 0.8rem; color: #38bdf8; font-weight: 800;">
              Select Installer →
            </div>
          </div>

        </div>

        <button onclick="dismissOnboarding('aoife')" style="background: none; border: none; color: #64748b; font-size: 0.82rem; cursor: pointer; text-decoration: underline;">
          Explore all tools without selecting a role
        </button>
      </div>
    `;

    document.body.appendChild(modal);
  }

  window.dismissOnboarding = function(personaKey) {
    try {
      localStorage.setItem("ESH_hasSeenOnboarding", "true");
    } catch (e) {}

    const modal = document.getElementById('esh-persona-onboarding-modal');
    if (modal) modal.remove();

    if (personaKey) {
      window.AG.setVoicePersona(personaKey, false);
      if (typeof window.setPersona === 'function') {
        const personaMapping = { aoife: 'homeowner', eimear: 'agent', declan: 'installer' };
        window.setPersona(personaMapping[personaKey] || 'homeowner');
      }
    }
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

  // Hub Click Routing
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
