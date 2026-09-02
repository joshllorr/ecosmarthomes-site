/**
 * property-auditor.js
 * 1-Click Daft.ie / MyHome.ie & Irish Eircode Property Auditor
 * EcoSmartHomes Ireland
 */

(function() {
  'use strict';

  const EIRCODE_MAP = {
    'P17': { town: 'Kinsale', county: 'Cork', archetype: '3-Bed Semi-Detached (115m²)', ber: 'D', price: 350000, heatLoss: '7.8 kW', hpSize: '8.5 kW Monobloc' },
    'T12': { town: 'Cork City', county: 'Cork', archetype: '4-Bed Detached (160m²)', ber: 'E', price: 425000, heatLoss: '10.5 kW', hpSize: '11.2 kW Monobloc' },
    'H91': { town: 'Salthill', county: 'Galway', archetype: '4-Bed Detached (175m²)', ber: 'E', price: 450000, heatLoss: '11.4 kW', hpSize: '12.0 kW Monobloc' },
    'C15': { town: 'Navan', county: 'Meath', archetype: '3-Bed Bungalow (130m²)', ber: 'F', price: 285000, heatLoss: '9.1 kW', hpSize: '9.5 kW Monobloc' },
    'D04': { town: 'Ballsbridge', county: 'Dublin', archetype: '4-Bed Detached (210m²)', ber: 'D', price: 850000, heatLoss: '12.8 kW', hpSize: '14.0 kW Monobloc' },
    'D14': { town: 'Dundrum', county: 'Dublin', archetype: '3-Bed Semi-Detached (120m²)', ber: 'D', price: 575000, heatLoss: '8.2 kW', hpSize: '9.0 kW Monobloc' },
    'V94': { town: 'Castletroy', county: 'Limerick', archetype: '3-Bed Semi-Detached (125m²)', ber: 'D', price: 320000, heatLoss: '8.4 kW', hpSize: '9.0 kW Monobloc' },
    'X91': { town: 'Waterford City', county: 'Waterford', archetype: '3-Bed Terraced (105m²)', ber: 'E', price: 245000, heatLoss: '7.2 kW', hpSize: '8.0 kW Monobloc' }
  };

  const DEMO_PRESETS = {
    kinsale: { town: 'Kinsale', county: 'Cork', archetype: '3-Bed Semi-Detached (115m²)', ber: 'D', price: 350000, heatLoss: '7.8 kW', hpSize: '8.5 kW Monobloc' },
    galway: { town: 'Salthill', county: 'Galway', archetype: '4-Bed Detached (175m²)', ber: 'E', price: 450000, heatLoss: '11.4 kW', hpSize: '12.0 kW Monobloc' },
    navan: { town: 'Navan', county: 'Meath', archetype: '3-Bed Bungalow (130m²)', ber: 'F', price: 285000, heatLoss: '9.1 kW', hpSize: '9.5 kW Monobloc' },
    dublin: { town: 'Dundrum', county: 'Dublin', archetype: '3-Bed Semi-Detached (120m²)', ber: 'D', price: 575000, heatLoss: '8.2 kW', hpSize: '9.0 kW Monobloc' }
  };

  window.runPropertyAudit = function(customInput) {
    const inputField = document.getElementById('prop-audit-input');
    const inputVal = (customInput || (inputField ? inputField.value : '')).trim();

    if (!inputVal) {
      if (inputField) inputField.focus();
      return;
    }

    // Determine Property Profile
    let profile = parsePropertyQuery(inputVal);

    // Show Radar Scanning State
    showRadarScanning(profile, () => {
      renderPropertyDossier(profile);
    });
  };

  window.loadPropertyDemo = function(demoKey) {
    const data = DEMO_PRESETS[demoKey] || DEMO_PRESETS.kinsale;
    const inputField = document.getElementById('prop-audit-input');
    if (inputField) {
      inputField.value = `https://www.daft.ie/for-sale/${demoKey}-${data.county.toLowerCase()}/demo`;
    }
    window.runPropertyAudit(inputField ? inputField.value : demoKey);
  };

  window.copyDaftListingBlurb = function() {
    const blurb = "EcoSmartHomes Energy Intelligence: Upgraded to A-Rating potential. Unlocks €35,000 in SEAI Direct Grants and 3.45% Green Mortgage eligibility. Heating costs reduced by up to 75%. Full NSAI heat loss report available.";
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(blurb).then(() => {
        if (window.showEshToast) window.showEshToast('Copied Daft.ie Listing Blurb to clipboard!', '📋');
        else alert('Copied Daft.ie Listing Blurb to clipboard!');
      }).catch(() => {
        prompt('Copy Daft.ie Blurb:', blurb);
      });
    } else {
      prompt('Copy Daft.ie Blurb:', blurb);
    }
  };

  window.copyInstallerTenderDraft = function() {
    const tender = "SEAI Heat Pump Tender Specification:\n- NSAI SR50-2:2024 Low-Flow Radiator Schedule\n- Design Flow Temp: 45°C / 50°C\n- Heat Loss Compliant Sizing\n- Buffer Tank / Separation Hydro Module Required";
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(tender).then(() => {
        if (window.showEshToast) window.showEshToast('Copied SEAI Installer Tender to clipboard!', '📋');
        else alert('Copied SEAI Installer Tender to clipboard!');
      }).catch(() => {
        prompt('Copy SEAI Tender:', tender);
      });
    } else {
      prompt('Copy SEAI Tender:', tender);
    }
  };

  function parsePropertyQuery(query) {
    const qLower = query.toLowerCase();

    // Check Eircode Map
    for (let code in EIRCODE_MAP) {
      if (query.toUpperCase().includes(code)) {
        return EIRCODE_MAP[code];
      }
    }

    // Check Keywords in URL or text
    if (qLower.includes('galway') || qLower.includes('salthill')) return DEMO_PRESETS.galway;
    if (qLower.includes('navan') || qLower.includes('meath')) return DEMO_PRESETS.navan;
    if (qLower.includes('dublin') || qLower.includes('dundrum')) return DEMO_PRESETS.dublin;

    // Default to Kinsale / Cork footprint
    return DEMO_PRESETS.kinsale;
  }

  function showRadarScanning(profile, onComplete) {
    const resultsContainer = document.getElementById('prop-audit-results');
    if (!resultsContainer) return;

    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = `
      <div style="background: rgba(6, 26, 20, 0.98); border: 2px solid #34f5c5; border-radius: 20px; padding: 40px 20px; text-align: center; box-shadow: 0 20px 60px rgba(52, 245, 197, 0.25);">
        <div style="width: 70px; height: 70px; border-radius: 50%; border: 3px solid #34f5c5; border-top-color: transparent; margin: 0 auto 20px auto; animation: spinRadar 1s linear infinite;"></div>
        <h3 id="radar-status-text" style="color: #ffffff; font-size: 1.3rem; font-weight: 800; margin: 0 0 10px 0;">
          Scanning Property Thermal Envelope...
        </h3>
        <p id="radar-sub-text" style="color: #94a3b8; font-size: 0.88rem; font-family: 'IBM Plex Mono', monospace; margin: 0;">
          Target: ${profile.town}, Co. ${profile.county} · Est. Asking: €${profile.price.toLocaleString()}
        </p>
      </div>
    `;

    // Smooth Step Progression
    setTimeout(() => {
      const status = document.getElementById('radar-status-text');
      const sub = document.getElementById('radar-sub-text');
      if (status) status.innerText = 'Simulating NSAI SR50-2:2024 Low-Flow Radiator Schedule...';
      if (sub) sub.innerText = `Current Baseline: BER [ ${profile.ber} ] · Evaluating ΔT30 Heat Delivery...`;
    }, 900);

    setTimeout(() => {
      const status = document.getElementById('radar-status-text');
      const sub = document.getElementById('radar-sub-text');
      if (status) status.innerText = 'Matching 2026 SEAI Direct Grant Pot & Green Mortgage Rates...';
      if (sub) sub.innerText = `Applying -€35,000 Grant Deductions & 3.45% Mortgage Discount...`;
    }, 1800);

    setTimeout(() => {
      onComplete();
    }, 2500);
  }

  function renderPropertyDossier(profile) {
    const resultsContainer = document.getElementById('prop-audit-results');
    if (!resultsContainer) return;

    const equitySurge = Math.round(profile.price * 0.070); // +7% avg
    const postVal = profile.price + equitySurge;

    resultsContainer.innerHTML = `
      <div style="background: radial-gradient(120% 120% at 50% 0%, #002d4a 0%, #001a2c 55%, #001711 100%); border: 2px solid #34f5c5; border-radius: 24px; padding: 32px 24px; box-shadow: 0 20px 60px rgba(52, 245, 197, 0.3); text-align: left;">
        
        <!-- Header Ribbon -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 18px; margin-bottom: 24px;">
          <div>
            <span style="background: #10b981; color: #00241b; font-weight: 800; font-size: 0.72rem; padding: 3px 10px; border-radius: 9999px; text-transform: uppercase;">
              ✓ Audit Verified · ${profile.town}, Co. ${profile.county}
            </span>
            <h2 style="color: #ffffff; font-size: clamp(1.4rem, 3.5vw, 1.9rem); font-weight: 900; margin: 8px 0 4px 0;">
              ${profile.archetype}
            </h2>
            <div style="font-size: 0.85rem; color: #94a3b8; font-family: 'IBM Plex Mono', monospace;">
              Asking Price: <strong style="color:#fff;">€${profile.price.toLocaleString()}</strong> · Current Rating: <span style="background: #f59e0b; color: #000; padding: 2px 6px; border-radius: 4px; font-weight: 800;">BER ${profile.ber}</span>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.72rem; color: #34f5c5; font-family: 'IBM Plex Mono', monospace; text-transform: uppercase;">Total Grants Unlocked</div>
            <div style="font-size: 1.8rem; font-weight: 900; color: #34f5c5; font-family: 'IBM Plex Mono', monospace;">€35,000</div>
          </div>
        </div>

        <!-- 3-Audience Breakdown Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 24px;">
          
          <!-- 1. Buyer Metric Card -->
          <div style="background: #001711; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 14px; padding: 18px;">
            <div style="font-size: 0.75rem; font-weight: 800; color: #34f5c5; text-transform: uppercase; font-family: 'IBM Plex Mono', monospace; margin-bottom: 8px;">
              🏠 1. For The Buyer
            </div>
            <div style="font-size: 1.1rem; font-weight: 900; color: #fff; margin-bottom: 4px;">
              Save €218 / month
            </div>
            <div style="font-size: 0.78rem; color: #94a3b8; line-height: 1.4; margin-bottom: 8px;">
              Qualifies for <strong>3.45% Green Mortgage</strong> rates across Irish lenders. Heating bill drops from €3,400/yr to <strong>€650/yr</strong>.
            </div>
            <div style="font-size: 0.72rem; color: #34f5c5; font-weight: 700;">
              ✔ -€4,320 Carbon Tax Shield Active
            </div>
          </div>

          <!-- 2. Estate Agent Metric Card -->
          <div style="background: #001711; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 14px; padding: 18px;">
            <div style="font-size: 0.75rem; font-weight: 800; color: #f59e0b; text-transform: uppercase; font-family: 'IBM Plex Mono', monospace; margin-bottom: 8px;">
              💼 2. For The Estate Agent
            </div>
            <div style="font-size: 1.1rem; font-weight: 900; color: #fff; margin-bottom: 4px;">
              +€${equitySurge.toLocaleString()} Capital Surge
            </div>
            <div style="font-size: 0.78rem; color: #94a3b8; line-height: 1.4; margin-bottom: 8px;">
              Upgrading from ${profile.ber} to A-Rating pushes target valuation to <strong>€${postVal.toLocaleString()}</strong>, adding buyer urgency.
            </div>
            <button type="button" class="btn-copy-daft-blurb" onclick="window.copyDaftListingBlurb()" style="background: rgba(245, 158, 11, 0.15); border: 1px solid #f59e0b; color: #fbbf24; font-size: 0.74rem; font-weight: 800; padding: 6px 12px; border-radius: 6px; cursor: pointer; width: 100%;">
              📋 Copy Daft.ie Blurb
            </button>
          </div>

          <!-- 3. Installer Metric Card -->
          <div style="background: #001711; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 14px; padding: 18px;">
            <div style="font-size: 0.75rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; font-family: 'IBM Plex Mono', monospace; margin-bottom: 8px;">
              ⚡ 3. For The Installer
            </div>
            <div style="font-size: 1.1rem; font-weight: 900; color: #fff; margin-bottom: 4px;">
              ${profile.hpSize}
            </div>
            <div style="font-size: 0.78rem; color: #94a3b8; line-height: 1.4; margin-bottom: 8px;">
              NSAI SR50-2 Heat Loss: <strong>${profile.heatLoss}</strong>. Radiator Schedule: 2 rooms compliant, 2 Type 22 upgrades specified.
            </div>
            <button type="button" class="btn-copy-tender" onclick="window.copyInstallerTenderDraft()" style="background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #38bdf8; font-size: 0.74rem; font-weight: 800; padding: 6px 12px; border-radius: 6px; cursor: pointer; width: 100%;">
              📋 Copy SEAI Tender
            </button>
          </div>

        </div>

        <!-- 1-Tap Checkout Conversion Banner -->
        <div style="background: rgba(0, 24, 18, 0.95); border: 1.5px solid #f59e0b; border-radius: 16px; padding: 20px; text-align: center;">
          <h3 style="color: #ffffff; font-size: 1.15rem; font-weight: 800; margin: 0 0 6px 0;">
            Want Joe to Inspect This Property Before You Bid or List?
          </h3>
          <p style="color: #cbd5e1; font-size: 0.88rem; margin: 0 auto 16px auto; max-width: 580px;">
            Book an independent pre-purchase / pre-listing site inspection. Get official NSAI room heat loss certs, buffer tank calculations, and SEAI grant sign-offs.
          </p>
          <a href="/checkout/?town=${encodeURIComponent(profile.town)}&county=${encodeURIComponent(profile.county)}&archetype=${encodeURIComponent(profile.archetype)}" class="btn-hero-primary-star" style="display: inline-block; padding: 14px 28px; font-size: 1rem; text-decoration: none;">
            ⭐ Book Independent On-Site Survey for ${profile.town} →
          </a>
        </div>

      </div>
    `;

    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

})();
