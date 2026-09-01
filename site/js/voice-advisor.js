/**
 * site/js/voice-advisor.js
 * Multi-Persona Browser Voice AI Advisor Engine (Antigravity Switchboard Integrated)
 * - Aoife: Homeowner Energy Advisor (Warm & Neighbourly Irish Accent)
 * - Eimear: Real Estate Energy Advisor (Polished & Articulate Dublin/South-East Blend)
 * - Declan: Installer Technical Advisor (Practical & Straight-Talking Limerick/Cork Tradesman)
 */

(function() {
  'use strict';

  let currentPersona = 'homeowner'; // 'homeowner' | 'agent' | 'installer'
  let isListening = false;
  let isSpeaking = false;
  let conversationHistory = [];
  let recognition = null;
  let selectedVoice = null;
  let customSystemPrompt = null;
  let customVoiceSettings = null;

  const PERSONA_CONFIGS = {
    homeowner: {
      key: 'homeowner',
      aliases: ['aoife', 'homeowner'],
      advisorName: 'Aoife',
      name: 'Aoife · Senior Retrofit AI',
      subtitle: 'EcoSmartHomes Ireland · Online',
      avatar: '👩‍💼',
      avatarBg: '#10b981',
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
      name: 'Eimear · Real Estate AI',
      subtitle: 'Property Energy & Valuation Advisor · Online',
      avatar: '💼',
      avatarBg: '#f59e0b',
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
      name: 'Declan · Installer AI',
      subtitle: 'NSAI SR50 Technical Advisor · Online',
      avatar: '⚡',
      avatarBg: '#38bdf8',
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

  window.setVoicePersona = function(personaKey, showToast = false) {
    const resolvedKey = resolvePersonaKey(personaKey);
    currentPersona = resolvedKey;
    const cfg = PERSONA_CONFIGS[resolvedKey];
    conversationHistory = [];

    // Update Launcher
    const launcherLabel = document.querySelector('#voice-launcher span');
    if (launcherLabel) launcherLabel.innerText = cfg.launcherText;

    // Update Modal Header
    const nameEl = document.getElementById('voice-advisor-name');
    const subEl = document.getElementById('voice-advisor-sub');
    const avatarEl = document.getElementById('voice-advisor-avatar');
    if (nameEl) nameEl.innerText = cfg.name;
    if (subEl) subEl.innerText = cfg.subtitle;
    if (avatarEl) {
      avatarEl.innerText = cfg.avatar;
      avatarEl.style.background = cfg.avatarBg;
    }

    // Update Welcome Message
    const chatBody = document.getElementById('voice-chat-body');
    if (chatBody) {
      chatBody.innerHTML = `<div class="voice-msg advisor">${cfg.welcome}</div>`;
    }

    // Update Quick Prompt Chips
    const chipContainer = document.querySelector('.quick-prompts-row');
    if (chipContainer) {
      chipContainer.innerHTML = cfg.chips.map(c => `
        <span class="quick-prompt-chip" data-query="${c.query}">${c.label}</span>
      `).join('');
      attachChipListeners();
    }

    if (showToast && typeof window.showEshToast === 'function') {
      window.showEshToast(cfg.toastMsg, cfg.avatar);
    }
  };

  // Antigravity Bridge
  window.AG = window.AG || {};
  window.AG.setVoicePersona = function(personaName) {
    window.setVoicePersona(personaName, false);
  };
  window.AG.setVoiceSettings = function(settings) {
    customVoiceSettings = settings;
  };
  window.AG.setSystemPrompt = function(prompt) {
    customSystemPrompt = prompt;
  };
  window.AG.voice = {
    say: function(text) {
      speakAdvisor(text);
    }
  };
  window.AG.onClick = function(elementId, handler) {
    const el = document.getElementById(elementId);
    if (el) el.addEventListener('click', handler);
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
      <!-- Floating Launcher Button -->
      <div id="voice-launcher" class="voice-advisor-launcher">
        <div class="voice-launcher-pulse"></div>
        <span style="font-weight: 700; font-size: 0.9rem;">${initialCfg.launcherText}</span>
      </div>

      <!-- Advisor Modal Drawer -->
      <div id="voice-modal" class="voice-advisor-modal">
        <div class="voice-modal-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div id="voice-advisor-avatar" style="width: 36px; height: 36px; border-radius: 50%; background: ${initialCfg.avatarBg}; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">
              ${initialCfg.avatar}
            </div>
            <div>
              <div id="voice-advisor-name" style="font-weight: 700; font-size: 0.95rem;">${initialCfg.name}</div>
              <div id="voice-advisor-sub" style="font-size: 0.75rem; color: #a7f3d0;">${initialCfg.subtitle}</div>
            </div>
          </div>
          <button id="voice-close-btn" aria-label="Close Voice Advisor" style="background: none; border: none; color: #94a3b8; font-size: 1.3rem; cursor: pointer; padding: 4px;">✕</button>
        </div>

        <div id="voice-chat-body" class="voice-modal-body">
          <div class="voice-msg advisor">${initialCfg.welcome}</div>
        </div>

        <!-- Acoustic Waveform Status -->
        <div id="voice-acoustic-bar" class="acoustic-waveform" style="background: #f1f5f9; border-top: 1px solid #e2e8f0; display: none;">
          <div class="waveform-bar"></div>
          <div class="waveform-bar"></div>
          <div class="waveform-bar"></div>
          <div class="waveform-bar"></div>
          <div class="waveform-bar"></div>
          <div class="waveform-bar"></div>
          <span id="voice-status-text" style="font-size: 0.75rem; color: #065f46; font-weight: 700; margin-left: 8px;">Listening...</span>
        </div>

        <!-- Footer / Input -->
        <div class="voice-modal-footer">
          <div class="quick-prompts-row" style="overflow-x: auto; white-space: nowrap; padding-bottom: 4px;">
            ${initialCfg.chips.map(c => `<span class="quick-prompt-chip" data-query="${c.query}">${c.label}</span>`).join('')}
          </div>

          <div class="voice-input-row">
            <button id="voice-mic-trigger" class="voice-mic-btn" title="Click to Speak" aria-label="Toggle microphone for voice input">🎙️</button>
            <input type="text" id="voice-text-input" class="voice-text-input" aria-label="Ask energy advisor" placeholder="Speak or type a question..." />
            <button id="voice-send-btn" aria-label="Send message" style="background: #003f2d; color: #fff; border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; font-size: 1rem;">➤</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);
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
        if (transcript) {
          sendUserMessage(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
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
      updateAcousticUI(true, `${cfg.advisorName} speaking...`);
    };

    utterance.onend = () => {
      isSpeaking = false;
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
        
        let formattedHtml = displayText ? displayText.replace(/\\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') : speechText;
        
        if (citation) {
          formattedHtml += `<div style="margin-top:8px;font-size:0.75rem;color:#047857;font-family:'IBM Plex Mono',monospace;">📜 Standard: ${citation}</div>`;
        }

        if (recommendedAction) {
          formattedHtml += `<div style="margin-top:8px;"><a href="/checkout/" style="background:#f59e0b;color:#001711;font-weight:800;font-size:0.78rem;padding:4px 10px;border-radius:6px;text-decoration:none;display:inline-block;">👉 ${recommendedAction} →</a></div>`;
        }

        advisorBubble.innerHTML = formattedHtml;
        chatBody.appendChild(advisorBubble);
        chatBody.scrollTop = chatBody.scrollHeight;

        conversationHistory.push({ sender: 'user', text: text });
        conversationHistory.push({ sender: 'advisor', text: speechText || displayText });

        if (speechText) speakAdvisor(speechText);
      } else {
        const errorBubble = document.createElement('div');
        errorBubble.className = 'voice-msg advisor';
        errorBubble.innerText = "Apologies, I couldn't reach the advisor network right now. Please feel free to call our team directly at 083 449 3934.";
        chatBody.appendChild(errorBubble);
      }
    } catch (err) {
      thinkingBubble.remove();
      const errorBubble = document.createElement('div');
      errorBubble.className = 'voice-msg advisor';
      errorBubble.innerText = "Network connection interrupted. Please try again or call us at 083 449 3934.";
      chatBody.appendChild(errorBubble);
    }
  }

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
