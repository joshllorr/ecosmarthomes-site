/**
 * calculator-data-core.js
 * Core Calculator Data Architecture & Statutory Regulations Engine
 * EcoSmartHomes Ireland
 * 
 * 1. Static Data Repository (SEAI Grants, NSAI SR50-2 ΔT30 low-temperature sizing)
 * 2. Unstructured Quote & PDF Text Parser (Regex matching)
 * 3. Data Integrity Lock (Frozen statutory baselines)
 */

(function(root) {
  'use strict';

  // 1. STATIC STATUTORY REPOSITORY (Deeply Frozen & Immutable)
  const IRISH_ENERGY_REGULATIONS_2026 = Object.freeze({
    // SEAI 2026 Grant Matrix
    SEAI_GRANTS: Object.freeze({
      HEAT_PUMP_AIR_TO_WATER: 6500,
      HEAT_PUMP_GROUND_SOURCE: 6500,
      SOLAR_PV_MAX: 2100,
      EXTERNAL_WALL_INSULATION: 8000,
      ATTIC_INSULATION: 1500,
      HEATING_CONTROLS: 700,
      CAVITY_WALL_INSULATION: 1700,
      INTERNAL_DRY_LINING: 4500,
      HEAT_PUMP_TECHNICAL_ASSESSMENT: 200,
      DEEP_RETROFIT_MAX_CAP: 25500,
      SBCI_RETROFIT_LOAN_MAX: 75000,
      SBCI_LOAN_INTEREST_RATE_SUBSIDIZED: 0.0345 // 3.45%
    }),

    // NSAI SR50-2:2024 Low-Temperature Heat Pump Sizing Standards
    NSAI_SR50_2: Object.freeze({
      DESIGN_FLOW_TEMP_C: 55,
      DESIGN_DELTA_T_K: 30,             // ΔT30 (55°C flow / 45°C return in 20°C room)
      STANDARD_TEST_DELTA_T_K: 50,       // ΔT50 (75°C flow / 65°C return in 20°C room)
      DELTA_T_CORRECTION_FACTOR: 0.51,  // (30/50)^1.3 = 0.513
      OVERSIZING_MULTIPLIER: 1.96,      // 1 / 0.51 = ~1.96x standard ΔT50 catalog wattage
      DESIGN_EXTERNAL_TEMP_C: -3,       // Standard Irish winter design baseline
      ROOM_DESIGN_TEMPS_C: Object.freeze({
        LIVING: 21,
        BEDROOM: 18,
        KITCHEN: 18,
        BATHROOM: 22,
        HALL_CIRCULATION: 18
      }),
      MIN_BUFFER_TANK_LITRES_PER_KW: 10 // Minimum 10L per kW heat pump capacity
    }),

    // Statutory Irish Carbon Tax Schedule (€/tonne CO2)
    CARBON_TAX_SCHEDULE: Object.freeze({
      YEAR_2024: 56.00,
      YEAR_2025: 63.50,
      YEAR_2026: 71.00,
      YEAR_2027: 78.50,
      YEAR_2028: 86.00,
      YEAR_2029: 93.50,
      YEAR_2030: 100.00
    })
  });

  // Export immutable reference to window/global
  root.IRISH_ENERGY_REGULATIONS_2026 = IRISH_ENERGY_REGULATIONS_2026;

  // 2. UNSTRUCTURED QUOTE & PDF TEXT PARSER (Zero Bloat Regex Engine)
  root.parseUnstructuredEnergyQuote = function(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      return { isValid: false, message: 'Empty or invalid quote text provided.' };
    }

    const text = rawText.replace(/\s+/g, ' ');

    // A. Extract Heat Pump kW Output (e.g., "8.5 kW", "12kW", "Heat Pump 10 kW")
    const hpMatch = text.match(/(?:heat\s*pump|output|capacity|model)?\s*[:=]?\s*(\d+(?:\.\d+)?)\s*(?:kw|kilowatt)/i);
    const hpKW = hpMatch ? parseFloat(hpMatch[1]) : null;

    // B. Extract Radiator Specs (e.g., "Type 22", "Type 11", "K2 convector", "K1")
    const radMatches = text.match(/(?:type|k)?\s*(11|21|22|33)\b/gi) || [];
    const radTypes = [...new Set(radMatches.map(r => r.toUpperCase().trim()))];

    // C. Extract Buffer Tank Capacity (e.g., "50L buffer", "100 litre volumiser")
    const bufferMatch = text.match(/(\d{2,3})\s*(?:l|litre|liter|ltr)\s*(?:buffer|volumiser|cylinder|tank)/i);
    const bufferLitres = bufferMatch ? parseInt(bufferMatch[1], 10) : null;

    // D. Extract SEAI Grant Line Item (e.g., "SEAI Grant: €6,500", "Grant Deduction €25,500")
    const grantMatch = text.match(/(?:seai|grant|deduction|rebate)\s*[:=]?\s*€?\s*([0-9,]+)/i);
    let quotedGrant = null;
    if (grantMatch) {
      quotedGrant = parseInt(grantMatch[1].replace(/,/g, ''), 10);
    }

    // E. Extract Total Price Quoted
    const priceMatch = text.match(/(?:total|quote|price|cost|amount\s*due|net)\s*[:=]?\s*€?\s*([0-9,]{4,})/i);
    let quotedTotal = null;
    if (priceMatch) {
      quotedTotal = parseInt(priceMatch[1].replace(/,/g, ''), 10);
    }

    return {
      isValid: true,
      extractedData: {
        heatPumpKW: hpKW,
        radiatorTypes: radTypes,
        bufferTankLitres: bufferLitres,
        quotedGrant: quotedGrant,
        quotedTotal: quotedTotal
      }
    };
  };

  // 3. COMPLIANCE EVALUATION ENGINE (Data Integrity Barrier)
  root.evaluateQuoteCompliance = function(rawTextOrParsed) {
    let data;
    if (typeof rawTextOrParsed === 'string') {
      const parsed = root.parseUnstructuredEnergyQuote(rawTextOrParsed);
      if (!parsed.isValid) return parsed;
      data = parsed.extractedData;
    } else if (rawTextOrParsed && rawTextOrParsed.extractedData) {
      data = rawTextOrParsed.extractedData;
    } else {
      data = rawTextOrParsed || {};
    }

    const regulations = IRISH_ENERGY_REGULATIONS_2026;
    const findings = [];
    const redFlags = [];
    let complianceScore = 100;

    // Check Heat Pump & Buffer Tank Sizing
    if (data.heatPumpKW) {
      const minBuffer = data.heatPumpKW * regulations.NSAI_SR50_2.MIN_BUFFER_TANK_LITRES_PER_KW;
      if (data.bufferTankLitres) {
        if (data.bufferTankLitres >= minBuffer) {
          findings.push(`✔ Buffer tank volume (${data.bufferTankLitres}L) meets NSAI SR50-2 minimum (${minBuffer}L for ${data.heatPumpKW}kW unit).`);
        } else {
          redFlags.push(`⚠️ Undersized Buffer Tank: Quote specifies ${data.bufferTankLitres}L, but NSAI SR50-2 mandates ≥ ${minBuffer}L to prevent compressor short-cycling.`);
          complianceScore -= 25;
        }
      } else {
        findings.push(`ℹ️ No explicit buffer tank specified. Verify installer includes ≥ ${minBuffer}L volumiser.`);
      }
    }

    // Check Radiator Compliance (ΔT30 Low-Temperature Standard)
    if (data.radiatorTypes && data.radiatorTypes.length > 0) {
      const hasType11 = data.radiatorTypes.some(t => t.includes('11'));
      if (hasType11) {
        redFlags.push(`⚠️ Low Heat Output Alert: Single-panel Type 11 radiators detected. Under 55°C heat pump flow (ΔT30), standard Type 11s only deliver 51% of rated heat and typically cause room underheating.`);
        complianceScore -= 20;
      }
      const hasType22 = data.radiatorTypes.some(t => t.includes('22') || t.includes('33'));
      if (hasType22) {
        findings.push(`✔ High-efficiency double-convector (Type 22/33) radiators specified for 55°C low-temperature operation.`);
      }
    }

    // Check SEAI Grant Claimed
    if (data.quotedGrant) {
      const maxSingleHP = regulations.SEAI_GRANTS.HEAT_PUMP_AIR_TO_WATER;
      const maxDeep = regulations.SEAI_GRANTS.DEEP_RETROFIT_MAX_CAP;
      if (data.quotedGrant === maxSingleHP) {
        findings.push(`✔ Standard SEAI Heat Pump Grant deduction (€${maxSingleHP.toLocaleString()}) correctly applied.`);
      } else if (data.quotedGrant <= maxDeep) {
        findings.push(`✔ Multi-measure SEAI Grant package (€${data.quotedGrant.toLocaleString()}) applied.`);
      } else {
        redFlags.push(`⚠️ Overstated Grant Deduction: Quote claims €${data.quotedGrant.toLocaleString()} SEAI grant, exceeding national single-measure heat pump baseline (€${maxSingleHP.toLocaleString()}).`);
        complianceScore -= 15;
      }
    }

    return {
      complianceScore: Math.max(0, complianceScore),
      isCompliant: redFlags.length === 0,
      findings: findings,
      redFlags: redFlags,
      statutoryStandardsApplied: {
        flowTemp: `${regulations.NSAI_SR50_2.DESIGN_FLOW_TEMP_C}°C (ΔT30)`,
        oversizingFactor: `${regulations.NSAI_SR50_2.OVERSIZING_MULTIPLIER}x`,
        standardGrant: `€${regulations.SEAI_GRANTS.HEAT_PUMP_AIR_TO_WATER.toLocaleString()}`
      }
    };
  };

})(typeof window !== 'undefined' ? window : this);
