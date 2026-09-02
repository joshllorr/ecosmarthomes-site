/**
 * site/js/voice-advisor.js
 * EcoSmartHomes AI Voice Advisor Engine (Siri/ChatGPT Ambient Hologram Mode)
 * Features:
 * - 3 Personas: Aoife (Homeowner), Eimear (Estate Agent), Declan (Installer)
 * - Siri/ChatGPT Fluid Multi-Ring Waveform Hologram Orb
 * - Hands-Free Ambient Mode for continuous browsing commentary
 * - Instant Eircode Voice Auto-Audit
 * - 1-Click PDF Summary & WhatsApp Direct Lead Sync
 */

(function() {
  'use strict';

  let currentPersona = 'homeowner';
  let isListening = false;
  let isSpeaking = false;
  let isHandsFree = false;
  let conversationHistory = [];
  let recognition = null;
  let selectedVoice = null;
  let customSystemPrompt = null;
  let customVoiceSettings = null;

  const EIRCODE_REGIONS = {
    'V94': { county: 'Co. Limerick', zone: 'Midwest Zone', solar: 950, avgBer: 'D2', avgGrant: '€26,500' },
    'V95': { county: 'Co. Clare', zone: 'Midwest Zone', solar: 940, avgBer: 'D1', avgGrant: '€24,000' },
    'D01': { county: 'Dublin 1', zone: 'East Coast', solar: 950, avgBer: 'E1', avgGrant: '€28,000' },
    'D02': { county: 'Dublin 2', zone: 'East Coast', solar: 950, avgBer: 'D2', avgGrant: '€26,500' },
    'D04': { county: 'Dublin 4', zone: 'East Coast', solar: 950, avgBer: 'D1', avgGrant: '€25,000' },
    'D06': { county: 'Dublin 6', zone: 'East Coast', solar: 950, avgBer: 'E2', avgGrant: '€32,000' },
    'D14': { county: 'Dublin 14', zone: 'South Dublin', solar: 950, avgBer: 'C3', avgGrant: '€21,000' },
    'D18': { county: 'Dublin 18', zone: 'South Dublin', solar: 960, avgBer: 'C2', avgGrant: '€18,500' },
    'A94': { county: 'Blackrock, Dublin', zone: 'South Dublin', solar: 960, avgBer: 'D1', avgGrant: '€24,500' },
    'A96': { county: 'Dún Laoghaire', zone: 'South Dublin', solar: 960, avgBer: 'D2', avgGrant: '€26,000' },
    'T12': { county: 'Cork City South', zone: 'South Coast', solar: 980, avgBer: 'D2', avgGrant: '€27,000' },
    'T23': { county: 'Cork City North', zone: 'South Coast', solar: 980, avgBer: 'E1', avgGrant: '€29,500' },
    'H91': { county: 'Galway City', zone: 'West Coast', solar: 910, avgBer: 'D2', avgGrant: '€26,000' },
    'X91': { county: 'Waterford City', zone: 'Sunny South-East', solar: 1030, avgBer: 'D1', avgGrant: '€25,000' },
    'Y35': { county: 'Wexford Town', zone: 'Sunny South-East', solar: 1050, avgBer: 'D2', avgGrant: '€26,000' },
    'R95': { county: 'Kilkenny City', zone: 'South East', solar: 980, avgBer: 'D1', avgGrant: '€24,000' },
    'R32': { county: 'Portlaoise, Laois', zone: 'Midlands', solar: 940, avgBer: 'D2', avgGrant: '€26,500' },
    'W91': { county: 'Naas, Kildare', zone: 'Greater Dublin', solar: 950, avgBer: 'C3', avgGrant: '€22,000' },
    'F91': { county: 'Sligo Town', zone: 'North West', solar: 880, avgBer: 'E1', avgGrant: '€29,000' }
  };

  const PERSONA_CONFIGS = {
    homeowner: {
      key: 'homeowner',
      aliases: ['aoife', 'homeowner'],
      advisorName: 'Aoife',
      title: 'Senior Retrofit Advisor',
      name: 'Aoife · Senior Retrofit AI',
      subtitle: 'EcoSmartHomes Ireland · Online',
      avatar: '👩‍💼',
      avatarBg: '#10b981',
      accentColor: '#34f5c5',
      glowColor: 'rgba(52, 245, 197, 0.5)',
      launcherText: '🎙️ Ask Aoife (Voice AI)',
      welcome: "Dia dhuit! I'm Aoife, your independent energy advisor. Ask me anything about SEAI grants, radiator sizing, or keeping your home cosy without overpaying.",
      apiEndpoint: '/api/voice-advisor',
      rate: 0.94,
      pitch: 1.02,
      toastMsg: 'Switched to Aoife (Homeowner Advisor)',
      chips: [
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
    agent: {
      key: 'agent',
      aliases: ['eimear', 'agent', 'estate-agent'],
      advisorName: 'Eimear',
      title: 'Estate Agent Energy Advisor',
      name: 'Eimear · Real Estate AI',
      subtitle: 'Property Energy & Valuation Advisor · Online',
      avatar: '💼',
      avatarBg: '#f59e0b',
      accentColor: '#fbbf24',
      glowColor: 'rgba(251, 191, 36, 0.5)',
      launcherText: '🎙️ Ask Eimear (Real Estate AI)',
      welcome: "Hello, I’m Eimear — your energy advisor for property listings. Let’s make your BER and upgrade options crystal clear for buyers.",
      apiEndpoint: '/api/voice-eimear',
      rate: 1.0,
      pitch: 1.05,
      toastMsg: 'Switched to Eimear (Real Estate Advisor)',
      chips: [
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
    installer: {
      key: 'installer',
      aliases: ['declan', 'installer', 'contractor'],
      advisorName: 'Declan',
      title: 'NSAI SR50 Technical Advisor',
      name: 'Declan · Installer AI',
      subtitle: 'NSAI SR50 Technical Advisor · Online',
      avatar: '⚡',
      avatarBg: '#38bdf8',
      accentColor: '#38bdf8',
      glowColor: 'rgba(56, 189, 248, 0.5)',
      launcherText: '🎙️ Ask Declan (Installer AI)',
      welcome: "How's it going? I'm Declan — here to help with sizing, SR50 checks, and anything technical you need.",
      apiEndpoint: '/api/voice-declan',
      rate: 0.92,
      pitch: 0.98,
      toastMsg: 'Switched to Declan (Installer Technical Advisor)',
      chips: [
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

  function resolvePersonaKey(key) {
    if (!key) return 'homeowner';
    const cleanKey = key.toLowerCase();
    for (const [pKey, cfg] of Object.entries(PERSONA_CONFIGS)) {
      if (pKey === cleanKey || cfg.aliases.includes(cleanKey)) return pKey;
    }
    return 'homeowner';
  }

  function applyPersonaTheme(cfg) {
    document.documentElement.style.setProperty('--persona-accent', cfg.accentColor);
    document.documentElement.style.setProperty('--persona-glow', cfg.glowColor);

    const launcher = document.getElementById('voice-launcher');
    if (launcher) {
      launcher.style.borderColor = cfg.accentColor;
      launcher.style.boxShadow = `0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px ${cfg.glowColor}`;
    }

    const modal = document.getElementById('voice-modal');
    if (modal) {
      modal.style.borderColor = cfg.accentColor;
      modal.style.boxShadow = `0 25px 60px rgba(0, 0, 0, 0.7), 0 0 30px ${cfg.glowColor}`;
    }

    const avatars = document.querySelectorAll('.hologram-avatar');
    avatars.forEach(av => {
      av.innerText = cfg.avatar;
      av.style.background = cfg.avatarBg;
      av.style.borderColor = cfg.accentColor;
    });

    const waves = document.querySelectorAll('.hologram-wave');
    waves.forEach(w => w.style.borderColor = cfg.accentColor);
  }

  window.setVoicePersona = function(personaKey, showToast = false) {
    const resolvedKey = resolvePersonaKey(personaKey);
    currentPersona = resolvedKey;
    const cfg = PERSONA_CONFIGS[resolvedKey];
    conversationHistory = [];

    applyPersonaTheme(cfg);

    const launcherLabel = document.querySelector('#voice-launcher span.launcher-label');
    if (launcherLabel) launcherLabel.innerText = cfg.launcherText;

    const nameEl = document.getElementById('voice-advisor-name');
    const subEl = document.getElementById('voice-advisor-sub');
    if (nameEl) nameEl.innerText = cfg.name;
    if (subEl) subEl.innerText = cfg.subtitle;

    const chatBody = document.getElementById('voice-chat-body');
    if (chatBody) {
      chatBody.innerHTML = `<div class="voice-msg advisor">${cfg.welcome}</div>`;
    }

    const chipContainer = document.querySelector('.quick-prompts-row');
    if (chipContainer) {
      chipContainer.innerHTML = cfg.chips.map(c => `
        <span class="quick-prompt-chip" data-query="${c.query}">${c.label}</span>
      `).join('');
      attachChipListeners();
    }

    const pdfBar = document.getElementById('voice-action-toolbar');
    if (pdfBar) pdfBar.style.display = 'none';

    if (showToast && typeof window.showEshToast === 'function') {
      window.showEshToast(cfg.toastMsg, cfg.avatar);
    }
  };

  function detectContextPersona() {
    const params = new URLSearchParams(window.location.search);
    const urlPersona = params.get('persona') || params.get('role');
    if (urlPersona) return resolvePersonaKey(urlPersona);

    const path = window.location.pathname.toLowerCase();
    if (path.includes('agent') || path.includes('property-auditor') || path.includes('daft-hud') || path.includes('eimear')) {
      return 'agent';
    }
    if (path.includes('installer') || path.includes('radiator-sizer') || path.includes('tender-generator') || path.includes('declan') || path.includes('contractor')) {
      return 'installer';
    }
    return 'homeowner';
  }

  function injectVoiceAdvisorUI() {
    if (document.getElementById('voice-advisor-container')) return;

    const initialKey = detectContextPersona();
    currentPersona = initialKey;
    const initialCfg = PERSONA_CONFIGS[initialKey];

    const container = document.createElement('div');
    container.id = 'voice-advisor-container';
    container.setAttribute('data-screen-id', 'esh_voice_assistant');
    container.innerHTML = `
      <!-- Floating Hologram Launcher -->
      <div id="voice-launcher" class="voice-advisor-launcher">
        <div class="hologram-orb-container" id="launcher-hologram-orb">
          <div class="hologram-wave wave-1"></div>
          <div class="hologram-wave wave-2"></div>
          <div class="hologram-wave wave-3"></div>
          <div class="hologram-avatar" style="width: 28px; height: 28px; font-size: 1rem;">${initialCfg.avatar}</div>
        </div>
        <span class="launcher-label" style="font-weight: 700; font-size: 0.9rem;">${initialCfg.launcherText}</span>
      </div>

      <!-- Advisor Modal Drawer -->
      <div id="voice-modal" class="voice-advisor-modal">
        <div class="voice-modal-header" style="background: rgba(0, 36, 27, 0.95); padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08);">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="hologram-orb-container" id="modal-hologram-orb">
              <div class="hologram-wave wave-1"></div>
              <div class="hologram-wave wave-2"></div>
              <div class="hologram-wave wave-3"></div>
              <div id="voice-advisor-avatar" class="hologram-avatar">${initialCfg.avatar}</div>
            </div>
            <div>
              <div id="voice-advisor-name" style="font-weight: 800; font-size: 0.95rem; color: #fff;">${initialCfg.name}</div>
              <div id="voice-advisor-sub" style="font-size: 0.72rem; color: #34f5c5; font-family: 'IBM Plex Mono', monospace;">${initialCfg.subtitle}</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button id="btn-hands-free-toggle" title="Toggle Hands-Free Commentary Mode" onclick="window.toggleHandsFreeMode()" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-size: 0.75rem; font-weight: 800; padding: 4px 8px; border-radius: 6px; cursor: pointer;">
              🎧 Ambient
            </button>
            <button id="voice-close-btn" aria-label="Close Voice Advisor" style="background: none; border: none; color: #94a3b8; font-size: 1.3rem; cursor: pointer; padding: 4px;">✕</button>
          </div>
        </div>

        <!-- Instant Eircode Voice Auto-Audit Bar -->
        <div class="eircode-voice-bar" style="background: #001711; border-bottom: 1px solid rgba(255,255,255,0.06); padding: 8px 16px; display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 0.9rem;">📍</span>
          <input type="text" id="voice-eircode-input" placeholder="Enter Eircode (e.g. V94 ABC1) for instant voice audit..." style="flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #fff; padding: 6px 10px; border-radius: 6px; font-size: 0.78rem; text-transform: uppercase;" />
          <button type="button" onclick="window.runEircodeVoiceAudit()" style="background: #34f5c5; color: #001711; font-weight: 800; border: none; padding: 6px 10px; border-radius: 6px; font-size: 0.75rem; cursor: pointer; white-space: nowrap;">
            ⚡ Audit
          </button>
        </div>

        <!-- 1-Click Action Toolbar (PDF & WhatsApp) -->
        <div id="voice-action-toolbar" style="display: none; background: #001f17; border-bottom: 1px solid rgba(255,255,255,0.08); padding: 8px 14px; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span style="font-size: 0.75rem; color: #94a3b8; font-family: 'IBM Plex Mono', monospace;">📄 Session Dossier Ready</span>
          <div style="display: flex; gap: 6px;">
            <button type="button" id="btn-download-pdf" onclick="window.downloadConversationPDF()" style="background: #34f5c5; color: #001711; font-weight: 800; font-size: 0.75rem; padding: 5px 10px; border-radius: 6px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
              <span>📥 Download PDF</span>
            </button>
            <button type="button" id="btn-whatsapp-sync" onclick="window.sendConversationToWhatsApp()" style="background: #25d366; color: #fff; font-weight: 800; font-size: 0.75rem; padding: 5px 10px; border-radius: 6px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
              <span>💬 WhatsApp</span>
            </button>
          </div>
        </div>

        <div id="voice-chat-body" class="voice-modal-body">
          <div class="voice-msg advisor">${initialCfg.welcome}</div>
        </div>

        <!-- Acoustic Waveform Status -->
        <div id="voice-acoustic-bar" class="acoustic-waveform" style="background: #001711; border-top: 1px solid rgba(255,255,255,0.08); display: none; padding: 8px 16px; align-items: center; gap: 8px;">
          <div style="display: flex; gap: 3px; align-items: center;">
            <div style="width: 3px; height: 14px; background: var(--persona-accent); border-radius: 2px; animation: avatarThrob 0.6s infinite alternate;"></div>
            <div style="width: 3px; height: 20px; background: var(--persona-accent); border-radius: 2px; animation: avatarThrob 0.4s infinite alternate 0.2s;"></div>
            <div style="width: 3px; height: 10px; background: var(--persona-accent); border-radius: 2px; animation: avatarThrob 0.5s infinite alternate 0.4s;"></div>
          </div>
          <span id="voice-status-text" style="font-size: 0.75rem; color: #cbd5e1; font-weight: 700; margin-left: 6px;">Listening...</span>
        </div>

        <!-- Footer / Input -->
        <div class="voice-modal-footer" style="padding: 12px 16px; background: #001711; border-top: 1px solid rgba(255,255,255,0.08);">
          <div class="quick-prompts-row" style="overflow-x: auto; white-space: nowrap; padding-bottom: 8px; display: flex; gap: 8px;">
            ${initialCfg.chips.map(c => `<span class="quick-prompt-chip" data-query="${c.query}" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; font-size: 0.75rem; padding: 4px 10px; border-radius: 12px; cursor: pointer; white-space: nowrap;">${c.label}</span>`).join('')}
          </div>

          <div class="voice-input-row" style="display: flex; gap: 8px; align-items: center; margin-top: 6px;">
            <button id="voice-mic-trigger" class="voice-mic-btn" title="Click to Speak" aria-label="Toggle microphone for voice input" style="width: 40px; height: 40px; border-radius: 50%; background: var(--persona-accent); color: #001711; border: none; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">🎙️</button>
            <input type="text" id="voice-text-input" class="voice-text-input" aria-label="Ask energy advisor" placeholder="Speak or type a question..." style="flex: 1; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #fff; padding: 10px 14px; border-radius: 25px; font-size: 0.85rem;" />
            <button id="voice-send-btn" aria-label="Send message" style="background: #003628; border: 1px solid var(--persona-accent); color: var(--persona-accent); border-radius: 50%; width: 40px; height: 40px; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center;">➤</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    applyPersonaTheme(initialCfg);
    initVoiceEvents();
    attachChipListeners();
  }

  function attachChipListeners() {
    document.querySelectorAll('.quick-prompt-chip').forEach(chip => {
      chip.onclick = () => {
        const query = chip.getAttribute('data-query');
        if (query) sendUserMessage(query);
      };
    });
  }

  // ==========================================
  // Instant Eircode Voice Auto-Audit
  // ==========================================
  window.runEircodeVoiceAudit = function() {
    const input = document.getElementById('voice-eircode-input');
    if (!input) return;
    const rawVal = input.value.trim().toUpperCase().replace(/\s+/g, '');
    if (!rawVal || rawVal.length < 3) {
      alert("Please enter a valid Irish Eircode (e.g. V94 ABC1 or D04 XY12).");
      return;
    }

    const routeKey = rawVal.slice(0, 3);
    const region = EIRCODE_REGIONS[routeKey] || { county: 'Ireland', zone: 'National Grid', solar: 950, avgBer: 'D1', avgGrant: '€25,000' };
    const cfg = PERSONA_CONFIGS[currentPersona];

    let spokenMessage = "";
    if (currentPersona === 'agent') {
      spokenMessage = `Found property record in ${region.county}. Typical baseline rating is ${region.avgBer}, with an estimated valuation uplift of thirty-eight thousand euro when upgraded to an A rating under green mortgage rates.`;
    } else if (currentPersona === 'installer') {
      spokenMessage = `Located in ${region.county}. Regional solar yield is approximately ${region.solar} kilowatt hours per kilowatt peak. NSAI SR50 design requires low temperature flow at 45 degrees.`;
    } else {
      spokenMessage = `Found your property in ${region.county}! Homes in your area are typically rated ${region.avgBer} and qualify for up to ${region.avgGrant} in SEAI retrofit grants.`;
    }

    sendUserMessage(`Eircode Audit: ${rawVal}`);
  };

  // ==========================================
  // Hands-Free Ambient Audio Toggle
  // ==========================================
  window.toggleHandsFreeMode = function() {
    isHandsFree = !isHandsFree;
    const btn = document.getElementById('btn-hands-free-toggle');
    const modal = document.getElementById('voice-modal');
    if (btn) {
      btn.innerText = isHandsFree ? '🎧 Ambient: ON' : '🎧 Ambient';
      btn.style.background = isHandsFree ? 'var(--persona-accent)' : 'rgba(255,255,255,0.08)';
      btn.style.color = isHandsFree ? '#001711' : '#cbd5e1';
    }
    if (modal) {
      modal.classList.toggle('hands-free-minimized', isHandsFree);
    }
    if (isHandsFree && typeof window.showEshToast === 'function') {
      window.showEshToast(`Hands-Free Ambient Mode Enabled`, '🎧');
    }
  };

  function initSpeechSynthesis() {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        selectedVoice = voices.find(v => v.lang === 'en-IE' || v.name.includes('Ireland')) ||
                        voices.find(v => v.lang === 'en-GB' && (v.name.includes('Female') || v.name.includes('Natural') || v.name.includes('Male'))) ||
                        voices.find(v => v.lang.startsWith('en')) || null;
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  function initSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IE';

      recognition.onstart = () => {
        isListening = true;
        updateAcousticUI(true, 'Listening (en-IE)...');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) sendUserMessage(transcript);
      };

      recognition.onerror = (event) => {
        isListening = false;
        updateAcousticUI(false);
      };

      recognition.onend = () => {
        isListening = false;
        if (!isSpeaking) updateAcousticUI(false);
      };
    }
  }

  function updateAcousticUI(active, text = '') {
    const bar = document.getElementById('voice-acoustic-bar');
    const status = document.getElementById('voice-status-text');
    if (bar && status) {
      bar.style.display = active ? 'flex' : 'none';
      status.innerText = text;
    }
  }

  function updateHologramSpeakingState(speaking) {
    const orbs = document.querySelectorAll('.hologram-orb-container');
    orbs.forEach(orb => orb.classList.toggle('speaking', speaking));
  }

  function speakAdvisor(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const cfg = PERSONA_CONFIGS[currentPersona];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = customVoiceSettings?.rate || cfg.rate;
    utterance.pitch = customVoiceSettings?.pitch || cfg.pitch;
    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.onstart = () => {
      isSpeaking = true;
      updateHologramSpeakingState(true);
      updateAcousticUI(true, `${cfg.advisorName} speaking...`);
    };

    utterance.onend = () => {
      isSpeaking = false;
      updateHologramSpeakingState(false);
      updateAcousticUI(false);
    };

    window.speechSynthesis.speak(utterance);
  }

  async function sendUserMessage(text) {
    const chatBody = document.getElementById('voice-chat-body');
    const inputField = document.getElementById('voice-text-input');
    if (inputField) inputField.value = '';

    const userBubble = document.createElement('div');
    userBubble.className = 'voice-msg user';
    userBubble.innerText = text;
    chatBody.appendChild(userBubble);
    chatBody.scrollTop = chatBody.scrollHeight;

    const thinkingBubble = document.createElement('div');
    thinkingBubble.className = 'voice-msg advisor thinking';
    thinkingBubble.innerHTML = `<span>Thinking...</span>`;
    chatBody.appendChild(thinkingBubble);
    chatBody.scrollTop = chatBody.scrollHeight;

    const cfg = PERSONA_CONFIGS[currentPersona];

    try {
      const response = await fetch(cfg.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          persona: cfg.key,
          history: conversationHistory.slice(-4)
        })
      });

      const resData = await response.json();
      thinkingBubble.remove();

      if (response.ok && resData.data) {
        const { speechText, displayText, citation, recommendedAction } = resData.data;

        const advisorBubble = document.createElement('div');
        advisorBubble.className = 'voice-msg advisor';
        
        let formattedHtml = displayText ? displayText.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') : speechText;
        
        if (citation) {
          formattedHtml += `<div style="margin-top:8px;font-size:0.75rem;color:#34f5c5;font-family:'IBM Plex Mono',monospace;">📜 Standard: ${citation}</div>`;
        }

        if (recommendedAction) {
          formattedHtml += `<div style="margin-top:8px;"><a href="/checkout/" style="background:#f59e0b;color:#001711;font-weight:800;font-size:0.78rem;padding:4px 10px;border-radius:6px;text-decoration:none;display:inline-block;">👉 ${recommendedAction} →</a></div>`;
        }

        advisorBubble.innerHTML = formattedHtml;
        chatBody.appendChild(advisorBubble);
        chatBody.scrollTop = chatBody.scrollHeight;

        conversationHistory.push({ sender: 'user', text: text });
        conversationHistory.push({ sender: 'advisor', text: speechText || displayText, citation });

        const pdfBar = document.getElementById('voice-action-toolbar');
        if (pdfBar) pdfBar.style.display = 'flex';

        if (speechText) speakAdvisor(speechText);
      } else {
        const errorBubble = document.createElement('div');
        errorBubble.className = 'voice-msg advisor';
        errorBubble.innerText = "Apologies, I couldn't reach the advisor network right now. Please feel free to call our team directly at 083 966 2197.";
        chatBody.appendChild(errorBubble);
      }
    } catch (err) {
      thinkingBubble.remove();
      const errorBubble = document.createElement('div');
      errorBubble.className = 'voice-msg advisor';
      errorBubble.innerText = "Network connection interrupted. Please try again or call us at 083 966 2197.";
      chatBody.appendChild(errorBubble);
    }
  }

  // PDF Generator
  window.downloadConversationPDF = function() {
    if (!conversationHistory || conversationHistory.length === 0) {
      alert("Please ask at least one question to generate your consultation summary.");
      return;
    }

    const cfg = PERSONA_CONFIGS[currentPersona];
    const docId = `ESH-CONSULT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const dateStr = new Date().toLocaleDateString('en-IE', { day: '2-digit', month: 'short', year: 'numeric' });

    let qAndAHtml = "";
    let currentQ = "";
    for (const item of conversationHistory) {
      if (item.sender === 'user') {
        currentQ = item.text;
      } else if (item.sender === 'advisor') {
        qAndAHtml += `
          <div style="margin-bottom: 16px; padding: 14px 16px; background: #f8fafc; border-left: 4px solid #003f2d; border-radius: 6px;">
            <div style="font-weight: 800; font-size: 0.92rem; color: #00241b; margin-bottom: 6px;">
              💬 Question: "${currentQ}"
            </div>
            <div style="font-size: 0.86rem; color: #334155; line-height: 1.5; margin-bottom: 6px;">
              ${item.text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
            </div>
            ${item.citation ? `<div style="font-size: 0.72rem; color: #059669; font-family: monospace; font-weight: 700;">📜 Technical Standard: ${item.citation}</div>` : ''}
          </div>
        `;
      }
    }

    const printHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>EcoSmartHomes Consultation Dossier · ${docId}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 0; line-height: 1.45; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #003f2d; padding-bottom: 12px; margin-bottom: 18px; }
    .logo-text { font-size: 1.4rem; font-weight: 900; color: #00241b; }
    .logo-text span { color: #10b981; }
    .meta-box { font-size: 0.78rem; text-align: right; color: #64748b; font-family: monospace; }
    .advisor-pill { display: inline-flex; align-items: center; gap: 6px; background: #ecfdf5; border: 1px solid #10b981; color: #065f46; padding: 4px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 700; margin-bottom: 14px; }
    .grants-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 14px 0; }
    .grant-card { background: #f0fdf4; border: 1px solid #86efac; padding: 10px 12px; border-radius: 8px; }
    .cta-box { background: #00241b; color: #fff; padding: 16px 20px; border-radius: 10px; margin-top: 20px; text-align: center; }
    .cta-box a { color: #34f5c5; font-weight: 800; text-decoration: none; }
    @media print { .no-print { display: none !important; } }
  </style>
</head>
<body>
  <div class="no-print" style="background: #00241b; color: #34f5c5; padding: 10px 20px; text-align: center; font-weight: 800; font-size: 0.85rem; margin-bottom: 20px;">
    🖨️ Click "Print" or "Save as PDF" in your browser's print dialog to save your consultation summary.
    <button onclick="window.print()" style="margin-left: 14px; background: #34f5c5; color: #001711; font-weight: 900; border: none; padding: 6px 14px; border-radius: 6px; cursor: pointer;">Print / Save PDF</button>
  </div>

  <div class="header">
    <div>
      <div class="logo-text">EcoSmart<span>Homes</span> Ireland</div>
      <div style="font-size: 0.78rem; color: #059669; font-weight: 700;">100% Conflict-Free Independent Energy Advisory</div>
    </div>
    <div class="meta-box">
      <div><strong>Dossier ID:</strong> ${docId}</div>
      <div><strong>Date:</strong> ${dateStr}</div>
      <div><strong>Status:</strong> Verified AI Consultation</div>
    </div>
  </div>

  <div class="advisor-pill">
    <span>${cfg.avatar}</span>
    <span>Consultation Lead: ${cfg.advisorName} (${cfg.title})</span>
  </div>

  <h2 style="font-size: 1.15rem; color: #00241b; margin: 0 0 10px 0;">📋 Key Inquiries & Engineering Findings</h2>
  ${qAndAHtml}

  <h2 style="font-size: 1.15rem; color: #00241b; margin: 18px 0 8px 0;">💶 2026 Irish Retrofit Grant & Financial Safeguards</h2>
  <div class="grants-grid">
    <div class="grant-card">
      <strong style="color: #065f46; font-size: 0.82rem; display: block;">SEAI Deep Retrofit Grant</strong>
      <span style="font-size: 1.1rem; font-weight: 900; color: #00241b;">Up to €35,000</span>
      <p style="font-size: 0.72rem; color: #475569; margin: 2px 0 0 0;">For multi-measure B2/A-rating upgrades (attic, external wrap, heat pump).</p>
    </div>
    <div class="grant-card">
      <strong style="color: #065f46; font-size: 0.82rem; display: block;">Heat Pump & Radiator Grant</strong>
      <span style="font-size: 1.1rem; font-weight: 900; color: #00241b;">€6,500 – €12,500</span>
      <p style="font-size: 0.72rem; color: #475569; margin: 2px 0 0 0;">NSAI SR50 compliant low-flow heating & boiler replacement.</p>
    </div>
    <div class="grant-card">
      <strong style="color: #065f46; font-size: 0.82rem; display: block;">Solar PV + Battery Storage</strong>
      <span style="font-size: 1.1rem; font-weight: 900; color: #00241b;">€2,100 Grant + 24c/kWh Export</span>
      <p style="font-size: 0.72rem; color: #475569; margin: 2px 0 0 0;">Cuts electricity bills by 60% with day/night arbitrage.</p>
    </div>
    <div class="grant-card">
      <strong style="color: #065f46; font-size: 0.82rem; display: block;">3.45% Green Mortgage Slasher</strong>
      <span style="font-size: 1.1rem; font-weight: 900; color: #00241b;">~€230/month Saved</span>
      <p style="font-size: 0.72rem; color: #475569; margin: 2px 0 0 0;">Unlocks discount mortgage rates on B3 or better ratings.</p>
    </div>
  </div>

  <div class="cta-box">
    <h3 style="margin: 0 0 6px 0; font-size: 1.05rem; color: #fff;">Need an On-Site Engineer Inspection or NSAI Verification?</h3>
    <p style="font-size: 0.82rem; color: #cbd5e1; margin: 0 0 10px 0;">
      Book our 32-County Home Energy Diagnostic Survey (€149) or WhatsApp our engineering desk.
    </p>
    <div style="font-size: 0.85rem;">
      <a href="https://www.ecosmarthomes.ie/checkout/?tier=survey&price=149">🏡 Book On-Site Survey (€149)</a> · 
      <a href="https://wa.me/353839662197">💬 WhatsApp: 083 966 2197</a>
    </div>
  </div>

  <div style="margin-top: 18px; text-align: center; font-size: 0.7rem; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px;">
    EcoSmartHomes Ireland · Grounded in NSAI SR50, SEAI SR54:2024 & DEAP 4.2.2 · Phone: 083 966 2197 · info@ecosmarthomes.ie
  </div>
</body>
</html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(printHtml);
      printWin.document.close();
    } else {
      alert("Please allow pop-ups to download or view your PDF summary.");
    }
  };

  // WhatsApp Direct Sync
  window.sendConversationToWhatsApp = function() {
    if (!conversationHistory || conversationHistory.length === 0) {
      alert("Please ask a question first to send your summary to WhatsApp.");
      return;
    }

    const cfg = PERSONA_CONFIGS[currentPersona];
    let msg = `*EcoSmartHomes Ireland — AI Consultation Summary*\n`;
    msg += `*Advisor:* ${cfg.advisorName} (${cfg.title})\n\n`;

    conversationHistory.forEach(item => {
      if (item.sender === 'user') {
        msg += `*Q:* ${item.text}\n`;
      } else if (item.sender === 'advisor') {
        msg += `*A:* ${item.text.replace(/<[^>]*>?/gm, '').slice(0, 180)}...\n\n`;
      }
    });

    msg += `I'd like to discuss the next steps with an EcoSmartHomes engineer.`;
    const waUrl = `https://wa.me/353839662197?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  function initVoiceEvents() {
    const launcher = document.getElementById('voice-launcher');
    const modal = document.getElementById('voice-modal');
    const closeBtn = document.getElementById('voice-close-btn');
    const micBtn = document.getElementById('voice-mic-trigger');
    const sendBtn = document.getElementById('voice-send-btn');
    const textInput = document.getElementById('voice-text-input');

    launcher.onclick = () => {
      modal.classList.add('open');
      if (textInput) textInput.focus();
    };

    closeBtn.onclick = () => {
      modal.classList.remove('open');
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (recognition && isListening) recognition.stop();
      updateHologramSpeakingState(false);
    };

    micBtn.onclick = () => {
      if (!recognition) {
        alert('Voice input is not supported in this browser. You can type your query in the box.');
        return;
      }
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
    };

    sendBtn.onclick = () => {
      const val = textInput.value.trim();
      if (val) sendUserMessage(val);
    };

    textInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        const val = textInput.value.trim();
        if (val) sendUserMessage(val);
      }
    };
  }

  window.openVoiceAdvisorModal = function() {
    const modal = document.getElementById('voice-modal');
    if (modal) modal.classList.add('open');
  };

  window.openPersonaVoiceModal = function(personaKey) {
    window.setVoicePersona(personaKey, false);
    window.openVoiceAdvisorModal();
  };

  document.addEventListener('DOMContentLoaded', () => {
    injectVoiceAdvisorUI();
    initSpeechSynthesis();
    initSpeechRecognition();
  });

})();
