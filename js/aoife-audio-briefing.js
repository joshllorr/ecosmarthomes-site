/**
 * site/js/aoife-audio-briefing.js
 * Aoife AI "30-Second Audio Briefing" Player (Voice-First Trust Engine)
 * EcoSmartHomes Ireland — Homeowner Advisory System
 */

(function() {
  'use strict';

  let currentTopic = 'grants';
  let isPlaying = false;
  let isPaused = false;
  let currentUtterance = null;
  let selectedVoice = null;
  let timerInterval = null;
  let elapsedSeconds = 0;
  const TOTAL_DURATION = 30; // 30-second briefing target

  // Audio Context for synthetic Irish intro chime
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

  function playIntroChime() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Note 1: C5 (523.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      // Note 2: G5 (783.99 Hz) melodic Celtic fifth
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(783.99, now + 0.1);
      gain2.gain.setValueAtTime(0.07, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.45);
    } catch (e) {}
  }

  function initVoices() {
    if (!('speechSynthesis' in window)) return;
    const findVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;
      selectedVoice = voices.find(v => v.lang === 'en-IE' || v.name.includes('Ireland')) ||
                      voices.find(v => v.lang === 'en-GB' && (v.name.includes('Female') || v.name.includes('Natural') || v.name.includes('Moira') || v.name.includes('Hazel') || v.name.includes('Libby'))) ||
                      voices.find(v => v.lang.startsWith('en') && v.name.includes('Female')) ||
                      voices.find(v => v.lang.startsWith('en')) || null;
    };
    findVoice();
    window.speechSynthesis.onvoiceschanged = findVoice;
  }

  function getActiveHomeownerContext() {
    const houseKey = window._simHouse || 'semi';
    const fuelKey = window._simFuel || 'oil';

    const houseNames = {
      semi: '1990s 3-Bed Semi-D',
      detached: '4-Bed Detached Home',
      bungalow: '1970s Hollow-Block Bungalow',
      terraced: 'Solid Masonry Terrace'
    };

    const fuelNames = {
      oil: 'home heating oil',
      gas: 'mains natural gas',
      electric: 'electric storage heating'
    };

    // Extract live calculated figures if available in DOM
    const grantEl = document.getElementById('simGrantVal') || document.getElementById('cashflowGrantVal');
    const grantVal = grantEl ? grantEl.innerText.replace('-', '').trim() : '€31,500';

    const billEl = document.getElementById('simBillVal');
    const billCut = billEl ? billEl.innerText.replace('-', '').trim() : '€2,650';

    const taxEl = document.getElementById('simTaxVal');
    const taxVal = taxEl ? taxEl.innerText.trim() : '€4,180';

    const grossEl = document.getElementById('cashflowGrossVal');
    const grossVal = grossEl ? grossEl.innerText.trim() : '€48,000';

    const netEl = document.getElementById('cashflowNetVal');
    const netVal = netEl ? netEl.innerText.trim() : '€16,500';

    const loanEl = document.getElementById('cashflowLoanVal');
    const loanMo = loanEl ? loanEl.innerText.replace('-', '').trim() : '€164/mo';

    const profitEl = document.getElementById('cashflowProfitVal');
    const pocketSurplus = profitEl ? profitEl.innerText.replace('+', '').trim() : '€57/month';

    const fuelSaveEl = document.getElementById('cashflowFuelSaveVal');
    const fuelSaveMo = fuelSaveEl ? fuelSaveEl.innerText.replace('+', '').trim() : '€221/mo';

    return {
      houseType: houseNames[houseKey] || 'Irish Home',
      fuel: fuelNames[fuelKey] || 'home heating oil',
      grantVal,
      billCut,
      taxVal,
      grossVal,
      netVal,
      loanMo,
      pocketSurplus,
      fuelSaveMo
    };
  }

  function generateScript(topicKey) {
    const c = getActiveHomeownerContext();
    switch (topicKey) {
      case 'cashflow':
        return `Hello! Here is your Day-1 positive cashflow briefing. With a turnkey deep retrofit of ${c.grossVal} and ${c.grantVal} in upfront SEAI grants, your net loan is only ${c.netVal}. At statutory low-cost green loan rates of 3.55%, your repayment is ${c.loanMo}, while your displaced heating savings put ${c.fuelSaveMo} back in your pocket. That leaves a positive surplus of plus ${c.pocketSurplus} from month one!`;

      case 'carbontax':
        return `Irish carbon tax on home heating fuel is legally escalating to one hundred euro per tonne by 2030. For your ${c.houseType} on ${c.fuel}, that is over ${c.taxVal} in dead money penalties. Transitioning to an A0 Zero-Emission heat pump permanently shields your home from statutory fuel hikes.`;

      case 'heatpump':
        return `Under NSAI standard SR50-2, an A-rated monobloc heat pump runs at a low flow temperature of 45 degrees. Properly paired with low-temperature radiators, you get continuous 21-degree warmth, whisper-quiet operation, and zero risk of freezing during Irish cold snaps.`;

      case 'grants':
      default:
        return `Dia dhuit! I'm Aoife, your independent energy advisor. For your ${c.houseType} heated by ${c.fuel}, 2026 SEAI One-Stop-Shop grants wipe up to ${c.grantVal} directly off your invoice upfront. Upgrading to an A0 Zero-Emission standard cuts your energy bills by up to ${c.billCut} a year. Tap below to inspect your survey options.`;
    }
  }

  function getTopicTitle(topicKey) {
    const titles = {
      grants: '2026 SEAI Grant Roadmap (Up to €35k)',
      cashflow: 'Day-1 Positive Cashflow Ledger',
      carbontax: '2026–2030 Carbon Tax Shield',
      heatpump: 'NSAI Heat Pump & Radiator Sizing'
    };
    return titles[topicKey] || '30-Second Audio Briefing';
  }

  function updateUIState(state) {
    // Sync buttons
    document.querySelectorAll('.btn-aoife-briefing-play').forEach(btn => {
      const icon = btn.querySelector('.briefing-play-icon') || btn.querySelector('.play-icon');
      const text = btn.querySelector('.play-text');
      if (state === 'playing') {
        if (icon) icon.innerText = '⏸';
        if (text) text.innerText = 'Pause Briefing';
        btn.classList.add('playing');
        btn.setAttribute('aria-pressed', 'true');
      } else if (state === 'paused') {
        if (icon) icon.innerText = '▶';
        if (text) text.innerText = 'Resume Briefing';
        btn.classList.remove('playing');
        btn.setAttribute('aria-pressed', 'false');
      } else {
        if (icon) icon.innerText = '▶';
        if (text) text.innerText = '30s Audio Briefing';
        btn.classList.remove('playing');
        btn.setAttribute('aria-pressed', 'false');
      }
    });

    // Sync Waveform visualizers
    document.querySelectorAll('.briefing-waveform').forEach(wf => {
      wf.classList.toggle('active', state === 'playing');
    });

    // Sync Avatar orbs
    document.querySelectorAll('.briefing-avatar-orb').forEach(orb => {
      orb.classList.toggle('speaking', state === 'playing');
    });

    // Sync topic buttons in Toolbox Studio
    document.querySelectorAll('.briefing-topic-btn').forEach(btn => {
      const match = btn.getAttribute('data-topic') === currentTopic;
      btn.classList.toggle('active', match);
      btn.setAttribute('aria-selected', match ? 'true' : 'false');
    });
  }

  function updateProgressUI(seconds) {
    const pct = Math.min(100, (seconds / TOTAL_DURATION) * 100);
    document.querySelectorAll('.briefing-progress-fill').forEach(bar => {
      bar.style.width = `${pct}%`;
    });

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeStr = `${mins}:${secs < 10 ? '0' : ''}${secs} / 0:30`;
    document.querySelectorAll('.briefing-timer').forEach(t => {
      t.innerText = timeStr;
    });
  }

  function setCaptionText(text) {
    document.querySelectorAll('.briefing-caption-text').forEach(cap => {
      cap.innerText = text;
    });
  }

  function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (isPlaying && !isPaused) {
        elapsedSeconds++;
        updateProgressUI(elapsedSeconds);
        if (elapsedSeconds >= TOTAL_DURATION) {
          clearInterval(timerInterval);
        }
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    elapsedSeconds = 0;
    updateProgressUI(0);
  }

  const AoifeBriefing = {
    play: function(topicKey) {
      if (topicKey) currentTopic = topicKey;
      if (!('speechSynthesis' in window)) {
        alert("Speech synthesis is not supported in your browser. Please review the roadmap cards below.");
        return;
      }

      if (typeof window.triggerHaptic === 'function') window.triggerHaptic(12);

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      stopTimer();

      playIntroChime();

      const scriptText = generateScript(currentTopic);
      setCaptionText(`"${scriptText}"`);

      currentUtterance = new SpeechSynthesisUtterance(scriptText);
      currentUtterance.rate = 0.96;
      currentUtterance.pitch = 1.02;
      if (selectedVoice) currentUtterance.voice = selectedVoice;

      currentUtterance.onstart = () => {
        isPlaying = true;
        isPaused = false;
        updateUIState('playing');
        startTimer();
      };

      currentUtterance.onend = () => {
        isPlaying = false;
        isPaused = false;
        stopTimer();
        updateUIState('stopped');
        setCaptionText("Briefing complete. Book an on-site survey or ask Aoife a direct question.");
      };

      currentUtterance.onerror = (e) => {
        isPlaying = false;
        isPaused = false;
        stopTimer();
        updateUIState('stopped');
      };

      // Slight delay so the gentle Celtic chime rings cleanly before speech
      setTimeout(() => {
        window.speechSynthesis.speak(currentUtterance);
      }, 180);
    },

    pause: function() {
      if ('speechSynthesis' in window && isPlaying && !isPaused) {
        window.speechSynthesis.pause();
        isPaused = true;
        updateUIState('paused');
      }
    },

    resume: function() {
      if ('speechSynthesis' in window && isPlaying && isPaused) {
        window.speechSynthesis.resume();
        isPaused = false;
        updateUIState('playing');
      }
    },

    toggle: function(topicKey) {
      if (isPlaying && !isPaused) {
        this.pause();
      } else if (isPlaying && isPaused) {
        this.resume();
      } else {
        this.play(topicKey || currentTopic);
      }
    },

    stop: function() {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      isPlaying = false;
      isPaused = false;
      stopTimer();
      updateUIState('stopped');
      setCaptionText("Tap play to hear Aoife's 30-second briefing.");
    },

    setTopic: function(topicKey) {
      currentTopic = topicKey;
      updateUIState(isPlaying ? (isPaused ? 'paused' : 'playing') : 'stopped');
      setCaptionText(`Selected: ${getTopicTitle(topicKey)}. Tap play to start.`);
      this.play(topicKey);
    },

    getLiveScript: function(topicKey) {
      return generateScript(topicKey || currentTopic);
    }
  };

  // Expose globally
  window.AoifeBriefing = AoifeBriefing;

  document.addEventListener('DOMContentLoaded', () => {
    initVoices();
  });

})();
