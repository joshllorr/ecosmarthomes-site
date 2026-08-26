/* EcoSmartHomes Shared Energy Metrics & Grants Module (SEAI May 2026 Revision: Full 15-Band A1-G Scale) */
window.ECOSMART_METRICS = window.ECOSMART_METRICS || {};

window.ECOSMART_METRICS.version = "May 2026 EPBD Revision";
window.ECOSMART_METRICS.effectiveDate = "2026-05-01";

window.ECOSMART_METRICS.grants = {
  heat_pump: { amount: 12500, label: "Air-to-Water Heat Pump grant", category: "Heating", scheme: "SEAI Home Energy Grants", updated: "2026-05-01" },
  wall_insulation: { amount: 8000, label: "External Wall Insulation (The Wrap)", category: "Fabric", scheme: "SEAI Home Energy Grants", updated: "2026-05-01" },
  windows_doors: { amount: 5600, label: "Triple Glazed Windows & Doors", category: "Fabric", scheme: "SEAI Home Energy Grants", updated: "2026-05-01" },
  attic_insulation: { amount: 2500, label: "Attic Insulation (300mm)", category: "Fabric", scheme: "SEAI Home Energy Grants", updated: "2026-05-01" },
  solar_pv: { amount: 1800, label: "Rooftop Solar PV Panels (0% VAT)", category: "Microgeneration", scheme: "Solar PV Grant", updated: "2026-05-01" },
  heating_controls: { amount: 700, label: "Smart Heating Controls Upgrade", category: "Controls", scheme: "SEAI Grants", updated: "2026-05-01" },
  one_stop_shop: { amount: 25500, label: "One Stop Shop (Whole-House Deep Retrofit)", category: "Deep Retrofit", scheme: "One Stop Shop", note: "Up to €25,500+ in combined grants to reach B2/A2", updated: "2026-05-01" },
  solar_export_payments: { amount_min: 240, amount_max: 420, label: "Clean Export Guarantee (CEG Payouts)", category: "Microgeneration", scheme: "Clean Export Guarantee", note: "24c/kWh average export credit", updated: "2026-05-01" }
};

// Full 15-Band Irish SEAI Building Energy Rating (BER) Scale (A1 to G)
window.ECOSMART_METRICS.ber_scale = {
  'A1': { label: 'A1', minKwh: 0,   maxKwh: 25,  kwh: 20,  co2: 0.3, color: '#00703c', fuelEst: 350,  desc: 'Nearly Zero Energy Building (NZEB) · Maximum Energy Independence' },
  'A2': { label: 'A2', minKwh: 25,  maxKwh: 50,  kwh: 40,  co2: 0.6, color: '#0a8f3c', fuelEst: 550,  desc: 'Deep Retrofit Gold Standard · Heat Pump + Solar + Full Wrap' },
  'A3': { label: 'A3', minKwh: 50,  maxKwh: 75,  kwh: 65,  co2: 1.0, color: '#1ca64a', fuelEst: 750,  desc: 'High Efficiency Modern Home' },
  'B1': { label: 'B1', minKwh: 75,  maxKwh: 100, kwh: 90,  co2: 1.4, color: '#54b848', fuelEst: 950,  desc: 'Highly Efficient Low-Carbon Dwelling' },
  'B2': { label: 'B2', minKwh: 100, maxKwh: 125, kwh: 115, co2: 1.8, color: '#7cc242', fuelEst: 1200, desc: 'SEAI National Cost-Optimal Standard · Target for All Grants' },
  'B3': { label: 'B3', minKwh: 125, maxKwh: 150, kwh: 140, co2: 2.2, color: '#b3d335', fuelEst: 1450, desc: 'Good Modern Thermal Standard' },
  'C1': { label: 'C1', minKwh: 150, maxKwh: 175, kwh: 165, co2: 2.7, color: '#dbe126', fuelEst: 1750, desc: 'Moderate Efficiency (2000s Irish Housing Stock)' },
  'C2': { label: 'C2', minKwh: 175, maxKwh: 200, kwh: 190, co2: 3.1, color: '#f5e21b', fuelEst: 2050, desc: 'Average Efficiency · Requires Top-up Insulation' },
  'C3': { label: 'C3', minKwh: 200, maxKwh: 225, kwh: 215, co2: 3.6, color: '#f7cd14', fuelEst: 2350, desc: 'Moderate Heat Loss · High Fuel Bills' },
  'D1': { label: 'D1', minKwh: 225, maxKwh: 260, kwh: 245, co2: 4.2, color: '#f5b318', fuelEst: 2750, desc: 'Typical 1990s Irish Semi-D · Significant Drafts' },
  'D2': { label: 'D2', minKwh: 260, maxKwh: 300, kwh: 280, co2: 4.8, color: '#f09618', fuelEst: 3200, desc: 'Typical 1980s Pebbledash House · High Carbon Tax Exposure' },
  'E1': { label: 'E1', minKwh: 300, maxKwh: 340, kwh: 320, co2: 5.4, color: '#ef7f12', fuelEst: 3600, desc: 'Poor Efficiency · High Heat Loss (~2.10 W/m²K Walls)' },
  'E2': { label: 'E2', minKwh: 340, maxKwh: 380, kwh: 360, co2: 6.0, color: '#eb6312', fuelEst: 4000, desc: 'Very Poor Efficiency · Inefficient Oil/Gas Boiler' },
  'F':  { label: 'F',  minKwh: 380, maxKwh: 450, kwh: 415, co2: 6.8, color: '#e63c0c', fuelEst: 4600, desc: 'Severe Heat Loss · EPBD 2030 Mandatory Upgrade Priority' },
  'G':  { label: 'G',  minKwh: 450, maxKwh: 700, kwh: 520, co2: 8.5, color: '#d91e0a', fuelEst: 5400, desc: 'Least Efficient (>450 kWh/m²/yr) · Maximum €25.5k Grants Claimable' }
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
