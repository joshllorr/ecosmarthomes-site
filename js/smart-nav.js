/**
 * EcoSmartHomes Smart Scroll Navigation, Persona Filter & Wow Factor Controller
 */
(function() {
  'use strict';

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
    all: {
      target: 25500,
      prefix: '€',
      suffix: '',
      label: 'Total Grants & Savings Unlocked: ',
      icon: '🏆',
      glowClass: 'persona-highlight-mint'
    }
  };

  // 3. Reactive Persona Filter Method
  window.setPersona = function(personaKey) {
    currentPersona = personaKey;

    // Update Pill Active States
    document.querySelectorAll('.persona-pill').forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-persona') === personaKey);
    });

    const metric = PERSONA_METRICS[personaKey] || PERSONA_METRICS.homeowner;

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
      if (personaKey === 'all' || personas.includes(personaKey) || personas.includes('all')) {
        card.classList.remove('persona-hidden');
        if (personas.includes(personaKey) && personaKey !== 'all') {
          card.classList.add(metric.glowClass);
        }
      } else {
        card.classList.add('persona-hidden');
      }
    });

    // Update Filter Header
    const lbl = document.getElementById('active-persona-title');
    if (lbl) {
      if (personaKey === 'homeowner') lbl.innerText = 'Homeowner Energy & Savings Suite';
      else if (personaKey === 'agent') lbl.innerText = 'Estate Agent Valuation & BER Hub';
      else if (personaKey === 'installer') lbl.innerText = 'Installer NSAI Sizing & Tender Suite';
      else lbl.innerText = 'All Independent Energy Tools';
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
    
    if (!document.getElementById('esh-side-tab-toggle')) {
      const sideTab = document.createElement('button');
      sideTab.id = 'esh-side-tab-toggle';
      sideTab.type = 'button';
      sideTab.setAttribute('aria-label', 'Open Tools Navigation Drawer');
      sideTab.innerHTML = `
        <span style="font-size: 1rem;">☰</span>
        <span style="writing-mode: vertical-rl; text-orientation: mixed; letter-spacing: 0.08em;">TOOLS</span>
      `;
      sideTab.onclick = window.openToolsDrawer;
      document.body.appendChild(sideTab);
    }

    if (!document.getElementById('esh-drawer-overlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'esh-drawer-overlay';
      overlay.onclick = window.closeToolsDrawer;
      document.body.appendChild(overlay);

      const drawer = document.createElement('aside');
      drawer.id = 'esh-side-drawer';
      drawer.setAttribute('role', 'dialog');
      drawer.setAttribute('aria-modal', 'true');
      drawer.setAttribute('aria-label', 'All EcoSmartHome Independent Tools');
      drawer.innerHTML = `
        <div class="drawer-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.4rem;">🏡</span>
            <strong style="font-size: 1.15rem; color: #ffffff;">EcoSmart<span style="color: #34f5c5;">Homes</span></strong>
          </div>
          <button type="button" class="drawer-close-btn" onclick="window.closeToolsDrawer()" aria-label="Close drawer">✕</button>
        </div>

        <div style="margin-bottom: 14px;">
          <a href="/checkout/" class="btn-hero-primary-star" style="display: block; text-align: center; padding: 12px; font-size: 0.92rem; border-radius: 8px;">
            ⭐ Book Joe's €49 Survey →
          </a>
        </div>

        <div class="drawer-section-title">⚡ ENERGY CALCULATORS & SIMULATORS</div>
        <a href="/solar/" class="drawer-link-item"><span class="tool-icon">☀️</span><div><div>Solar PV & CEG Simulator</div><div style="font-size:0.72rem;color:#94a3b8;font-weight:500;">Eircode irradiance & 24c export cash</div></div></a>
        <a href="/battery-arbitrage/" class="drawer-link-item"><span class="tool-icon">🔋</span><div><div>Smart Battery Arbitrage</div><div style="font-size:0.72rem;color:#94a3b8;font-weight:500;">Charge at 7c, slash 38c peak bills</div></div></a>
        <a href="/radiator-sizer/" class="drawer-link-item"><span class="tool-icon">📐</span><div><div>Radiator Low-Flow Sizer</div><div style="font-size:0.72rem;color:#94a3b8;font-weight:500;">NSAI SR50-2:2024 heat pump compliance</div></div></a>
        <a href="/retrofit-loan/" class="drawer-link-item"><span class="tool-icon">💶</span><div><div>0% Loan & Grant Stacker</div><div style="font-size:0.72rem;color:#94a3b8;font-weight:500;">SBCI 3.55% subsidized cashflow</div></div></a>
        <a href="/ber-matrix/" class="drawer-link-item"><span class="tool-icon">🏡</span><div><div>Simplified BER Matrix (A0-G)</div><div style="font-size:0.72rem;color:#94a3b8;font-weight:500;">May 2026 SEAI scale & value surge</div></div></a>
        <a href="/carbon-tax/" class="drawer-link-item"><span class="tool-icon">⚡</span><div><div>Carbon Tax Ticker</div><div style="font-size:0.72rem;color:#94a3b8;font-weight:500;">2026–2030 fossil fuel penalty audit</div></div></a>
        <a href="/green-mortgage/" class="drawer-link-item"><span class="tool-icon">🏛️</span><div><div>Green Mortgage Arbitrage</div><div style="font-size:0.72rem;color:#94a3b8;font-weight:500;">Unlock 3.45% discounted interest</div></div></a>

        <div class="drawer-section-title">🛡️ AUDITING & TENDERING</div>
        <a href="/quote-auditor/" class="drawer-link-item"><span class="tool-icon">🛡️</span><div><div>Contractor Quote Speedometer</div><div style="font-size:0.72rem;color:#94a3b8;font-weight:500;">Anti-scam quote red-liner & PDF</div></div></a>
        <a href="/tender-generator/" class="drawer-link-item"><span class="tool-icon">📋</span><div><div>Contractor Tender RFP</div><div style="font-size:0.72rem;color:#94a3b8;font-weight:500;">NSAI SR50 tender spec & milestone terms</div></div></a>
        <a href="/contractors/" class="drawer-link-item"><span class="tool-icon">👔</span><div><div>For Registered Installers</div><div style="font-size:0.72rem;color:#94a3b8;font-weight:500;">SEAI compliance & pre-screened jobs</div></div></a>

        <div class="drawer-section-title">📍 DIRECTORY & SUPPORT</div>
        <a href="/locations/" class="drawer-link-item"><span class="tool-icon">📍</span><div><div>33 Irish Towns SEO Hub</div><div style="font-size:0.72rem;color:#94a3b8;font-weight:500;">Local micro-climate & survey directory</div></div></a>
        <a href="/tools/voice-aoife.html" class="drawer-link-item"><span class="tool-icon">🎙️</span><div><div>Ask Aoife (Voice AI)</div><div style="font-size:0.72rem;color:#94a3b8;font-weight:500;">Interactive voice energy advisor</div></div></a>
        <a href="/support/faq.html" class="drawer-link-item"><span class="tool-icon">❓</span><div><div>Knowledgebase & FAQ</div><div style="font-size:0.72rem;color:#94a3b8;font-weight:500;">SEAI grant guides & conflict-free charter</div></div></a>
      `;
      document.body.appendChild(drawer);
    }

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

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') window.closeToolsDrawer();
    });

    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          const currentScrollY = window.scrollY;
          const sideTab = document.getElementById('esh-side-tab-toggle');

          if (currentScrollY > lastScrollY && currentScrollY > SCROLL_THRESHOLD) {
            if (header) header.classList.add('nav-hidden');
            if (sideTab) sideTab.classList.remove('tab-hidden');
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

    // Initialize Default Persona
    window.setPersona('homeowner');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmartNav);
  } else {
    initSmartNav();
  }
})();
