/**
 * EcoSmartHomes Smart Scroll Navigation, Persona Filter & Wow Factor Controller
 */
(function() {
  'use strict';

  // Global Toast Notification Helper
  window.showEshToast = function(msg, icon = '✅') {
    let toast = document.getElementById('esh-global-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'esh-global-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span style="font-size: 1.1rem;">${icon}</span> <span>${msg}</span>`;
    toast.classList.add('show');
    clearTimeout(window.eshToastTimer);
    window.eshToastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  };

  // 3. Tactile Haptic UI Feedback Helper (Micro-Interactions)
  const triggerHaptic = (ms = 8) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(ms); } catch (e) {}
    }
  };
  window.triggerHaptic = triggerHaptic;

  // Haptic Feedback for Range Sliders & Snap Interactions
  document.addEventListener('input', (e) => {
    if (e.target && e.target.type === 'range') {
      triggerHaptic(5);
    }
  }, { passive: true });

  // Robust Clipboard Copier with Fallback
  window.copyTextToClipboard = function(text, successMsg = 'Copied to Clipboard!') {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        window.showEshToast(successMsg, '✅');
      }).catch(() => {
        fallbackCopyText(text, successMsg);
      });
    } else {
      fallbackCopyText(text, successMsg);
    }
  };

  function fallbackCopyText(text, successMsg) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      window.showEshToast(successMsg, '✅');
    } catch (err) {
      window.showEshToast('Press Ctrl+C to copy', '📋');
    }
    document.body.removeChild(textArea);
  }

  let currentPersona = 'homeowner';

  // 1. High-Performance Easing Counter (easeOutExpo)
  function animateValueCounter(element, start, end, duration, prefix = '', suffix = '') {
    if (!element) return;
    const startTime = performance.now();
    const isCurrency = prefix.includes('€');

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal = Math.round(start + (end - start) * ease);

      if (isCurrency) {
        element.innerText = `${prefix}${currentVal.toLocaleString()}${suffix}`;
      } else {
        element.innerText = `${prefix}${currentVal}${suffix}`;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }

  // 2. Persona Metrics Table
  const PERSONA_METRICS = {
    homeowner: {
      target: 4750,
      prefix: '€',
      suffix: '',
      label: 'Avg. Lifetime Fuel Tax Shielded: ',
      icon: '🛡️',
      glowClass: 'persona-highlight-mint'
    },
    agent: {
      target: 15000,
      prefix: '€',
      suffix: '+',
      label: 'Avg. Property Equity Surge: ',
      icon: '📈',
      glowClass: 'persona-highlight-gold'
    },
    installer: {
      target: 4.2,
      prefix: '~',
      suffix: ' hrs',
      label: 'NSAI Compliance Time Saved: ',
      icon: '⚡',
      glowClass: 'persona-highlight-blue'
    },
    audit: {
      target: 100,
      prefix: '',
      suffix: '%',
      label: 'Conflict-Free Red-Line Protection: ',
      icon: '🛡️',
      glowClass: 'persona-highlight-mint'
    },
    all: {
      target: 25500,
      prefix: '€',
      suffix: '',
      label: 'Total Grants & Savings Unlocked: ',
      icon: '🏆',
      glowClass: 'persona-highlight-mint'
    }
  };

  // 3. One View System Switcher & Persona Controller (Zero Scroll Hijacking)
  window.switchSystemView = function(viewKey) {
    window.setPersona(viewKey);
  };

  window.handlePersonaTabClick = function(role) {
    const validRoles = ['homeowner', 'agent', 'installer', 'audit', 'all'];
    const targetRole = validRoles.includes(role) ? role : 'homeowner';
    const isHomePage = !!document.getElementById('view-panel-homeowner') ||
                       window.location.pathname === '/' || 
                       window.location.pathname.endsWith('/index.html') || 
                       window.location.pathname === '';

    if (!isHomePage) {
      window.location.href = `/?view=${targetRole}`;
      return;
    }

    // On home page: switch to dedicated portal
    window.setPersona(targetRole);

    // Smoothly scroll to top so user lands directly at their portal hero
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // Seamlessly update URL query parameter without page reload
    try {
      const url = new URL(window.location);
      url.searchParams.set('view', targetRole);
      window.history.pushState({ role: targetRole }, '', url.toString());
    } catch (e) {}
  };

  // Delegated click handler for cross-portal gateway cards
  document.addEventListener('click', function(e) {
    const card = e.target.closest('.cross-portal-gateway-card');
    if (!card) return;
    if (card.classList.contains('agent-card')) {
      window.handlePersonaTabClick('agent');
    } else if (card.classList.contains('installer-card')) {
      window.handlePersonaTabClick('installer');
    } else if (card.classList.contains('audit-card')) {
      window.handlePersonaTabClick('audit');
    }
  });

  // Toggle Portal Secondary Tools Drawer
  window.togglePortalDrawer = function(drawerId) {
    const drawer = document.getElementById(drawerId);
    const btn = document.querySelector(`[data-drawer-target="${drawerId}"]`);
    if (!drawer) return;
    const isClosed = drawer.style.display === 'none' || !drawer.classList.contains('open');
    if (isClosed) {
      drawer.style.display = 'block';
      drawer.classList.add('open');
      if (btn) {
        btn.classList.add('expanded');
        btn.setAttribute('aria-expanded', 'true');
      }
    } else {
      drawer.style.display = 'none';
      drawer.classList.remove('open');
      if (btn) {
        btn.classList.remove('expanded');
        btn.setAttribute('aria-expanded', 'false');
      }
    }
  };

  window.setPersona = function(personaKey) {
    const rawKey = (personaKey || 'homeowner').toLowerCase();
    const validKeys = ['homeowner', 'agent', 'installer', 'audit', 'all'];
    currentPersona = validKeys.includes(rawKey) ? rawKey : 'homeowner';
    triggerHaptic(10);

    // Persist chosen role to memory
    try {
      localStorage.setItem('ESH_currentRole', currentPersona);
      localStorage.setItem('ESH_hasChosenRole', 'true');
    } catch (e) {}

    // Inject Active Persona as Root Data Attribute
    document.documentElement.setAttribute('data-persona', currentPersona);
    document.body.setAttribute('data-persona', currentPersona);

    // Sync Voice Persona safely without recursive loops
    if (window.AG && typeof window.AG.setVoicePersona === 'function' && !window._voicePersonaSyncing) {
      window._voicePersonaSyncing = true;
      try {
        const voiceMap = { homeowner: 'aoife', agent: 'eimear', installer: 'declan', audit: 'declan', all: 'aoife' };
        const advisorKey = voiceMap[currentPersona];
        if (advisorKey && window.AG.currentPersonaKey !== advisorKey) {
          window.AG.setVoicePersona(advisorKey, false);
        }
      } catch (e) {} finally {
        window._voicePersonaSyncing = false;
      }
    }

    // Update Pill Active States
    document.querySelectorAll('.persona-pill').forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-persona') === currentPersona);
    });

    // Sync persona-chips
    document.querySelectorAll('.persona-chip').forEach(chip => {
      const p = chip.getAttribute('data-persona');
      chip.classList.remove('active-homeowner', 'active-agent', 'active-installer', 'active-audit', 'active-all');
      if (p === currentPersona) {
        if (p === 'homeowner') chip.classList.add('active-homeowner');
        else if (p === 'agent') chip.classList.add('active-agent');
        else if (p === 'installer') chip.classList.add('active-installer');
        else if (p === 'audit') chip.classList.add('active-audit');
        else if (p === 'all') chip.classList.add('active-all');
      }
    });

    // Sync Mobile Persona Dropdown Capsule
    const mobileLabel = document.getElementById('mobile-current-persona-label');
    const mobileTrigger = document.getElementById('mobile-persona-toggle-btn');
    if (mobileLabel && mobileTrigger) {
      mobileTrigger.classList.remove('agent-active', 'installer-active', 'audit-active');
      if (currentPersona === 'agent') {
        mobileLabel.innerText = '💼 Estate Agent';
        mobileTrigger.classList.add('agent-active');
      } else if (currentPersona === 'installer') {
        mobileLabel.innerText = '⚡ Installer';
        mobileTrigger.classList.add('installer-active');
      } else if (currentPersona === 'audit') {
        mobileLabel.innerText = '🛡️ Audit & Review';
        mobileTrigger.classList.add('audit-active');
      } else if (currentPersona === 'all') {
        mobileLabel.innerText = '🔍 All Tools';
      } else {
        mobileLabel.innerText = '🏠 Homeowner';
      }
    }

    // Sync Mobile Dock Central FAB active state
    const dockAuditFab = document.querySelector('.dock-fab-center');
    if (dockAuditFab) {
      dockAuditFab.classList.toggle('active', currentPersona === 'audit');
    }
    if (currentPersona === 'homeowner') {
      setDockActiveItem(0);
    } else if (currentPersona === 'audit') {
      document.querySelectorAll('#esh-mobile-dock .dock-item, .mobile-app-bottom-dock .dock-item').forEach(item => item.classList.remove('active'));
    }

    const metric = PERSONA_METRICS[currentPersona] || PERSONA_METRICS.homeowner;

    // Animate Dopamine Tickers
    const counterElements = document.querySelectorAll('.dopamine-counter-target');
    counterElements.forEach(el => {
      animateValueCounter(el, 0, metric.target, 550, metric.prefix, metric.suffix);
    });

    const labelElements = document.querySelectorAll('.dopamine-label-target');
    labelElements.forEach(el => {
      el.innerHTML = `${metric.icon} ${metric.label}`;
    });

    // Filter Tool Showcase Grid & Apply Breathing Glow
    const cards = document.querySelectorAll('.tool-showcase-box');
    cards.forEach(card => {
      card.classList.remove('persona-highlight-mint', 'persona-highlight-gold', 'persona-highlight-blue');
      const personas = card.getAttribute('data-personas') || 'all';
      if (currentPersona === 'all' || personas.includes(currentPersona) || personas.includes('all') || (currentPersona === 'audit' && (card.getAttribute('data-toolcat') === 'contractor' || personas.includes('installer')))) {
        card.classList.remove('persona-hidden');
        if (personas.includes(currentPersona) && currentPersona !== 'all') {
          card.classList.add(metric.glowClass);
        }
      } else {
        card.classList.add('persona-hidden');
      }
    });

    // Update Filter Header
    const lbl = document.getElementById('active-persona-title');
    if (lbl) {
      if (currentPersona === 'homeowner') lbl.innerText = 'Homeowner Energy & Savings Suite';
      else if (currentPersona === 'agent') lbl.innerText = 'Estate Agent Valuation & BER Hub';
      else if (currentPersona === 'installer') lbl.innerText = 'Installer NSAI Sizing & Tender Suite';
      else if (currentPersona === 'audit') lbl.innerText = 'Audit, Review & Test Command Center';
      else lbl.innerText = 'All Independent Energy Tools';
    }

    // =========================================================================
    // ONE VIEW SYSTEM PANELS TOGGLE (IN-PLACE, ZERO SCROLL HIJACKING)
    // =========================================================================
    const systemPanels = {
      homeowner: document.getElementById('view-panel-homeowner'),
      agent: document.getElementById('view-panel-agent'),
      installer: document.getElementById('view-panel-installer'),
      audit: document.getElementById('view-panel-audit'),
      all: document.getElementById('view-panel-all')
    };

    let hasStructuredPanels = false;
    Object.keys(systemPanels).forEach(key => {
      const panel = systemPanels[key];
      if (panel) {
        hasStructuredPanels = true;
        if (key === currentPersona) {
          panel.classList.add('active');
          panel.style.display = 'block';
        } else {
          panel.classList.remove('active');
          panel.style.display = 'none';
        }
      }
    });

    // Fallback: Toggle standalone individual wizard sections if not inside systemPanels
    const homeownerWizard = document.getElementById('carbon-tax-war-room') || document.getElementById('wallet-rescue-wizard');
    const agentWizard = document.getElementById('agent-rescue-wizard');
    const installerWizard = document.getElementById('installer-rescue-wizard');

    if (!hasStructuredPanels) {
      if (homeownerWizard) homeownerWizard.style.display = (currentPersona === 'homeowner' || currentPersona === 'all') ? 'block' : 'none';
      if (agentWizard) agentWizard.style.display = (currentPersona === 'agent' || currentPersona === 'all') ? 'block' : 'none';
      if (installerWizard) installerWizard.style.display = (currentPersona === 'installer' || currentPersona === 'all') ? 'block' : 'none';
    }

    // Update active calculations without scrolling
    if (currentPersona === 'installer') {
      if (typeof updateInstallerComplianceMatrix === 'function') updateInstallerComplianceMatrix();
      if (typeof updateInstallerHydraulicCalculations === 'function') updateInstallerHydraulicCalculations();
      if (typeof updateInstallerDefroster === 'function') updateInstallerDefroster();
    } else if (currentPersona === 'agent' && typeof updateAgentSurgeCalculations === 'function') {
      updateAgentSurgeCalculations();
    }

    // Synchronize URL query parameter without page reload or jump
    try {
      if (window.history && window.history.replaceState) {
        const url = new URL(window.location);
        if (url.searchParams.get('view') !== currentPersona && url.searchParams.get('role') !== currentPersona) {
          url.searchParams.set('view', currentPersona);
          window.history.replaceState({ view: currentPersona }, '', url);
        }
      }
    } catch (e) {}

    window._personaInitialized = true;

    // Synchronize Voice AI Advisor Persona
    if (typeof window.setVoicePersona === 'function') {
      if (currentPersona === 'agent') {
        window.setVoicePersona('agent');
      } else if (currentPersona === 'installer') {
        window.setVoicePersona('installer');
      } else {
        window.setVoicePersona('homeowner');
      }
    }
  };

  // 4. Tactile Preset One-Click Controller (Zero Keyboard Friction)
  const PRESET_DATA = {
    oil: { name: 'Kerosene Oil', bill: 300, taxPenalty: 3420, shieldSavings: 2750, pctPenalty: 88, pctShield: 92 },
    gas: { name: 'Natural Gas', bill: 180, taxPenalty: 2150, shieldSavings: 1850, pctPenalty: 55, pctShield: 80 },
    storage: { name: 'Night Storage / Electric', bill: 250, taxPenalty: 1980, shieldSavings: 2200, pctPenalty: 65, pctShield: 85 }
  };

  window.selectFuelPreset = function(fuelKey) {
    document.querySelectorAll('.tactile-preset-chip[data-fuel]').forEach(chip => {
      chip.classList.toggle('active', chip.getAttribute('data-fuel') === fuelKey);
    });

    const data = PRESET_DATA[fuelKey] || PRESET_DATA.oil;
    
    // Update Dynamic Bar Metrics
    const penaltyVal = document.getElementById('stat-fuel-penalty-val');
    const shieldVal = document.getElementById('stat-shield-savings-val');
    const penaltyBar = document.getElementById('bar-fill-penalty');
    const shieldBar = document.getElementById('bar-fill-shield');

    if (penaltyVal) penaltyVal.innerText = `+€${data.taxPenalty.toLocaleString()} Tax Penalty`;
    if (shieldVal) shieldVal.innerText = `-€${data.shieldSavings.toLocaleString()}/yr Saved`;
    if (penaltyBar) penaltyBar.style.width = `${data.pctPenalty}%`;
    if (shieldBar) shieldBar.style.width = `${data.pctShield}%`;
  };

  // 5. Drawer & Smart Scroll
  let lastScrollY = window.scrollY;
  let ticking = false;
  const SCROLL_THRESHOLD = 50;

  function initSmartNav() {
    const header = document.querySelector('.main-nav-bar') || document.querySelector('.header');

    window.openToolsDrawer = function() {
      const overlay = document.getElementById('esh-drawer-overlay');
      const drawer = document.getElementById('esh-side-drawer');
      if (overlay && drawer) {
        overlay.classList.add('active');
        drawer.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    };

    window.closeToolsDrawer = function() {
      const overlay = document.getElementById('esh-drawer-overlay');
      const drawer = document.getElementById('esh-side-drawer');
      if (overlay && drawer) {
        overlay.classList.remove('active');
        drawer.classList.remove('open');
        document.body.style.overflow = '';
      }
    };

    if (!document.getElementById('esh-side-tab-toggle')) {
      const sideTab = document.createElement('button');
      sideTab.id = 'esh-side-tab-toggle';
      sideTab.type = 'button';
      sideTab.setAttribute('aria-label', 'Open Tools Navigation Drawer');
      sideTab.title = 'Open Tools Directory';
      sideTab.innerHTML = `
        <span style="font-size: 1.05rem; line-height: 1;">☰</span>
        <span style="writing-mode: vertical-rl; text-orientation: mixed; letter-spacing: 0.1em; font-weight: 800;">TOOLS</span>
      `;
      sideTab.onclick = () => window.openToolsDrawer();
      sideTab.addEventListener('click', () => window.openToolsDrawer());
      document.body.appendChild(sideTab);
    } else {
      const existingTab = document.getElementById('esh-side-tab-toggle');
      existingTab.onclick = () => window.openToolsDrawer();
      existingTab.addEventListener('click', () => window.openToolsDrawer());
    }

    if (!document.getElementById('esh-drawer-overlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'esh-drawer-overlay';
      overlay.onclick = () => window.closeToolsDrawer();
      overlay.addEventListener('click', () => window.closeToolsDrawer());
      document.body.appendChild(overlay);
    } else {
      const existingOverlay = document.getElementById('esh-drawer-overlay');
      existingOverlay.onclick = () => window.closeToolsDrawer();
      existingOverlay.addEventListener('click', () => window.closeToolsDrawer());
    }

    // 2. Off-Canvas Side Drawer with Persona Accordion Tabs (Right Hand Side)
    if (!document.getElementById('esh-side-drawer')) {
      const drawer = document.createElement('aside');
      drawer.id = 'esh-side-drawer';
      drawer.setAttribute('aria-label', 'Tools and Resources Directory Sidebar');
      drawer.innerHTML = `
        <div class="drawer-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.4rem;">🏡</span>
            <div>
              <span style="font-size: 1.1rem; font-weight: 900; color: #ffffff;">EcoSmart<strong style="color: #34f5c5;">Homes</strong></span>
              <div style="font-size: 0.72rem; color: #34f5c5; font-family: 'IBM Plex Mono', monospace;">Tool & Resource Directory</div>
            </div>
          </div>
          <button type="button" class="drawer-close-btn" onclick="window.closeToolsDrawer()" aria-label="Close Drawer">✕</button>
        </div>
        <div style="padding: 10px 16px 0 16px;">
          <button type="button" onclick="window.closeToolsDrawer(); window.openPersonaPickerModal();" style="width: 100%; background: rgba(52, 245, 197, 0.12); border: 1px solid rgba(52, 245, 197, 0.35); border-radius: 12px; color: #34f5c5; font-size: 0.78rem; font-weight: 800; padding: 10px; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;">
            <span>✨ Switch Advisory Role (Open Switchboard)</span>
          </button>
        </div>

        <div style="flex: 1; overflow-y: auto; padding-bottom: 20px;">
          
          <!-- 1. HOMEOWNER HUB -->
          <div class="drawer-accordion-group">
            <button type="button" id="accordion-btn-homeowner" class="drawer-accordion-btn active" onclick="window.toggleDrawerAccordion('homeowner')">
              <span style="display:flex;align-items:center;gap:8px;">
                <span>🏠</span>
                <span>Homeowner Tools</span>
              </span>
              <span style="display:flex;align-items:center;gap:6px;">
                <span class="drawer-badge-pill" style="background:rgba(16,185,129,0.15);color:#34f5c5;border:1px solid #10b981;">10 Tools</span>
                <span class="accordion-arrow">▼</span>
              </span>
            </button>
            <div id="accordion-panel-homeowner" class="drawer-accordion-panel active">
              <a href="#heroGrantSimulator" class="drawer-tool-item" onclick="window.selectArchetypeFastPick('bungalow'); window.closeToolsDrawer();">
                <span class="tool-icon">⚡</span>
                <div>
                  <div>Irish Archetype Fast-Picks (1-Click)</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">Bungalow, Semi-D, Timber, Terrace</div>
                </div>
              </a>
              <a href="#heroAoifeBriefingPlayer" class="drawer-tool-item" onclick="if(window.AoifeBriefing){ window.AoifeBriefing.play('grants'); } window.closeToolsDrawer();">
                <span class="tool-icon">🎙️</span>
                <div>
                  <div>Aoife 30-Sec Audio Briefing (Voice AI)</div>
                  <div style="font-size:0.72rem;color:#34f5c5;font-weight:700;">▶ 30-Sec Grants &amp; Cashflow Audio</div>
                </div>
              </a>
              <a href="/carbon-tax/" class="drawer-tool-item">
                <span class="tool-icon">🛡️</span>
                <div>
                  <div>Carbon Tax Shield & Bill Sizer</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">Avoid €4.3k in statutory fuel hikes</div>
                </div>
              </a>
              <a href="/ber-advisor/" class="drawer-tool-item">
                <span class="tool-icon">💶</span>
                <div>
                  <div>€35,000 SEAI Grant Stack</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">Deep retrofit & heat pump grants</div>
                </div>
              </a>
              <a href="/solar/" class="drawer-tool-item">
                <span class="tool-icon">☀️</span>
                <div>
                  <div>Solar PV Simulator</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">Microgeneration & export income</div>
                </div>
              </a>
              <a href="/battery-arbitrage/" class="drawer-tool-item">
                <span class="tool-icon">🔋</span>
                <div>
                  <div>Battery Arbitrage Engine</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">Night rate tariff optimization</div>
                </div>
              </a>
              <a href="/retrofit-loan/" class="drawer-tool-item">
                <span class="tool-icon">🏦</span>
                <div>
                  <div>3.45% SBCI Retrofit Loan</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">Low-cost green loan calculator</div>
                </div>
              </a>
              <a href="/energy-notebook/" class="drawer-tool-item">
                <span class="tool-icon">📓</span>
                <div>
                  <div>Private Energy Notebook & PDF Pack</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">1-Click Bank-Ready Green Mortgage Pack</div>
                </div>
              </a>
              <a href="/quote-comparator/" class="drawer-tool-item">
                <span class="tool-icon">⚖️</span>
                <div>
                  <div>Contractor Quote Comparator</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">1-Tap WhatsApp dispute generator</div>
                </div>
              </a>
              <a href="/tools/voice-aoife.html" class="drawer-tool-item">
                <span class="tool-icon">🤖</span>
                <div>
                  <div>Aoife AI 24/7 Voice Advisor</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">Interactive audio engineering Q&A</div>
                </div>
              </a>
            </div>
          </div>

          <!-- 2. ESTATE AGENT HUB -->
          <div class="drawer-accordion-group">
            <button type="button" id="accordion-btn-agent" class="drawer-accordion-btn" onclick="window.toggleDrawerAccordion('agent')">
              <span style="display:flex;align-items:center;gap:8px;">
                <span>💼</span>
                <span>Estate Agent Hub</span>
              </span>
              <span style="display:flex;align-items:center;gap:6px;">
                <span class="drawer-badge-pill" style="background:rgba(245,158,11,0.15);color:#fbbf24;border:1px solid #f59e0b;">8 Tools</span>
                <span class="accordion-arrow">▼</span>
              </span>
            </button>
            <div id="accordion-panel-agent" class="drawer-accordion-panel">
              <a href="/tools/voice-eimear.html" class="drawer-tool-item">
                <span class="tool-icon">🎙️</span>
                <div>
                  <div>Ask Eimear (Real Estate AI)</div>
                  <div style="font-size:0.72rem;color:#fbbf24;font-weight:700;">Voice advisor for property listings</div>
                </div>
              </a>
              <a href="/daft-hud/" class="drawer-tool-item">
                <span class="tool-icon">⚡</span>
                <div>
                  <div>Daft.ie 1-Click Bookmarklet (HUD)</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">Zero-install live listing overlay</div>
                </div>
              </a>
              <a href="/property-auditor/" class="drawer-tool-item">
                <span class="tool-icon">🚀</span>
                <div>
                  <div>1-Click Daft.ie Property Auditor</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">Instant link & Eircode grant scanner</div>
                </div>
              </a>
              <a href="/?view=agent" class="drawer-tool-item" onclick="window.setPersona('agent'); window.closeToolsDrawer();">
                <span class="tool-icon">📈</span>
                <div>
                  <div>Capital Equity Surge Calculator</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">A-Rating property value uplift</div>
                </div>
              </a>
              <a href="/?view=agent" class="drawer-tool-item" onclick="window.setPersona('agent'); window.closeToolsDrawer(); setTimeout(() => { window.setAgentStep2Mode('defense'); document.getElementById('btnAgentModeDefense')?.scrollIntoView({behavior:'smooth', block:'center'}); }, 150);">
                <span class="tool-icon">🛡️</span>
                <div>
                  <div>Vendor Objection Shield</div>
                  <div style="font-size:0.72rem;color:#34f5c5;font-weight:700;">Price-chipping defense matrix</div>
                </div>
              </a>
              <a href="/ber-matrix/" class="drawer-tool-item">
                <span class="tool-icon">📊</span>
                <div>
                  <div>Official Simplified BER Matrix</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">8-Category Irish SEAI scale</div>
                </div>
              </a>
              <a href="/?view=agent" class="drawer-tool-item" onclick="window.setPersona('agent'); window.closeToolsDrawer(); setTimeout(() => { window.openAgentBorrowingBooster(); }, 150);">
                <span class="tool-icon">🏛️</span>
                <div>
                  <div>Buyer Borrowing Power Booster</div>
                  <div style="font-size:0.72rem;color:#38bdf8;font-weight:700;">Mortgage ceiling expander (+€42k)</div>
                </div>
              </a>
              <a href="/checkout/?role=agent" class="drawer-tool-item">
                <span class="tool-icon">📜</span>
                <div>
                  <div>Pre-Listing Verification Pack</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">Buyer-ready engineer certs (€49)</div>
                </div>
              </a>
            </div>
          </div>

          <!-- 3. INSTALLER & RETROFITTER HUB -->
          <div class="drawer-accordion-group">
            <button type="button" id="accordion-btn-installer" class="drawer-accordion-btn" onclick="window.toggleDrawerAccordion('installer')">
              <span style="display:flex;align-items:center;gap:8px;">
                <span>⚡</span>
                <span>Installer & Retrofitter</span>
              </span>
              <span style="display:flex;align-items:center;gap:6px;">
                <span class="drawer-badge-pill" style="background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid #38bdf8;">8 Tools</span>
                <span class="accordion-arrow">▼</span>
              </span>
            </button>
            <div id="accordion-panel-installer" class="drawer-accordion-panel">
              <a href="/tools/voice-declan.html" class="drawer-tool-item">
                <span class="tool-icon">🎙️</span>
                <div>
                  <div>Ask Declan (Installer AI)</div>
                  <div style="font-size:0.72rem;color:#38bdf8;font-weight:700;">NSAI SR50 technical advisor</div>
                </div>
              </a>
              <a href="#installer-rescue-wizard" class="drawer-tool-item" onclick="window.openInstallerHydraulicSizer(event)">
                <span class="tool-icon">🌊</span>
                <div>
                  <div>NSAI Hydraulic &amp; Velocity Sizer</div>
                  <div style="font-size:0.72rem;color:#38bdf8;font-weight:700;">Anti-lockout pipework &amp; volumiser</div>
                </div>
              </a>
              <a href="#installer-rescue-wizard" class="drawer-tool-item" onclick="window.openInstallerQuoteDefroster(event)">
                <span class="tool-icon">🛡️</span>
                <div>
                  <div>Cowboy Quote Defroster</div>
                  <div style="font-size:0.72rem;color:#34f5c5;font-weight:700;">Spec &amp; margin shield (+€3.3k)</div>
                </div>
              </a>
              <a href="/radiator-sizer/" class="drawer-tool-item">
                <span class="tool-icon">📐</span>
                <div>
                  <div>NSAI SR50-2 Radiator Sizer</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">55°C ΔT30 heat loss calculation</div>
                </div>
              </a>
              <a href="/tender-generator/" class="drawer-tool-item">
                <span class="tool-icon">📝</span>
                <div>
                  <div>1-Click SEAI Tender RFP Draft</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">Compliant contractor quotes</div>
                </div>
              </a>
              <a href="/quote-auditor/" class="drawer-tool-item">
                <span class="tool-icon">🔍</span>
                <div>
                  <div>Contractor Quote Auditor</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">Buffer tank & pricing red-liner</div>
                </div>
              </a>
              <a href="/heat-pump-suitability.html" class="drawer-tool-item">
                <span class="tool-icon">🌡️</span>
                <div>
                  <div>Heat Pump Suitability Sizer</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">Flow temp & kW requirements</div>
                </div>
              </a>
              <a href="/checkout/?role=installer" class="drawer-tool-item">
                <span class="tool-icon">📋</span>
                <div>
                  <div>Trade Sub-Contract Survey</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">Hand off desk admin to Joe (€49)</div>
                </div>
              </a>
            </div>
          </div>

          <!-- 4. AUDIT, REVIEW & TEST HUB -->
          <div class="drawer-accordion-group">
            <button type="button" id="accordion-btn-audit" class="drawer-accordion-btn" onclick="window.toggleDrawerAccordion('audit')">
              <span style="display:flex;align-items:center;gap:8px;">
                <span>🛡️</span>
                <span>Audit, Review & Test</span>
              </span>
              <span style="display:flex;align-items:center;gap:6px;">
                <span class="drawer-badge-pill" style="background:rgba(52,245,197,0.15);color:#34f5c5;border:1px solid #34f5c5;">5 Tools</span>
                <span class="accordion-arrow">▼</span>
              </span>
            </button>
            <div id="accordion-panel-audit" class="drawer-accordion-panel">
              <a href="/quote-auditor/" class="drawer-tool-item">
                <span class="tool-icon">🛡️</span>
                <div>
                  <div>AI Contractor Quote Red-Liner</div>
                  <div style="font-size:0.72rem;color:#34f5c5;font-weight:700;">Flag hidden markups & buffer tank omissions</div>
                </div>
              </a>
              <a href="/quote-comparator/" class="drawer-tool-item">
                <span class="tool-icon">⚖️</span>
                <div>
                  <div>Contractor Quote Comparator</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">Compare 2-3 quotes side-by-side</div>
                </div>
              </a>
              <a href="/heat-pump-suitability.html" class="drawer-tool-item">
                <span class="tool-icon">📐</span>
                <div>
                  <div>Heat Pump Readiness & Flow Test</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">NSAI SR50 HLI &lt; 2.0 W/K/m² check</div>
                </div>
              </a>
              <a href="/property-auditor/" class="drawer-tool-item">
                <span class="tool-icon">🔍</span>
                <div>
                  <div>National BER Register Audit</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">Official SEAI records & Eircode lookup</div>
                </div>
              </a>
              <a href="/?view=audit" class="drawer-tool-item" onclick="window.setPersona('audit'); window.closeToolsDrawer();">
                <span class="tool-icon">📷</span>
                <div>
                  <div>Snap & Audit Scanner</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">Zero-typing AI photo analysis</div>
                </div>
              </a>
              <a href="/checkout/?tier=survey&price=149" class="drawer-tool-item">
                <span class="tool-icon">💳</span>
                <div>
                  <div>Book Independent In-Person Survey</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">NSAI compliant on-site inspection (€149)</div>
                </div>
              </a>
            </div>
          </div>

          <!-- 5. RESOURCES & SUPPORT HUB -->
          <div class="drawer-accordion-group">
            <button type="button" id="accordion-btn-resources" class="drawer-accordion-btn" onclick="window.toggleDrawerAccordion('resources')">
              <span style="display:flex;align-items:center;gap:8px;">
                <span>📚</span>
                <span>Resources & Support</span>
              </span>
              <span style="display:flex;align-items:center;gap:6px;">
                <span class="drawer-badge-pill" style="background:rgba(255,255,255,0.1);color:#cbd5e1;border:1px solid rgba(255,255,255,0.2);">5 Links</span>
                <span class="accordion-arrow">▼</span>
              </span>
            </button>
            <div id="accordion-panel-resources" class="drawer-accordion-panel">
              <a href="/pricing/" class="drawer-tool-item">
                <span class="tool-icon">🏷️</span>
                <div>
                  <div>2026 Pricing Framework</div>
                  <div style="font-size:0.72rem;color:#34f5c5;font-weight:700;">On-site surveys & digital packs</div>
                </div>
              </a>
              <a href="/roadmap/" class="drawer-tool-item">
                <span class="tool-icon">🗺️</span>
                <div>
                  <div>2026 Retrofit Roadmap</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">Irish engineering dossiers</div>
                </div>
              </a>
              <a href="/locations/" class="drawer-tool-item">
                <span class="tool-icon">📍</span>
                <div>
                  <div>32-County Location Hub</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">Regional installers & grants</div>
                </div>
              </a>
              <a href="/contractors/" class="drawer-tool-item">
                <span class="tool-icon">👷</span>
                <div>
                  <div>SEAI Registered Contractors</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">Verified installer directory</div>
                </div>
              </a>
              <a href="/support/faq.html" class="drawer-tool-item">
                <span class="tool-icon">❓</span>
                <div>
                  <div>FAQ & Help Center</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">Grants, loans, and technical queries</div>
                </div>
              </a>
              <a href="/privacy-policy.html" class="drawer-tool-item">
                <span class="tool-icon">🔒</span>
                <div>
                  <div>Privacy & Data Security</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">GDPR & statutory compliance</div>
                </div>
              </a>
            </div>
          </div>

        </div>

        <div style="padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; gap: 8px;">
          <a href="/checkout/?tier=survey&price=149" class="btn-hero-primary-star" style="display: block; text-align: center; padding: 12px 16px; font-size: 0.88rem; text-decoration: none;">
            ⭐ Book On-Site Survey (€149) →
          </a>
          <a href="/pricing/" style="display: block; text-align: center; font-size: 0.78rem; color: #34f5c5; font-weight: 700; text-decoration: none;">
            View All Pricing Packages & Tiers →
          </a>
        </div>
      `;
      drawer.addEventListener('click', function(e) {
        const link = e.target.closest('.drawer-tool-item');
        if (link) {
          window.closeToolsDrawer();
        }
      });
      document.body.appendChild(drawer);
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') window.closeToolsDrawer();
    });

    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          const currentScrollY = window.scrollY;

          if (currentScrollY > lastScrollY && currentScrollY > SCROLL_THRESHOLD) {
            if (header) header.classList.add('nav-hidden');
          } else {
            if (header) header.classList.remove('nav-hidden');
          }

          lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Auto-Hide floating widgets when keyboard / input is focused on mobile
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(el => {
      el.addEventListener('focus', () => document.body.classList.add('floating-widgets-hidden'));
      el.addEventListener('blur', () => document.body.classList.remove('floating-widgets-hidden'));
    });

    // Initialize Default Persona or View from URL / Memory
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const initialView = urlParams.get('view') || urlParams.get('role');
      if (initialView && ['homeowner', 'agent', 'installer', 'audit', 'all'].includes(initialView.toLowerCase())) {
        window.setPersona(initialView.toLowerCase());
      } else {
        const saved = localStorage.getItem("ESH_currentRole") || 'homeowner';
        window.setPersona(saved);
      }
    } catch (e) {
      window.setPersona('homeowner');
    }
  }

  // Auto-run initSmartNav
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmartNav);
  } else {
    initSmartNav();
  }

  // ==========================================================================
  // 3-STEP WALLET-HIT ONBOARDING RESCUE ENGINE
  // ==========================================================================
  let selectedFuel = 'oil';
  let monthlyHeatingBill = 350;
  let cumulativePenalty = 4320;
  let penaltyInterval = null;
  let isShieldDeployed = false;

  // Irish Carbon Tax Escalator Factors (€7.50/tonne annual statutory escalator to 2030)
  const FUEL_ESCALATOR_FACTORS = {
    oil: { baseMultiplier: 12.35, monthlyDrainPct: 0.206, label: 'Kerosene Home Heating Oil' },
    gas: { baseMultiplier: 8.85, monthlyDrainPct: 0.162, label: 'Mains Natural Gas' },
    electric: { baseMultiplier: 7.90, monthlyDrainPct: 0.145, label: 'Electric / Storage Radiators' }
  };

  function updatePenaltyCalculations() {
    if (isShieldDeployed) return;
    const factor = FUEL_ESCALATOR_FACTORS[selectedFuel] || FUEL_ESCALATOR_FACTORS.oil;
    // Cumulative 2026-2030 penalty calculation
    cumulativePenalty = Math.round(monthlyHeatingBill * factor.baseMultiplier);
    const monthlyLeak = Math.round(monthlyHeatingBill * factor.monthlyDrainPct);

    // Update Slider Display
    const billDisp = document.getElementById('lbl-wizard-monthly-bill');
    if (billDisp) billDisp.innerText = `€${monthlyHeatingBill}/month`;

    // Update Penalty Display
    const penaltyDisp = document.getElementById('lbl-wizard-penalty-clock');
    if (penaltyDisp) penaltyDisp.innerText = `€${cumulativePenalty.toLocaleString()}.00`;

    const leakDisp = document.getElementById('lbl-wizard-monthly-leak');
    if (leakDisp) leakDisp.innerText = `Leaking: €${monthlyLeak}.00 / month straight to the taxman`;

    // Smooth Continuous Ambient Interpolation (€100 to €650)
    const wizardCard = document.getElementById('wallet-rescue-wizard');
    if (wizardCard) {
      const ratio = Math.min(Math.max((monthlyHeatingBill - 100) / 550, 0), 1);
      // Interpolate from Mint (16, 185, 129) -> Amber (245, 158, 11) -> Crimson (239, 68, 68)
      let r, g, b, borderColor, shadowColor;
      if (ratio < 0.5) {
        const localRatio = ratio / 0.5;
        r = Math.round(16 + (245 - 16) * localRatio);
        g = Math.round(185 + (158 - 185) * localRatio);
        b = Math.round(129 + (11 - 129) * localRatio);
        borderColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
        shadowColor = `rgba(${r}, ${g}, ${b}, 0.3)`;
      } else {
        const localRatio = (ratio - 0.5) / 0.5;
        r = Math.round(245 + (239 - 245) * localRatio);
        g = Math.round(158 + (68 - 158) * localRatio);
        b = Math.round(11 + (68 - 11) * localRatio);
        borderColor = `rgba(${r}, ${g}, ${b}, 0.7)`;
        shadowColor = `rgba(${r}, ${g}, ${b}, 0.4)`;
      }
      wizardCard.style.background = `radial-gradient(120% 120% at 50% 0%, rgba(${r}, ${g}, ${b}, 0.25) 0%, #00241b 55%, #001711 100%)`;
      wizardCard.style.borderColor = borderColor;
      wizardCard.style.boxShadow = `0 20px 60px ${shadowColor}`;
    }
  }

  window.setWizardFuel = function(fuelKey) {
    if (typeof triggerHaptic === 'function') triggerHaptic(12);
    selectedFuel = fuelKey;
    document.querySelectorAll('.wizard-fuel-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-fuel') === fuelKey);
    });
    updatePenaltyCalculations();
    if (window.ESH_OS && typeof window.ESH_OS.setState === 'function') {
      window.ESH_OS.setState({
        energy: {
          currentFuel: fuelKey,
          monthlyHeatingSpend: monthlyHeatingBill,
          projectedPenalty: cumulativePenalty
        }
      });
    }
  };

  window.onWizardSliderChange = function(sliderVal) {
    monthlyHeatingBill = Number(sliderVal);
    updatePenaltyCalculations();
    if (typeof updateGlidingBubble === 'function') {
      updateGlidingBubble(document.getElementById('wizard-spend-range'));
    }
    if (window.ESH_OS && typeof window.ESH_OS.setState === 'function') {
      window.ESH_OS.setState({
        energy: {
          monthlyHeatingSpend: monthlyHeatingBill,
          projectedPenalty: cumulativePenalty
        }
      });
    }
  };
  window.updateWizardSpend = window.onWizardSliderChange;
  window.setFuel = window.setWizardFuel;

  // Live Micro-Cent Penalty Ticker (The Shock)
  function startLivePenaltyTicker() {
    if (penaltyInterval) clearInterval(penaltyInterval);
    let subCents = 0;
    penaltyInterval = setInterval(() => {
      if (isShieldDeployed) {
        clearInterval(penaltyInterval);
        return;
      }
      subCents += 0.03;
      const penaltyDisp = document.getElementById('lbl-wizard-penalty-clock');
      if (penaltyDisp) {
        const total = (cumulativePenalty + subCents).toFixed(2);
        penaltyDisp.innerText = `€${Number(total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    }, 120);
  }

  // Deploy Carbon Tax Shield (The Rescue)
  window.deployCarbonShield = function() {
    if (typeof triggerHaptic === 'function') triggerHaptic(25);
    isShieldDeployed = true;
    if (penaltyInterval) clearInterval(penaltyInterval);

    const clockContainer = document.querySelector('.penalty-clock-container');
    const penaltyDisp = document.getElementById('lbl-wizard-penalty-clock');
    const deployBtn = document.getElementById('btn-wizard-deploy-shield');
    const rescueContainer = document.getElementById('shield-deployed-container');

    // Shatter Clock Transition
    if (clockContainer) {
      clockContainer.style.borderColor = '#34f5c5';
      clockContainer.style.boxShadow = '0 0 40px rgba(52, 245, 197, 0.6)';
      clockContainer.style.background = 'rgba(0, 36, 27, 0.95)';
    }

    if (penaltyDisp) {
      penaltyDisp.style.color = '#34f5c5';
      penaltyDisp.style.textShadow = '0 0 25px rgba(52, 245, 197, 0.8)';
      // Countdown to 0
      let countdown = cumulativePenalty;
      const step = Math.ceil(cumulativePenalty / 20);
      const timer = setInterval(() => {
        countdown -= step;
        if (countdown <= 0) {
          countdown = 0;
          clearInterval(timer);
          penaltyDisp.innerText = '€0.00 (TAX PENALTY WIPED OUT)';
          if (deployBtn) deployBtn.style.display = 'none';
          if (rescueContainer) {
            rescueContainer.style.display = 'block';
            setTimeout(() => {
              rescueContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 80);
          }
          if (window.ESH_OS && typeof window.ESH_OS.setState === 'function') {
            window.ESH_OS.setState({
              energy: {
                shieldActive: true,
                projectedPenalty: 0
              }
            });
          }
        } else {
          penaltyDisp.innerText = `€${countdown.toLocaleString()}.00`;
        }
      }, 25);
    }
  };

  // Bootstrap live penalty calculations and ticker
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      updatePenaltyCalculations();
      startLivePenaltyTicker();
    });
  } else {
    updatePenaltyCalculations();
    startLivePenaltyTicker();
  }

  // ==========================================================================
  // 3-STEP ESTATE AGENT COMMISSION-BOOSTER & VENDOR OBJECTION SHIELD ENGINE
  // ==========================================================================
  let agentCurrentBER = 'D';
  let agentPropertyVal = 350000;
  let agentStep2Mode = 'equity'; // 'equity' | 'defense'

  // Official Simplified 8-Category Scale Multipliers (Equity Surge)
  const BER_SURGE_MULTIPLIERS = {
    G: 0.108,
    F: 0.095,
    E: 0.082,
    D: 0.070,
    C: 0.048,
    B: 0.025,
    A: 0.012,
    A0: 0.005
  };

  // Vendor Objection Shield Calibration Tables (2026 SEAI OSS & Irish Market Reality)
  const BER_BUYER_CLAIMED_COST = {
    G: 48000,
    F: 44000,
    E: 38000,
    D: 32000,
    C: 22000,
    B: 12000,
    A: 0,
    A0: 0
  };

  const BER_SEAI_GRANT_OFFSET = {
    G: 35000,
    F: 33000,
    E: 32000,
    D: 31500,
    C: 26000,
    B: 14000,
    A: 0,
    A0: 0
  };

  const BER_ANNUAL_ENERGY_SAVINGS = {
    G: 2850,
    F: 2500,
    E: 2150,
    D: 1850,
    C: 1200,
    B: 550,
    A: 0,
    A0: 0
  };

  window.setAgentStep2Mode = function(mode) {
    agentStep2Mode = mode;
    const btnEquity = document.getElementById('btnAgentModeEquity');
    const btnDefense = document.getElementById('btnAgentModeDefense');
    const containerEquity = document.getElementById('agentEquityContainer');
    const containerDefense = document.getElementById('agentDefenseContainer');

    if (btnEquity && btnDefense) {
      btnEquity.classList.toggle('active', mode === 'equity');
      btnEquity.setAttribute('aria-selected', mode === 'equity' ? 'true' : 'false');
      btnDefense.classList.toggle('active', mode === 'defense');
      btnDefense.setAttribute('aria-selected', mode === 'defense' ? 'true' : 'false');
    }

    if (containerEquity) containerEquity.style.display = mode === 'equity' ? 'block' : 'none';
    if (containerDefense) containerDefense.style.display = mode === 'defense' ? 'block' : 'none';

    if (mode === 'defense') {
      updateAgentDefenseCalculations();
    } else {
      updateAgentSurgeCalculations();
    }
  };

  function updateAgentDefenseCalculations() {
    const claimedCost = BER_BUYER_CLAIMED_COST[agentCurrentBER] ?? 32000;
    const grantOffset = BER_SEAI_GRANT_OFFSET[agentCurrentBER] ?? 31500;
    const netOutlay = Math.max(0, claimedCost - grantOffset);

    // 25-Year Green Mortgage Calculation (3.45% Green APR vs 4.75% Standard Variable on 80% LTV)
    const loan = agentPropertyVal * 0.8;
    const r_std = 0.0475 / 12;
    const r_grn = 0.0345 / 12;
    const m_std = loan * (r_std * Math.pow(1 + r_std, 300)) / (Math.pow(1 + r_std, 300) - 1);
    const m_grn = loan * (r_grn * Math.pow(1 + r_grn, 300)) / (Math.pow(1 + r_grn, 300) - 1);
    const monthlyDiff = Math.max(0, m_std - m_grn);

    let mortgageSavings = 0;
    if (['G', 'F', 'E', 'D', 'C'].includes(agentCurrentBER)) {
      mortgageSavings = Math.round(monthlyDiff * 300);
    } else if (agentCurrentBER === 'B') {
      mortgageSavings = Math.round(monthlyDiff * 300 * 0.4);
    }

    const annualFuelSave = BER_ANNUAL_ENERGY_SAVINGS[agentCurrentBER] || 0;
    const fuelSavings25Yr = annualFuelSave * 25;
    const totalBuyerSurplus = Math.max(0, (grantOffset + mortgageSavings + fuelSavings25Yr) - claimedCost);

    // Update DOM Readouts
    const elBuyerClaim = document.getElementById('defenseBuyerClaimVal');
    const elBuyerClaimSub = document.getElementById('defenseBuyerClaimSub');
    const elGrant = document.getElementById('defenseGrantVal');
    const elNetOutlay = document.getElementById('defenseNetOutlayVal');
    const elMortgageSlash = document.getElementById('defenseMortgageSlashVal');
    const elNetSurplus = document.getElementById('defenseNetSurplusVal');
    const elVerdict = document.getElementById('defenseVerdictText');

    if (elBuyerClaim) elBuyerClaim.innerText = claimedCost > 0 ? `-€${claimedCost.toLocaleString()}` : '€0';
    if (elBuyerClaimSub) elBuyerClaimSub.innerText = claimedCost > 0 ? `Buyer low-ball discount (BER ${agentCurrentBER})` : `No upgrade works needed (BER ${agentCurrentBER})`;
    if (elGrant) elGrant.innerText = grantOffset > 0 ? `+€${grantOffset.toLocaleString()}` : '€0';
    if (elNetOutlay) elNetOutlay.innerText = `€${netOutlay.toLocaleString()}`;
    if (elMortgageSlash) elMortgageSlash.innerText = mortgageSavings > 0 ? `+€${mortgageSavings.toLocaleString()}` : '€0 (Already Eligible)';
    if (elNetSurplus) elNetSurplus.innerText = `+€${totalBuyerSurplus.toLocaleString()} Total Buyer Surplus`;

    if (elVerdict) {
      if (['G', 'F', 'E', 'D', 'C'].includes(agentCurrentBER)) {
        elVerdict.innerText = `The purchaser's claim of a €${claimedCost.toLocaleString()} renovation penalty is mathematically disproven. With up to €${grantOffset.toLocaleString()} in statutory SEAI One-Stop-Shop grants and €${mortgageSavings.toLocaleString()} in Green Mortgage interest savings, the purchaser gains an enormous net surplus of +€${totalBuyerSurplus.toLocaleString()}. Zero price concession is warranted.`;
      } else if (agentCurrentBER === 'B') {
        elVerdict.innerText = `Property operates at high B-Rating efficiency. Minor heat pump or PV optimization unlocks A-Class status with €${grantOffset.toLocaleString()} in grants completely wiping out the €${claimedCost.toLocaleString()} outlay. Full asking price is 100% fortified.`;
      } else {
        elVerdict.innerText = `Elite A-Class Asset (BER ${agentCurrentBER}). Zero retrofit liability exists. The purchaser qualifies immediately for 3.45% Green Mortgage financing without spending a single euro on capital works. Full asking price stands.`;
      }
    }
  }

  // ==========================================================================
  // MULTI-FORMAT LISTING PACK GENERATOR (DAFT, WINDOW, VENDOR PITCH)
  // ==========================================================================
  let agentListingFormat = 'daft'; // 'daft' | 'window' | 'pitch'

  function generateDaftListingCopy(ber, equitySurge, propertyVal) {
    const surgeFormatted = equitySurge.toLocaleString();
    const valFormatted = propertyVal.toLocaleString();
    const grantCap = BER_SEAI_GRANT_OFFSET[ber] || 35000;

    if (['D', 'E', 'F', 'G'].includes(ber)) {
      // Category 1: The "High-Potential Fixer"
      return `🏡 Prime Energy & Retrofitting Potential – Capital Appreciation Opportunity\n\nFor the forward-thinking buyer, this property represents an exceptional opportunity to significantly increase both its energy efficiency and market value, backed by substantial state funding.\n\nA preliminary independent diagnostic assessment via EcoSmartHomes indicates that upgrading this property from its current BER ${ber} rating to a highly efficient A-Rating can unlock an estimated +€${surgeFormatted} in immediate capital equity.\n\n• Grant Funding Available: Up to €${grantCap.toLocaleString()} in direct, non-means-tested SEAI cash grants are fully accessible for this specific property archetype to cover heat pump installation, solar PV integration, and advanced insulation upgrades.\n• Purchasing Advantage: Achieving an A-Class rating instantly qualifies this property for a premium Green Mortgage rate (currently averaging 3.45%), potentially saving the incoming buyer over €200 per month in mortgage interest repayments.\n• Independent Verification: A complete independent engineering validation pack and retrofitting roadmap are available upon request to serious bidders to streamline your mortgage approval process.`;
    } else if (['B', 'C'].includes(ber)) {
      // Category 2: The "Mid-Tier Optimizer"
      return `🏡 A-Rated Green Mortgage Potential & Energy Optimization\n\nMaintained to an excellent standard, this modern home currently holds a comfortable BER ${ber} rating. However, it sits right on the threshold of maximum efficiency, offering a seamless path to complete carbon protection.\n\n• The Green Premium: Minor, targeted upgrades via available SEAI grants (up to €${grantCap.toLocaleString()}) can comfortably push this home into the coveted A-Rated bracket. This transition instantly qualifies the property for discounted Green Mortgage financing (3.45%), significantly increasing its appeal and affordability to top-tier buyers.\n• Shield Against Rising Costs: Fully optimizing the thermal envelope will drop annual space heating and hot water costs down to a projected €650 a year, acting as a permanent shield against future Irish fuel tax escalators.\n• Next Steps for Bidders: The vendors have sub-contracted an independent engineering pre-survey through EcoSmartHomes. Bidders can access the complete NSAI low-flow radiator compatibility matrix and tailored grant application framework directly from the selling agent.`;
    } else {
      // Category 3: The "Gold Standard" (A, A0)
      return `🏡 Elite A-Class Energy Rating & Low-Carbon Luxury\n\nThis property represents the absolute pinnacle of sustainable Irish housing, boasting an exceptional BER ${ber} rating.\n\n• Maximum Mortgage Discount: This elite rating guarantees immediate access to the lowest 3.45% Green Mortgage interest rates on the Irish market, drastically reducing long-term borrowing costs for the successful purchaser.\n• Absolute Carbon Shielding: Built with advanced thermal envelope technology, this home operates at maximum efficiency with heating bills slashed to an estimated €650 per annum, completely immune to compounding carbon tax penalties.\n• Verified Engineering: Full SEAI compliance documentation and NSAI SR50-2 verification certs on file with the selling agent.`;
    }
  }

  function generateWindowDisplayCopy(ber, equitySurge, propertyVal) {
    const surgeFormatted = equitySurge.toLocaleString();
    const valFormatted = propertyVal.toLocaleString();
    const grantCap = BER_SEAI_GRANT_OFFSET[ber] || 35000;

    if (['A', 'A0'].includes(ber)) {
      return `“ELITE A-CLASS ENERGY HOMES · INSTANT 3.45% GREEN MORTGAGE”\n\nAsking: €${valFormatted} · Certified BER ${ber}\n• Zero Retrofit Liability: Immaculate thermal envelope with projected annual heating under €650.\n• Financing Advantage: Qualifies purchasers immediately for Ireland’s lowest 3.45% Green Mortgage rates.\n• Full Independent Compliance Dossier & NSAI SR50-2 Verification Certs Available From This Office.`;
    } else if (['B', 'C'].includes(ber)) {
      return `“PRE-QUALIFIED FOR IRELAND'S 3.45% GREEN MORTGAGE”\n\nAsking: €${valFormatted} · Current BER ${ber} (A-Rating Ready)\n• State Funding Accessible: Pre-assessed for up to €${grantCap.toLocaleString()} in direct SEAI grant support.\n• Capital Growth Upside: Unlocks an estimated +€${surgeFormatted} in equity uplift post-upgrade.\n• Full Independent Engineering Roadmap & Radiator Sizing Dossier Available From This Office.`;
    } else {
      return `“UNLOCK IRELAND’S LOWEST 3.45% GREEN MORTGAGE”\n\nAsking: €${valFormatted} · Current BER ${ber} (Target: A0)\n• Up to €${grantCap.toLocaleString()} in Direct SEAI One-Stop-Shop Grants Deducted at Source.\n• Adds +€${surgeFormatted} Estimated Capital Equity Surge Upon Transition to A-Class.\n• Full Independent Engineering Grant Pack & Specification Available From This Office.`;
    }
  }

  function generateVendorPitchCopy(ber, equitySurge, propertyVal) {
    const surgeFormatted = equitySurge.toLocaleString();
    const valFormatted = propertyVal.toLocaleString();
    const grantCap = BER_SEAI_GRANT_OFFSET[ber] || 35000;

    if (['A', 'A0'].includes(ber)) {
      return `“Mr. & Mrs. Vendor, your home represents the top 5% of energy assets in Ireland. While other estate agents will list this as just another property, our agency actively markets it as a certified net-zero asset with immediate access to 3.45% Green Mortgage financing and zero retrofit liability.\n\nWe target rate-conscious buyers and downsizers willing to pay a verified premium for guaranteed low running costs. That is how we defend and maximize your €${valFormatted} asking price.”`;
    } else if (['B', 'C'].includes(ber)) {
      return `“Mr. & Mrs. Vendor, your home is in prime condition. At BER ${ber}, it sits right on the edge of the highest green tier. Other agents will let buyers negotiate without context; our agency equips buyers with an independent roadmap showing how up to €${grantCap.toLocaleString()} in SEAI grants bridges them to an A-Rating and unlocks 3.45% Green Mortgage rates.\n\nWe turn your energy rating into a competitive bidding catalyst, unlocking up to +€${surgeFormatted} in equity rather than accepting discounts.”`;
    } else {
      return `“Mr. & Mrs. Vendor, here is exactly how our agency will protect your €${valFormatted} asking price:\n\nMost agents simply put a sign in your lawn and upload photos. When buyers view a BER ${ber} home, their standard tactic is to chip €30,000 to €45,000 off their offer claiming 'renovation costs'.\n\nUnlike other agencies, we provide an Independent Engineering Grant Roadmap powered by EcoSmartHomes. We prove to bidders that up to €${grantCap.toLocaleString()} in statutory SEAI One-Stop-Shop grants is deducted at source, and upgrading unlocks over €60,000 in 25-year Green Mortgage savings. We insulate your asking price with mathematics, proving a +€${surgeFormatted} equity gain. That is why instructed vendors choose our agency.”`;
    }
  }

  function updateAgentListingPack() {
    const surgePct = BER_SURGE_MULTIPLIERS[agentCurrentBER] || 0.070;
    const equitySurge = Math.round(agentPropertyVal * surgePct);
    const container = document.getElementById('agentPackContentBox');
    const daftText = generateDaftListingCopy(agentCurrentBER, equitySurge, agentPropertyVal);
    const windowText = generateWindowDisplayCopy(agentCurrentBER, equitySurge, agentPropertyVal);
    const pitchText = generateVendorPitchCopy(agentCurrentBER, equitySurge, agentPropertyVal);
    const grantCap = BER_SEAI_GRANT_OFFSET[agentCurrentBER] || 35000;

    if (!container) return;

    if (agentListingFormat === 'window') {
      container.className = 'agent-pack-content-box format-window';
      container.innerHTML = `
        <div class="window-card-display">
          <div class="window-headline-main">“UNLOCK IRELAND’S LOWEST 3.45% GREEN MORTGAGE”</div>
          <div class="window-headline-sub">Pre-Assessed for Up to €${grantCap.toLocaleString()} in Direct SEAI Grants</div>
          <div class="window-badge-bar">
            <span class="window-badge-pill">📍 Certified Listing</span>
            <span class="window-badge-pill">€${agentPropertyVal.toLocaleString()} Asking</span>
            <span class="window-badge-pill">BER ${agentCurrentBER} ➔ A0 Target</span>
            <span class="window-badge-pill" style="color: #f59e0b; border-color: rgba(245, 158, 11, 0.4);">+€${equitySurge.toLocaleString()} Equity Upside</span>
          </div>
          <div style="font-size: 0.76rem; color: #94a3b8; margin-top: 8px;">
            Full Independent Engineering Roadmap &amp; Grant Breakdown Available From This Office
          </div>
        </div>
        <p id="lbl-daft-blurb-text" style="display: none;">${daftText}</p>
      `;
    } else if (agentListingFormat === 'pitch') {
      container.className = 'agent-pack-content-box format-pitch';
      container.innerHTML = `
        <div style="font-size: 0.74rem; font-weight: 800; color: #fbbf24; font-family: 'IBM Plex Mono', monospace; text-transform: uppercase; margin-bottom: 6px;">
          🤝 Sole-Agency Kitchen Table Script (Win the Instruction)
        </div>
        <p style="margin: 0; font-style: italic; color: #fef08a; line-height: 1.55;">
          ${pitchText.replace(/\n\n/g, '<br><br>')}
        </p>
        <p id="lbl-daft-blurb-text" style="display: none;">${daftText}</p>
      `;
    } else {
      container.className = 'agent-pack-content-box';
      container.innerHTML = `
        <p id="lbl-daft-blurb-text" style="margin: 0; white-space: pre-line;">
          ${daftText}
        </p>
      `;
    }
  }

  window.setAgentListingFormat = function(format) {
    agentListingFormat = format;
    const btnDaft = document.getElementById('btnAgentPackDaft');
    const btnWindow = document.getElementById('btnAgentPackWindow');
    const btnPitch = document.getElementById('btnAgentPackPitch');
    const copyBtnLabel = document.getElementById('lbl-agent-pack-copy-btn');

    if (btnDaft) {
      btnDaft.classList.toggle('active', format === 'daft');
      btnDaft.setAttribute('aria-selected', format === 'daft' ? 'true' : 'false');
    }
    if (btnWindow) {
      btnWindow.classList.toggle('active', format === 'window');
      btnWindow.setAttribute('aria-selected', format === 'window' ? 'true' : 'false');
    }
    if (btnPitch) {
      btnPitch.classList.toggle('active', format === 'pitch');
      btnPitch.setAttribute('aria-selected', format === 'pitch' ? 'true' : 'false');
    }

    if (copyBtnLabel) {
      if (format === 'window') {
        copyBtnLabel.innerText = '🪟 Copy High-Street Window Display Teaser';
      } else if (format === 'pitch') {
        copyBtnLabel.innerText = '🤝 Copy Kitchen-Table Vendor Pitch Script';
      } else {
        copyBtnLabel.innerText = '📋 Copy Green Bulletpoints for Daft.ie Listing';
      }
    }

    updateAgentListingPack();
  };

  function updateAgentSurgeCalculations() {
    const surgePct = BER_SURGE_MULTIPLIERS[agentCurrentBER] || 0.070;
    const equitySurge = Math.round(agentPropertyVal * surgePct);
    const postVal = agentPropertyVal + equitySurge;
    const extraCommission = Math.round(equitySurge * 0.015); // Standard 1.5% agent fee

    // Update Digital Display
    const surgeDisp = document.getElementById('lbl-agent-equity-surge');
    if (surgeDisp) surgeDisp.innerText = `+€${equitySurge.toLocaleString()}`;

    const subDisp = document.getElementById('lbl-agent-surge-sub');
    if (subDisp) {
      if (['A', 'A0'].includes(agentCurrentBER)) {
        subDisp.innerHTML = `Pinnacle Energy Standard: <strong>€${postVal.toLocaleString()}</strong> · Eligible for lowest <strong>3.45% Green Mortgages</strong>`;
      } else {
        subDisp.innerHTML = `Post-Retrofit Value: <strong>€${postVal.toLocaleString()}</strong> · Adds <strong>+€${extraCommission}</strong> to sales commission`;
      }
    }

    const priceDisp = document.getElementById('lbl-agent-price-val');
    if (priceDisp) priceDisp.innerText = `€${agentPropertyVal.toLocaleString()}`;

    // Update Multi-Format Listing Pack
    updateAgentListingPack();
  }

  window.setAgentBER = function(ber) {
    agentCurrentBER = ber;
    document.querySelectorAll('.agent-ber-pill').forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-ber') === ber);
    });
    updateAgentSurgeCalculations();
    updateAgentDefenseCalculations();
    if (typeof updateBorrowingBoosterCalculations === 'function') updateBorrowingBoosterCalculations();
  };

  window.onAgentPriceSliderChange = function(val) {
    agentPropertyVal = Number(val);
    updateAgentSurgeCalculations();
    updateAgentDefenseCalculations();
  };

  window.onAgentPriceChange = function(priceVal) {
    agentPropertyVal = Number(priceVal);
    updateAgentSurgeCalculations();
    updateAgentDefenseCalculations();
  };

  window.setAgentPricePreset = function(val) {
    agentPropertyVal = Number(val);
    const slider = document.getElementById('agent-price-slider') || document.getElementById('agent-price-range');
    if (slider) slider.value = val;
    updateAgentSurgeCalculations();
    updateAgentDefenseCalculations();
  };

  window.copyAgentDefenseWhatsApp = function() {
    window.requireFreemiumPass(() => {
      const claimedCost = BER_BUYER_CLAIMED_COST[agentCurrentBER] ?? 32000;
      const grantOffset = BER_SEAI_GRANT_OFFSET[agentCurrentBER] ?? 31500;
      const netOutlay = Math.max(0, claimedCost - grantOffset);

      const loan = agentPropertyVal * 0.8;
      const r_std = 0.0475 / 12;
      const r_grn = 0.0345 / 12;
      const m_std = loan * (r_std * Math.pow(1 + r_std, 300)) / (Math.pow(1 + r_std, 300) - 1);
      const m_grn = loan * (r_grn * Math.pow(1 + r_grn, 300)) / (Math.pow(1 + r_grn, 300) - 1);
      const monthlyDiff = Math.max(0, m_std - m_grn);
      const monthlySave = Math.round(monthlyDiff);
      const mortgageSavings = ['G', 'F', 'E', 'D', 'C'].includes(agentCurrentBER) ? Math.round(monthlyDiff * 300) : (agentCurrentBER === 'B' ? Math.round(monthlyDiff * 300 * 0.4) : 0);
      const fuelSavings = (BER_ANNUAL_ENERGY_SAVINGS[agentCurrentBER] || 0) * 25;
      const totalSurplus = Math.max(0, (grantOffset + mortgageSavings + fuelSavings) - claimedCost);

      let text = '';
      if (['G', 'F', 'E', 'D', 'C', 'B'].includes(agentCurrentBER)) {
        text = `Hi [Buyer Name],\n\nRegarding your offer and mention of a €${claimedCost.toLocaleString()} deduction for BER upgrade works on the property:\n\nWe have run this property archetype through our certified EcoSmartHomes engineering diagnostic:\n\n1️⃣ Direct SEAI Grant: Up to €${grantOffset.toLocaleString()} is deducted upfront at source via the One-Stop-Shop scheme.\n2️⃣ True Net Outlay: Your actual capital exposure is only ~€${netOutlay.toLocaleString()}.\n3️⃣ Green Mortgage Rate: Upgrading to an A-rating unlocks 3.45% Green Mortgage APR, saving ~€${monthlySave}/month (€${mortgageSavings.toLocaleString()} over 25-yr loan term).\n4️⃣ Net Financial Impact: You will achieve a verified +€${totalSurplus.toLocaleString()} lifetime surplus.\n\nBecause the statutory grant structure and green mortgage benefits fully absorb and exceed these upgrade costs, the vendor cannot accept a price-chipping discount. Full asking price of €${agentPropertyVal.toLocaleString()} stands.\n\nHappy to share the full EcoSmartHomes independent validation cert upon request.`;
      } else {
        text = `Hi [Buyer Name],\n\nRegarding your offer on the property:\n\nThis home holds an elite BER ${agentCurrentBER} rating, which carries zero retrofit liability. It qualifies you immediately for 3.45% Green Mortgage rates without any capital expenditure. The full asking price of €${agentPropertyVal.toLocaleString()} is verified by independent engineering certs.\n\nBest regards,`;
      }

      window.copyTextToClipboard(text, 'WhatsApp Defense Script Copied!');
      const btn = document.getElementById('btnAgentWhatsappRebuttal');
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '<span>✅ WhatsApp Script Copied! Ready to Send</span>';
        btn.style.background = '#059669';
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.style.background = '';
        }, 2500);
      }
    });
  };

  window.copyAgentListingPack = function() {
    window.requireFreemiumPass(() => {
      const surgePct = BER_SURGE_MULTIPLIERS[agentCurrentBER] || 0.070;
      const equitySurge = Math.round(agentPropertyVal * surgePct);

      let textToCopy = '';
      let successMsg = '';
      let btnSuccessText = '';

      if (agentListingFormat === 'window') {
        textToCopy = generateWindowDisplayCopy(agentCurrentBER, equitySurge, agentPropertyVal);
        successMsg = 'Copied Window Display Teaser Card to Clipboard!';
        btnSuccessText = '✅ Copied Window Display Teaser!';
      } else if (agentListingFormat === 'pitch') {
        textToCopy = generateVendorPitchCopy(agentCurrentBER, equitySurge, agentPropertyVal);
        successMsg = 'Copied Kitchen-Table Vendor Pitch Script!';
        btnSuccessText = '✅ Copied Vendor Pitch Script!';
      } else {
        textToCopy = generateDaftListingCopy(agentCurrentBER, equitySurge, agentPropertyVal);
        successMsg = 'Copied Daft.ie Listing Blurb to Clipboard!';
        btnSuccessText = '✅ Copied to Clipboard! Ready for Daft.ie';
      }

      window.copyTextToClipboard(textToCopy, successMsg);
      const btn = document.getElementById('btn-copy-daft-action');
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = `<span>${btnSuccessText}</span>`;
        btn.style.background = '#10b981';
        btn.style.color = '#001711';
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.style.background = '';
          btn.style.color = '';
        }, 2400);
      }
    });
  };

  // Backwards-compatible alias
  window.copyDaftListingBlurb = window.copyAgentListingPack;

  // ==========================================================================
  // IDEA 3: BUYER BORROWING POWER BOOSTER (THE MORTGAGE CEILING EXPANDER)
  // ==========================================================================
  let buyerHouseholdIncome = 85000;

  function updateBorrowingBoosterCalculations() {
    // Central Bank of Ireland 4x gross income limit
    const baseLimit = buyerHouseholdIncome * 4;

    // Monthly loan repayments on 25-yr term (300 months)
    const r_std = 0.0475 / 12; // 4.75% standard variable
    const r_grn = 0.0345 / 12; // 3.45% green fixed
    const m_std = baseLimit * (r_std * Math.pow(1 + r_std, 300)) / (Math.pow(1 + r_std, 300) - 1);
    const m_grn = baseLimit * (r_grn * Math.pow(1 + r_grn, 300)) / (Math.pow(1 + r_grn, 300) - 1);
    const mortgageMonthlySave = Math.max(0, Math.round(m_std - m_grn));

    // Energy savings based on current BER rating (G to A0 saves ~€275/mo, D to A0 saves ~€215/mo, B saves ~€80/mo)
    const annualFuelSave = BER_ANNUAL_ENERGY_SAVINGS[agentCurrentBER] || 2580;
    const monthlyFuelSave = Math.round(annualFuelSave / 12);

    // Total monthly disposable surplus
    const totalMonthlySurplus = mortgageMonthlySave + monthlyFuelSave;

    // Capitalized borrowing capacity supported by monthly surplus under stress-test debt-service ratios
    // Supported by Central Bank green exception guidelines (up to +12.5% to +15% borrowing ceiling)
    const borrowingBoost = Math.round((baseLimit * 0.125) / 500) * 500;
    const expandedLimit = baseLimit + borrowingBoost;

    // Dynamic pool uplift
    const poolUplift = Math.min(28, Math.max(16, Math.round(18 + (borrowingBoost / baseLimit) * 35)));

    // DOM updates
    const lblIncome = document.getElementById('lbl-booster-income-val');
    if (lblIncome) lblIncome.innerText = `€${buyerHouseholdIncome.toLocaleString()} / yr`;

    const slider = document.getElementById('booster-income-slider');
    if (slider) slider.value = buyerHouseholdIncome;

    const lblBase = document.getElementById('lbl-booster-base-limit');
    if (lblBase) lblBase.innerText = `€${baseLimit.toLocaleString()}`;

    const lblMonthly = document.getElementById('lbl-booster-monthly-surplus');
    if (lblMonthly) lblMonthly.innerText = `+€${totalMonthlySurplus.toLocaleString()} / mo`;

    const lblEnergySub = document.getElementById('lbl-booster-energy-sub');
    if (lblEnergySub) lblEnergySub.innerText = `Includes €${monthlyFuelSave}/mo Fuel Slash + €${mortgageMonthlySave}/mo Green Rate`;

    const lblExpanded = document.getElementById('lbl-booster-expanded-limit');
    if (lblExpanded) lblExpanded.innerText = `€${expandedLimit.toLocaleString()}`;

    const lblNetUplift = document.getElementById('lbl-booster-net-uplift');
    if (lblNetUplift) lblNetUplift.innerText = `+€${borrowingBoost.toLocaleString()} Buying Power`;

    const lblPool = document.getElementById('lbl-booster-pool-uplift');
    if (lblPool) lblPool.innerText = `🔥 +${poolUplift}% Qualified Buyer Pool`;

    const lblVerdict = document.getElementById('lbl-booster-verdict-text');
    if (lblVerdict) {
      lblVerdict.innerHTML = `With a joint household income of <strong>€${buyerHouseholdIncome.toLocaleString()}</strong>, Central Bank rules normally restrict borrowing to <strong>€${baseLimit.toLocaleString()}</strong>. However, qualifying this home for a <strong>3.45% Green Mortgage</strong> delivers <strong>€${mortgageMonthlySave}/mo</strong> in bank interest savings, coupled with <strong>€${monthlyFuelSave}/mo</strong> in displaced energy costs (net <strong>+€${totalMonthlySurplus.toLocaleString()}/mo</strong> cash buffer). Under mortgage broker debt-service criteria, this surplus qualifies the buyer for up to <strong>+€${borrowingBoost.toLocaleString()} in extra borrowing headroom</strong>, expanding purchasing ceiling to <strong>€${expandedLimit.toLocaleString()}</strong>.`;
    }
  }

  window.onBuyerIncomeSliderChange = function(val) {
    buyerHouseholdIncome = Number(val);
    document.querySelectorAll('.agent-booster-preset-btn').forEach(btn => btn.classList.remove('active'));
    updateBorrowingBoosterCalculations();
  };

  window.setBuyerIncomePreset = function(val) {
    buyerHouseholdIncome = Number(val);
    document.querySelectorAll('.agent-booster-preset-btn').forEach(btn => {
      btn.classList.toggle('active', btn.textContent.includes(Math.round(val / 1000) + 'k'));
    });
    updateBorrowingBoosterCalculations();
  };

  window.openAgentBorrowingBooster = function() {
    const drawer = document.getElementById('agent-secondary-drawer');
    const trigger = document.querySelector('[data-drawer-target="agent-secondary-drawer"]');
    if (drawer && drawer.style.display === 'none') {
      drawer.style.display = 'block';
      if (trigger) {
        trigger.setAttribute('aria-expanded', 'true');
        const caret = trigger.querySelector('.portal-drawer-caret');
        if (caret) caret.textContent = '▴';
      }
    }
    const card = document.getElementById('agentBorrowingBoosterCard');
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.style.boxShadow = '0 0 40px rgba(56, 189, 248, 0.6)';
      setTimeout(() => {
        card.style.boxShadow = '';
      }, 1500);
    }
  };

  window.copyBorrowingBoosterPitch = function() {
    window.requireFreemiumPass(() => {
      const baseLimit = buyerHouseholdIncome * 4;
      const borrowingBoost = Math.round((baseLimit * 0.125) / 500) * 500;
      const expandedLimit = baseLimit + borrowingBoost;
      const annualFuelSave = BER_ANNUAL_ENERGY_SAVINGS[agentCurrentBER] || 2580;
      const monthlyFuelSave = Math.round(annualFuelSave / 12);
      const r_std = 0.0475 / 12;
      const r_grn = 0.0345 / 12;
      const m_std = baseLimit * (r_std * Math.pow(1 + r_std, 300)) / (Math.pow(1 + r_std, 300) - 1);
      const m_grn = baseLimit * (r_grn * Math.pow(1 + r_grn, 300)) / (Math.pow(1 + r_grn, 300) - 1);
      const mortgageMonthlySave = Math.max(0, Math.round(m_std - m_grn));
      const totalMonthlySurplus = mortgageMonthlySave + monthlyFuelSave;

      const pitchText = `Hi [Broker / Buyer Name],\n\nRegarding the mortgage assessment for this property:\n\nUnder standard 4x Central Bank limits on a €${buyerHouseholdIncome.toLocaleString()} gross income, the base borrowing cap is €${baseLimit.toLocaleString()}.\n\nHowever, because this home is verified for an EcoSmartHomes A-Rating upgrade roadmap:\n\n1️⃣ Green Mortgage Qualification: Unlocks Ireland's lowest 3.45% Green Mortgage APR (saving €${mortgageMonthlySave}/month vs 4.75% standard variable).\n2️⃣ Displaced Energy Running Costs: Advanced fabric and heat pump sizing eliminates €${monthlyFuelSave}/month in fossil fuel bills.\n3️⃣ Net Monthly Underwriter Surplus: +€${totalMonthlySurplus.toLocaleString()}/month in certified disposable cashflow.\n4️⃣ Expanded Borrowing Capacity: Under lender debt-service ratio stress-testing, this surplus safely justifies an expanded borrowing ceiling of €${expandedLimit.toLocaleString()} (+€${borrowingBoost.toLocaleString()} additional purchasing power).\n\nFull independent engineering validation cert and SEAI grant breakdown can be supplied directly to your underwriter to expedite loan approval at this revised figure.\n\nBest regards,\n[Listing Agent]`;

      window.copyTextToClipboard(pitchText, 'Broker & Buyer Borrowing Booster Script Copied!');
      const btn = document.getElementById('btnAgentBoosterCopy');
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '<span>✅ Borrowing Script Copied! Ready to Send</span>';
        btn.style.background = '#10b981';
        btn.style.color = '#001711';
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.style.background = '';
          btn.style.color = '';
        }, 2500);
      }
    });
  };

  // Bootstrap initial Agent calculations
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      updateAgentSurgeCalculations();
      updateAgentDefenseCalculations();
      updateBorrowingBoosterCalculations();
    });
  } else {
    updateAgentSurgeCalculations();
    updateAgentDefenseCalculations();
    updateBorrowingBoosterCalculations();
  }

  // ==========================================================================
  // 3-STEP INSTALLER "VAN-TO-VERDICT" ENGINE
  // ==========================================================================
  let installerArchetype = 'semi';

  const ARCHETYPE_ROOM_SCHEDULES = {
    semi: {
      name: '3-Bed Semi-Detached (115m²)',
      hpCapacity: '8.5 kW Monobloc Heat Pump',
      heatLoss: '7.8 kW @ -3°C',
      rooms: [
        { name: 'Living Room (26m²)', req: 2100, exist: 2350, status: 'ok', rec: 'Existing rad delivers required wattage at 50°C flow.' },
        { name: 'Master Bedroom (18m²)', req: 1250, exist: 850, status: 'warn', rec: 'Upgrade to Type 22 Double Convector 1200x600 (+400W needed).' },
        { name: 'Kitchen / Dining (22m²)', req: 1750, exist: 1900, status: 'ok', rec: 'Compliant with NSAI SR50-2 low-flow benchmark.' },
        { name: 'Bedroom 2 / Office (14m²)', req: 950, exist: 650, status: 'warn', rec: 'Upgrade to Type 21 Compact Convector (+300W needed).' }
      ]
    },
    detached: {
      name: '4-Bed Detached (175m²)',
      hpCapacity: '12.0 kW Monobloc Heat Pump',
      heatLoss: '11.4 kW @ -3°C',
      rooms: [
        { name: 'Living Room (34m²)', req: 2800, exist: 2950, status: 'ok', rec: 'Existing radiator capacity compliant.' },
        { name: 'Master Suite (24m²)', req: 1650, exist: 1200, status: 'warn', rec: 'Upgrade to Type 22 1400x600 (+450W needed).' },
        { name: 'Kitchen / Family (32m²)', req: 2400, exist: 2600, status: 'ok', rec: 'Meets Delta-T 30 output requirement.' },
        { name: 'Bedrooms 2 & 3 (28m²)', req: 1900, exist: 1400, status: 'warn', rec: 'Replace 2x single panels with Type 21 convectors.' }
      ]
    },
    bungalow: {
      name: '3-Bed Bungalow (130m²)',
      hpCapacity: '9.5 kW Monobloc Heat Pump',
      heatLoss: '9.1 kW @ -3°C',
      rooms: [
        { name: 'Lounge (28m²)', req: 2300, exist: 2450, status: 'ok', rec: 'Compliant low-flow heat output.' },
        { name: 'Master Bed (20m²)', req: 1400, exist: 1050, status: 'warn', rec: 'Type 22 upgrade recommended (+350W).' },
        { name: 'Kitchen / Dining (26m²)', req: 2100, exist: 2200, status: 'ok', rec: 'Flow rate adequate at 48°C.' },
        { name: 'Rear Bedroom (16m²)', req: 1100, exist: 800, status: 'warn', rec: 'Oversizing required to eliminate cold spots.' }
      ]
    },
    apt: {
      name: '2-Bed Apartment (75m²)',
      hpCapacity: '5.0 kW Compact Heat Pump',
      heatLoss: '4.6 kW @ -3°C',
      rooms: [
        { name: 'Open Plan Living (28m²)', req: 1850, exist: 2000, status: 'ok', rec: 'Compliant heat delivery.' },
        { name: 'Master Bed (16m²)', req: 1050, exist: 1100, status: 'ok', rec: 'Compliant flow rate.' },
        { name: 'Bedroom 2 (12m²)', req: 800, exist: 600, status: 'warn', rec: 'Type 21 compact upgrade (+200W).' }
      ]
    }
  };

  function updateInstallerComplianceMatrix() {
    const data = ARCHETYPE_ROOM_SCHEDULES[installerArchetype] || ARCHETYPE_ROOM_SCHEDULES.semi;

    // Update HP Sizing Header
    const hpDisp = document.getElementById('lbl-installer-hp-size');
    if (hpDisp) hpDisp.innerText = data.hpCapacity;

    const lossDisp = document.getElementById('lbl-installer-heat-loss');
    if (lossDisp) lossDisp.innerText = `Total Heat Loss: ${data.heatLoss} · NSAI SR50-2:2024 ΔT30 Standard`;

    // Render Room Cards
    const container = document.getElementById('installer-room-container');
    if (container) {
      container.innerHTML = data.rooms.map(r => `
        <div class="installer-room-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="color: #ffffff; font-size: 0.88rem;">${r.name}</strong>
            ${r.status === 'ok' 
              ? '<span class="badge-status-ok">🟢 Compliant OK</span>' 
              : '<span class="badge-status-warn">⚠️ Oversizing Required</span>'}
          </div>
          <div style="font-size: 0.78rem; color: #94a3b8; margin-bottom: 4px; font-family: \'IBM Plex Mono\', monospace;">
            Req: <span style="color: #fff; font-weight: 700;">${r.req}W</span> · Existing: <span style="color: ${r.status==='ok'?'#34f5c5':'#fbbf24'}; font-weight: 700;">${r.exist}W</span>
          </div>
          <div style="font-size: 0.72rem; color: ${r.status==='ok'?'#94a3b8':'#fde68a'}; line-height: 1.4;">
            ${r.rec}
          </div>
        </div>
      `).join('');
    }

    // Update Tender Draft Text
    const tenderBox = document.getElementById('lbl-installer-tender-text');
    if (tenderBox) {
      const warnCount = data.rooms.filter(r => r.status === 'warn').length;
      const okCount = data.rooms.length - warnCount;
      tenderBox.innerText = `📋 ECOSMARTHOMES NSAI SR50-2 TENDER SPECIFICATION\nProperty: ${data.name}\nProposed Heat Source: ${data.hpCapacity} (${data.heatLoss})\nRadiator Compliance Schedule:\n• ${okCount} Rooms Compliant with 50°C Low-Flow Heat Delivery\n• ${warnCount} Rooms Specified for Type 22 Convector Upgrades\nDirect SEAI Grant Deduction: -€12,500\nMilestone Terms: 10% Deposit · 40% Delivery · 50% SEAI Inspection Pass`;
    }
  }

  window.setInstallerArchetype = function(key) {
    installerArchetype = key;
    document.querySelectorAll('.installer-archetype-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-arch') === key);
    });
    updateInstallerComplianceMatrix();
    updateInstallerHydraulicCalculations();
    updateInstallerDefroster();
  };

  // ==========================================================================
  // ⚡ NSAI SR50-2 HYDRAULIC SIZING & ANTI-LOCKOUT ENGINE
  // ==========================================================================
  let installerStep2Mode = 'rads'; // 'rads' | 'hydraulics'
  let installerDeltaT = 5; // 5 (°C monobloc benchmark) | 7 (°C split benchmark)

  const ARCHETYPE_HYDRAULIC_SPECS = {
    semi: {
      name: '3-Bed Semi-Detached (115m²)',
      hpKw: 8.5,
      hpUnitName: '8.5 kW Monobloc Heat Pump',
      heatLoss: '7.8 kW @ -3°C',
      volumiserLiters: 50,
      volumiserType: '50L In-Line Volumiser',
      volumiserHint: 'Active Defrost Buffer Required',
      recPipe: '28mm Copper (or 32mm MLCP)',
      pipeIdMm: 26.2, // 28mm copper ID = ~26.2mm
      existing22IdMm: 20.2 // 22mm copper ID = ~20.2mm
    },
    detached: {
      name: '4-Bed Detached (175m²)',
      hpKw: 12.0,
      hpUnitName: '12.0 kW Monobloc Heat Pump',
      heatLoss: '11.4 kW @ -3°C',
      volumiserLiters: 75,
      volumiserType: '75L Low-Loss Header / Buffer',
      volumiserHint: 'High-Volume Defrost Reserve',
      recPipe: '35mm Copper (or 40mm MLCP)',
      pipeIdMm: 32.6, // 35mm copper ID = ~32.6mm
      existing22IdMm: 20.2
    },
    bungalow: {
      name: '3-Bed Bungalow (130m²)',
      hpKw: 9.5,
      hpUnitName: '9.5 kW Monobloc Heat Pump',
      heatLoss: '9.1 kW @ -3°C',
      volumiserLiters: 60,
      volumiserType: '60L In-Line Volumiser',
      volumiserHint: 'Defrost Thermal Reserve',
      recPipe: '28mm Copper (or 32mm MLCP)',
      pipeIdMm: 26.2,
      existing22IdMm: 20.2
    },
    apt: {
      name: '2-Bed Apartment (75m²)',
      hpKw: 5.0,
      hpUnitName: '5.0 kW Compact Heat Pump',
      heatLoss: '4.6 kW @ -3°C',
      volumiserLiters: 35,
      volumiserType: '35L Close-Coupled Volumiser',
      volumiserHint: 'Compact Defrost Protection',
      recPipe: '22mm Copper (or 26mm MLCP)',
      pipeIdMm: 20.2, // 22mm copper is sufficient for 5kW
      existing22IdMm: 20.2
    }
  };

  function calculateHydraulicPhysics(kw, deltaT, pipeIdMm) {
    // Mass Flow Rate: Q (kW) / (Cp * DeltaT) -> L/min = (kW * 60) / (4.186 * deltaT)
    const flowLmin = (kw * 60) / (4.186 * deltaT);
    const flowLhr = flowLmin * 60;
    const flowM3s = (flowLmin / 1000) / 60; // m^3/s
    const pipeDiameterM = pipeIdMm / 1000;
    const pipeAreaM2 = (Math.PI / 4) * Math.pow(pipeDiameterM, 2);
    const velocityMs = flowM3s / pipeAreaM2;
    return {
      flowLmin: Math.round(flowLmin * 10) / 10,
      flowLhr: Math.round(flowLhr),
      velocityMs: Math.round(velocityMs * 100) / 100
    };
  }

  function updateInstallerHydraulicCalculations() {
    const spec = ARCHETYPE_HYDRAULIC_SPECS[installerArchetype] || ARCHETYPE_HYDRAULIC_SPECS.semi;
    
    // Calculate for recommended pipe and existing 22mm pipe
    const recPhysics = calculateHydraulicPhysics(spec.hpKw, installerDeltaT, spec.pipeIdMm);
    const exist22Physics = calculateHydraulicPhysics(spec.hpKw, installerDeltaT, spec.existing22IdMm);

    // Update Header
    const hpTitle = document.getElementById('lbl-installer-hydraulic-hp');
    if (hpTitle) hpTitle.innerText = `${spec.hpKw.toFixed(1)} kW Monobloc Hydraulic Sizing`;

    // 1. Flow Rate
    const flowEl = document.getElementById('lbl-hydraulic-flow');
    if (flowEl) flowEl.innerText = `${recPhysics.flowLmin.toFixed(1)} L/min`;

    const flowHrEl = document.getElementById('lbl-hydraulic-flow-hr');
    if (flowHrEl) flowHrEl.innerText = `${recPhysics.flowLhr.toLocaleString()} L/hr (${(recPhysics.flowLmin / 60).toFixed(2)} kg/s)`;

    // 2. Recommended Primary Pipe
    const recPipeEl = document.getElementById('lbl-hydraulic-pipe-rec');
    if (recPipeEl) recPipeEl.innerText = spec.recPipe.split(' ')[0] + ' Primary';

    const recVelocityEl = document.getElementById('lbl-hydraulic-pipe-velocity');
    if (recVelocityEl) recVelocityEl.innerText = `${recPhysics.velocityMs.toFixed(2)} m/s ✅ (NSAI Compliant)`;

    // 3. 22mm Risk Metric
    const risk22El = document.getElementById('lbl-hydraulic-22mm-risk');
    const hint22El = document.getElementById('lbl-hydraulic-22mm-hint');
    if (risk22El) {
      if (exist22Physics.velocityMs <= 1.0) {
        risk22El.innerText = `${exist22Physics.velocityMs.toFixed(2)} m/s ✅`;
        risk22El.style.color = '#34f5c5';
        if (hint22El) hint22El.innerText = 'Passes NSAI 1.0 m/s Limit';
      } else {
        risk22El.innerText = `${exist22Physics.velocityMs.toFixed(2)} m/s ❌`;
        risk22El.style.color = '#ef4444';
        if (hint22El) hint22El.innerText = 'Exceeds 1.0 m/s (Lockout Danger)';
      }
    }

    // 4. Defrost Volumiser
    const volEl = document.getElementById('lbl-hydraulic-volumiser');
    if (volEl) volEl.innerText = `${spec.volumiserLiters}L In-Line`;

    const volHintEl = document.getElementById('lbl-hydraulic-volumiser-hint');
    if (volHintEl) volHintEl.innerText = spec.volumiserHint;

    // Verdict callout text
    const verdictEl = document.getElementById('lbl-hydraulic-verdict-text');
    if (verdictEl) {
      if (exist22Physics.velocityMs > 1.0) {
        verdictEl.innerHTML = `Connecting an <strong>${spec.hpKw.toFixed(1)} kW</strong> heat pump at ΔT ${installerDeltaT}°C to standard 22mm copper pipework pushes flow velocity to <strong style="color:#f87171;">${exist22Physics.velocityMs.toFixed(2)} m/s</strong>, breaching NSAI SR50-2 acoustic limits (&lt; 1.0 m/s) and generating excessive hydraulic resistance that causes heat pump high-pressure lockouts during sub-zero defrost cycles. Install <strong>${spec.recPipe}</strong> from monobloc to internal manifold + minimum <strong>${spec.volumiserType}</strong>.`;
      } else {
        verdictEl.innerHTML = `For a compact <strong>${spec.hpKw.toFixed(1)} kW</strong> heat pump, primary flow rate is <strong>${recPhysics.flowLmin.toFixed(1)} L/min</strong>. Standard 22mm copper pipework maintains flow velocity at <strong style="color:#34f5c5;">${exist22Physics.velocityMs.toFixed(2)} m/s</strong>, comfortably within the NSAI SR50-2 acoustic limit (&lt; 1.0 m/s). Pair with a <strong>${spec.volumiserType}</strong> to prevent defrost cycles from chilling living quarters.`;
      }
    }

    // Delta-T Buttons active state
    const b5 = document.getElementById('btnDeltaT5');
    const b7 = document.getElementById('btnDeltaT7');
    if (b5) b5.classList.toggle('active', installerDeltaT === 5);
    if (b7) b7.classList.toggle('active', installerDeltaT === 7);
  }

  window.setInstallerStep2Mode = function(mode) {
    installerStep2Mode = mode;
    const btnRads = document.getElementById('btnInstallerModeRads');
    const btnHydraulics = document.getElementById('btnInstallerModeHydraulics');
    const panelRads = document.getElementById('installer-rads-panel');
    const panelHydraulics = document.getElementById('installer-hydraulic-container');

    if (mode === 'rads') {
      if (btnRads) btnRads.classList.add('active');
      if (btnHydraulics) btnHydraulics.classList.remove('active');
      if (panelRads) panelRads.style.display = 'block';
      if (panelHydraulics) panelHydraulics.style.display = 'none';
      updateInstallerComplianceMatrix();
    } else {
      if (btnRads) btnRads.classList.remove('active');
      if (btnHydraulics) btnHydraulics.classList.add('active');
      if (panelRads) panelRads.style.display = 'none';
      if (panelHydraulics) panelHydraulics.style.display = 'block';
      updateInstallerHydraulicCalculations();
    }
  };

  window.setInstallerDeltaT = function(deltaT) {
    installerDeltaT = Number(deltaT);
    updateInstallerHydraulicCalculations();
  };

  window.openInstallerHydraulicSizer = function(event) {
    if (event) event.preventDefault();
    window.setPersona('installer');
    window.setInstallerStep2Mode('hydraulics');
    const target = document.getElementById('installer-rescue-wizard');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (typeof window.closeToolsDrawer === 'function') {
      window.closeToolsDrawer();
    }
  };

  window.copyHydraulicSpec = function() {
    window.requireFreemiumPass(() => {
      const spec = ARCHETYPE_HYDRAULIC_SPECS[installerArchetype] || ARCHETYPE_HYDRAULIC_SPECS.semi;
      const recPhysics = calculateHydraulicPhysics(spec.hpKw, installerDeltaT, spec.pipeIdMm);
      const exist22Physics = calculateHydraulicPhysics(spec.hpKw, installerDeltaT, spec.existing22IdMm);

      const statusText = exist22Physics.velocityMs <= 1.0 
        ? `${exist22Physics.velocityMs.toFixed(2)} m/s (✅ Compliant with NSAI SR50-2)` 
        : `${exist22Physics.velocityMs.toFixed(2)} m/s (❌ FAILS NSAI SR50-2 < 1.0 m/s acoustic/head limit)`;

      const text = `🌊 ECOSMARTHOMES NSAI SR50-2 PRIMARY HYDRAULIC SPECIFICATION
Property: ${spec.name}
Specified Unit: ${spec.hpUnitName} (${spec.heatLoss})
Design Temperature Difference: ΔT ${installerDeltaT}.0°C (${installerDeltaT === 5 ? 'Monobloc Benchmark' : 'Split System Standard'})
Required Design Flow Rate: ${recPhysics.flowLmin.toFixed(1)} L/min (${recPhysics.flowLhr.toLocaleString()} L/h · ${(recPhysics.flowLmin/60).toFixed(2)} kg/s)
Recommended Primary Pipe: ${spec.recPipe} (Velocity: ${recPhysics.velocityMs.toFixed(2)} m/s ✅ Compliant)
22mm Existing Run Assessment: ${statusText}
Defrost Buffer Protection: ${spec.volumiserType} (Active Volumiser / Low-Loss Reserve)
Hydraulic Architecture: Direct flow with close-coupled volumiser + magnetic cyclone filter + 25kPa differential bypass valve
Compliance Standard: NSAI SR50-2:2024 Code of Practice for Heat Pump Systems`;

      window.copyTextToClipboard(text, 'Copied NSAI Hydraulic Specification to Clipboard!');
      const btn = document.getElementById('btnCopyHydraulicSpec');
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '✅ Copied Hydraulic Specification to Clipboard!';
        btn.style.background = '#34f5c5';
        btn.style.color = '#00241b';
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.style.background = '';
          btn.style.color = '';
        }, 2400);
      }
    });
  };

  window.copyInstallerTenderDraft = function() {
    window.requireFreemiumPass(() => {
      const textEl = document.getElementById('lbl-installer-tender-text');
      if (!textEl) return;
      const text = textEl.innerText;

      window.copyTextToClipboard(text, 'Copied SEAI Tender Draft to Clipboard!');
      const btn = document.getElementById('btn-copy-tender-action');
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '✅ Copied SEAI Tender Draft to Clipboard!';
        btn.style.background = '#38bdf8';
        btn.style.color = '#001a2c';
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.style.background = '';
          btn.style.color = '';
        }, 2200);
      }
    });
  };

  // ==========================================================================
  // ⚡ INSTALLER IDEA 2: COWBOY QUOTE DEFROSTER (MARGIN & SPEC SHIELD)
  // ==========================================================================
  let installerStep3Mode = 'tender'; // 'tender' | 'defroster'

  const ARCHETYPE_DEFROSTER_SPECS = {
    semi: {
      name: '3-Bed Semi-Detached (115m²)',
      hpKw: 8.5,
      hpUnitName: '8.5 kW Monobloc Heat Pump',
      yourPrice: 13800,
      cowboyPrice: 10500,
      initialDiff: 3300,
      yourFlow: '45°C Low-Flow (COP 4.2)',
      cowboyFlow: '65°C High-Flow (COP 2.6)',
      annualExtraPower: 980,
      tenYearPowerLoss: 9800,
      remedialRisk: 1500,
      netTenYearSaving: 6500,
      yourRads: 'Resized Type 22 Convectors',
      yourPipe: '28mm Copper + 50L Volumiser',
      cowboyPipe: 'Tied into 22mm Choked Pipe'
    },
    detached: {
      name: '4-Bed Detached (175m²)',
      hpKw: 12.0,
      hpUnitName: '12.0 kW Monobloc Heat Pump',
      yourPrice: 16500,
      cowboyPrice: 12200,
      initialDiff: 4300,
      yourFlow: '45°C Low-Flow (COP 4.2)',
      cowboyFlow: '65°C High-Flow (COP 2.5)',
      annualExtraPower: 1350,
      tenYearPowerLoss: 13500,
      remedialRisk: 1800,
      netTenYearSaving: 9200,
      yourRads: 'Resized Type 22 & 33 Convectors',
      yourPipe: '35mm Copper + 75L Volumiser',
      cowboyPipe: 'Tied into 22mm / 15mm Choked Pipe'
    },
    bungalow: {
      name: '3-Bed Bungalow (130m²)',
      hpKw: 9.5,
      hpUnitName: '9.5 kW Monobloc Heat Pump',
      yourPrice: 14600,
      cowboyPrice: 11000,
      initialDiff: 3600,
      yourFlow: '45°C Low-Flow (COP 4.2)',
      cowboyFlow: '65°C High-Flow (COP 2.6)',
      annualExtraPower: 1100,
      tenYearPowerLoss: 11000,
      remedialRisk: 1600,
      netTenYearSaving: 7400,
      yourRads: 'Resized Type 22 Convectors',
      yourPipe: '28mm Copper + 60L Volumiser',
      cowboyPipe: 'Tied into 22mm Choked Pipe'
    },
    apt: {
      name: '2-Bed Apartment (75m²)',
      hpKw: 5.0,
      hpUnitName: '5.0 kW Monobloc Heat Pump',
      yourPrice: 9800,
      cowboyPrice: 7500,
      initialDiff: 2300,
      yourFlow: '45°C Low-Flow (COP 4.2)',
      cowboyFlow: '60°C High-Flow (COP 2.8)',
      annualExtraPower: 580,
      tenYearPowerLoss: 5800,
      remedialRisk: 1200,
      netTenYearSaving: 4700,
      yourRads: 'Optimised Low-Flow Convectors',
      yourPipe: '22mm Copper + 35L Volumiser',
      cowboyPipe: 'Tied into Microbore / 15mm Pipe'
    }
  };

  function updateInstallerDefroster() {
    const spec = ARCHETYPE_DEFROSTER_SPECS[installerArchetype] || ARCHETYPE_DEFROSTER_SPECS.semi;

    const marginPill = document.getElementById('lbl-defroster-margin-pill');
    if (marginPill) marginPill.innerText = `🔥 Margin Protected: €${spec.initialDiff.toLocaleString()}`;

    const yourPriceEl = document.getElementById('lbl-defroster-your-price');
    if (yourPriceEl) yourPriceEl.innerText = `€${spec.yourPrice.toLocaleString()} Turnkey`;

    const cowboyPriceEl = document.getElementById('lbl-defroster-cowboy-price');
    if (cowboyPriceEl) cowboyPriceEl.innerText = `€${spec.cowboyPrice.toLocaleString()} Budget`;

    const yourFlowEl = document.getElementById('lbl-defroster-your-flow');
    if (yourFlowEl) yourFlowEl.innerText = spec.yourFlow;

    const cowboyFlowEl = document.getElementById('lbl-defroster-cowboy-flow');
    if (cowboyFlowEl) cowboyFlowEl.innerText = spec.cowboyFlow;

    const cowboyExtraPowerEl = document.getElementById('lbl-defroster-cowboy-extra-power');
    if (cowboyExtraPowerEl) cowboyExtraPowerEl.innerText = `Burns +€${spec.annualExtraPower.toLocaleString()}/year in unnecessary ESB electricity`;

    const yourRadsEl = document.getElementById('lbl-defroster-your-rads');
    if (yourRadsEl) yourRadsEl.innerText = spec.yourRads;

    const yourPipeEl = document.getElementById('lbl-defroster-your-pipe');
    if (yourPipeEl) yourPipeEl.innerText = spec.yourPipe;

    const netSavingsEl = document.getElementById('lbl-defroster-net-savings');
    if (netSavingsEl) netSavingsEl.innerText = `💰 Saves €${spec.netTenYearSaving.toLocaleString()}+ Over 10 Years`;

    const descEl = document.getElementById('lbl-defroster-verdict-desc');
    if (descEl) {
      descEl.innerHTML = `The budget quote appears <strong>€${spec.initialDiff.toLocaleString()}</strong> cheaper on day one, but burns an extra <strong>€${spec.tenYearPowerLoss.toLocaleString()}</strong> in compressor electricity over 10 years and risks <strong>€${spec.remedialRisk.toLocaleString()}+</strong> in emergency callouts and failed SEAI sign-offs. Your compliant NSAI spec delivers guaranteed comfort and saves the client <strong>€${spec.netTenYearSaving.toLocaleString()}+</strong> overall.`;
    }
  }

  window.setInstallerStep3Mode = function(mode) {
    installerStep3Mode = mode;
    const btnTender = document.getElementById('btnInstallerStep3Tender');
    const btnDefroster = document.getElementById('btnInstallerStep3Defroster');
    const panelTender = document.getElementById('installer-tender-panel');
    const panelDefroster = document.getElementById('installer-defroster-panel');

    if (mode === 'tender') {
      if (btnTender) btnTender.classList.add('active');
      if (btnDefroster) btnDefroster.classList.remove('active');
      if (panelTender) panelTender.style.display = 'block';
      if (panelDefroster) panelDefroster.style.display = 'none';
    } else {
      if (btnTender) btnTender.classList.remove('active');
      if (btnDefroster) btnDefroster.classList.add('active');
      if (panelTender) panelTender.style.display = 'none';
      if (panelDefroster) panelDefroster.style.display = 'block';
      updateInstallerDefroster();
    }
  };

  window.openInstallerQuoteDefroster = function(event) {
    if (event) event.preventDefault();
    window.setPersona('installer');
    window.setInstallerStep3Mode('defroster');
    const target = document.getElementById('installer-defroster-panel') || document.getElementById('installer-rescue-wizard');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (typeof window.closeToolsDrawer === 'function') {
      window.closeToolsDrawer();
    }
  };

  window.copyCowboyQuoteDefense = function() {
    window.requireFreemiumPass(() => {
      const spec = ARCHETYPE_DEFROSTER_SPECS[installerArchetype] || ARCHETYPE_DEFROSTER_SPECS.semi;

      const scriptText = `🛡️ ECOSMARTHOMES NSAI QUALITY DEFENSE BRIEFING
Property: ${spec.name} (${spec.hpUnitName})

Hi [Homeowner],

Totally understand why the €${spec.cowboyPrice.toLocaleString()} quote caught your eye—a €${spec.initialDiff.toLocaleString()} headline difference looks tempting on paper. However, before committing, here is why that cheaper install will actually cost you ~€${spec.netTenYearSaving.toLocaleString()} MORE over the next few years:

1. FLOW TEMPERATURE & RUNNING COSTS:
• Their Quote: Runs at ${spec.cowboyFlow} using your existing small radiators. The heat pump struggles at low efficiency, burning an extra ~€${spec.annualExtraPower.toLocaleString()}/year in ESB electricity.
• Our NSAI Spec: Replaces undersized radiators with ${spec.yourRads} running at ${spec.yourFlow}, cutting power consumption by 35%–40%.

2. FROST LOCKOUTS & HYDRAULIC WEAR:
• Their Quote: ${spec.cowboyPipe} without a dedicated volumiser. Water velocity exceeds NSAI SR50-2 limits (1.0 m/s), causing whistling radiators and compressor freeze lockouts during sub-zero defrost cycles.
• Our NSAI Spec: ${spec.yourPipe} ensures whisper-quiet flow (<0.8 m/s) and zero frost lockouts.

3. SEAI GRANT ASSURANCE:
• Our installation includes full NSAI SR50-2 certification and guarantees your SEAI grant sign-off with 0% clawback risk.

BOTTOM LINE:
The cheaper quote saves €${spec.initialDiff.toLocaleString()} on day one, but costs you ~€${spec.tenYearPowerLoss.toLocaleString()} extra in electricity and remedial pipework over 10 years. Our system delivers guaranteed 21°C warmth in winter and saves you over €${spec.netTenYearSaving.toLocaleString()} net.

Happy to walk you through the engineering anytime!
[Your Name / Registered Installer]`;

      window.copyTextToClipboard(scriptText, 'Copied Client Quality Defense Script to Clipboard!');
      const btn = document.getElementById('btnCopyCowboyDefense');
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '✅ Copied Defense Script to Clipboard!';
        btn.style.background = '#34f5c5';
        btn.style.color = '#00241b';
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.style.background = '';
          btn.style.color = '';
        }, 2400);
      }
    });
  };

  // Auto-init ticker on load
  setTimeout(startLivePenaltyTicker, 800);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmartNav);
  } else {
    initSmartNav();
  }

  // ==========================================================================
  // NATIVE IOS MOBILE APP DOCK & GLIDING SLIDER BUBBLE CONTROLLER
  // ==========================================================================

  function updateGlidingBubble(slider) {
    if (!slider) return;
    const bubbles = document.querySelectorAll('.slider-value-bubble, #gliding-spend-bubble');
    const min = Number(slider.min) || 100;
    const max = Number(slider.max) || 650;
    const val = Number(slider.value) || 350;
    const ratio = (val - min) / (max - min);

    bubbles.forEach(bubble => {
      bubble.innerText = `€${val}/mo`;
      bubble.style.left = `${ratio * 100}%`;
    });
  }

  
  // ==========================================================================
  // MOBILE TOP MENU SLIDER CONTROLLER (SITE-WIDE SYNC)
  // ==========================================================================
  window.toggleMobileToolsSlider = function() {
    triggerHaptic(8);
    const slider = document.getElementById('mobileTopMenuSlider');
    const btn = document.getElementById('mobileToolsToggleBtn');
    if (!slider) return;
    const isOpen = slider.classList.toggle('is-open');
    if (btn) {
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      const chevron = btn.querySelector('.tools-toggle-chevron');
      if (chevron) {
        chevron.textContent = isOpen ? '▴' : '▾';
      }
      btn.classList.toggle('active', isOpen);
    }
  };

  function initMobileTopMenuSlider() {
    const header = document.querySelector('.main-nav-bar') || document.querySelector('.header');
    if (!header) return;

    let slider = document.getElementById('mobileTopMenuSlider');
    const path = (window.location.pathname || '').toLowerCase();
    const isHome = path === '/' || path === '/index.html' || path === '';

    const tools = [
      { id: 'digital-twin', label: '🏡 Digital Twin', href: '/digital-twin/' },
      { id: 'quote-auditor', label: '🛡️ Quote Auditor', href: '/quote-auditor/' },
      { id: 'solar', label: '☀️ Solar PV', href: '/solar/' },
      { id: 'carbon-tax', label: '⚡ Carbon Tax', href: isHome ? '#carbon-tax-war-room' : '/carbon-tax/' },
      { id: 'green-mortgage', label: '🏛️ Green Mortgage', href: isHome ? '#green-mortgage-ticker' : '/green-mortgage/' },
      { id: 'roadmap', label: '📄 Roadmap PDF', href: '/roadmap/' },
      { id: 'locations', label: '📍 Towns Hub', href: '/locations/' },
      { id: 'contractors', label: '👔 For Installers', href: '/contractors/' },
      { id: 'grant-matrix', label: '⚖️ Grants Matrix', href: '/ber-matrix/' },
      { id: 'transformation', label: '📐 Transformation', href: '/digital-twin/' },
      { id: 'pricing', label: '🏷️ Pricing', href: '/pricing/' },
      { id: 'checkout', label: '💳 Book Survey', href: '/checkout/?tier=survey&price=149', isCta: true }
    ];

    let toggleBar = document.getElementById('mobileToolsToggleBar');
    if (!toggleBar) {
      toggleBar = document.createElement('div');
      toggleBar.id = 'mobileToolsToggleBar';
      toggleBar.className = 'mobile-tools-toggle-bar';
      toggleBar.innerHTML = `
        <button type="button" class="mobile-tools-toggle-btn" id="mobileToolsToggleBtn" onclick="window.toggleMobileToolsSlider()" aria-expanded="false" aria-controls="mobileTopMenuSlider">
          <span class="tools-toggle-title">⚡ Quick Tools (12)</span>
          <span class="tools-toggle-chevron">▾</span>
        </button>
      `;
      if (slider) {
        slider.parentNode.insertBefore(toggleBar, slider);
      } else {
        header.appendChild(toggleBar);
      }
    }

    if (!slider) {
      slider = document.createElement('nav');
      slider.id = 'mobileTopMenuSlider';
      slider.className = 'mobile-top-menu-slider';
      slider.setAttribute('aria-label', 'Mobile Quick Tools Navigation');

      let html = '';
      tools.forEach(tool => {
        const ctaClass = tool.isCta ? ' cta-chip' : '';
        html += `<a href="${tool.href}" class="mobile-nav-slider-chip${ctaClass}" data-tool="${tool.id}">${tool.label}</a>`;
      });
      slider.innerHTML = html;
      header.appendChild(slider);
    }

    // Attach smooth scroll behavior for in-page anchors on home
    slider.querySelectorAll('.mobile-nav-slider-chip').forEach(chip => {
      const href = chip.getAttribute('href');
      if (href && href.startsWith('#')) {
        chip.addEventListener('click', function(e) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            slider.querySelectorAll('.mobile-nav-slider-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
          }
        });
      }
    });

    // Automatically highlight active tool chip based on current path
    slider.querySelectorAll('.mobile-nav-slider-chip').forEach(chip => {
      const href = chip.getAttribute('href').toLowerCase();
      if (!href.startsWith('#') && href !== '/' && path.startsWith(href)) {
        chip.classList.add('active');
        setTimeout(() => {
          chip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }, 150);
      }
    });
  }


  function initMobileIOSAppDock() {
    // 1. Create Fixed Bottom Dock if not present
    if (!document.getElementById('esh-mobile-dock')) {
      const dock = document.createElement('nav');
      dock.id = 'esh-mobile-dock';
      dock.className = 'mobile-app-bottom-dock';
      dock.setAttribute('aria-label', 'iOS Native Mobile Navigation');
      dock.innerHTML = `
        <button type="button" class="dock-item active" onclick="window.onMobileDockHome()" aria-label="Home">
          <span class="dock-icon">🏠</span>
          <span>Home</span>
        </button>
        <button type="button" class="dock-item" onclick="window.onMobileDockProfiles()" aria-label="Profiles">
          <span class="dock-icon">🎛️</span>
          <span>Profiles</span>
        </button>
        <button type="button" class="dock-fab-center" id="mobile-dock-audit-fab" onclick="window.onMobileDockAudit()" aria-label="Audit & Review Command Center" title="Audit & Review Portal">
          <span class="dock-fab-icon">🛡️</span>
        </button>
        <button type="button" class="dock-item" onclick="window.onMobileDockReports()" aria-label="Reports & Tools">
          <span class="dock-icon">📋</span>
          <span>Reports</span>
        </button>
        <a href="/checkout/" id="mobile-dock-checkout" class="dock-item dock-checkout-trigger dock-checkout-disabled" aria-label="Checkout Survey" title="Select an advisory tier or generate a roadmap to activate checkout">
          <span class="dock-icon">💳</span>
          <span>Checkout</span>
          <span class="dock-checkout-badge"></span>
        </a>
      `;
      document.body.appendChild(dock);

      // Restore active checkout state if tier previously selected
      try {
        const savedTier = sessionStorage.getItem('ESH_activeAdvisoryTier');
        if (savedTier || window.location.pathname.includes('/checkout/')) {
          setTimeout(() => window.setDockCheckoutEnabled(true, savedTier), 100);
        }
      } catch (e) {}
    }

    // 2. Create Mobile Tool Sheet Modal if not present
    if (!document.getElementById('esh-mobile-tool-sheet')) {
      const sheet = document.createElement('div');
      sheet.id = 'esh-mobile-tool-sheet';
      sheet.style.display = 'none';
      sheet.setAttribute('role', 'dialog');
      sheet.setAttribute('aria-modal', 'true');
      sheet.innerHTML = `
        <div class="sheet-handle-bar"></div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <strong style="font-size: 1.2rem; color: #ffffff;">📋 Reports & Energy Engines</strong>
          <button type="button" onclick="window.closeMobileToolSheet()" style="background: rgba(255,255,255,0.1); border: none; color: #fff; width: 32px; height: 32px; border-radius: 50%; font-size: 1rem; cursor: pointer;">✕</button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <a href="/daft-hud/" class="drawer-link-item"><span class="tool-icon">⚡</span><div><div>Daft.ie 1-Click Bookmarklet (HUD)</div><div style="font-size:0.72rem;color:#94a3b8;">Zero-install live listing overlay</div></div></a>
          <a href="/property-auditor/" class="drawer-link-item"><span class="tool-icon">🚀</span><div><div>1-Click Property Auditor</div><div style="font-size:0.72rem;color:#94a3b8;">Daft.ie & Eircode grant scanner</div></div></a>
          <a href="/solar/" class="drawer-link-item"><span class="tool-icon">☀️</span><div><div>Solar PV & CEG Simulator</div><div style="font-size:0.72rem;color:#94a3b8;">Eircode irradiance & 24c export cash</div></div></a>
          <a href="/battery-arbitrage/" class="drawer-link-item"><span class="tool-icon">🔋</span><div><div>Smart Battery Arbitrage</div><div style="font-size:0.72rem;color:#94a3b8;">Charge at 7c, slash 38c peak bills</div></div></a>
          <a href="/radiator-sizer/" class="drawer-link-item"><span class="tool-icon">📐</span><div><div>Radiator Low-Flow Sizer</div><div style="font-size:0.72rem;color:#94a3b8;">NSAI SR50-2:2024 compliance</div></div></a>
          <a href="/retrofit-loan/" class="drawer-link-item"><span class="tool-icon">💶</span><div><div>0% Loan & Grant Stacker</div><div style="font-size:0.72rem;color:#94a3b8;">SBCI 3.55% subsidized cashflow</div></div></a>
          <a href="/ber-matrix/" class="drawer-link-item"><span class="tool-icon">🏡</span><div><div>Simplified BER Matrix (A0-G)</div><div style="font-size:0.72rem;color:#94a3b8;">May 2026 SEAI scale & value surge</div></div></a>
          <a href="/tender-generator/" class="drawer-link-item"><span class="tool-icon">📋</span><div><div>Contractor Tender RFP</div><div style="font-size:0.72rem;color:#94a3b8;">NSAI SR50 tender spec & milestone terms</div></div></a>
        </div>
        <div style="margin-top: 24px; display: flex; flex-direction: column; gap: 8px;">
          <a href="/checkout/?tier=survey&price=149" class="btn-hero-primary-star" style="width: 100%; box-sizing: border-box; text-align: center;">
            ⭐ Book On-Site Survey (€149) →
          </a>
          <a href="/pricing/" style="text-align: center; font-size: 0.8rem; color: #34f5c5; font-weight: 700; text-decoration: none;">
            View All Pricing Packages →
          </a>
        </div>
      `;
      document.body.appendChild(sheet);
    }

    // 3. Attach Slider Bubble Tracking
    const slider = document.getElementById('wizard-spend-range');
    if (slider) {
      slider.addEventListener('input', () => updateGlidingBubble(slider));
      updateGlidingBubble(slider);
    }
  }

  function setDockActiveItem(index) {
    const items = document.querySelectorAll('#esh-mobile-dock .dock-item, .mobile-app-bottom-dock .dock-item');
    items.forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
  }

  function isMainAppPage() {
    if (document.getElementById('view-panel-homeowner') || document.getElementById('view-panel-audit')) return true;
    const path = (window.location.pathname || '').toLowerCase();
    return path === '/' || path === '' || path.endsWith('/index.html') || path.endsWith('/site/') || path.endsWith('/site');
  }

  function getMainAppHomeUrl(viewParam) {
    const isSiteSubdir = window.location.pathname.toLowerCase().includes('/site/');
    const base = isSiteSubdir ? '/site/' : '/';
    return viewParam ? `${base}?view=${viewParam}` : base;
  }

  // Mobile Dock Handlers with Haptics & Active Radial Bloom
  window.onMobileDockHome = function() {
    triggerHaptic(8);
    setDockActiveItem(0);
    if (!isMainAppPage()) {
      window.location.href = getMainAppHomeUrl('homeowner');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (typeof window.setPersona === 'function') {
        window.setPersona('homeowner');
      }
    }
  };

  window.onMobileDockProfiles = function() {
    triggerHaptic(8);
    setDockActiveItem(1);
    if (typeof window.openPersonaPickerModal === 'function') {
      window.openPersonaPickerModal();
    } else if (!isMainAppPage()) {
      window.location.href = getMainAppHomeUrl() + '#mobile-persona-dropdown-panel';
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const panel = document.getElementById('mobile-persona-dropdown-panel');
      if (panel) {
        panel.style.display = 'flex';
        panel.classList.add('open');
      }
    }
  };

  window.onMobileDockAudit = function() {
    triggerHaptic(12);
    if (isMainAppPage() && typeof window.setPersona === 'function') {
      window.setPersona('audit');
      const snapSection = document.getElementById('snap-audit') || document.getElementById('view-panel-audit');
      if (snapSection) {
        snapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.location.href = getMainAppHomeUrl('audit');
    }
  };

  // Backward compatibility alias in case cached HTML calls onMobileDockShield
  window.onMobileDockShield = window.onMobileDockAudit;

  window.onMobileDockReports = function() {
    triggerHaptic(8);
    setDockActiveItem(2);
    const sheet = document.getElementById('esh-mobile-tool-sheet');
    if (sheet) {
      sheet.style.display = 'flex';
      sheet.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeMobileToolSheet = function() {
    triggerHaptic(6);
    const sheet = document.getElementById('esh-mobile-tool-sheet');
    if (sheet) {
      sheet.classList.remove('open');
      sheet.style.display = 'none';
      document.body.style.overflow = '';
    }
  };

  // ==========================================================================
  // ADAPTIVE PERSONA DROPDOWN CONTROLLER
  // ==========================================================================

  window.togglePersonaDropdown = function(e) {
    if (e) e.stopPropagation();
    const panel = document.getElementById('mobile-persona-dropdown-panel');
    if (!panel) return;
    const isHidden = panel.style.display === 'none' || !panel.style.display || !panel.classList.contains('open');
    if (isHidden) {
      panel.style.display = 'flex';
      panel.classList.add('open');
    } else {
      panel.style.display = 'none';
      panel.classList.remove('open');
    }
  };

  window.selectPersonaFromDropdown = function(personaKey) {
    const panel = document.getElementById('mobile-persona-dropdown-panel');
    if (panel) {
      panel.style.display = 'none';
      panel.classList.remove('open');
    }

    const roleToAdvisor = {
      homeowner: 'aoife',
      aoife: 'aoife',
      agent: 'eimear',
      eimear: 'eimear',
      installer: 'declan',
      declan: 'declan',
      audit: 'declan',
      all: 'aoife'
    };
    const advisorToRole = {
      aoife: 'homeowner',
      homeowner: 'homeowner',
      eimear: 'agent',
      agent: 'agent',
      declan: 'installer',
      installer: 'installer',
      audit: 'audit',
      all: 'all'
    };

    const raw = (personaKey || 'homeowner').toLowerCase();
    const advisorKey = roleToAdvisor[raw] || 'aoife';
    const roleKey = advisorToRole[raw] || 'homeowner';

    // 1. Persistent Role Saving
    try {
      localStorage.setItem("ESH_hasSeenOnboarding", "true");
      localStorage.setItem("ESH_hasChosenRole", "true");
      localStorage.setItem("ESH_lastPersona", advisorKey);
      localStorage.setItem("ESH_currentRole", roleKey);
    } catch (e) {}

    // 2. Seamless Advisor Activation (chime, theme colors, launcher button, voice system)
    if (window.AG && typeof window.AG.setVoicePersona === 'function') {
      window.AG.setVoicePersona(advisorKey, false);
    }

    // 3. Sync UI & Tools Filter
    if (window.setPersona) {
      window.setPersona(roleKey);
    }
  };

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    const panel = document.getElementById('mobile-persona-dropdown-panel');
    const trigger = document.getElementById('mobile-persona-toggle-btn');
    if (panel && (panel.classList.contains('open') || panel.style.display === 'flex')) {
      if (!panel.contains(e.target) && (!trigger || !trigger.contains(e.target))) {
        panel.style.display = 'none';
        panel.classList.remove('open');
      }
    }
  });

  // Set Fixed Bottom Dock Checkout State
  window.setDockCheckoutEnabled = function(enabled, tierName) {
    const trigger = document.getElementById('mobile-dock-checkout');
    if (!trigger) return;
    if (enabled) {
      trigger.classList.remove('dock-checkout-disabled');
      trigger.classList.add('dock-checkout-active');
      trigger.removeAttribute('title');
      if (tierName) {
        trigger.setAttribute('href', `/checkout/?tier=${encodeURIComponent(tierName)}`);
        try {
          sessionStorage.setItem('ESH_activeAdvisoryTier', tierName);
        } catch (e) {}
      }
    } else {
      trigger.classList.add('dock-checkout-disabled');
      trigger.classList.remove('dock-checkout-active');
      trigger.setAttribute('title', 'Select an advisory tier or generate a roadmap to activate checkout');
    }
  };

  // Smart Scroll Direction Listener & Dock Collision Shielding
  const activeIntersectingModules = new Set();
  let isScrollingDown = false;
  let scrollStopTimer = null;

  function initSmartScrollMechanics() {
    function getScrollY() {
      const container = document.getElementById('mobile-app-container');
      return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || (container ? container.scrollTop : 0) || 0;
    }

    let lastScrollY = getScrollY();
    let ticking = false;
    const SCROLL_DELTA_THRESHOLD = 8;
    const HERO_SUPPRESSION_THRESHOLD = 220;

    function hideTriggers() {
      const floatingWa = document.getElementById('esh-whatsapp-floating-btn');
      const floatingVoice = document.getElementById('voice-launcher') || document.querySelector('.voice-advisor-launcher');
      const floatingActionsRow = document.querySelector('.floating-actions-bar');

      [floatingWa, floatingVoice, floatingActionsRow].forEach(el => {
        if (!el) return;
        el.classList.add('scroll-hidden', 'is-hidden');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('transform', 'translateY(120px)', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
      });
    }

    function showTriggers() {
      const currentScrollY = getScrollY();
      // Keep strictly hidden in hero zone, or while moving downward, or over any interactive module
      if (currentScrollY < HERO_SUPPRESSION_THRESHOLD || isScrollingDown || activeIntersectingModules.size > 0) {
        hideTriggers();
        return;
      }

      const floatingWa = document.getElementById('esh-whatsapp-floating-btn');
      const floatingVoice = document.getElementById('voice-launcher') || document.querySelector('.voice-advisor-launcher');
      const floatingActionsRow = document.querySelector('.floating-actions-bar');

      [floatingWa, floatingVoice, floatingActionsRow].forEach(el => {
        if (!el || el.classList.contains('contextual-suppressed')) return;
        el.classList.remove('scroll-hidden', 'is-hidden');
        el.style.removeProperty('visibility');
        el.style.removeProperty('opacity');
        el.style.removeProperty('transform');
        el.style.removeProperty('pointer-events');
      });
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = getScrollY();
          const delta = currentScrollY - lastScrollY;
          const docHeight = Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
          );
          const winHeight = window.innerHeight;
          const isScrollFloor = (winHeight + currentScrollY) >= (docHeight - 40);
          const isHeroZone = currentScrollY < HERO_SUPPRESSION_THRESHOLD;

          // 1. Independent Mobile Radial FAB Momentum Controller
          const fabContainer = document.getElementById('fabRadialContainer');
          if (fabContainer && !fabContainer.classList.contains('is-open')) {
            if (delta > 20) {
              // Rapid downward flick: tuck FAB slightly
              fabContainer.classList.add('scroll-hidden');
            } else if (delta < -4 || isScrollFloor) {
              // Gentle upscroll or bottom of page: reveal FAB
              fabContainer.classList.remove('scroll-hidden');
            }
          }

          // 2. Legacy Floating Pills Controller
          if (isHeroZone) {
            isScrollingDown = false;
            hideTriggers();
          } else if (delta > SCROLL_DELTA_THRESHOLD) {
            // Scrolling down: strictly hide
            isScrollingDown = true;
            if (scrollStopTimer) clearTimeout(scrollStopTimer);
            scrollStopTimer = setTimeout(() => {
              isScrollingDown = false;
              const fab = document.getElementById('fabRadialContainer');
              if (fab) fab.classList.remove('scroll-hidden');
            }, 300);
            hideTriggers();
          } else if (delta < -SCROLL_DELTA_THRESHOLD) {
            // Scrolling up past hero: reveal if outside interactive modules
            isScrollingDown = false;
            if (!isHeroZone && activeIntersectingModules.size === 0) {
              showTriggers();
            } else {
              hideTriggers();
            }
          } else if (isScrollFloor) {
            if (activeIntersectingModules.size === 0) {
              showTriggers();
            }
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    }

    // Initial check on mount
    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true });
    const appContainer = document.getElementById('mobile-app-container');
    if (appContainer) appContainer.addEventListener('scroll', onScroll, { passive: true });
  }

  // Contextual Aoife & Floating Triggers Suppression Observer
  function initDossierContextualObserver() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const floatingVoice = document.getElementById('voice-launcher') || document.querySelector('.voice-advisor-launcher');
        const floatingWa = document.getElementById('esh-whatsapp-floating-btn');
        const floatingBar = document.querySelector('.floating-actions-bar');
        const inlineVoiceBtn = document.getElementById('btn-dossier-ask-aoife') || document.querySelector('.btn-inline-ask-aoife') || document.getElementById('simVoiceCtaBtn');

        if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
          activeIntersectingModules.add(entry.target);
          [floatingVoice, floatingWa, floatingBar].forEach(el => {
            if (!el) return;
            el.classList.add('contextual-suppressed', 'is-hidden', 'scroll-hidden');
            el.style.setProperty('visibility', 'hidden', 'important');
            el.style.setProperty('opacity', '0', 'important');
            el.style.setProperty('transform', 'translateY(120px)', 'important');
            el.style.setProperty('pointer-events', 'none', 'important');
          });
          if (inlineVoiceBtn) inlineVoiceBtn.classList.add('cta-spotlight');
        } else {
          activeIntersectingModules.delete(entry.target);
          if (activeIntersectingModules.size === 0 && !isScrollingDown) {
            const container = document.getElementById('mobile-app-container');
            const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || (container ? container.scrollTop : 0) || 0;
            if (currentScrollY >= 220) {
              [floatingVoice, floatingWa, floatingBar].forEach(el => {
                if (!el) return;
                el.classList.remove('contextual-suppressed');
              });
              if (inlineVoiceBtn) inlineVoiceBtn.classList.remove('cta-spotlight');
            }
          }
        }
      });
    }, {
      threshold: [0, 0.15, 0.5, 0.75, 1.0]
    });

    const suppressionSelectors = [
      '#prop-audit-results',
      '.hero-scanner-card',
      '#snap-audit',
      '.snap-audit-section',
      '#grant-matrix-calculator',
      '.grant-matrix-section',
      '#transformation-slider',
      '.transformation-section',
      '.transformation-slider-wrap',
      '.transformation-cards-grid',
      '.comparison-container',
      '#green-mortgage-ticker',
      '.mortgage-ticker-section',
      '.bank-ticker-grid',
      '.bank-cards-carousel',
      '#county-solar-map',
      '#carbon-tax-war-room',
      '#wallet-rescue-wizard',
      '#agent-rescue-wizard',
      '#installer-rescue-wizard'
    ];

    suppressionSelectors.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) observer.observe(el);
    });

    window.observeDossierCardForAoifeSuppression = function(el) {
      if (el) observer.observe(el);
    };
  }

  // ==========================================================================
  // 5. RADIAL FLOATING ACTION HUB CONTROLLER
  // ==========================================================================
  function initFabRadialLauncher() {
    const container = document.getElementById('fabRadialContainer');
    const triggerBtn = document.getElementById('fabTriggerBtn');
    const backdrop = document.getElementById('fabBackdrop');
    const actions = document.getElementById('fabActions');
    const btnWhatsApp = document.getElementById('fabActionWhatsApp');
    const btnCamera = document.getElementById('fabActionCamera');
    const btnAoife = document.getElementById('fabActionAoife');

    if (!container || !triggerBtn) return;

    // Ensure FAB is active, visible, and interactive
    container.classList.remove('scroll-hidden', 'context-suppressed');

    function openFab() {
      container.classList.add('is-open');
      if (backdrop) backdrop.classList.add('is-active');
      triggerBtn.setAttribute('aria-expanded', 'true');
      if (actions) actions.setAttribute('aria-hidden', 'false');
      triggerHaptic(12);
    }

    function closeFab() {
      container.classList.remove('is-open');
      if (backdrop) backdrop.classList.remove('is-active');
      triggerBtn.setAttribute('aria-expanded', 'false');
      if (actions) actions.setAttribute('aria-hidden', 'true');
      triggerHaptic(6);
    }

    function toggleFab(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (container.classList.contains('is-open')) {
        closeFab();
      } else {
        openFab();
      }
    }

    triggerBtn.addEventListener('click', toggleFab);

    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        e.preventDefault();
        closeFab();
      });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && container.classList.contains('is-open')) {
        closeFab();
      }
    });

    // Action 1: WhatsApp
    if (btnWhatsApp) {
      btnWhatsApp.addEventListener('click', (e) => {
        triggerHaptic(8);
        closeFab();
        if (typeof window.openWhatsAppQuickConsult === 'function') {
          e.preventDefault();
          window.openWhatsAppQuickConsult();
        }
      });
    }

    // Action 2: Snap Photo
    if (btnCamera) {
      btnCamera.addEventListener('click', (e) => {
        e.preventDefault();
        triggerHaptic(10);
        closeFab();

        // Switch cleanly to audit panel so snap-audit is visible
        if (typeof window.setPersona === 'function') {
          window.setPersona('audit');
        }

        setTimeout(() => {
          const fileInput = document.getElementById('snapFileInput') || 
                            document.querySelector('input[type="file"][accept*="image"]') ||
                            document.getElementById('input-bill-upload');
          if (fileInput) {
            fileInput.click();
          } else {
            window.showEshToast('Ready to analyze equipment or BER photo', '📸');
          }
        }, 350);
      });
    }

    // Action 3: Ask Aoife (Voice AI)
    if (btnAoife) {
      btnAoife.addEventListener('click', (e) => {
        e.preventDefault();
        triggerHaptic(10);
        closeFab();

        if (typeof window.openVoiceAdvisor === 'function') {
          window.openVoiceAdvisor();
        } else {
          const voiceLauncher = document.getElementById('voice-launcher') || document.querySelector('.voice-advisor-launcher');
          if (voiceLauncher) {
            voiceLauncher.click();
          } else if (typeof window.AG !== 'undefined' && window.AG.toggleVoice) {
            window.AG.toggleVoice();
          } else {
            window.showEshToast('Connecting to Aoife Voice AI...', '🎙️');
          }
        }
      });
    }
  }

  // Auto-init on load
  function initSmartNavSuite() {
    if (typeof initSmartNav === 'function') {
      initSmartNav();
    }
    initMobileTopMenuSlider();
    initMobileIOSAppDock();
    initSmartScrollMechanics();
    initDossierContextualObserver();
    initFabRadialLauncher();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmartNavSuite);
  } else {
    initSmartNavSuite();
  }

  // ==========================================================================
  // FREEMIUM ENGINE STEP 1: OPEN ACCESS HOOK & EXPORT GATE
  // ==========================================================================

  let pendingFreemiumAction = null;

  window.hasFreemiumPass = function() {
    try {
      const token = localStorage.getItem('esh_freemium_token');
      return !!token;
    } catch (e) {
      return false;
    }
  };

  window.requireFreemiumPass = function(callback) {
    if (window.hasFreemiumPass()) {
      if (typeof callback === 'function') callback();
      return true;
    }

    pendingFreemiumAction = callback;
    window.openFreemiumModal();
    return false;
  };

  window.openFreemiumModal = function() {
    let overlay = document.getElementById('esh-freemium-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'esh-freemium-modal-overlay';
      overlay.innerHTML = `
        <div class="freemium-modal-card">
          <button type="button" class="freemium-close-btn" onclick="window.closeFreemiumModal()" aria-label="Close">✕</button>
          
          <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(52, 245, 197, 0.15); border: 2px solid #34f5c5; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 16px auto; box-shadow: 0 0 25px rgba(52, 245, 197, 0.45);">
            🎫
          </div>

          <h2 style="font-size: clamp(1.4rem, 3.5vw, 1.7rem); font-weight: 900; color: #ffffff; margin: 0 0 8px 0; line-height: 1.25;">
            Unlock 30 Days of Unlimited Premium Exports
          </h2>
          
          <p style="font-size: 0.88rem; color: #94a3b8; line-height: 1.5; margin: 0 auto 16px auto; max-width: 390px;">
            Join 1,200+ Irish property professionals and homeowners using EcoSmartHomes to eliminate unbilled administrative desk work.
          </p>

          <!-- Trust Checkmark Badges -->
          <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; font-size: 0.74rem; color: #34f5c5; font-weight: 700; font-family: 'IBM Plex Mono', monospace;">
            <span style="background: rgba(52, 245, 197, 0.1); border: 1px solid rgba(52, 245, 197, 0.25); padding: 4px 10px; border-radius: 9999px;">✓ No Credit Card Required</span>
            <span style="background: rgba(52, 245, 197, 0.1); border: 1px solid rgba(52, 245, 197, 0.25); padding: 4px 10px; border-radius: 9999px;">✓ 1-Tap Copy Active</span>
            <span style="background: rgba(52, 245, 197, 0.1); border: 1px solid rgba(52, 245, 197, 0.25); padding: 4px 10px; border-radius: 9999px;">✓ Instant PDF Downloads</span>
          </div>

          <form id="freemium-signup-form" onsubmit="window.activateFreemiumPass(event)">
            
            <div style="text-align: left; margin-bottom: 12px;">
              <label for="freemium-name" style="display: block; font-size: 0.76rem; font-weight: 700; color: #cbd5e1; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; font-family: 'IBM Plex Mono', monospace;">
                Your First Name *
              </label>
              <input type="text" id="freemium-name" class="freemium-input" placeholder="e.g., Seán" required />
            </div>

            <div style="text-align: left; margin-bottom: 12px;">
              <label for="freemium-email" style="display: block; font-size: 0.76rem; font-weight: 700; color: #cbd5e1; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; font-family: 'IBM Plex Mono', monospace;">
                Professional Email Address *
              </label>
              <input type="email" id="freemium-email" class="freemium-input" placeholder="e.g., sean@property.ie" required />
            </div>

            <div style="text-align: left; margin-bottom: 16px;">
              <label for="freemium-role" style="display: block; font-size: 0.76rem; font-weight: 700; color: #cbd5e1; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; font-family: 'IBM Plex Mono', monospace;">
                Select Your Industry Role *
              </label>
              <select id="freemium-role" class="freemium-input" style="appearance: none; background-image: url('data:image/svg+xml;utf8,<svg fill=\"%2334f5c5\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>'); background-repeat: no-repeat; background-position: right 10px center;">
                <option value="Homeowner">🏠 Homeowner (Carbon Tax Shielding)</option>
                <option value="Estate Agent">💼 Estate Agent / Auctioneer (Daft.ie Enhancements)</option>
                <option value="Installer">⚡ Installer / Retrofitter (NSAI SR50-2 Compliance)</option>
              </select>
            </div>

            <button type="submit" class="freemium-btn-amber">
              <span>🔘 Activate My Free 30-Day Pass →</span>
            </button>
          </form>

          <div style="margin-top: 16px; font-size: 0.74rem; color: #94a3b8; line-height: 1.4;">
            By activating, you get 100% free premium access to all 11 tool modules for 30 days. No auto-charges. No lock-ins.
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    }

    overlay.classList.add('active');
  };

  window.closeFreemiumModal = function() {
    const overlay = document.getElementById('esh-freemium-modal-overlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
  };

  window.activateFreemiumPass = function(event) {
    if (event) event.preventDefault();
    const name = (document.getElementById('freemium-name')?.value || 'Friend').trim();
    const email = (document.getElementById('freemium-email')?.value || '').trim();
    const role = document.getElementById('freemium-role')?.value || 'Homeowner';

    const tokenData = {
      token: 'esh_free_' + Date.now(),
      name: name,
      email: email,
      role: role,
      activatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem('esh_freemium_token', tokenData.token);
      localStorage.setItem('esh_user_lead', JSON.stringify(tokenData));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    window.closeFreemiumModal();
    
    if (window.showEshToast) {
      window.showEshToast('🎉 Free 30-Day Pass Activated! Copying to clipboard...', '✨');
    }

    // Automatically execute the pending export action with zero friction
    if (typeof pendingFreemiumAction === 'function') {
      const action = pendingFreemiumAction;
      pendingFreemiumAction = null;
      setTimeout(() => {
        action();
      }, 300);
    }
  };

  // Drawer Persona Accordion Controller
  window.toggleDrawerAccordion = function(hubKey) {
    const btn = document.getElementById('accordion-btn-' + hubKey);
    const panel = document.getElementById('accordion-panel-' + hubKey);
    if (!btn || !panel) return;

    const isActive = btn.classList.contains('active');
    
    // Optional: Collapse other panels for a clean, focused view
    const allBtns = document.querySelectorAll('.drawer-accordion-btn');
    const allPanels = document.querySelectorAll('.drawer-accordion-panel');
    allBtns.forEach(b => b.classList.remove('active'));
    allPanels.forEach(p => p.classList.remove('active'));

    if (!isActive) {
      btn.classList.add('active');
      panel.classList.add('active');
    }
  };



  // Antigravity Persona Toolbar & Hub Event Handlers (Safe Button-Only Binding)
  function initAntigravityVoiceHubListeners() {
    if (typeof window.AG === 'undefined') return;

    const triggers = [
      { id: 'accordion-btn-installer', advisor: 'declan', settings: { rate: 0.92, pitch: 0.98, voiceHint: 'en-IE' } },
      { id: 'accordion-btn-agent', advisor: 'eimear', settings: { rate: 1.0, pitch: 1.05, voiceHint: 'en-IE' } },
      { id: 'accordion-btn-homeowner', advisor: 'aoife', settings: { rate: 0.94, pitch: 1.02, voiceHint: 'en-IE' } }
    ];

    triggers.forEach(t => {
      const el = document.getElementById(t.id);
      if (el && el !== document.documentElement && el !== document.body) {
        el.addEventListener('click', () => {
          if (window.AG && window.AG.setVoicePersona && !window._voicePersonaSyncing) {
            window._voicePersonaSyncing = true;
            try {
              window.AG.setVoicePersona(t.advisor);
              if (window.AG.setVoiceSettings) {
                window.AG.setVoiceSettings(t.settings);
              }
            } finally {
              window._voicePersonaSyncing = false;
            }
          }
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initAntigravityVoiceHubListeners);


  // ==========================================================================
  // PERSISTENT ROLE RESTORATION ON APP LOAD
  // ==========================================================================
  function restoreSavedPersonaState() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const paramView = urlParams.get('view') || urlParams.get('role') || urlParams.get('persona');
      if (paramView && typeof window.setPersona === 'function') {
        window.setPersona(paramView);
        return;
      }
      const savedPersona = localStorage.getItem('ESH_lastPersona');
      const savedRole = localStorage.getItem('ESH_currentRole');
      const roleMap = { aoife: 'homeowner', eimear: 'agent', declan: 'installer', audit: 'audit', all: 'all' };
      const roleToApply = savedRole || (savedPersona ? roleMap[savedPersona.toLowerCase()] : null);
      if (roleToApply && typeof window.setPersona === 'function') {
        window.setPersona(roleToApply);
      }
    } catch(e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restoreSavedPersonaState);
  } else {
    setTimeout(restoreSavedPersonaState, 50);
  }
  window.addEventListener('load', restoreSavedPersonaState);

  // Auto-bootstrap EcoOS Universal One-Page Engine across entire site
  try {
    if (!window.ESH_OS && !document.querySelector('script[src*="esh-os.js"]')) {
      const osScript = document.createElement('script');
      osScript.src = '/js/esh-os.js?v=1';
      osScript.defer = true;
      document.head.appendChild(osScript);
    }
  } catch (e) {}

})();

