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
    container.innerHTML = `
      <!-- Floating Launcher Button -->
      <div id="voice-launcher" class="voice-advisor-launcher">
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
          <button id="voice-close-btn" style="background: none; border: none; color: #94a3b8; font-size: 1.3rem; cursor: pointer; padding: 4px;">✕</button>
        </div>

        <div id="voice-chat-body" class="voice-modal-body">
          <div class="voice-msg advisor">
            👋 <strong>Hi there! I'm Aoife.</strong><br>
            Ask me anything out loud about Irish SEAI grants, heat pumps, insulation, or solar PV. Tap the green mic to speak!
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
          <div class="quick-prompts-row">
            <span class="quick-prompt-chip" data-query="How much is the heat pump grant?">💶 €12.5k Heat Pump</span>
            <span class="quick-prompt-chip" data-query="Do I qualify with a D-rated home?">🏷️ D Rating Check</span>
            <span class="quick-prompt-chip" data-query="What is the €49 survey?">📋 €49 Survey</span>
          </div>

          <div class="voice-input-row">
            <button id="voice-mic-trigger" class="voice-mic-btn" title="Click to Speak">🎙️</button>
            <input type="text" id="voice-text-input" class="voice-text-input" placeholder="Speak or type a question..." />
            <button id="voice-send-btn" style="background: #003f2d; color: #fff; border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; font-size: 1rem;">➤</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    initVoiceEvents();
  }

  function initSpeechSynthesis() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        // Prefer natural Irish or British English voices
        selectedVoice = voices.find(v => v.lang === 'en-IE' || v.name.includes('Ireland')) ||
                        voices.find(v => v.lang === 'en-GB' && v.name.includes('Female')) ||
                        voices.find(v => v.lang.startsWith('en')) || null;
      };
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
        updateAcousticBar(true, 'Listening... Speak now 🎙️');
        const micBtn = document.getElementById('voice-mic-trigger');
        if (micBtn) micBtn.classList.add('listening');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && transcript.trim()) {
          handleUserQuery(transcript.trim());
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech Recognition Error:', event.error);
        stopListening();
      };

      recognition.onend = () => {
        stopListening();
      };
    }
  }

  function toggleListening() {
    if (!recognition) {
      alert('Voice recognition is not supported in this browser. You can type your question directly!');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    }
  }

  function stopListening() {
    isListening = false;
    const micBtn = document.getElementById('voice-mic-trigger');
    if (micBtn) micBtn.classList.remove('listening');
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
      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        isSpeaking = true;
        updateAcousticBar(true, 'Aoife is speaking... 🔊');
      };

      utterance.onend = () => {
        isSpeaking = false;
        updateAcousticBar(false, '');
      };

      window.speechSynthesis.speak(utterance);
    }
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
        const displayHtml = `
          ${data.displayText.replace(/\n/g, '<br>')}
          ${data.surveyCta ? `
            <div style="margin-top: 10px; padding: 10px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; text-align: center;">
              <a href="https://buy.stripe.com/test_aFabJ01EGbPz6tn8UYeME00" target="_blank" rel="noopener" style="color: #92400e; font-weight: 800; text-decoration: none; font-size: 0.85rem; display: block;">
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
      console.error('Advisor error:', err);
      const typingNode = document.getElementById(typingId);
      if (typingNode) typingNode.remove();
      appendMessage(`Homeowners in Ireland can claim up to €12,500 for an Air-to-Water Heat Pump, plus €2,500 for attic insulation under May 2026 SEAI rates. You can start with our <a href="https://buy.stripe.com/test_aFabJ01EGbPz6tn8UYeME00" target="_blank">€49 Independent Survey</a> to check your exact heat loss index!`, 'advisor', true);
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
