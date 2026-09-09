/**
 * EcoOS: The Universal One-Page Retrofit Operating System
 * Reactive State Bus, Workspace Sheet Controller & Command Palette
 * EcoSmartHomes Ireland
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'esh_os_state_v1';

  // Default Universal Retrofit State
  const DEFAULT_STATE = {
    property: {
      eircode: '',
      county: 'Dublin',
      homeType: 'semi-d',       // detached, semi-d, terrace, apartment
      yearBuilt: 1985,
      floorArea: 135,           // m²
      currentBer: 'G',
      targetBer: 'A0'
    },
    energy: {
      currentFuel: 'oil',       // oil, gas, electric, solid-fuel
      annualFuelSpend: 4200,
      solarPvKw: 4.2,
      hasBattery: false
    },
    financials: {
      estimatedRetrofitCost: 48000,
      eligibleGrants: 35000,
      netPayable: 13000,
      mortgageBalance: 280000,
      greenMortgageSavingMonth: 194
    },
    quotes: [],
    activePersona: 'homeowner',
    activeTool: null
  };

  // Auto-detect embedded mode in iframe
  const isEmbedded = window.parent !== window || window.location.search.includes('embedded=1');
  if (isEmbedded) {
    document.documentElement.setAttribute('data-embedded', 'true');
    const markBody = () => {
      if (document.body) {
        document.body.setAttribute('data-embedded', 'true');
        document.body.classList.add('eco-os-embedded');
      }
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', markBody);
    } else {
      markBody();
    }
  }

  // State Persistence
  function loadInitialState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const stateObj = {
          ...DEFAULT_STATE,
          ...parsed,
          property: { ...DEFAULT_STATE.property, ...(parsed.property || {}) },
          energy: { ...DEFAULT_STATE.energy, ...(parsed.energy || {}) },
          financials: { ...DEFAULT_STATE.financials, ...(parsed.financials || {}) }
        };
        // Migrate legacy 15-band D1/A2 notation to modernized 8-bar scale G/A0
        if (stateObj.property.currentBer === 'D1') {
          stateObj.property.currentBer = 'G';
        }
        if (stateObj.property.targetBer === 'A2') {
          stateObj.property.targetBer = 'A0';
        }
        if (stateObj.financials.eligibleGrants === 10500) {
          stateObj.financials.eligibleGrants = 35000;
        }
        return stateObj;
      }
    } catch (e) {
      console.warn('EcoOS: Could not read localStorage, using default state.', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  let state = loadInitialState();

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('EcoOS: Could not write to localStorage', e);
    }
  }

  // Reactive State Bus
  const ESH_OS = {
    getState: function() {
      return JSON.parse(JSON.stringify(state));
    },

    setState: function(partialState) {
      if (!partialState || typeof partialState !== 'object') return;
      
      if (partialState.property) {
        state.property = { ...state.property, ...partialState.property };
      }
      if (partialState.energy) {
        state.energy = { ...state.energy, ...partialState.energy };
      }
      if (partialState.financials) {
        state.financials = { ...state.financials, ...partialState.financials };
      }
      if (partialState.quotes) {
        state.quotes = partialState.quotes;
      }
      if (partialState.activePersona) {
        state.activePersona = partialState.activePersona;
      }
      if (partialState.activeTool !== undefined) {
        state.activeTool = partialState.activeTool;
      }

      saveState();

      // Dispatch global change event
      const evt = new CustomEvent('esh:state-changed', {
        detail: { state: ESH_OS.getState(), changes: partialState }
      });
      window.dispatchEvent(evt);

      // Broadcast to any active workspace iframe
      broadcastToActiveSheet();
      updateBlueprintWidget();
    },

    resetState: function() {
      state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      saveState();
      window.dispatchEvent(new CustomEvent('esh:state-changed', {
        detail: { state: ESH_OS.getState(), reset: true }
      }));
      broadcastToActiveSheet();
      updateBlueprintWidget();
      if (window.showEshToast) {
        window.showEshToast('Blueprint data reset to defaults', '🔄');
      }
    },

    // Tool Directory Catalog
    tools: [
      {
        id: 'quote-auditor',
        title: 'Contractor Quote Speedometer & Anti-Scam Auditor',
        shortTitle: 'Quote Auditor',
        url: '/quote-auditor/',
        icon: '🛡️',
        badge: 'Red-Line Guard',
        category: 'audit',
        personas: ['homeowner', 'audit', 'installer'],
        description: 'Benchmark quotes against fair SEAI market rates & generate counter-offer checklists.'
      },
      {
        id: 'quote-comparator',
        title: 'Multi-Quote Line-Item Comparator',
        shortTitle: 'Quote Comparator',
        url: '/quote-comparator/',
        icon: '⚖️',
        badge: 'Line-by-Line',
        category: 'audit',
        personas: ['homeowner', 'audit', 'installer'],
        description: 'Upload multiple quotes side-by-side to expose hidden margins and missing items.'
      },
      {
        id: 'ber-matrix',
        title: 'BER A0 to G What-If Valuation & Equity Matrix',
        shortTitle: 'BER Matrix',
        url: '/ber-matrix/',
        icon: '📈',
        badge: 'Official May 2026',
        category: 'agent',
        personas: ['homeowner', 'agent'],
        description: 'Simulate the €38k+ property equity boost from stepping your BER to an A-rating.'
      },
      {
        id: 'green-mortgage',
        title: 'Green Mortgage Rate Arbitrage & Monthly Savings',
        shortTitle: 'Green Mortgage',
        url: '/green-mortgage/',
        icon: '🏦',
        badge: '3.45% Lending',
        category: 'agent',
        personas: ['homeowner', 'agent'],
        description: 'Calculate lifetime interest deductions across AIB, Bank of Ireland & PTSB.'
      },
      {
        id: 'radiator-sizer',
        title: 'NSAI SR50-2 Radiator & Low-Flow 45°C Sizer',
        shortTitle: 'Radiator Sizer',
        url: '/radiator-sizer/',
        icon: '⚡',
        badge: 'NSAI SR50-2',
        category: 'installer',
        personas: ['installer', 'audit'],
        description: 'Calculate Delta-T 30 room-by-room heat loss emitter schedules for heat pump readiness.'
      },
      {
        id: 'tender-generator',
        title: 'SEAI Contractor Works Tender & RFQ Generator',
        shortTitle: 'Tender Spec',
        url: '/tender-generator/',
        icon: '📋',
        badge: 'Legally Binding',
        category: 'installer',
        personas: ['installer', 'homeowner', 'audit'],
        description: 'Generate standardized RFQ work scopes that protect your SEAI grant claim.'
      },
      {
        id: 'digital-twin',
        title: '3D Interactive Irish Home Retrofit Digital Twin',
        shortTitle: 'Digital Twin',
        url: '/digital-twin/',
        icon: '🏠',
        badge: 'Live 3D',
        category: 'all',
        personas: ['homeowner', 'agent', 'all'],
        description: 'Toggle solar panels, heat pumps, and external wrap on an architectural 3D cutaway.'
      },
      {
        id: 'carbon-tax',
        title: 'Carbon Tax Escalation Trajectory Simulator',
        shortTitle: 'Carbon Tax Shield',
        url: '/carbon-tax/',
        icon: '🔥',
        badge: 'Budget 2026-30',
        category: 'homeowner',
        personas: ['homeowner', 'agent'],
        description: 'Calculate your compounding home heating fuel penalty under Irish carbon tax hikes.'
      },
      {
        id: 'battery-arbitrage',
        title: 'Smart Battery Overnight Tariff Arbitrage Sizer',
        shortTitle: 'Battery Arbitrage',
        url: '/battery-arbitrage/',
        icon: '🔋',
        badge: 'Smart Export',
        category: 'homeowner',
        personas: ['homeowner', 'installer'],
        description: 'Maximize day/night rate differences & Clean Export Guarantee feed-in revenue.'
      },
      {
        id: 'solar',
        title: 'Solar PV & Clean Export Guarantee Estimator',
        shortTitle: 'Solar PV Sizer',
        url: '/solar/',
        icon: '☀️',
        badge: 'Zero VAT',
        category: 'homeowner',
        personas: ['homeowner', 'installer'],
        description: 'Model roof orientation, kW output, zero-VAT savings, and €2,100 SEAI grants.'
      },
      {
        id: 'wrap-simulator',
        title: 'Fabric-First External Wall Insulation Simulator',
        shortTitle: 'Wrap Simulator',
        url: '/wrap-simulator/',
        icon: '🧱',
        badge: '€8,000 Grant',
        category: 'homeowner',
        personas: ['homeowner', 'installer'],
        description: 'Simulate external wall insulation u-values, condensation dew-points, and comfort.'
      },
      {
        id: 'retrofit-loan',
        title: 'Low-Cost Home Energy Upgrade Loan Calculator',
        shortTitle: 'Retrofit Loan',
        url: '/retrofit-loan/',
        icon: '💶',
        badge: '3.55% SBCI',
        category: 'homeowner',
        personas: ['homeowner', 'agent'],
        description: 'Calculate monthly repayment on government-backed low-interest retrofit financing.'
      },
      {
        id: 'property-auditor',
        title: 'Commercial & Multi-Unit Property Auditor',
        shortTitle: 'Property Auditor',
        url: '/property-auditor/',
        icon: '🏢',
        badge: 'Multi-Unit',
        category: 'agent',
        personas: ['agent', 'audit'],
        description: 'Screen apartment blocks, portfolios, and rental properties for compliance.'
      },
      {
        id: 'contractors',
        title: 'Verified NSAI Contractor & Heat Pump Directory',
        shortTitle: 'Contractors',
        url: '/contractors/',
        icon: '👷',
        badge: 'Vetted Guild',
        category: 'installer',
        personas: ['homeowner', 'installer', 'audit'],
        description: 'Find SEAI registered and vetted heat pump and solar contractors by county.'
      },
      {
        id: 'heat-pump-suitability',
        title: 'Heat Pump Suitability & Heat Loss Indicator Index',
        shortTitle: 'Heat Pump Check',
        url: '/heat-pump-suitability.html',
        icon: '❄️',
        badge: 'HLI Sizer',
        category: 'installer',
        personas: ['homeowner', 'installer'],
        description: 'Ensure your home meets the SEAI HLI threshold before installing a heat pump.'
      },
      {
        id: 'voice-aoife',
        title: 'Aoife — AI Homeowner Energy Advisor',
        shortTitle: 'Advisor Aoife',
        url: '/tools/voice-aoife.html',
        icon: '🎙️',
        badge: 'Voice AI',
        category: 'homeowner',
        personas: ['homeowner'],
        description: 'Interactive natural-voice guidance on grants, insulation sequences, and payback.'
      },
      {
        id: 'voice-declan',
        title: 'Declan — AI Technical Sizing & NSAI Specialist',
        shortTitle: 'Advisor Declan',
        url: '/tools/voice-declan.html',
        icon: '🎙️',
        badge: 'Voice AI',
        category: 'installer',
        personas: ['installer', 'audit'],
        description: 'Technical heating engineer voice agent for SR50-2 compliance and tender specs.'
      },
      {
        id: 'voice-eimear',
        title: 'Eimear — AI Estate Agent & Valuation Specialist',
        shortTitle: 'Advisor Eimear',
        url: '/tools/voice-eimear.html',
        icon: '🎙️',
        badge: 'Voice AI',
        category: 'agent',
        personas: ['agent'],
        description: 'Real estate energy valuation advisor for BER capital appreciation and sale yields.'
      }
    ],

    // Workspace Sheet / Focus Modal Controller
    openToolSheet: function(toolId) {
      const tool = ESH_OS.tools.find(t => t.id === toolId);
      if (!tool) {
        console.warn('EcoOS: Tool not found', toolId);
        return;
      }

      state.activeTool = toolId;
      saveState();

      let sheet = document.getElementById('eco-os-workspace-sheet');
      if (!sheet) {
        sheet = createWorkspaceSheetElement();
      }

      const frame = document.getElementById('eco-os-sheet-iframe');
      const titleEl = document.getElementById('eco-os-sheet-title');
      const badgeEl = document.getElementById('eco-os-sheet-badge');
      const externalLink = document.getElementById('eco-os-sheet-external-link');
      const loader = document.getElementById('eco-os-sheet-loader');

      if (titleEl) titleEl.innerHTML = `<span>${tool.icon}</span> <span>${tool.title}</span>`;
      if (badgeEl) badgeEl.innerText = tool.badge || 'EcoOS Active';
      if (externalLink) externalLink.href = tool.url;

      if (loader) loader.style.display = 'flex';
      if (frame) {
        const urlWithParams = tool.url.includes('?') 
          ? `${tool.url}&embedded=1&origin=eco_os` 
          : `${tool.url}?embedded=1&origin=eco_os`;
        
        frame.src = urlWithParams;
        frame.onload = function() {
          if (loader) loader.style.display = 'none';
          try {
            frame.contentWindow.postMessage({
              type: 'ESH_STATE_INIT',
              state: ESH_OS.getState()
            }, '*');
          } catch (e) {}
        };
      }

      sheet.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Update URL without page reload
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('tool', toolId);
        window.history.replaceState({ tool: toolId }, '', url.toString());
      } catch (e) {}

      if (window.triggerHaptic) window.triggerHaptic(12);
    },

    closeToolSheet: function() {
      state.activeTool = null;
      saveState();

      const sheet = document.getElementById('eco-os-workspace-sheet');
      if (sheet) {
        sheet.classList.remove('active');
      }
      document.body.style.overflow = '';

      const frame = document.getElementById('eco-os-sheet-iframe');
      if (frame) {
        // Clear iframe to free memory
        setTimeout(() => {
          if (!sheet || !sheet.classList.contains('active')) {
            frame.src = 'about:blank';
          }
        }, 300);
      }

      // Restore URL parameter
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('tool');
        window.history.replaceState({}, '', url.toString());
      } catch (e) {}

      if (window.triggerHaptic) window.triggerHaptic(8);
    },

    // Command Palette Controller
    openCommandPalette: function() {
      let palette = document.getElementById('eco-os-command-palette');
      if (!palette) {
        palette = createCommandPaletteElement();
      }
      palette.classList.add('active');
      const input = document.getElementById('eco-os-command-input');
      if (input) {
        input.value = '';
        input.focus();
        renderCommandResults('');
      }
      document.body.style.overflow = 'hidden';
      if (window.triggerHaptic) window.triggerHaptic(10);
    },

    closeCommandPalette: function() {
      const palette = document.getElementById('eco-os-command-palette');
      if (palette) {
        palette.classList.remove('active');
      }
      document.body.style.overflow = '';
    }
  };

  // Broadcast state changes into active iframe
  function broadcastToActiveSheet() {
    const frame = document.getElementById('eco-os-sheet-iframe');
    if (frame && frame.contentWindow) {
      try {
        frame.contentWindow.postMessage({
          type: 'ESH_STATE_UPDATE',
          state: ESH_OS.getState()
        }, '*');
      } catch (e) {}
    }
  }

  // Listen for state messages from child tool iframes
  window.addEventListener('message', function(e) {
    if (!e.data || typeof e.data !== 'object') return;
    if (e.data.type === 'ESH_STATE_UPDATE' && e.data.updates) {
      ESH_OS.setState(e.data.updates);
    } else if (e.data.type === 'ESH_CLOSE_SHEET') {
      ESH_OS.closeToolSheet();
    }
  });

  // Create Workspace Sheet Modal DOM
  function createWorkspaceSheetElement() {
    const sheet = document.createElement('div');
    sheet.id = 'eco-os-workspace-sheet';
    sheet.className = 'eco-os-workspace-sheet';
    sheet.innerHTML = `
      <div class="eco-os-sheet-backdrop" id="eco-os-sheet-backdrop"></div>
      <div class="eco-os-sheet-window">
        <div class="eco-os-sheet-header">
          <div class="eco-os-sheet-header-left">
            <h3 id="eco-os-sheet-title" class="eco-os-sheet-title"><span>⚙️</span> EcoOS Tool</h3>
            <span id="eco-os-sheet-badge" class="eco-os-sheet-badge">Active Workspace</span>
          </div>
          <div class="eco-os-sheet-header-actions">
            <button id="eco-os-sync-indicator" class="eco-os-sync-indicator" title="Universal Blueprint State Synced" onclick="ESH_OS.resetState()">
              <span>🟢 Live Synced</span>
            </button>
            <a id="eco-os-sheet-external-link" href="#" target="_blank" class="eco-os-sheet-ext-btn" title="Open in dedicated tab">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
            <button id="eco-os-sheet-close-btn" class="eco-os-sheet-close-btn" title="Close Workspace (Esc)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
        <div class="eco-os-sheet-body">
          <div id="eco-os-sheet-loader" class="eco-os-sheet-loader">
            <div class="eco-os-spinner"></div>
            <p>Initializing Real-Time Irish Building Engine...</p>
          </div>
          <iframe id="eco-os-sheet-iframe" class="eco-os-sheet-iframe" src="about:blank" frameborder="0"></iframe>
        </div>
      </div>
    `;
    document.body.appendChild(sheet);

    // Bind Close events
    document.getElementById('eco-os-sheet-backdrop').addEventListener('click', ESH_OS.closeToolSheet);
    document.getElementById('eco-os-sheet-close-btn').addEventListener('click', ESH_OS.closeToolSheet);

    return sheet;
  }

  // Create Command Palette DOM
  function createCommandPaletteElement() {
    const pal = document.createElement('div');
    pal.id = 'eco-os-command-palette';
    pal.className = 'eco-os-command-palette';
    pal.innerHTML = `
      <div class="eco-os-palette-backdrop" id="eco-os-palette-backdrop"></div>
      <div class="eco-os-palette-dialog">
        <div class="eco-os-palette-search-bar">
          <svg class="eco-os-palette-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="eco-os-command-input" class="eco-os-command-input" placeholder="Search calculators, grants, BER matrix, quote tools... (ESC to exit)" autocomplete="off">
          <span class="eco-os-palette-esc">ESC</span>
        </div>
        <div class="eco-os-palette-results" id="eco-os-palette-results"></div>
        <div class="eco-os-palette-footer">
          <span>Tip: Press <strong>Ctrl + K</strong> anywhere to open this menu</span>
          <span>Powered by <strong>EcoOS</strong></span>
        </div>
      </div>
    `;
    document.body.appendChild(pal);

    const input = document.getElementById('eco-os-command-input');
    input.addEventListener('input', (e) => renderCommandResults(e.target.value));

    document.getElementById('eco-os-palette-backdrop').addEventListener('click', ESH_OS.closeCommandPalette);

    return pal;
  }

  function renderCommandResults(query) {
    const listEl = document.getElementById('eco-os-palette-results');
    if (!listEl) return;

    const q = (query || '').toLowerCase().trim();
    const filtered = ESH_OS.tools.filter(tool => {
      if (!q) return true;
      return tool.title.toLowerCase().includes(q) ||
             tool.shortTitle.toLowerCase().includes(q) ||
             tool.description.toLowerCase().includes(q) ||
             tool.category.toLowerCase().includes(q) ||
             (tool.badge && tool.badge.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="eco-os-palette-empty">
          <p>No tools found matching "<strong>${query}</strong>"</p>
          <button class="eco-os-palette-quick-btn" onclick="ESH_OS.openToolSheet('quote-auditor'); ESH_OS.closeCommandPalette();">Launch Quote Auditor →</button>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered.map(tool => `
      <a href="${tool.url}" class="eco-os-palette-item" onclick="ESH_OS.closeCommandPalette();" style="text-decoration: none;">
        <div class="eco-os-palette-item-icon">${tool.icon}</div>
        <div class="eco-os-palette-item-content">
          <div class="eco-os-palette-item-title-row">
            <span class="eco-os-palette-item-title">${tool.title}</span>
            <span class="eco-os-palette-item-badge">${tool.badge}</span>
          </div>
          <div class="eco-os-palette-item-desc">${tool.description}</div>
        </div>
        <div class="eco-os-palette-item-action">Launch →</div>
      </a>
    `).join('');
  }

  // Floating Live Blueprint Widget
  function updateBlueprintWidget() {
    let widget = document.getElementById('eco-os-floating-blueprint');
    if (!widget) {
      widget = document.createElement('div');
      widget.id = 'eco-os-floating-blueprint';
      widget.className = 'eco-os-floating-blueprint';
      document.body.appendChild(widget);
    }

    const p = state.property;
    const f = state.financials;
    const formattedGrants = f.eligibleGrants ? `€${f.eligibleGrants.toLocaleString()}` : '€35,000';
    const homeLabel = p.homeType.charAt(0).toUpperCase() + p.homeType.slice(1);

    widget.innerHTML = `
      <button class="eco-os-blueprint-pill" onclick="ESH_OS.openCommandPalette()" title="Press Ctrl+K to jump to any tool">
        <span class="eco-os-blueprint-pulse"></span>
        <span class="eco-os-blueprint-tag">EcoOS Live</span>
        <span class="eco-os-blueprint-prop">${homeLabel} (${p.floorArea}m²)</span>
        <span class="eco-os-blueprint-ber">${p.currentBer} ➔ ${p.targetBer}</span>
        <span class="eco-os-blueprint-grant">${formattedGrants} Grants</span>
        <span class="eco-os-blueprint-cmd">⌘K</span>
      </button>
    `;
  }

  // Intercept in-app clicks to tool routes
  function initLinkInterception() {
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a');
      if (!link) return;

      // Only intercept if explicitly requested via data-tool-sheet
      const explicitTool = link.getAttribute('data-tool-sheet');
      if (explicitTool) {
        e.preventDefault();
        ESH_OS.openToolSheet(explicitTool);
        return;
      }
    });

    // Keyboard Shortcuts (Ctrl+K or Cmd+K or ESC)
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const pal = document.getElementById('eco-os-command-palette');
        if (pal && pal.classList.contains('active')) {
          ESH_OS.closeCommandPalette();
        } else {
          ESH_OS.openCommandPalette();
        }
      } else if (e.key === 'Escape') {
        ESH_OS.closeToolSheet();
        ESH_OS.closeCommandPalette();
      }
    });
  }

  // Restore on page load if ?tool= is present in URL
  function restoreFromUrl() {
    try {
      const params = new URLSearchParams(window.location.search);
      const toolParam = params.get('tool');
      if (toolParam) {
        setTimeout(() => {
          ESH_OS.openToolSheet(toolParam);
        }, 200);
      }
    } catch (e) {}
  }

  // Expose Globally
  window.ESH_OS = ESH_OS;

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initLinkInterception();
      updateBlueprintWidget();
      restoreFromUrl();
    });
  } else {
    initLinkInterception();
    updateBlueprintWidget();
    restoreFromUrl();
  }
})();
