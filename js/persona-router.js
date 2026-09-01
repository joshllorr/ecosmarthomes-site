/**
 * /js/persona-router.js
 * EcoSmartHomes Master Persona Switchboard with Color Wash & Cinematic Bloom Transitions
 * Controls dynamic persona switching, background color washes, ripple animations, and session memory
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
      avatar: "🏡",
      avatarBg: "#10b981",
      accentColor: "#34f5c5",
      glowColor: "rgba(30, 143, 75, 0.6)",
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
      glowColor: "rgba(242, 201, 76, 0.6)",
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
      glowColor: "rgba(0, 180, 255, 0.6)",
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

  // Dynamic Theming
  function applyPersonaTheme(persona) {
    if (!persona) return;
    document.documentElement.style.setProperty('--persona-accent', persona.accentColor);
    document.documentElement.style.setProperty('--persona-glow', persona.glowColor);

    const launcher = document.getElementById('voice-launcher');
    if (launcher) {
      launcher.style.boxShadow = `0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px ${persona.glowColor}`;
      launcher.style.borderColor = persona.accentColor;
    }

    const modal = document.getElementById('voice-modal');
    if (modal) {
      modal.style.borderColor = persona.accentColor;
      modal.style.boxShadow = `0 25px 60px rgba(0, 0, 0, 0.7), 0 0 30px ${persona.glowColor}`;
    }

    const avatars = document.querySelectorAll('.hologram-avatar');
    avatars.forEach(av => {
      av.innerText = persona.avatar;
      av.style.background = persona.avatarBg;
      av.style.borderColor = persona.accentColor;
    });

    const waves = document.querySelectorAll('.hologram-wave');
    waves.forEach(w => w.style.borderColor = persona.accentColor);
  }

  // ===============================
  // Color Wash Background Transition
  // ===============================
  window.AG.triggerColorWash = function(personaName) {
    const wash = document.getElementById("personaColorWash");
    if (!wash) return;

    // Reset classes
    wash.className = "";

    // Apply persona color wash
    wash.classList.add(`colorwash-${personaName}`);

    // Force reflow and animate in
    void wash.offsetWidth;
    wash.classList.add("colorwash-animate-in");

    // Fade out after 900ms
    setTimeout(() => {
      wash.classList.remove("colorwash-animate-in");
      wash.classList.add("colorwash-animate-out");
    }, 900);
  };

  // ===============================
  // Persona Ripple Effect
  // ===============================
  window.AG.triggerPersonaRipple = function(personaName) {
    const card = document.querySelector(`[data-persona="${personaName}"]`);
    if (!card) return;

    const existing = card.querySelector('.persona-ripple-orb');
    if (existing) existing.remove();

    const ripple = document.createElement('div');
    ripple.className = 'persona-ripple-orb';
    card.appendChild(ripple);

    setTimeout(() => ripple.remove(), 1000);
  };

  // ===============================
  // Cinematic Persona Switch Animation
  // ===============================
  window.AG.animatePersonaSwitch = function(oldPersona, newPersona) {
    const oldCard = document.querySelector(`[data-persona="${oldPersona}"]`);
    const newCard = document.querySelector(`[data-persona="${newPersona}"]`);

    // Remove previous animation classes
    document.querySelectorAll(".persona-card, .esh-onboarding-card").forEach(card => {
      card.classList.remove("halo-fade-in", "halo-fade-out", "active-halo");
      card.querySelector(".persona-badge")?.classList.remove("visible");
      card.querySelector(".primary-action")?.classList.remove("cta-pop");
    });

    // Fade out old persona
    if (oldCard) {
      oldCard.classList.add("halo-fade-out");
    }

    // Delay before blooming new persona
    setTimeout(() => {
      if (newCard) {
        newCard.classList.add("halo-fade-in", "active-halo");

        // Badge + CTA animation
        const badge = newCard.querySelector(".persona-badge");
        const cta = newCard.querySelector(".primary-action");

        if (badge) {
          badge.classList.add("visible");
        }
        if (cta) {
          cta.classList.add("cta-pop");
          const name = AGPersonas[newPersona]?.name || 'Advisor';
          cta.textContent = `Continue with ${name} →`;
        }

        const subtitle = document.querySelector(".persona-subtitle");
        if (subtitle && AGPersonas[newPersona]) {
          subtitle.textContent = `You previously explored with ${AGPersonas[newPersona].name}. Select below to continue or switch your advisor:`;
        }
      }
    }, 300);
  };

  // Save Persona
  window.AG.savePersona = function(personaName) {
    try {
      localStorage.setItem("ESH_lastPersona", personaName);
    } catch (e) {
      console.warn("LocalStorage unavailable for Persona Memory:", e);
    }
  };

  // Load Saved Persona from Memory
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
        const canonicalKey = AGPersonas[saved.toLowerCase()].key;
        window.AG.setVoicePersona(canonicalKey, false);

        // Highlight the saved card
        const card = document.querySelector(`[data-persona="${canonicalKey}"]`);
        if (card) {
          document.querySelectorAll('.persona-card, .esh-onboarding-card').forEach(c => c.classList.remove('active-halo', 'halo-fade-in'));
          card.classList.add("active-halo", "halo-fade-in");
          card.querySelector(".persona-badge")?.classList.add("visible");
          const primaryBtn = card.querySelector(".primary-action");
          if (primaryBtn) {
            primaryBtn.textContent = `Continue with ${AGPersonas[canonicalKey].name} →`;
            primaryBtn.classList.add("cta-pop");
          }
        }

        const subtitle = document.querySelector(".persona-subtitle");
        if (subtitle) {
          subtitle.textContent = `You previously explored with ${AGPersonas[canonicalKey].name}. Select below to continue or switch your advisor:`;
        }
      } else {
        window.AG.setVoicePersona("aoife", false);
        checkFirstTimeOnboarding();
      }
    } catch (e) {
      window.AG.setVoicePersona("aoife", false);
    }
  };

  // ===============================
  // Hooked Persona Activation Function
  // ===============================
  window.AG.setVoicePersona = function(personaName, autoSpeak = false) {
    const key = (personaName || 'aoife').toLowerCase();
    const canonicalKey = AGPersonas[key]?.key || 'aoife';
    const previous = (window.AG.currentPersona?.key || '').toLowerCase();

    // Trigger Color Wash Background
    window.AG.triggerColorWash(canonicalKey);

    // Trigger Ripple & Cinematic Transition
    if (previous && previous !== canonicalKey) {
      window.AG.animatePersonaSwitch(previous, canonicalKey);
      window.AG.triggerPersonaRipple(canonicalKey);
    }

    const persona = AGPersonas[canonicalKey] || AGPersonas.aoife;
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

  // First Time Check
  function checkFirstTimeOnboarding() {
    try {
      const hasSeen = localStorage.getItem("ESH_hasSeenOnboarding");
      const isHome = window.location.pathname === '/' || window.location.pathname.endsWith('index.html') || window.location.pathname === '';
      if (!hasSeen && isHome) {
        setTimeout(() => window.openPersonaPickerModal(), 1200);
      }
    } catch (e) {}
  }

  // Re-Openable Persona Picker Modal
  window.openPersonaPickerModal = function() {
    let modal = document.querySelector("#personaModal");
    if (!modal) {
      injectPersonaModalDOM();
      modal = document.querySelector("#personaModal");
    }
    if (modal) {
      modal.classList.add("open");
      modal.style.display = "flex";
      window.AG.loadSavedPersona();
    }
  };

  window.dismissPersonaModal = function(personaKey) {
    try {
      localStorage.setItem("ESH_hasSeenOnboarding", "true");
    } catch (e) {}

    const modal = document.querySelector("#personaModal");
    if (modal) {
      modal.classList.remove("open");
      modal.style.display = "none";
    }

    if (personaKey) {
      window.AG.setVoicePersona(personaKey, false);
      if (typeof window.setPersona === 'function') {
        const mapping = { aoife: 'homeowner', eimear: 'agent', declan: 'installer' };
        window.setPersona(mapping[personaKey] || 'homeowner');
      }
    }
  };

  // Inject Re-Usable Modal Structure with Color Wash Layer
  function injectPersonaModalDOM() {
    if (document.getElementById('personaModal')) return;

    const modal = document.createElement('div');
    modal.id = 'personaModal';
    modal.className = 'persona-modal-overlay';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 18, 13, 0.88);
      backdrop-filter: blur(16px);
      z-index: 99999;
      display: none; align-items: center; justify-content: center;
      padding: 20px;
      animation: eshFadeIn 0.3s ease-out forwards;
    `;

    modal.innerHTML = `
      <div style="background: #001f17; border: 1.5px solid rgba(52, 245, 197, 0.35); border-radius: 28px; max-width: 880px; width: 100%; padding: clamp(24px, 4vw, 40px); box-shadow: 0 25px 60px rgba(0,0,0,0.8); text-align: center; position: relative; overflow: hidden;">
        
        <!-- Background Color Wash Layer -->
        <div id="personaColorWash"></div>

        <button onclick="dismissPersonaModal('')" style="position: absolute; top: 20px; right: 20px; background: none; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer; z-index: 2;">✕</button>
        
        <div style="position: relative; z-index: 1;">
          <div style="font-size: 0.78rem; font-weight: 800; color: #34f5c5; text-transform: uppercase; font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.08em; margin-bottom: 6px;">
            Welcome to EcoSmartHomes Ireland
          </div>
          <h2 style="color: #ffffff; font-size: clamp(1.6rem, 3.5vw, 2.2rem); font-weight: 900; margin: 0 0 10px 0;">
            Who are you exploring for today?
          </h2>
          <p class="persona-subtitle" style="color: #cbd5e1; font-size: 0.95rem; max-width: 620px; margin: 0 auto 28px auto; line-height: 1.5;">
            Select your role to personalize your tools and activate your dedicated 100% conflict-free Irish AI Energy Advisor.
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 16px; margin-bottom: 24px;">
            
            <!-- Homeowner (Aoife) -->
            <div class="persona-card esh-onboarding-card card-homeowner" data-persona="aoife" onclick="dismissPersonaModal('aoife')">
              <div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                  <span style="font-size: 2rem;">🏡</span>
                  <span style="background: rgba(52,245,197,0.15); color: #34f5c5; font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border-radius: 8px; font-family: 'IBM Plex Mono', monospace;">Aoife</span>
                </div>
                <span class="persona-badge">✨ Last Selected Advisor</span>
                <h3 style="color: #ffffff; font-size: 1.15rem; font-weight: 800; margin: 6px 0 6px 0;">Homeowner</h3>
                <p style="color: #94a3b8; font-size: 0.82rem; line-height: 1.4; margin: 0;">
                  Lower heating bills, size radiators, and claim up to €35,000 in SEAI retrofit grants.
                </p>
              </div>
              <div class="primary-action" style="margin-top: 16px; font-size: 0.82rem; color: #34f5c5; font-weight: 800;">
                Select Homeowner →
              </div>
            </div>

            <!-- Estate Agent (Eimear) -->
            <div class="persona-card esh-onboarding-card card-agent" data-persona="eimear" onclick="dismissPersonaModal('eimear')">
              <div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                  <span style="font-size: 2rem;">💼</span>
                  <span style="background: rgba(251,191,36,0.15); color: #fbbf24; font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border-radius: 8px; font-family: 'IBM Plex Mono', monospace;">Eimear</span>
                </div>
                <span class="persona-badge">✨ Last Selected Advisor</span>
                <h3 style="color: #ffffff; font-size: 1.15rem; font-weight: 800; margin: 6px 0 6px 0;">Estate Agent / Valuer</h3>
                <p style="color: #94a3b8; font-size: 0.82rem; line-height: 1.4; margin: 0;">
                  Explain BER uplift, unlock +€38k valuation equity surge, and highlight 3.45% green mortgages.
                </p>
              </div>
              <div class="primary-action" style="margin-top: 16px; font-size: 0.82rem; color: #fbbf24; font-weight: 800;">
                Select Estate Agent →
              </div>
            </div>

            <!-- Installer (Declan) -->
            <div class="persona-card esh-onboarding-card card-installer" data-persona="declan" onclick="dismissPersonaModal('declan')">
              <div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                  <span style="font-size: 2rem;">⚡</span>
                  <span style="background: rgba(56,189,248,0.15); color: #38bdf8; font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border-radius: 8px; font-family: 'IBM Plex Mono', monospace;">Declan</span>
                </div>
                <span class="persona-badge">✨ Last Selected Advisor</span>
                <h3 style="color: #ffffff; font-size: 1.15rem; font-weight: 800; margin: 6px 0 6px 0;">Installer / Trades</h3>
                <p style="color: #94a3b8; font-size: 0.82rem; line-height: 1.4; margin: 0;">
                  NSAI SR50 low-temperature radiator sizing, heat loss formulas, and €49 digital data packs.
                </p>
              </div>
              <div class="primary-action" style="margin-top: 16px; font-size: 0.82rem; color: #38bdf8; font-weight: 800;">
                Select Installer →
              </div>
            </div>

          </div>

          <button onclick="dismissPersonaModal('')" style="background: none; border: none; color: #64748b; font-size: 0.82rem; cursor: pointer; text-decoration: underline;">
            Explore all tools without selecting a role
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

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
