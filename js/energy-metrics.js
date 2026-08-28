/* EcoSmartHomes Shared Energy Metrics & Grants Module (New May 2026 EPBD BER Scale: A0 to G) */
window.ECOSMART_METRICS = window.ECOSMART_METRICS || {};

window.ECOSMART_METRICS.version = "May 2026 EPBD Unified Scale";
window.ECOSMART_METRICS.effectiveDate = "2026-05-01";

window.ECOSMART_METRICS.grants = {
  heat_pump: { amount: 12500, label: "Air-to-Water Heat Pump grant", category: "Heating", scheme: "SEAI Home Energy Grants", updated: "2026-05-01" },
  wall_insulation: { amount: 8000, label: "External Wall Insulation (The Wrap)", category: "Fabric", scheme: "SEAI Home Energy Grants", updated: "2026-05-01" },
  windows_doors: { amount: 5600, label: "Triple Glazed Windows & Doors", category: "Fabric", scheme: "SEAI Home Energy Grants", updated: "2026-05-01" },
  attic_insulation: { amount: 2500, label: "Attic Insulation (300mm)", category: "Fabric", scheme: "SEAI Home Energy Grants", updated: "2026-05-01" },
  solar_pv: { amount: 1800, label: "Rooftop Solar PV Panels (0% VAT)", category: "Microgeneration", scheme: "Solar PV Grant", updated: "2026-05-01" },
  heating_controls: { amount: 700, label: "Smart Heating Controls Upgrade", category: "Controls", scheme: "SEAI Grants", updated: "2026-05-01" },
  one_stop_shop: { amount: 35000, label: "One Stop Shop (Whole-House Deep Retrofit)", category: "Deep Retrofit", scheme: "One Stop Shop", note: "Up to €35,000 in combined grants to reach B / A / A0", updated: "2026-05-01" },
  solar_export_payments: { amount_min: 240, amount_max: 420, label: "Clean Export Guarantee (CEG Payouts)", category: "Microgeneration", scheme: "Clean Export Guarantee", note: "24c/kWh average export credit", updated: "2026-05-01" }
};

// Official New Irish BER Scale (A0 to G) — EPBD Framework
window.ECOSMART_METRICS.ber_scale = {
  'A0': { label: 'A0', minKwh: 0,   maxKwh: 42,  kwh: 30,  co2: 0.2, color: '#1d4ed8', fuelEst: 350,  desc: 'Zero-Emission Building (ZEB / NZEB) · ≤42 kWh/m²/yr · Positive Energy Grid Contributor' },
  'A':  { label: 'A',  minKwh: 43,  maxKwh: 75,  kwh: 60,  co2: 0.6, color: '#00875a', fuelEst: 650,  desc: 'Deep Retrofit Gold Standard · ≤75 kWh/m²/yr · Heat Pump + Solar + Full Wrap' },
  'B':  { label: 'B',  minKwh: 76,  maxKwh: 150, kwh: 115, co2: 1.6, color: '#22c55e', fuelEst: 1200, desc: 'SEAI National Cost-Optimal Standard · ≤150 kWh/m²/yr · Minimum Target for Grants' },
  'C':  { label: 'C',  minKwh: 151, maxKwh: 225, kwh: 190, co2: 2.8, color: '#84cc16', fuelEst: 1950, desc: 'Moderate Efficiency · ≤225 kWh/m²/yr · Typical 2000s Housing Stock' },
  'D':  { label: 'D',  minKwh: 226, maxKwh: 275, kwh: 250, co2: 4.2, color: '#eab308', fuelEst: 2750, desc: 'Typical Irish Average · ≤275 kWh/m²/yr · 1980s-1990s Semi-D' },
  'E':  { label: 'E',  minKwh: 276, maxKwh: 325, kwh: 300, co2: 5.4, color: '#f97316', fuelEst: 3400, desc: 'Poor Thermal Efficiency · ≤325 kWh/m²/yr · High Heat Loss (~2.10 W/m²K Walls)' },
  'F':  { label: 'F',  minKwh: 326, maxKwh: 375, kwh: 350, co2: 6.6, color: '#ea580c', fuelEst: 4200, desc: 'Severe Heat Loss · ≤375 kWh/m²/yr · EU EPBD 2030 Mandatory Upgrade Target' },
  'G':  { label: 'G',  minKwh: 376, maxKwh: 650, kwh: 450, co2: 8.5, color: '#dc2626', fuelEst: 5400, desc: 'Worst Performance (>375 kWh/m²/yr) · Maximum €35k SEAI Deep Retrofit Grants' }
};

window.ECOSMART_METRICS.calcNetCost = function(grossCost, measures) {
  let grantTotal = 0;
  if (measures.includes('heat_pump')) grantTotal += this.grants.heat_pump.amount;
  if (measures.includes('attic_insulation')) grantTotal += this.grants.attic_insulation.amount;
  if (measures.includes('wall_insulation')) grantTotal += this.grants.wall_insulation.amount;
  if (measures.includes('solar_pv')) grantTotal += this.grants.solar_pv.amount;
  if (measures.includes('one_stop_shop')) grantTotal += this.grants.one_stop_shop.amount;
  return Math.max(0, grossCost - grantTotal);
};
