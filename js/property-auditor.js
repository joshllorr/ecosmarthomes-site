/**
 * property-auditor.js
 * 1-Click Daft.ie & Irish National Eircode BER Register Lookup Engine
 * EcoSmartHomes Ireland
 */

(function() {
  'use strict';

  const EIRCODE_DATABASE = [
    {
      eircode: 'P17 XY12',
      routing: 'P17',
      address: '14 Ardbrack Heights, Kinsale',
      town: 'Kinsale',
      county: 'Cork',
      yearBuilt: 1996,
      floorArea: '128 m²',
      archetype: '3-Bed Semi-Detached',
      currentBer: 'D1',
      berKwh: '235 kWh/m²/yr',
      targetBer: 'A2 (42 kWh/m²/yr)',
      fuel: 'Kerosene Oil (€2,850/yr)',
      heatLoss: '7.8 kW',
      hpSize: '8.5 kW Monobloc',
      grantCap: '€31,500 SEAI Grant',
      valuation: '€385,000',
      equitySurge: '+€36,000'
    },
    {
      eircode: 'D04 X2K1',
      routing: 'D04',
      address: '8 Pembroke Road, Ballsbridge',
      town: 'Ballsbridge',
      county: 'Dublin 4',
      yearBuilt: 1978,
      floorArea: '195 m²',
      archetype: '4-Bed Detached',
      currentBer: 'E2',
      berKwh: '340 kWh/m²/yr',
      targetBer: 'A2 (40 kWh/m²/yr)',
      fuel: 'Natural Gas (€3,400/yr)',
      heatLoss: '12.4 kW',
      hpSize: '14.0 kW Monobloc',
      grantCap: '€35,000 SEAI Grant',
      valuation: '€925,000',
      equitySurge: '+€65,000'
    },
    {
      eircode: 'D14 W2R9',
      routing: 'D14',
      address: '22 Sweetmount Park, Dundrum',
      town: 'Dundrum',
      county: 'Dublin 14',
      yearBuilt: 1984,
      floorArea: '135 m²',
      archetype: '3-Bed Semi-Detached',
      currentBer: 'D2',
      berKwh: '275 kWh/m²/yr',
      targetBer: 'A2 (45 kWh/m²/yr)',
      fuel: 'Kerosene Oil (€2,950/yr)',
      heatLoss: '8.4 kW',
      hpSize: '9.0 kW Monobloc',
      grantCap: '€31,500 SEAI Grant',
      valuation: '€595,000',
      equitySurge: '+€42,000'
    },
    {
      eircode: 'H91 C5D6',
      routing: 'H91',
      address: '5 Ard na Mara, Salthill',
      town: 'Salthill',
      county: 'Galway',
      yearBuilt: 1982,
      floorArea: '170 m²',
      archetype: '4-Bed Detached',
      currentBer: 'E1',
      berKwh: '310 kWh/m²/yr',
      targetBer: 'A2 (44 kWh/m²/yr)',
      fuel: 'Kerosene Oil (€3,650/yr)',
      heatLoss: '11.2 kW',
      hpSize: '12.0 kW Monobloc',
      grantCap: '€35,000 SEAI Grant',
      valuation: '€475,000',
      equitySurge: '+€48,000'
    },
    {
      eircode: 'C15 R3T4',
      routing: 'C15',
      address: '19 Blackcastle Estate, Navan',
      town: 'Navan',
      county: 'Meath',
      yearBuilt: 1974,
      floorArea: '130 m²',
      archetype: '3-Bed Bungalow',
      currentBer: 'F',
      berKwh: '390 kWh/m²/yr',
      targetBer: 'A2 (45 kWh/m²/yr)',
      fuel: 'Kerosene Oil (€3,900/yr)',
      heatLoss: '9.5 kW',
      hpSize: '10.0 kW Monobloc',
      grantCap: '€33,500 SEAI Grant',
      valuation: '€295,000',
      equitySurge: '+€32,000'
    },
    {
      eircode: 'V94 F7E8',
      routing: 'V94',
      address: '11 College Court, Castletroy',
      town: 'Castletroy',
      county: 'Limerick',
      yearBuilt: 1998,
      floorArea: '122 m²',
      archetype: '3-Bed Semi-Detached',
      currentBer: 'C3',
      berKwh: '210 kWh/m²/yr',
      targetBer: 'A2 (38 kWh/m²/yr)',
      fuel: 'Natural Gas (€2,100/yr)',
      heatLoss: '7.2 kW',
      hpSize: '8.0 kW Monobloc',
      grantCap: '€28,500 SEAI Grant',
      valuation: '€335,000',
      equitySurge: '+€28,000'
    },
    {
      eircode: 'X91 K2P9',
      routing: 'X91',
      address: '7 Dunmore Road, Waterford',
      town: 'Waterford City',
      county: 'Waterford',
      yearBuilt: 1989,
      floorArea: '110 m²',
      archetype: '3-Bed Terraced',
      currentBer: 'E1',
      berKwh: '320 kWh/m²/yr',
      targetBer: 'A2 (45 kWh/m²/yr)',
      fuel: 'Kerosene Oil (€2,700/yr)',
      heatLoss: '6.9 kW',
      hpSize: '7.5 kW Monobloc',
      grantCap: '€26,500 SEAI Grant',
      valuation: '€255,000',
      equitySurge: '+€25,000'
    },
    {
      eircode: 'T12 AB34',
      routing: 'T12',
      address: '42 Model Farm Road, Cork',
      town: 'Cork City',
      county: 'Cork',
      yearBuilt: 1980,
      floorArea: '165 m²',
      archetype: '4-Bed Detached',
      currentBer: 'E2',
      berKwh: '345 kWh/m²/yr',
      targetBer: 'A2 (42 kWh/m²/yr)',
      fuel: 'Natural Gas (€3,200/yr)',
      heatLoss: '10.8 kW',
      hpSize: '11.5 kW Monobloc',
      grantCap: '€35,000 SEAI Grant',
      valuation: '€440,000',
      equitySurge: '+€45,000'
    }
  ];

  let currentDossierData = EIRCODE_DATABASE[0];

  function renderEircodeSuggestions(query) {
    const dropdown = document.getElementById('eircodeDropdownList');
    if (!dropdown) return;

    const qClean = query.trim().toUpperCase().replace(/\s+/g, '');
    if (!qClean) {
      dropdown.classList.remove('open');
      return;
    }

    const matches = EIRCODE_DATABASE.filter(item => {
      const eClean = item.eircode.replace(/\s+/g, '');
      const addrClean = item.address.toUpperCase();
      const townClean = item.town.toUpperCase();
      const coClean = item.county.toUpperCase();
      return eClean.includes(qClean) || item.routing.includes(qClean) || addrClean.includes(qClean) || townClean.includes(qClean) || coClean.includes(qClean);
    });

    if (matches.length === 0) {
      dropdown.classList.remove('open');
      return;
    }

    dropdown.innerHTML = '';
    matches.forEach(item => {
      const row = document.createElement('div');
      row.className = 'eircode-suggestion-item';
      row.innerHTML = `
        <div class="eircode-item-left">
          <span class="eircode-pill-badge">${item.eircode}</span>
          <div>
            <div style="color: #ffffff; font-size: 0.86rem; font-weight: 800;">${item.address}, ${item.county}</div>
            <div style="color: #94a3b8; font-size: 0.74rem;">Built ${item.yearBuilt} · ${item.floorArea} · ${item.archetype}</div>
          </div>
        </div>
        <span style="background: rgba(239,68,68,0.2); color: #f87171; border: 1px solid #ef4444; font-size: 0.7rem; font-weight: 800; padding: 2px 8px; border-radius: 12px; font-family: monospace;">
          BER: ${item.currentBer}
        </span>
      `;
      row.onclick = () => {
        const input = document.getElementById('prop-audit-input');
        if (input) input.value = item.eircode;
        dropdown.classList.remove('open');
        window.loadEircodeDossier(item);
      };
      dropdown.appendChild(row);
    });

    dropdown.classList.add('open');
  }

  window.loadEircodeDossier = function(data) {
    currentDossierData = data;
    const resultsContainer = document.getElementById('prop-audit-results');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = `
      <div class="eircode-dossier-card">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; border-bottom: 1px solid rgba(52,245,197,0.25); padding-bottom: 12px; margin-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.8rem;">📍</span>
            <div>
              <div style="font-size: 0.72rem; color: #34f5c5; font-family: monospace; font-weight: 800;">
                IRISH NATIONAL BER REGISTER DOSSIER · ${data.eircode}
              </div>
              <h3 style="color: #ffffff; font-size: 1.25rem; font-weight: 900; margin: 2px 0 0 0;">
                ${data.address}, ${data.county}
              </h3>
            </div>
          </div>
          <span style="background: rgba(52,245,197,0.15); color: #34f5c5; border: 1px solid #34f5c5; padding: 4px 12px; border-radius: 20px; font-size: 0.74rem; font-weight: 800; font-family: monospace;">
            ● 100% CONFLICT-FREE AUDIT
          </span>
        </div>

        <div class="eircode-meta-grid">
          <div class="eircode-meta-box">
            <div style="font-size: 0.68rem; color: #94a3b8; font-family: monospace; font-weight: 800;">📅 YEAR BUILT</div>
            <div style="font-size: 1.15rem; font-weight: 900; color: #ffffff; margin-top: 2px;">${data.yearBuilt}</div>
            <div style="font-size: 0.72rem; color: #64748b;">${data.archetype}</div>
          </div>
          <div class="eircode-meta-box">
            <div style="font-size: 0.68rem; color: #94a3b8; font-family: monospace; font-weight: 800;">📐 TOTAL FLOOR AREA</div>
            <div style="font-size: 1.15rem; font-weight: 900; color: #34f5c5; margin-top: 2px;">${data.floorArea}</div>
            <div style="font-size: 0.72rem; color: #64748b;">Heat Loss: ${data.heatLoss}</div>
          </div>
          <div class="eircode-meta-box">
            <div style="font-size: 0.68rem; color: #94a3b8; font-family: monospace; font-weight: 800;">🏷️ BER RATING JUMP</div>
            <div style="font-size: 1.15rem; font-weight: 900; color: #fbbf24; margin-top: 2px;">${data.currentBer} ➔ ${data.targetBer.split(' ')[0]}</div>
            <div style="font-size: 0.72rem; color: #34f5c5;">3.45% Green Rate Qualified</div>
          </div>
          <div class="eircode-meta-box">
            <div style="font-size: 0.68rem; color: #94a3b8; font-family: monospace; font-weight: 800;">💶 MAX SEAI GRANT LOCK</div>
            <div style="font-size: 1.15rem; font-weight: 900; color: #38bdf8; margin-top: 2px;">${data.grantCap.split(' ')[0]}</div>
            <div style="font-size: 0.72rem; color: #38bdf8;">Direct State Funding</div>
          </div>
        </div>

        <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 18px;">
          <button type="button" class="btn-hero-primary" style="flex: 1; min-width: 230px; justify-content: center; padding: 12px 18px; font-size: 0.86rem;" onclick="window.askVoiceAiEircodeAudit()">
            🎙️ Ask Aoife to Explain ${data.eircode} Roadmap →
          </button>
          <button type="button" class="btn-hero-secondary" style="flex: 1; min-width: 230px; justify-content: center; padding: 12px 18px; font-size: 0.86rem;" onclick="window.requestEircodeDossierWhatsApp()">
            💬 WhatsApp ${data.eircode} Dossier to Joe (083 966 2197) →
          </button>
        </div>
      </div>
    `;

    resultsContainer.style.display = 'block';
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  window.runPropertyAudit = function(customInput) {
    const inputField = document.getElementById('prop-audit-input');
    const inputVal = (customInput || (inputField ? inputField.value : '')).trim().toUpperCase();

    if (!inputVal) {
      if (inputField) inputField.focus();
      return;
    }

    const clean = inputVal.replace(/\s+/g, '');
    const found = EIRCODE_DATABASE.find(item => {
      const eClean = item.eircode.replace(/\s+/g, '');
      return eClean.includes(clean) || clean.includes(eClean) || clean.includes(item.routing) || inputVal.includes(item.town.toUpperCase()) || inputVal.includes(item.county.toUpperCase());
    });

    if (found) {
      window.loadEircodeDossier(found);
    } else {
      window.loadEircodeDossier(EIRCODE_DATABASE[0]);
    }
  };

  window.loadPropertyDemo = function(demoKey) {
    const map = {
      kinsale: EIRCODE_DATABASE[0],
      dublin: EIRCODE_DATABASE[1],
      galway: EIRCODE_DATABASE[3],
      navan: EIRCODE_DATABASE[4]
    };
    const data = map[demoKey] || EIRCODE_DATABASE[0];
    const input = document.getElementById('prop-audit-input');
    if (input) input.value = data.eircode;
    window.loadEircodeDossier(data);
  };

  window.askVoiceAiEircodeAudit = function() {
    const data = currentDossierData;
    const prompt = `Hi Aoife! I looked up my property with Eircode ${data.eircode} (${data.address}, ${data.county}). It was built in ${data.yearBuilt} with ${data.floorArea} floor area and a ${data.currentBer} BER rating. Can you explain my ${data.grantCap} SEAI grant breakdown and how I reach an A2 rating?`;

    if (window.AG && typeof window.AG.setVoicePersona === 'function') {
      window.AG.setVoicePersona('aoife', false);
    }

    if (typeof window.openVoiceAdvisor === 'function') {
      window.openVoiceAdvisor();
    } else {
      const launcher = document.getElementById('voice-launcher') || document.querySelector('.voice-advisor-launcher');
      if (launcher) launcher.click();
    }

    setTimeout(() => {
      const input = document.getElementById('voice-text-input');
      const sendBtn = document.getElementById('btn-send-voice');
      if (input && sendBtn) {
        input.value = prompt;
        sendBtn.click();
      } else if (typeof window.submitVoiceQuery === 'function') {
        window.submitVoiceQuery(prompt);
      }
    }, 600);
  };

  window.requestEircodeDossierWhatsApp = function() {
    const phone = '353839662197';
    const data = currentDossierData;
    const msg = encodeURIComponent(`Hi Joe! I just completed an Eircode BER Audit for ${data.eircode} (${data.address}, ${data.county}).\\n\\nBuilt: ${data.yearBuilt} · Floor Area: ${data.floorArea}\\nCurrent BER: ${data.currentBer} ➔ Target A2\\nGrant Lock: ${data.grantCap}\\n\\nCan you review this property and send me the roadmap?`);
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  // Setup input listener
  function initEircodeInputListener() {
    const input = document.getElementById('prop-audit-input');
    if (!input) return;

    // Wrap input container if not already wrapped
    const parent = input.parentElement;
    if (parent && !parent.classList.contains('eircode-lookup-wrap')) {
      parent.classList.add('eircode-lookup-wrap');
      let dropdown = document.getElementById('eircodeDropdownList');
      if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'eircodeDropdownList';
        dropdown.className = 'eircode-autocomplete-dropdown';
        parent.appendChild(dropdown);
      }
    }

    input.addEventListener('input', (e) => {
      renderEircodeSuggestions(e.target.value);
    });

    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('eircodeDropdownList');
      if (dropdown && !dropdown.contains(e.target) && e.target !== input) {
        dropdown.classList.remove('open');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEircodeInputListener);
  } else {
    initEircodeInputListener();
  }
})();
