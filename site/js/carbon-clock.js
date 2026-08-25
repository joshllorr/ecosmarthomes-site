/**
 * site/js/carbon-clock.js
 * Irish Carbon Tax & Fossil Fuel Penalty Escalator Engine (2026-2030)
 * EcoSmartHomes Ireland
 */

(function() {
  'use strict';

  // National Carbon Tax Base Ticker
  // May 1, 2026 Baseline: ~€420,000,000 collected annually (~€13.31 per second across Ireland)
  const START_DATE = new Date('2026-05-01T00:00:00Z').getTime();
  const BASE_COLLECTED = 428500000;
  const RATE_PER_SEC = 13.58;

  function initNationalTicker() {
    const tickerEl = document.getElementById('national-carbon-ticker');
    if (!tickerEl) return;

    function tick() {
      const now = Date.now();
      const elapsedSec = Math.max(0, (now - START_DATE) / 1000);
      const totalTax = BASE_COLLECTED + (elapsedSec * RATE_PER_SEC);
      tickerEl.textContent = '€' + Math.floor(totalTax).toLocaleString();
      requestAnimationFrame(tick);
    }
    tick();
  }

  // Carbon Tax Schedule per tonne CO2 (Irish Climate Act)
  const taxRates = {
    2026: 71.00,
    2027: 78.50,
    2028: 86.00,
    2029: 93.50,
    2030: 100.00
  };

  // Emissions per fuel unit (kg CO2)
  // Kerosene: 2.54 kg CO2 / Litre
  // Natural Gas: 0.203 kg CO2 / kWh
  // LPG: 1.55 kg CO2 / Litre
  // Coal/Solid Fuel: 3.85 kg CO2 / kg
  const emissionFactors = {
    'oil': { factor: 2.54, unit: 'Litres', defaultVol: 1800, min: 500, max: 4000, step: 100 },
    'gas': { factor: 0.203, unit: 'kWh', defaultVol: 16000, min: 4000, max: 35000, step: 1000 },
    'lpg': { factor: 1.55, unit: 'Litres', defaultVol: 2200, min: 500, max: 5000, step: 100 },
    'coal': { factor: 3.85, unit: 'Bags (40kg)', defaultVol: 40, min: 10, max: 120, step: 5, multiplier: 40 }
  };

  function updateHouseholdCarbonMath() {
    const fuelSelect = document.getElementById('tax-fuel-type');
    const volSlider = document.getElementById('tax-volume-slider');
    const volDisplay = document.getElementById('tax-volume-display');

    if (!fuelSelect || !volSlider) return;

    const fuelType = fuelSelect.value || 'oil';
    const fuelConfig = emissionFactors[fuelType] || emissionFactors['oil'];
    const volume = parseFloat(volSlider.value) || fuelConfig.defaultVol;

    if (volDisplay) {
      volDisplay.textContent = `${volume.toLocaleString()} ${fuelConfig.unit}/year`;
    }

    // Calculate annual CO2 in Tonnes
    const effectiveUnits = fuelType === 'coal' ? volume * (fuelConfig.multiplier || 40) : volume;
    const co2TonnesPerYear = (effectiveUnits * fuelConfig.factor) / 1000;

    let cumulativeTax2026to2030 = 0;
    const years = [2026, 2027, 2028, 2029, 2030];

    years.forEach(year => {
      const rate = taxRates[year];
      const baseTax = co2TonnesPerYear * rate;
      const vatOnTax = baseTax * 0.09; // 9% VAT on carbon tax
      const totalYearTax = baseTax + vatOnTax;

      cumulativeTax2026to2030 += totalYearTax;

      const yearEl = document.getElementById(`tax-val-${year}`);
      if (yearEl) {
        yearEl.textContent = `€${Math.round(totalYearTax).toLocaleString()}`;
      }
    });

    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setTxt('tax-val-2026-bite', `€${Math.round((co2TonnesPerYear * taxRates[2026]) * 1.09).toLocaleString()}/yr`);
    setTxt('tax-val-2030-bite', `€${Math.round((co2TonnesPerYear * taxRates[2030]) * 1.09).toLocaleString()}/yr`);
    setTxt('tax-val-cumulative', `€${Math.round(cumulativeTax2026to2030).toLocaleString()}`);
    setTxt('tax-val-co2-tonnes', `${co2TonnesPerYear.toFixed(1)} Tonnes CO₂/yr`);

    // Inaction comparison: 5 years of fuel + tax inflation vs Heat Pump Net Cost
    const totalEstimatedFossilSpend5Yr = Math.round((volume * 1.25 * 5) + cumulativeTax2026to2030);
    setTxt('tax-val-inaction-spend', `€${totalEstimatedFossilSpend5Yr.toLocaleString()}`);
  }

  function handleFuelChange() {
    const fuelSelect = document.getElementById('tax-fuel-type');
    const volSlider = document.getElementById('tax-volume-slider');
    const volLabel = document.getElementById('tax-slider-label');

    if (!fuelSelect || !volSlider) return;

    const fuelType = fuelSelect.value;
    const config = emissionFactors[fuelType] || emissionFactors['oil'];

    volSlider.min = config.min;
    volSlider.max = config.max;
    volSlider.step = config.step;
    volSlider.value = config.defaultVol;

    if (volLabel) {
      volLabel.textContent = `Annual Fuel Consumption (${config.unit}):`;
    }

    updateHouseholdCarbonMath();
  }

  function initCarbonApp() {
    initNationalTicker();

    const fuelSelect = document.getElementById('tax-fuel-type');
    const volSlider = document.getElementById('tax-volume-slider');

    if (fuelSelect) fuelSelect.addEventListener('change', handleFuelChange);
    if (volSlider) volSlider.addEventListener('input', updateHouseholdCarbonMath);

    updateHouseholdCarbonMath();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarbonApp);
  } else {
    initCarbonApp();
  }

  window.updateHouseholdCarbonMath = updateHouseholdCarbonMath;
})();
