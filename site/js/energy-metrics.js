/* EcoSmartHomes Shared Energy Metrics & Grants Module (March 28, 2026 Benchmarks) */
window.ECOSMART_METRICS = {
  version: "March 28 2026 Revision",
  effectiveDate: "2026-03-28",
  
  // SEAI March 2026 Grant Cap Rates
  grants: {
    heatPumpAirToWater: 6500,
    heatingControls: 1500,
    heatPumpMaxTotal: 8000,
    atticStandard: 1500,
    atticDetached: 1700,
    cavityWall: 1700,
    externalWallMax: 8000,
    internalWallMax: 4500,
    solarPVBase: 2100,
    solarPVMax: 2400,
    solarThermal: 1200,
    deepRetrofitBonus: 2000
  },

  // 2026 Revised BER Scale (kWh/m²·yr thresholds & CO2 Factors)
  berScale: {
    'A1': { min: 0,   max: 25,  co2: 0.3, color: '#00703C' },
    'A2': { min: 25,  max: 50,  co2: 0.8, color: '#008542' },
    'A3': { min: 50,  max: 75,  co2: 1.2, color: '#009E49' },
    'B1': { min: 75,  max: 100, co2: 1.6, color: '#50B848' },
    'B2': { min: 100, max: 125, co2: 2.0, color: '#78C944' },
    'B3': { min: 125, max: 150, co2: 2.4, color: '#99D546' },
    'C1': { min: 150, max: 175, co2: 2.8, color: '#FFF200' },
    'C2': { min: 175, max: 200, co2: 3.2, color: '#FDB913' },
    'C3': { min: 200, max: 225, co2: 3.6, color: '#F8971D' },
    'D1': { min: 225, max: 260, co2: 4.1, color: '#F37023' },
    'D2': { min: 260, max: 300, co2: 4.7, color: '#EE4326' },
    'E1': { min: 300, max: 340, co2: 5.3, color: '#E41B23' },
    'E2': { min: 340, max: 380, co2: 5.9, color: '#BD1622' },
    'F':  { min: 380, max: 450, co2: 6.7, color: '#8E0E17' },
    'G':  { min: 450, max: 600, co2: 8.0, color: '#5C060B' }
  },

  // Helper method to compute net out-of-pocket cost
  calcNetCost: function(grossCost, measures) {
    let grantTotal = 0;
    if (measures.includes('heatPump')) grantTotal += this.grants.heatPumpAirToWater + this.grants.heatingControls;
    if (measures.includes('attic')) grantTotal += this.grants.atticDetached;
    if (measures.includes('cavity')) grantTotal += this.grants.cavityWall;
    if (measures.includes('solar')) grantTotal += this.grants.solarPVBase;
    if (measures.includes('deepRetrofit')) grantTotal += this.grants.deepRetrofitBonus;
    return Math.max(0, grossCost - grantTotal);
  }
};
