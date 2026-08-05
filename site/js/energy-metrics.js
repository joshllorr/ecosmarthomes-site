/* EcoSmartHomes Shared Energy Metrics & Grants Module (May 2026 Revision: Simplified BER A0-G) */
window.ECOSMART_METRICS = window.ECOSMART_METRICS || {};

window.ECOSMART_METRICS.version = "May 2026 Revision";
window.ECOSMART_METRICS.effectiveDate = "2026-05-01";

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

// Simplified May 2026 BER Scale (A0 - G)
window.ECOSMART_METRICS.ber_scale = {
  'A0': { label: 'A0', desc: 'Zero-emission, fossil fuel-free', co2: 0.0, color: '#0a8f3c', kwh: 0 },
  'A':  { label: 'A',  desc: 'High efficiency',               co2: 0.8, color: '#1ca64a', kwh: 50 },
  'B':  { label: 'B',  desc: 'Efficient home',                co2: 2.0, color: '#7cc242', kwh: 125 },
  'C':  { label: 'C',  desc: 'Moderate efficiency',           co2: 3.2, color: '#f2e627', kwh: 185 },
  'D':  { label: 'D',  desc: 'Below average',                 co2: 4.7, color: '#f5b318', kwh: 260 },
  'E':  { label: 'E',  desc: 'Poor efficiency',               co2: 5.9, color: '#ef7f12', kwh: 340 },
  'F':  { label: 'F',  desc: 'Very poor efficiency',          co2: 6.7, color: '#e63c0c', kwh: 415 },
  'G':  { label: 'G',  desc: 'Least efficient',               co2: 8.0, color: '#d91e0a', kwh: 480 }
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
