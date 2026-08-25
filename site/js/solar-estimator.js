/**
 * site/js/solar-estimator.js
 * Interactive Rooftop Solar & Clean Export Guarantee (CEG) Estimator
 * EcoSmartHomes Ireland
 */

(function() {
  'use strict';

  const regionalYields = {
    'Wexford': 1050, 'Waterford': 1040, 'Cork': 1020, 'Kerry': 1010,
    'Limerick': 980, 'Dublin': 1000, 'Kildare': 990, 'Wicklow': 1010,
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

  function updateSolarCalculations() {
    const slider = document.getElementById('solar-panel-slider');
    const panelCountEl = document.getElementById('solar-panel-count-display');
    const countySelect = document.getElementById('solar-county-select');
    const orientationSelect = document.getElementById('solar-orientation-select');
    const batteryToggle = document.getElementById('solar-battery-toggle');
    const roofGrid = document.getElementById('solar-roof-panel-grid');

    if (!slider) return;

    const panelCount = parseInt(slider.value, 10);
    const county = countySelect ? countySelect.value : 'Limerick';
    const orientation = orientationSelect ? orientationSelect.value : 'South';
    const hasBattery = batteryToggle ? batteryToggle.checked : false;

    if (panelCountEl) panelCountEl.textContent = `${panelCount} Panels (${(panelCount * 0.43).toFixed(1)} kWp)`;

    // Render interactive roof panel grid
    if (roofGrid) {
      roofGrid.innerHTML = '';
      for (let i = 0; i < panelCount; i++) {
        const p = document.createElement('div');
        p.className = 'roof-solar-panel';
        p.innerHTML = `<span class="panel-cell-glimmer"></span>`;
        roofGrid.appendChild(p);
      }
    }

    const systemSizeKwp = panelCount * 0.43;
    const baseYield = regionalYields[county] || 980;
    const orientMult = orientationMultipliers[orientation] || 1.0;
    const totalAnnualKwh = Math.round(systemSizeKwp * baseYield * orientMult);

    const importTariff = 0.34;
    const exportTariff = 0.24;

    const selfConsumptionPct = hasBattery ? 0.80 : 0.45;
    const exportPct = 1.0 - selfConsumptionPct;

    const selfConsumedKwh = Math.round(totalAnnualKwh * selfConsumptionPct);
    const exportedKwh = Math.round(totalAnnualKwh * exportPct);

    const annualBillSavings = Math.round(selfConsumedKwh * importTariff);
    const annualCegExport = Math.round(exportedKwh * exportTariff);
    const totalAnnualBenefit = annualBillSavings + annualCegExport;

    // SEAI Grant (capped at €1,800)
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
  }

  function initSolarEstimator() {
    const slider = document.getElementById('solar-panel-slider');
    const countySelect = document.getElementById('solar-county-select');
    const orientationSelect = document.getElementById('solar-orientation-select');
    const batteryToggle = document.getElementById('solar-battery-toggle');

    if (slider) slider.addEventListener('input', updateSolarCalculations);
    if (countySelect) countySelect.addEventListener('change', updateSolarCalculations);
    if (orientationSelect) orientationSelect.addEventListener('change', updateSolarCalculations);
    if (batteryToggle) batteryToggle.addEventListener('change', updateSolarCalculations);

    // Initial render
    updateSolarCalculations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSolarEstimator);
  } else {
    initSolarEstimator();
  }

  window.updateSolarCalculations = updateSolarCalculations;
})();
