/* EcoSmartHomes Shared Energy Metrics & Grants Module (March 28, 2026 National Benchmarks) */
window.ECOSMART_METRICS = window.ECOSMART_METRICS || {};

window.ECOSMART_METRICS.version = "March 28 2026 Revision";
window.ECOSMART_METRICS.effectiveDate = "2026-03-28";

window.ECOSMART_METRICS.grants = {
  heat_pump: { amount: 12500, label: "Heat pump grant", category: "Heating", scheme: "SEAI Home Energy Grants", updated: "2026-03-28" },
  wall_insulation: { amount: 8000, label: "Wall insulation grant", category: "Fabric", scheme: "SEAI Home Energy Grants", updated: "2026-03-28" },
  windows_doors: { amount: 5600, label: "Windows & doors grant", category: "Fabric", scheme: "SEAI Home Energy Grants", updated: "2026-03-28" },
  ev_grant_vrt: { amount: 8500, label: "Electric car grant + VRT relief", category: "Transport", scheme: "EV Grants", updated: "2026-03-28" },
  attic_insulation: { amount: 2500, label: "Attic insulation grant", category: "Fabric", scheme: "SEAI Home Energy Grants", updated: "2026-03-28" },
  solar_pv: { amount: 1800, label: "Solar panel (PV) grant", category: "Microgeneration", scheme: "Solar PV Grant", updated: "2026-03-28" },
  solar_thermal: { amount: 1200, label: "Solar water heating grant", category: "Heating", scheme: "Solar Thermal Grant", updated: "2026-03-28" },
  heating_controls: { amount: 700, label: "Heating controls grant", category: "Controls", scheme: "SEAI Grants", updated: "2026-03-28" },
  ev_home_charger: { amount: 300, label: "EV home charger grant", category: "Transport", scheme: "EV Charger Grant", updated: "2026-03-28" },
  warmer_homes: { amount: null, label: "Warmer Homes Scheme", category: "Fabric", scheme: "Warmer Homes", note: "Free upgrades for eligible welfare recipients", updated: "2026-03-28" },
  one_stop_shop: { amount: 26000, label: "One Stop Shop (whole-house upgrade)", category: "Deep Retrofit", scheme: "One Stop Shop", note: "€26,000+ in combined grants", updated: "2026-03-28" },
  vacant_property: { amount: 70000, label: "Vacant Property Refurbishment Grant", category: "Refurbishment", scheme: "Vacant Property Grant", updated: "2026-03-28" },
  housing_adaptation: { amount: 40000, label: "Housing Adaptation Grant", category: "Accessibility", scheme: "Housing Adaptation", updated: "2026-03-28" },
  solar_export_payments: { amount_min: 222, amount_max: 350, label: "Solar export payments (ongoing income)", category: "Microgeneration", scheme: "Clean Export Guarantee", note: "Typical annual export income range", updated: "2026-03-28" }
};

window.ECOSMART_METRICS.berScale = {
  'A1': { min: 0,   max: 25,  co2: 0.3, color: '#0a8f3c' },
  'A2': { min: 25,  max: 50,  co2: 0.8, color: '#1ca64a' },
  'A3': { min: 50,  max: 75,  co2: 1.2, color: '#2fbd58' },
  'B1': { min: 75,  max: 100, co2: 1.6, color: '#7cc242' },
  'B2': { min: 100, max: 150, co2: 2.0, color: '#a8cf3a' },
  'B3': { min: 150, max: 175, co2: 2.4, color: '#c8d92f' },
  'C1': { min: 175, max: 200, co2: 2.8, color: '#f2e627' },
  'C2': { min: 200, max: 225, co2: 3.2, color: '#f7d21c' },
  'D1': { min: 225, max: 250, co2: 4.1, color: '#f5b318' },
  'D2': { min: 250, max: 275, co2: 4.7, color: '#f29a15' },
  'E1': { min: 275, max: 300, co2: 5.3, color: '#ef7f12' },
  'E2': { min: 300, max: 325, co2: 5.9, color: '#eb5f0f' },
  'F':  { min: 325, max: 450, co2: 6.7, color: '#e63c0c' },
  'G':  { min: 450, max: 600, co2: 8.0, color: '#d91e0a' }
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
