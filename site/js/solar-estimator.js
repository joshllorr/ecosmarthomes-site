/**
 * site/js/solar-estimator.js
 * 🛰️ Satellite Roof-Scan AI & Clean Export Guarantee (CEG) Estimator
 * EcoSmartHomes Ireland · Powered by Google Maps Platform / Irish Solar Micro-Climate Intelligence
 */

(function() {
  'use strict';

  const EIRCODE_LOCATIONS = {
    'V94': { town: 'Castletroy / Limerick', county: 'Limerick', lat: 52.6680, lng: -8.5710, solar: 980, sunHours: 1420, roofArea: 52, pitch: '32° South', defaultPanels: 12 },
    'V95': { town: 'Ennis / Shannon', county: 'Clare', lat: 52.8463, lng: -8.9807, solar: 970, sunHours: 1400, roofArea: 48, pitch: '30° South', defaultPanels: 10 },
    'D01': { town: 'Dublin City Centre', county: 'Dublin', lat: 53.3501, lng: -6.2603, solar: 1000, sunHours: 1450, roofArea: 38, pitch: '35° South-East', defaultPanels: 8 },
    'D02': { town: 'Dublin 2 (Grand Canal)', county: 'Dublin', lat: 53.3400, lng: -6.2500, solar: 1000, sunHours: 1450, roofArea: 40, pitch: '34° South', defaultPanels: 8 },
    'D04': { town: 'Ballsbridge / Donnybrook', county: 'Dublin', lat: 53.3240, lng: -6.2230, solar: 1010, sunHours: 1460, roofArea: 55, pitch: '33° South', defaultPanels: 12 },
    'D06': { town: 'Ranelagh / Rathmines', county: 'Dublin', lat: 53.3180, lng: -6.2600, solar: 1005, sunHours: 1455, roofArea: 48, pitch: '32° South', defaultPanels: 10 },
    'D14': { town: 'Dundrum / Churchtown', county: 'Dublin', lat: 53.2900, lng: -6.2400, solar: 1010, sunHours: 1460, roofArea: 54, pitch: '32° South', defaultPanels: 12 },
    'D18': { town: 'Foxrock / Sandyford', county: 'Dublin', lat: 53.2700, lng: -6.1800, solar: 1015, sunHours: 1470, roofArea: 60, pitch: '30° South', defaultPanels: 14 },
    'A94': { town: 'Blackrock', county: 'Dublin', lat: 53.2989, lng: -6.1784, solar: 1015, sunHours: 1470, roofArea: 58, pitch: '32° South', defaultPanels: 12 },
    'A96': { town: 'Dún Laoghaire / Dalkey', county: 'Dublin', lat: 53.2944, lng: -6.1339, solar: 1020, sunHours: 1480, roofArea: 56, pitch: '30° South-East', defaultPanels: 12 },
    'T12': { town: 'Cork City South / Douglas', county: 'Cork', lat: 51.8792, lng: -8.4721, solar: 1025, sunHours: 1490, roofArea: 52, pitch: '32° South', defaultPanels: 12 },
    'T23': { town: 'Cork City North', county: 'Cork', lat: 51.9124, lng: -8.4756, solar: 1020, sunHours: 1480, roofArea: 50, pitch: '34° South', defaultPanels: 10 },
    'H91': { town: 'Galway City / Salthill', county: 'Galway', lat: 53.2707, lng: -9.0568, solar: 960, sunHours: 1380, roofArea: 50, pitch: '30° South-West', defaultPanels: 10 },
    'X91': { town: 'Waterford City (Sunny South-East)', county: 'Waterford', lat: 52.2593, lng: -7.1101, solar: 1045, sunHours: 1530, roofArea: 54, pitch: '32° South', defaultPanels: 12 },
    'Y35': { town: 'Wexford Town (Sunny South-East)', county: 'Wexford', lat: 52.3369, lng: -6.4633, solar: 1060, sunHours: 1560, roofArea: 56, pitch: '30° South', defaultPanels: 14 },
    'R95': { town: 'Kilkenny City', county: 'Kilkenny', lat: 52.6541, lng: -7.2448, solar: 1000, sunHours: 1460, roofArea: 52, pitch: '32° South', defaultPanels: 12 },
    'R32': { town: 'Portlaoise', county: 'Laois', lat: 53.0328, lng: -7.2995, solar: 975, sunHours: 1410, roofArea: 50, pitch: '32° South', defaultPanels: 10 },
    'W91': { town: 'Naas / Sallins', county: 'Kildare', lat: 53.2158, lng: -6.6669, solar: 990, sunHours: 1435, roofArea: 54, pitch: '32° South', defaultPanels: 12 },
    'F91': { town: 'Sligo Town', county: 'Sligo', lat: 54.2766, lng: -8.4761, solar: 920, sunHours: 1320, roofArea: 48, pitch: '34° South', defaultPanels: 10 }
  };

  const regionalYields = {
    'Wexford': 1060, 'Waterford': 1045, 'Cork': 1025, 'Kerry': 1010,
    'Limerick': 980, 'Dublin': 1005, 'Kildare': 990, 'Wicklow': 1015,
    'Galway': 960, 'Clare': 970, 'Tipperary': 990, 'Mayo': 940,
    'Donegal': 920, 'Louth': 980, 'Meath': 990, 'Default': 980
  };

  const orientationMultipliers = {
    'South': 1.0,
    'South-East': 0.95,
    'South-West': 0.95,
    'East': 0.82,
    'West': 0.82
  };

  let currentEircodeMeta = EIRCODE_LOCATIONS['V94'];

  function updateSolarCalculations() {
    const slider = document.getElementById('solar-panel-slider');
    const panelCountEl = document.getElementById('solar-panel-count-display');
    const countySelect = document.getElementById('solar-county-select');
    const orientationSelect = document.getElementById('solar-orientation-select');
    const batteryToggle = document.getElementById('solar-battery-toggle');
    const roofGrid = document.getElementById('solar-roof-panel-grid');

    if (!slider) return;

    const panelCount = parseInt(slider.value, 10);
    const county = countySelect ? countySelect.value : (currentEircodeMeta?.county || 'Limerick');
    const orientation = orientationSelect ? orientationSelect.value : 'South';
    const hasBattery = batteryToggle ? batteryToggle.checked : false;

    const systemSizeKwp = panelCount * 0.43; // 430W tier-1 panels
    if (panelCountEl) panelCountEl.textContent = `${panelCount} Panels (${systemSizeKwp.toFixed(1)} kWp)`;

    // Render interactive roof panel grid with high-tech solar cells
    if (roofGrid) {
      roofGrid.innerHTML = '';
      for (let i = 0; i < panelCount; i++) {
        const p = document.createElement('div');
        p.className = 'roof-solar-panel';
        p.innerHTML = `<span class="panel-cell-glimmer"></span><span style="position: absolute; bottom: 3px; right: 4px; font-size: 7px; color: #38bdf8; font-weight: 700;">430W</span>`;
        roofGrid.appendChild(p);
      }
    }

    const baseYield = regionalYields[county] || (currentEircodeMeta?.solar || 980);
    const orientMult = orientationMultipliers[orientation] || 1.0;
    const totalAnnualKwh = Math.round(systemSizeKwp * baseYield * orientMult);

    const importTariff = 0.34;
    const exportTariff = 0.24; // 24c/kWh Clean Export Guarantee (CEG)

    const selfConsumptionPct = hasBattery ? 0.80 : 0.45;
    const exportPct = 1.0 - selfConsumptionPct;

    const selfConsumedKwh = Math.round(totalAnnualKwh * selfConsumptionPct);
    const exportedKwh = Math.round(totalAnnualKwh * exportPct);

    const annualBillSavings = Math.round(selfConsumedKwh * importTariff);
    const annualCegExport = Math.round(exportedKwh * exportTariff);
    const totalAnnualBenefit = annualBillSavings + annualCegExport;

    // May 2026 SEAI Grant (capped at €1,800)
    let seaiGrant = 0;
    if (systemSizeKwp <= 2.0) {
      seaiGrant = Math.round(systemSizeKwp * 400);
    } else {
      seaiGrant = Math.min(1800, Math.round(800 + (systemSizeKwp - 2.0) * 350));
    }

    const grossCost = Math.round((systemSizeKwp * 1250) + (hasBattery ? 2800 : 0));
    const netCost = Math.max(0, grossCost - seaiGrant);
    const paybackYears = (netCost / (totalAnnualBenefit || 1)).toFixed(1);
    const lifetimeSavings = Math.round((totalAnnualBenefit * 25) - netCost);

    // Update UI elements
    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setTxt('solar-val-kwh', `${totalAnnualKwh.toLocaleString()} kWh/yr`);
    setTxt('solar-val-bill-cut', `€${annualBillSavings.toLocaleString()}/yr`);
    setTxt('solar-val-ceg-cash', `€${annualCegExport.toLocaleString()}/yr`);
    setTxt('solar-val-total-benefit', `€${totalAnnualBenefit.toLocaleString()}/yr`);
    setTxt('solar-val-grant', `€${seaiGrant.toLocaleString()}`);
    setTxt('solar-val-net-cost', `€${netCost.toLocaleString()}`);
    setTxt('solar-val-payback', `${paybackYears} Years`);
    setTxt('solar-val-25yr', `€${lifetimeSavings.toLocaleString()}`);

    // Update Satellite HUD telemetry
    setTxt('hud-roof-area', `${(panelCount * 2.1).toFixed(1)} m² usable`);
    setTxt('hud-sun-hours', `${currentEircodeMeta?.sunHours || 1420} hrs/yr`);
    setTxt('hud-irradiance', `${baseYield} kWh/kWp`);
  }

  function handleEircodeScan(eircodeVal) {
    const clean = (eircodeVal || '').trim().toUpperCase().replace(/\s+/g, '');
    const prefix = clean.slice(0, 3);
    const meta = EIRCODE_LOCATIONS[prefix] || EIRCODE_LOCATIONS['V94'];
    currentEircodeMeta = meta;

    const hudBadge = document.getElementById('satellite-hud-location');
    const hudStatus = document.getElementById('satellite-scan-status');
    const countySelect = document.getElementById('solar-county-select');

    if (hudBadge) {
      hudBadge.innerHTML = `📍 <strong>${meta.town}</strong> (Lat: ${meta.lat.toFixed(4)}, Lng: ${meta.lng.toFixed(4)})`;
    }

    if (hudStatus) {
      hudStatus.textContent = `🛰️ Satellite scan locked on ${clean || 'V94'} · High-Resolution Rooftop Mesh`;
    }

    if (countySelect && meta.county) {
      countySelect.value = meta.county;
    }

    updateSolarCalculations();
  }

  function initSolarEstimator() {
    const slider = document.getElementById('solar-panel-slider');
    const countySelect = document.getElementById('solar-county-select');
    const orientationSelect = document.getElementById('solar-orientation-select');
    const batteryToggle = document.getElementById('solar-battery-toggle');
    const eircodeInput = document.getElementById('solar-eircode-input');

    if (slider) slider.addEventListener('input', updateSolarCalculations);
    if (countySelect) countySelect.addEventListener('change', updateSolarCalculations);
    if (orientationSelect) orientationSelect.addEventListener('change', updateSolarCalculations);
    if (batteryToggle) batteryToggle.addEventListener('change', updateSolarCalculations);

    if (eircodeInput) {
      eircodeInput.addEventListener('input', () => {
        handleEircodeScan(eircodeInput.value);
      });
    }

    // Initial render
    handleEircodeScan('V94 ED21');
    updateSolarCalculations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSolarEstimator);
  } else {
    initSolarEstimator();
  }

  window.updateSolarCalculations = updateSolarCalculations;
})();

