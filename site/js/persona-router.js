/**
 * /js/persona-router.js
 * EcoSmartHomes Master Persona Switchboard with Contextual Auto-Proactive Switcher
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

  // Voice Interface
  window.AG.voice = window.AG.voice || {
    say: function(text, onComplete) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        if (window.AG.currentPersona) {
          utterance.rate = window.AG.currentPersona.rate;
          utterance.pitch = window.AG.currentPersona.pitch;
        }
        utterance.onend = function() {
          if (typeof onComplete === 'function') onComplete();
        };
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // ===============================
  // Contextual Auto-Proactive Switcher Engine
  // ===============================
  let dismissedSuggestions = {};

  window.AG.showContextualSuggestion = function(targetPersonaKey, message, triggerReason) {
    if (dismissedSuggestions[targetPersonaKey]) return;
    if (window.AG.currentPersona?.key === targetPersonaKey) return;

    let toast = document.getElementById('esh-persona-suggestion-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'esh-persona-suggestion-toast';
      toast.className = 'persona-suggestion-toast';
      document.body.appendChild(toast);
    }

    const persona = AGPersonas[targetPersonaKey];
    if (!persona) return;

    toast.className = `persona-suggestion-toast toast-${targetPersonaKey} show`;
    toast.innerHTML = `
      <div class="toast-avatar" style="background: ${persona.avatarBg}; border-color: ${persona.accentColor};">
        ${persona.avatar}
      </div>
      <div class="toast-content">
        <div class="toast-title" style="color: ${persona.accentColor};">
          💡 Advisor Suggestion · ${persona.name}
        </div>
        <div class="toast-message">${message}</div>
      </div>
      <div class="toast-actions">
        <button type="button" class="btn-toast-switch" onclick="window.AG.acceptPersonaSuggestion('${targetPersonaKey}')" style="background: ${persona.accentColor}; color: #001711;">
          Switch →
        </button>
        <button type="button" class="btn-toast-dismiss" onclick="window.AG.dismissPersonaSuggestion('${targetPersonaKey}')" aria-label="Dismiss">
          ✕
        </button>
      </div>
    `;
  };

  window.AG.acceptPersonaSuggestion = function(personaKey) {
    window.AG.dismissPersonaSuggestion(personaKey);
    window.AG.setVoicePersona(personaKey, true);
  };

  window.AG.dismissPersonaSuggestion = function(personaKey) {
    dismissedSuggestions[personaKey] = true;
    const toast = document.getElementById('esh-persona-suggestion-toast');
    if (toast) {
      toast.classList.remove('show');
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 400);
    }
  };

  // Contextual Observers (Path & User Activity Sensing)
  function initContextualEngine() {
    const path = window.location.pathname.toLowerCase();

    // 1. URL Path Schedulers
    if (path.includes('radiator-sizer') || path.includes('tender-generator') || path.includes('heat-pump')) {
      setTimeout(() => {
        window.AG.showContextualSuggestion('declan', "Sizing radiators for NSAI SR50? Declan has 45°C flow formulas ready.", "technical_path");
      }, 3500);
    } else if (path.includes('daft-hud') || path.includes('green-mortgage') || path.includes('property-auditor')) {
      setTimeout(() => {
        window.AG.showContextualSuggestion('eimear', "Evaluating property BER uplift & green mortgages? Eimear can draft listing summaries.", "property_path");
      }, 3500);
    } else if (path.includes('carbon-tax') || path.includes('solar') || path.includes('roadmap')) {
      setTimeout(() => {
        window.AG.showContextualSuggestion('aoife', "Exploring 2026 SEAI grants and fuel bill savings? Aoife has grant tables ready.", "homeowner_path");
      }, 3500);
    }

    // 2. Interactive Slider & Input Observers
    document.addEventListener('input', (e) => {
      const target = e.target;
      if (!target) return;

      const id = (target.id || '').toLowerCase();
      const name = (target.name || '').toLowerCase();

      // Flow Temp or Delta-T Sliders -> Declan
      if (id.includes('flow') || id.includes('temp') || id.includes('delta') || id.includes('pipe') || id.includes('heatloss')) {
        window.AG.showContextualSuggestion('declan', "Testing low-temperature flow rates? Declan can check your Delta-T 30 compliance.", "slider_interaction");
      }
      // Mortgage or Equity Sliders -> Eimear
      else if (id.includes('equity') || id.includes('valuation') || id.includes('mortgage') || id.includes('property') || id.includes('price')) {
        window.AG.showContextualSuggestion('eimear', "Simulating equity uplift? Eimear is primed to calculate Daft valuation surges.", "slider_interaction");
      }
      // Grant or Fuel Bill Sliders -> Aoife
      else if (id.includes('grant') || id.includes('fuel') || id.includes('bill') || id.includes('kerosene') || id.includes('ber-slider')) {
        window.AG.showContextualSuggestion('aoife', "Calculating grant rebates? Aoife can show how to claim up to €35,000 in SEAI support.", "slider_interaction");
      }
    }, { passive: true });
  }

  // ===============================
  // Persona Particle Shimmer System
  // ===============================
  window.AG.spawnPersonaParticles = function(personaName) {
    const layer = document.getElementById("personaParticleLayer");
    if (!layer) return;

    layer.innerHTML = "";
    const count = 18;

    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.classList.add("particle", `particle-${personaName}`);

      p.style.left = Math.random() * 100 + "%";
      p.style.bottom = (Math.random() * 40) + "px";
      p.style.animationDuration = (4.5 + Math.random() * 3) + "s";
      p.style.animationDelay = (Math.random() * 2) + "s";

      layer.appendChild(p);
    }
  };

  // ===============================
  // Voice Resonance Glow
  // ===============================
  window.AG.triggerVoiceResonance = function() {
    const wash = document.getElementById("personaColorWash");
    if (wash) {
      wash.classList.add("wash-resonate");
      setTimeout(() => wash.classList.remove("wash-resonate"), 450);
    }
  };

  // ===============================
  // Persona Accent Edge Glow
  // ===============================
  window.AG.applyPersonaEdgeGlow = function(personaName) {
    const modal = document.querySelector(".modal-container");
    if (modal) {
      modal.classList.remove("persona-edge-aoife", "persona-edge-eimear", "persona-edge-declan");
      modal.classList.add("persona-edge-" + personaName);
    }
  };

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

  // Color Wash
  window.AG.triggerColorWash = function(personaName) {
    const wash = document.getElementById("personaColorWash");
    if (!wash) return;

    wash.className = "";
    wash.classList.add(`colorwash-${personaName}`);

    void wash.offsetWidth;
    wash.classList.add("colorwash-animate-in");

    setTimeout(() => {
      wash.classList.remove("colorwash-animate-in");
      wash.classList.add("colorwash-animate-out");
    }, 900);
  };

  // Ripple
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

  // Card Switch Animation
  window.AG.animatePersonaSwitch = function(oldPersona, newPersona) {
    const oldCard = document.querySelector(`[data-persona="${oldPersona}"]`);
    const newCard = document.querySelector(`[data-persona="${newPersona}"]`);

    document.querySelectorAll(".persona-card, .esh-onboarding-card").forEach(card => {
      card.classList.remove("halo-fade-in", "halo-fade-out", "active-halo");
      card.querySelector(".persona-badge")?.classList.remove("visible");
      card.querySelector(".primary-action")?.classList.remove("cta-pop");
    });

    if (oldCard) {
      oldCard.classList.add("halo-fade-out");
    }

    setTimeout(() => {
      if (newCard) {
        newCard.classList.add("halo-fade-in", "active-halo");

        const badge = newCard.querySelector(".persona-badge");
        const cta = newCard.querySelector(".primary-action");

        if (badge) badge.classList.add("visible");
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

  // Load Saved Persona
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

  // Master Orchestrated Activation
  window.AG.setVoicePersona = function(personaName, autoSpeak = false) {
    const key = (personaName || 'aoife').toLowerCase();
    const canonicalKey = AGPersonas[key]?.key || 'aoife';
    const previous = (window.AG.currentPersona?.key || '').toLowerCase();

    // 0. Play Acoustic Handoff Chime
    window.AG.playPersonaHandoffChime(canonicalKey);

    // 1. Ripple
    window.AG.triggerPersonaRipple(canonicalKey);

    // 2. Color Wash
    window.AG.triggerColorWash(canonicalKey);

    // 3. Card Animations
    if (previous && previous !== canonicalKey) {
      window.AG.animatePersonaSwitch(previous, canonicalKey);
    }

    // 4. Modal Edge Glow
    window.AG.applyPersonaEdgeGlow(canonicalKey);

    // 5. Spawn Floating Particles
    window.AG.spawnPersonaParticles(canonicalKey);

    // 6. Persona Activation
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

    // 7. Speech Synthesis + Resonance
    if (autoSpeak && window.AG.voice && typeof window.AG.voice.say === 'function') {
      window.AG.voice.say(persona.greeting, () => {
        window.AG.triggerVoiceResonance();
      });
    }

    // 8. Save Memory
    window.AG.savePersona(persona.key);
  };

  function autoLaunchRolePickerModal() {
    try {
      const isHome = window.location.pathname === '/' || window.location.pathname.endsWith('index.html') || window.location.pathname === '';
      if (isHome) {
        setTimeout(() => {
          window.openPersonaPickerModal();
        }, 500);
      }
    } catch (e) {}
  }

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
      autoLaunchRolePickerModal();
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
      <div class="modal-container" style="background: #001f17; border: 1.5px solid rgba(52, 245, 197, 0.35); border-radius: 28px; max-width: 880px; width: 100%; padding: clamp(24px, 4vw, 40px); box-shadow: 0 25px 60px rgba(0,0,0,0.8); text-align: center; position: relative; overflow: hidden; transition: box-shadow 0.6s ease, border-color 0.6s ease;">
        
        <!-- Background Color Wash Layer -->
        <div id="personaColorWash"></div>

        <!-- Particle Shimmer Layer -->
        <div id="personaParticleLayer"></div>

        <button onclick="dismissPersonaModal('')" style="position: absolute; top: 20px; right: 20px; background: none; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer; z-index: 3;">✕</button>
        
        <div style="position: relative; z-index: 2;">
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

  
  // =========================================================
  // Synthesized Spatial Web Audio Engine (Zero External Files)
  // =========================================================
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  window.AG.playTone = function(freq, duration = 0.2, type = 'sine', gainVal = 0.08) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  // 1. Advisor Wakeup Chime (Warm C5 -> E5 Ascending Major Third)
  window.AG.playWakeupChime = function() {
    try {
      window.AG.playTone(523.25, 0.25, 'triangle', 0.07);
      setTimeout(() => window.AG.playTone(659.25, 0.35, 'sine', 0.09), 110);
    } catch (e) {}
  };

  // 2. Persona Handoff Acoustic Chimes
  window.AG.playPersonaHandoffChime = function(personaKey) {
    try {
      if (personaKey === 'aoife') {
        // Aoife: Warm Organic Celtic Chime (C5 -> G5)
        window.AG.playTone(523.25, 0.2, 'sine', 0.08);
        setTimeout(() => window.AG.playTone(783.99, 0.35, 'triangle', 0.08), 90);
      } else if (personaKey === 'eimear') {
        // Eimear: Polished Radiant Gold Chime (D5 -> A5)
        window.AG.playTone(587.33, 0.2, 'triangle', 0.08);
        setTimeout(() => window.AG.playTone(880.00, 0.35, 'sine', 0.08), 90);
      } else if (personaKey === 'declan') {
        // Declan: Resonant Trades Solid Tone (F4 -> C5)
        window.AG.playTone(349.23, 0.22, 'square', 0.04);
        setTimeout(() => window.AG.playTone(523.25, 0.32, 'triangle', 0.08), 90);
      }
    } catch (e) {}
  };

  // 3. Mic Start / Stop Beeps
  window.AG.playMicStartChime = function() {
    window.AG.playTone(440, 0.12, 'sine', 0.05);
    setTimeout(() => window.AG.playTone(880, 0.15, 'sine', 0.06), 70);
  };

  window.AG.playMicStopChime = function() {
    window.AG.playTone(880, 0.12, 'sine', 0.06);
    setTimeout(() => window.AG.playTone(440, 0.15, 'sine', 0.05), 70);
  };

  // =========================================================
  // Global Push-to-Talk Spacebar HUD
  // =========================================================
  let isSpacebarPressed = false;
  let pttHudElement = null;

  function injectPttHudDOM() {
    if (document.getElementById('eshPttHud')) return;
    pttHudElement = document.createElement('div');
    pttHudElement.id = 'eshPttHud';
    pttHudElement.className = 'spacebar-ptt-hud';
    pttHudElement.innerHTML = `
      <div style="font-size: 1.4rem;">🎙️</div>
      <div class="ptt-wave-anim">
        <div class="ptt-bar"></div>
        <div class="ptt-bar"></div>
        <div class="ptt-bar"></div>
        <div class="ptt-bar"></div>
        <div class="ptt-bar"></div>
      </div>
      <div>
        <div class="ptt-text" id="pttAdvisorStatus">Listening to Voice...</div>
        <div class="ptt-hint">Release [Spacebar] to Send</div>
      </div>
    `;
    document.body.appendChild(pttHudElement);
  }

  function initPushToTalk() {
    injectPttHudDOM();

    window.addEventListener('keydown', (e) => {
      // Ignore if user is currently typing in an input, textarea or contenteditable element
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);
      
      if (e.code === 'Space' && !isInput && !isSpacebarPressed) {
        isSpacebarPressed = true;
        e.preventDefault();

        // 1. Play Acoustic Mic Chime
        window.AG.playMicStartChime();

        // 2. Show PTT HUD
        const hud = document.getElementById('eshPttHud');
        const pName = window.AG.currentPersona?.name || 'Aoife';
        const statusEl = document.getElementById('pttAdvisorStatus');
        if (statusEl) statusEl.innerText = `Speaking to ${pName}...`;

        if (hud) {
          hud.classList.add('active');
        }

        // 3. Trigger Voice Recognition
        if (typeof window.startVoiceRecognition === 'function') {
          window.startVoiceRecognition();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space' && isSpacebarPressed) {
        isSpacebarPressed = false;
        e.preventDefault();

        // 1. Play Mic Stop Chime
        window.AG.playMicStopChime();

        // 2. Hide PTT HUD
        const hud = document.getElementById('eshPttHud');
        if (hud) {
          hud.classList.remove('active');
        }

        // 3. Stop Voice Recognition & Submit Query
        if (typeof window.stopVoiceRecognition === 'function') {
          window.stopVoiceRecognition();
        }
      }
    });
  }


  // Auto-bootstrap persona memory & contextual engine on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.AG.loadSavedPersona();
      autoLaunchRolePickerModal();
      initContextualEngine();
      initPushToTalk();
    });
  } else {
    window.AG.loadSavedPersona();
      autoLaunchRolePickerModal();
    initContextualEngine();
      initPushToTalk();
  }

})(window);
