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
    // Sync persona-chips
    document.querySelectorAll('.persona-chip').forEach(chip => {
      const p = chip.getAttribute('data-persona');
      chip.classList.remove('active-homeowner', 'active-agent', 'active-installer');
      if (p === personaKey) {
        if (p === 'homeowner') chip.classList.add('active-homeowner');
        else if (p === 'agent') chip.classList.add('active-agent');
        else if (p === 'installer') chip.classList.add('active-installer');
      }
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

    // Toggle Wizard Views on Persona Switch
    const homeownerWizard = document.getElementById('wallet-rescue-wizard');
    const agentWizard = document.getElementById('agent-rescue-wizard');
    const installerWizard = document.getElementById('installer-rescue-wizard');

    // Hide all first
    if (homeownerWizard) homeownerWizard.style.display = 'none';
    if (agentWizard) agentWizard.style.display = 'none';
    if (installerWizard) installerWizard.style.display = 'none';

    if (personaKey === 'installer') {
      if (installerWizard) {
        installerWizard.style.display = 'block';
        updateInstallerComplianceMatrix();
      }
    } else if (personaKey === 'agent') {
      if (agentWizard) {
        agentWizard.style.display = 'block';
        if (typeof updateAgentSurgeCalculations === 'function') {
          updateAgentSurgeCalculations();
        }
      }
    } else {
      if (homeownerWizard) homeownerWizard.style.display = 'block';
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
    selectedFuel = fuelKey;
    document.querySelectorAll('.wizard-fuel-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-fuel') === fuelKey);
    });
    updatePenaltyCalculations();
  };

  window.onWizardSliderChange = function(sliderVal) {
    monthlyHeatingBill = Number(sliderVal);
    updatePenaltyCalculations();
    if (typeof updateGlidingBubble === 'function') {
      updateGlidingBubble(document.getElementById('wizard-spend-range'));
    }
  };

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
          if (rescueContainer) rescueContainer.style.display = 'block';
        } else {
          penaltyDisp.innerText = `€${countdown.toLocaleString()}.00`;
        }
      }, 25);
    }
  };

  // ==========================================================================
  // 3-STEP ESTATE AGENT COMMISSION-BOOSTER & DAFT.IE COPY ENGINE
  // ==========================================================================
  let agentCurrentBER = 'D';
  let agentPropertyVal = 350000;

  // Official Simplified 8-Category Scale Multipliers
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

  function generateDaftListingCopy(ber, equitySurge, propertyVal) {
    const surgeFormatted = equitySurge.toLocaleString();
    const valFormatted = propertyVal.toLocaleString();

    if (['D', 'E', 'F', 'G'].includes(ber)) {
      // Category 1: The "High-Potential Fixer"
      return `🏡 Green Energy & Retrofitting Potential – Capital Appreciation Opportunity\n\nFor the forward-thinking buyer, this property represents an exceptional opportunity to significantly increase both its energy efficiency and market value, backed by substantial state funding.\n\nA preliminary independent diagnostic assessment via EcoSmartHomes indicates that upgrading this property from its current BER ${ber} rating to a highly efficient A-Rating can unlock an estimated +€${surgeFormatted} in immediate capital equity.\n\n• Grant Funding Available: Up to €25,500 in direct, non-means-tested SEAI cash grants are fully accessible for this specific property archetype to cover heat pump installation, solar PV integration, and advanced insulation upgrades.\n• Purchasing Advantage: Achieving an A-Class rating instantly qualifies this property for a premium Green Mortgage rate (currently averaging 3.45%), potentially saving the incoming buyer over €200 per month in mortgage interest repayments.\n• Independent Verification: A complete independent engineering validation pack and retrofitting roadmap are available upon request to serious bidders to streamline your mortgage approval process.`;
    } else if (['B', 'C'].includes(ber)) {
      // Category 2: The "Mid-Tier Optimizer"
      return `🏡 A-Rated Green Mortgage Potential & Energy Optimization\n\nMaintained to an excellent standard, this modern home currently holds a comfortable BER ${ber} rating. However, it sits right on the threshold of maximum efficiency, offering a seamless path to complete carbon protection.\n\n• The Green Premium: Minor, targeted upgrades via available SEAI grants can comfortably push this home into the coveted A-Rated bracket. This transition instantly qualifies the property for discounted Green Mortgage financing (3.45%), significantly increasing its appeal and affordability to top-tier buyers.\n• Shield Against Rising Costs: Fully optimizing the thermal envelope will drop annual space heating and hot water costs down to a projected €650 a year, acting as a permanent shield against future Irish fuel tax escalators.\n• Next Steps for Bidders: The vendors have sub-contracted an independent engineering pre-survey through EcoSmartHomes. Bidders can access the complete NSAI low-flow radiator compatibility matrix and tailored grant application framework directly from the selling agent.`;
    } else {
      // Category 3: The "Gold Standard" (A, A0)
      return `🏡 Elite A-Class Energy Rating & Low-Carbon Luxury\n\nThis property represents the absolute pinnacle of sustainable Irish housing, boasting an exceptional BER ${ber} rating.\n\n• Maximum Mortgage Discount: This elite rating guarantees immediate access to the lowest 3.45% Green Mortgage interest rates on the Irish market, drastically reducing long-term borrowing costs for the successful purchaser.\n• Absolute Carbon Shielding: Built with advanced thermal envelope technology, this home operates at maximum efficiency with heating bills slashed to an estimated €650 per annum, completely immune to compounding carbon tax penalties.\n• Verified Engineering: Full SEAI compliance documentation and NSAI SR50-2 verification certs on file with the selling agent.`;
    }
  }

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

    // Update Daft.ie Blurb Preview with Category Templates
    const daftBox = document.getElementById('lbl-daft-blurb-text');
    if (daftBox) {
      daftBox.innerText = generateDaftListingCopy(agentCurrentBER, equitySurge, agentPropertyVal);
    }
  }

  window.setAgentBER = function(ber) {
    agentCurrentBER = ber;
    document.querySelectorAll('.agent-ber-pill').forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-ber') === ber);
    });
    updateAgentSurgeCalculations();
  };

  window.onAgentPriceSliderChange = function(val) {
    agentPropertyVal = Number(val);
    updateAgentSurgeCalculations();
  };

  window.onAgentPriceChange = function(priceVal) {
    agentPropertyVal = Number(priceVal);
    updateAgentSurgeCalculations();
  };

  window.setAgentPricePreset = function(val) {
    agentPropertyVal = Number(val);
    const slider = document.getElementById('agent-price-slider') || document.getElementById('agent-price-range');
    if (slider) slider.value = val;
    updateAgentSurgeCalculations();
  };

  window.copyDaftListingBlurb = function() {
    const textEl = document.getElementById('lbl-daft-blurb-text');
    if (!textEl) return;
    const text = textEl.innerText;
    window.copyTextToClipboard(text, 'Copied Daft.ie Listing Blurb to Clipboard!');
    const btn = document.getElementById('btn-copy-daft-action');
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = '✅ Copied to Clipboard! Ready for Daft.ie';
      btn.style.background = '#10b981';
      btn.style.color = '#001711';
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.style.background = '';
        btn.style.color = '';
      }, 2400);
    }
  };

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
  };

  window.copyInstallerTenderDraft = function() {
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
      }, 2400);
    }
  };

  // Auto-init ticker on load
  setTimeout(startLivePenaltyTicker, 800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmartNav);
  } else {
    initSmartNav();
  }
})();

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

  function initMobileIOSAppDock() {
    // 1. Create Fixed Bottom Dock if not present
    if (!document.getElementById('esh-mobile-dock')) {
      const dock = document.createElement('nav');
      dock.id = 'esh-mobile-dock';
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
        <button type="button" class="dock-fab-center" onclick="window.onMobileDockShield()" aria-label="Quick Shield Scan">
          <span>🔄</span>
        </button>
        <button type="button" class="dock-item" onclick="window.onMobileDockReports()" aria-label="Reports & Tools">
          <span class="dock-icon">📋</span>
          <span>Reports</span>
        </button>
        <a href="/checkout/" class="dock-item" aria-label="Checkout Survey">
          <span class="dock-icon">👤</span>
          <span>Checkout</span>
        </a>
      `;
      document.body.appendChild(dock);
    }

    // 2. Create Mobile Tool Sheet Modal if not present
    if (!document.getElementById('esh-mobile-tool-sheet')) {
      const sheet = document.createElement('div');
      sheet.id = 'esh-mobile-tool-sheet';
      sheet.setAttribute('role', 'dialog');
      sheet.setAttribute('aria-modal', 'true');
      sheet.innerHTML = `
        <div class="sheet-handle-bar"></div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <strong style="font-size: 1.2rem; color: #ffffff;">📋 Reports & Energy Engines</strong>
          <button type="button" onclick="window.closeMobileToolSheet()" style="background: rgba(255,255,255,0.1); border: none; color: #fff; width: 32px; height: 32px; border-radius: 50%; font-size: 1rem; cursor: pointer;">✕</button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <a href="/solar/" class="drawer-link-item"><span class="tool-icon">☀️</span><div><div>Solar PV & CEG Simulator</div><div style="font-size:0.72rem;color:#94a3b8;">Eircode irradiance & 24c export cash</div></div></a>
          <a href="/battery-arbitrage/" class="drawer-link-item"><span class="tool-icon">🔋</span><div><div>Smart Battery Arbitrage</div><div style="font-size:0.72rem;color:#94a3b8;">Charge at 7c, slash 38c peak bills</div></div></a>
          <a href="/radiator-sizer/" class="drawer-link-item"><span class="tool-icon">📐</span><div><div>Radiator Low-Flow Sizer</div><div style="font-size:0.72rem;color:#94a3b8;">NSAI SR50-2:2024 compliance</div></div></a>
          <a href="/retrofit-loan/" class="drawer-link-item"><span class="tool-icon">💶</span><div><div>0% Loan & Grant Stacker</div><div style="font-size:0.72rem;color:#94a3b8;">SBCI 3.55% subsidized cashflow</div></div></a>
          <a href="/ber-matrix/" class="drawer-link-item"><span class="tool-icon">🏡</span><div><div>Simplified BER Matrix (A0-G)</div><div style="font-size:0.72rem;color:#94a3b8;">May 2026 SEAI scale & value surge</div></div></a>
          <a href="/tender-generator/" class="drawer-link-item"><span class="tool-icon">📋</span><div><div>Contractor Tender RFP</div><div style="font-size:0.72rem;color:#94a3b8;">NSAI SR50 tender spec & milestone terms</div></div></a>
        </div>
        <div style="margin-top: 24px;">
          <a href="/checkout/" class="btn-hero-primary-star" style="width: 100%; box-sizing: border-box; text-align: center;">
            ⭐ Book Joe's €49 Survey →
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

  // Mobile Dock Handlers
  window.onMobileDockHome = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.setPersona('homeowner');
  };

  window.onMobileDockProfiles = function() {
    const bar = document.querySelector('.persona-filter-bar');
    if (bar) {
      bar.scrollIntoView({ behavior: 'smooth', block: 'center' });
      bar.style.boxShadow = '0 0 30px rgba(52, 245, 197, 0.8)';
      setTimeout(() => bar.style.boxShadow = '', 1600);
    }
  };

  window.onMobileDockShield = function() {
    const wizard = document.getElementById('wallet-rescue-wizard');
    if (wizard) {
      wizard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  window.onMobileDockReports = function() {
    const sheet = document.getElementById('esh-mobile-tool-sheet');
    if (sheet) {
      sheet.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeMobileToolSheet = function() {
    const sheet = document.getElementById('esh-mobile-tool-sheet');
    if (sheet) {
      sheet.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  // Auto-init on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileIOSAppDock);
  } else {
    initMobileIOSAppDock();
  }

