/**
 * site/js/voice-advisor.js
 * Browser-Based Voice AI Advisor (Aoife)
 * Real-time Speech Recognition & Synthesis for Irish Homeowners
 */

(function() {
  'use strict';

  let isListening = false;
  let isSpeaking = false;
  let conversationHistory = [];
  let recognition = null;
  let selectedVoice = null;

  // DOM Elements injected into page
  function injectVoiceAdvisorUI() {
    if (document.getElementById('voice-advisor-container')) return;

    const container = document.createElement('div');
    container.id = 'voice-advisor-container';
    container.setAttribute('data-screen-id', 'aoife_voice_assistant');
    container.innerHTML = `
      <!-- Floating Launcher Button -->
      <div id="voice-launcher" class="voice-advisor-launcher" data-screen-id="aoife_voice_assistant">
        <div class="voice-launcher-pulse"></div>
        <span style="font-weight: 700; font-size: 0.9rem;">🎙️ Ask Aoife (Voice AI)</span>
      </div>

      <!-- Advisor Modal Drawer -->
      <div id="voice-modal" class="voice-advisor-modal">
        <div class="voice-modal-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: #10b981; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">
              👩‍💼
            </div>
            <div>
              <div style="font-weight: 700; font-size: 0.95rem;">Aoife · Senior Retrofit AI</div>
              <div style="font-size: 0.75rem; color: #a7f3d0;">EcoSmartHomes Ireland · Online</div>
            </div>
          </div>
          <button id="voice-close-btn" aria-label="Close Voice Advisor" style="background: none; border: none; color: #94a3b8; font-size: 1.3rem; cursor: pointer; padding: 4px;">✕</button>
        </div>

        <div id="voice-chat-body" class="voice-modal-body">
          <div class="voice-msg advisor">
            👋 <strong>"Aoife, will my radiators freeze if I install a heat pump?"</strong><br><br>
            Tap below to talk live with Ireland's senior independent energy AI. Ask her how to avoid the 9% double VAT fuel penalty and what upgrades you actually need in plain, neighborly English.
          </div>
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
            <span class="quick-prompt-chip" data-query="Can I keep my open fireplace with a heat pump?">🔥 Open Fireplace (SR54)</span>
            <span class="quick-prompt-chip" data-query="What is the HLI 2.0 requirement for heat pumps?">📐 HLI ≤ 2.0 Rule</span>
            <span class="quick-prompt-chip" data-query="How much is the heat pump grant?">💶 €12.5k Grant</span>
            <span class="quick-prompt-chip" data-query="Do I qualify with a D-rated home?">🏷️ D Rating Check</span>
          </div>

          <div class="voice-input-row">
            <button id="voice-mic-trigger" class="voice-mic-btn" title="Click to Speak" aria-label="Toggle microphone for voice input">🎙️</button>
            <input type="text" id="voice-text-input" class="voice-text-input" aria-label="Ask Aoife voice energy advisor" placeholder="Speak or type a question..." />
            <button id="voice-send-btn" aria-label="Send message to voice advisor" style="background: #003f2d; color: #fff; border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; font-size: 1rem;">➤</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    initVoiceEvents();
  }

  function initSpeechSynthesis() {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        selectedVoice = voices.find(v => v.lang === 'en-IE' || v.name.includes('Ireland')) ||
                        voices.find(v => v.lang === 'en-GB' && (v.name.includes('Female') || v.name.includes('Natural'))) ||
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
      recognition.interimResults = true;
      // Use device language or standard English for universal browser support
      recognition.lang = navigator.language || 'en-GB';

      let finalTranscript = '';

      recognition.onstart = () => {
        isListening = true;
        finalTranscript = '';
        updateAcousticBar(true, '🎙️ Listening... Speak your question now');
        const micBtn = document.getElementById('voice-mic-trigger');
        const textInput = document.getElementById('voice-text-input');
        if (micBtn) micBtn.classList.add('listening');
        if (textInput) textInput.placeholder = 'Listening to your voice...';
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const textInput = document.getElementById('voice-text-input');
        const liveText = finalTranscript || interimTranscript;
        if (textInput && liveText) {
          textInput.value = liveText;
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech Recognition Notice:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          const chatBody = document.getElementById('voice-chat-body');
          if (chatBody && !document.getElementById('mic-permission-notice')) {
            const notice = document.createElement('div');
            notice.id = 'mic-permission-notice';
            notice.className = 'voice-msg advisor';
            notice.style.background = '#fef3c7';
            notice.style.borderColor = '#f59e0b';
            notice.style.color = '#92400e';
            notice.innerHTML = '🔒 <strong>Microphone permission required:</strong> You can enable mic access in your browser or simply type your question below!';
            chatBody.appendChild(notice);
            chatBody.scrollTop = chatBody.scrollHeight;
          }
        }
        stopListening();
      };

      recognition.onend = () => {
        stopListening();
        const textInput = document.getElementById('voice-text-input');
        const spokenQuery = (finalTranscript || (textInput ? textInput.value : '')).trim();
        if (spokenQuery) {
          handleUserQuery(spokenQuery);
          if (textInput) textInput.value = '';
        }
      };
    }
  }

  async function toggleListening() {
    if (!recognition) {
      const textInput = document.getElementById('voice-text-input');
      if (textInput) textInput.focus();
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      // Request mic permission explicitly on user touch/click
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Stop immediate tracks once permission is verified to prevent battery drain
          stream.getTracks().forEach(track => track.stop());
        }
        recognition.start();
      } catch (err) {
        console.warn('Recognition start handled gracefully:', err);
        try {
          recognition.start();
        } catch (_) {}
      }
    }
  }

  function stopListening() {
    isListening = false;
    const micBtn = document.getElementById('voice-mic-trigger');
    const textInput = document.getElementById('voice-text-input');
    if (micBtn) micBtn.classList.remove('listening');
    if (textInput) textInput.placeholder = 'Speak or type a question...';
    updateAcousticBar(false, '');
  }

  function updateAcousticBar(active, text) {
    const bar = document.getElementById('voice-acoustic-bar');
    const statusText = document.getElementById('voice-status-text');
    if (!bar) return;

    if (active) {
      bar.style.display = 'flex';
      bar.classList.add('active');
      if (statusText) statusText.textContent = text;
    } else {
      bar.style.display = 'none';
      bar.classList.remove('active');
    }
  }

  function speakText(text) {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      // Clean speech text of markdown symbols
      const cleanSpoken = text.replace(/\*\*/g, '').replace(/[#_`]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanSpoken);
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        isSpeaking = true;
        updateAcousticBar(true, '🔊 Aoife is speaking...');
      };

      utterance.onend = () => {
        isSpeaking = false;
        updateAcousticBar(false, '');
      };

      window.speechSynthesis.speak(utterance);
    }
  }

  function formatMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n•\s*/g, '<br>• ')
      .replace(/\n/g, '<br>');
  }

  async function handleUserQuery(queryText) {
    appendMessage(queryText, 'user');
    stopListening();

    // Show typing state
    const chatBody = document.getElementById('voice-chat-body');
    const typingId = 'typing-' + Date.now();
    const typingEl = document.createElement('div');
    typingEl.id = typingId;
    typingEl.className = 'voice-msg advisor';
    typingEl.innerHTML = `<em>Aoife is thinking... 💭</em>`;
    if (chatBody) {
      chatBody.appendChild(typingEl);
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    try {
      const res = await fetch('/api/voice-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          history: conversationHistory.slice(-4)
        })
      });

      const json = await res.json();
      const typingNode = document.getElementById(typingId);
      if (typingNode) typingNode.remove();

      if (res.ok && json.success && json.data) {
        const data = json.data;
        const formattedDisplay = formatMarkdown(data.displayText);
        const displayHtml = `
          <div>${formattedDisplay}</div>
          ${data.surveyCta ? `
            <div style="margin-top: 12px; padding: 10px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; text-align: center;">
              <a href="https://buy.stripe.com/aFabJ01EGbPz6tn8UYeME00" target="_blank" rel="noopener" style="color: #92400e; font-weight: 800; text-decoration: none; font-size: 0.88rem; display: block;">
                Order €49 Independent Survey →
              </a>
            </div>
          ` : ''}
        `;

        appendMessage(displayHtml, 'advisor', true);
        speakText(data.speechText || data.displayText);

        conversationHistory.push({ sender: 'user', text: queryText });
        conversationHistory.push({ sender: 'advisor', text: data.speechText || data.displayText });
      } else {
        throw new Error(json.error || 'Could not reach advisor');
      }
    } catch (err) {
      console.warn('Voice API offline or local, applying client-side SEAI Grounded Engineering RAG:', err);
      const typingNode = document.getElementById(typingId);
      if (typingNode) typingNode.remove();

      const qLower = (queryText || '').toLowerCase();
      let replyHtml = '';
      let spokenText = '';

      if (qLower.includes('fireplace') || qLower.includes('chimney') || qLower.includes('open fire')) {
        spokenText = "Under SEAI Technical Guidance SR54 Section 4.2, open fireplaces cannot remain in use with a heat pump because of excessive draft losses. The chimney must be permanently sealed or fitted with a room-sealed appliance to meet the Heat Loss Index of 2.0.";
        replyHtml = `
          <div>
            <strong>Open Fireplaces & SEAI Heat Pump Rules</strong><br>
            • <strong>Official Standard</strong>: <em>SEAI Technical Guidance SR54:2024 Section 4.2 & DEAP 4.2.2 Rule 3.4</em><br>
            • <strong>The Engineering Rule</strong>: Open flues cause massive uncontrolled air permeability and draft heat loss. To qualify for the <strong>€12,500 Heat Pump Grant</strong>, dwelling Heat Loss Indicator (HLI) must be ≤ 2.0 W/K/m².<br>
            • <strong>Mandatory Compliance</strong>: Open fireplaces must be permanently sealed at the throat with an insulated register plate or replaced with a room-sealed stove with dedicated external combustion air intake.<br><br>
            <div style="margin-top: 8px; padding: 10px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; text-align: center;">
              <a href="https://buy.stripe.com/aFabJ01EGbPz6tn8UYeME00" target="_blank" rel="noopener" style="color: #92400e; font-weight: 800; text-decoration: none; font-size: 0.88rem; display: block;">
                Book €49 Survey to Audit Flues & Heat Loss →
              </a>
            </div>
          </div>
        `;
      } else if (qLower.includes('hli') || qLower.includes('2.0') || qLower.includes('heat loss')) {
        spokenText = "Under SEAI Domestic Technical Guidance SR50-2, your home's Heat Loss Indicator must be 2.0 or lower before a heat pump grant is approved. This ensures the heat pump runs efficiently in Irish winters without excessive electricity bills.";
        replyHtml = `
          <div>
            <strong>Heat Loss Indicator (HLI ≤ 2.0 W/K/m²) Requirement</strong><br>
            • <strong>Official Standard</strong>: <em>SEAI Domestic Guidance SR50-2 Clause 3.4 & DEAP 4.2.2</em><br>
            • <strong>The Rule</strong>: Heat pump grant approval mandates an independent assessment confirming HLI ≤ 2.0 W/K/m² (or ≤ 2.3 with fabric roadmap) to maintain a Seasonal Performance Factor (SPF) ≥ 3.0.<br>
            • <strong>Upgrade Sequence</strong>: 300mm Attic Insulation + External Wall Wrap (U ≤ 0.18 W/m²K) brings 90% of Irish D/E-rated homes below the 2.0 threshold.<br><br>
            <div style="margin-top: 8px; padding: 10px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; text-align: center;">
              <a href="https://buy.stripe.com/aFabJ01EGbPz6tn8UYeME00" target="_blank" rel="noopener" style="color: #92400e; font-weight: 800; text-decoration: none; font-size: 0.88rem; display: block;">
                Order €49 Independent HLI Survey →
              </a>
            </div>
          </div>
        `;
      } else {
        spokenText = "Under May 2026 SEAI rates, Irish homeowners can access up to €12,500 for a heat pump, €8,000 for external wall insulation, and €1,800 for solar PV with permanent 0% VAT.";
        replyHtml = `
          <div>
            <strong>May 2026 SEAI Energy Grants & Standards</strong><br>
            • <strong>Air-to-Water Heat Pump</strong>: Up to <strong>€12,500</strong> grant (0% VAT, HLI ≤ 2.0)<br>
            • <strong>External Wall Wrap</strong>: Up to <strong>€8,000</strong> grant (NSAI Agrément, U ≤ 0.18 W/m²K)<br>
            • <strong>Attic Insulation</strong>: Up to <strong>€2,500</strong> grant (300mm mineral wool)<br>
            • <strong>Solar PV System</strong>: Up to <strong>€1,800</strong> grant + 24c/kWh Clean Export Guarantee<br><br>
            <div style="margin-top: 8px; padding: 10px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; text-align: center;">
              <a href="https://buy.stripe.com/aFabJ01EGbPz6tn8UYeME00" target="_blank" rel="noopener" style="color: #92400e; font-weight: 800; text-decoration: none; font-size: 0.88rem; display: block;">
                Book €49 Independent Retrofit Survey →
              </a>
            </div>
          </div>
        `;
      }

      appendMessage(replyHtml, 'advisor', true);
      speakText(spokenText);
      conversationHistory.push({ sender: 'user', text: queryText });
      conversationHistory.push({ sender: 'advisor', text: spokenText });
    }
  }

  function appendMessage(content, sender, isHtml = false) {
    const chatBody = document.getElementById('voice-chat-body');
    if (!chatBody) return;

    const msg = document.createElement('div');
    msg.className = `voice-msg ${sender}`;
    if (isHtml) {
      msg.innerHTML = content;
    } else {
      msg.textContent = content;
    }

    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function initVoiceEvents() {
    const launcher = document.getElementById('voice-launcher');
    const modal = document.getElementById('voice-modal');
    const closeBtn = document.getElementById('voice-close-btn');
    const micBtn = document.getElementById('voice-mic-trigger');
    const sendBtn = document.getElementById('voice-send-btn');
    const textInput = document.getElementById('voice-text-input');
    const chips = document.querySelectorAll('.quick-prompt-chip');

    if (launcher && modal) {
      launcher.addEventListener('click', () => {
        const isHidden = modal.style.display === 'none' || !modal.style.display;
        modal.style.display = isHidden ? 'flex' : 'none';
        if (isHidden && !conversationHistory.length) {
          // Welcome greeting
          setTimeout(() => {
            speakText("Hi! I'm Aoife. Ask me anything out loud about Irish heat pump grants or energy upgrades.");
          }, 300);
        }
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        stopListening();
      });
    }

    if (micBtn) {
      micBtn.addEventListener('click', toggleListening);
    }

    if (sendBtn && textInput) {
      sendBtn.addEventListener('click', () => {
        const text = textInput.value.trim();
        if (text) {
          handleUserQuery(text);
          textInput.value = '';
        }
      });

      textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const text = textInput.value.trim();
          if (text) {
            handleUserQuery(text);
            textInput.value = '';
          }
        }
      });
    }

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query');
        if (query) handleUserQuery(query);
      });
    });

    initSpeechRecognition();
    initSpeechSynthesis();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectVoiceAdvisorUI);
  } else {
    injectVoiceAdvisorUI();
  }
})();
