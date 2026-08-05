---
title: "EcoSmartHomes - Building Energy Rating (BER) Analysis Standard"
version: "1.0.0"
date: "2026-08-03"
domain: "ecosmarthomes.ie"
format: "markdown/structured-agent-data"
category: "BER Technical Standard"
---

# EcoSmartHomes: Building Energy Rating (BER) Technical Standard

This document details the official Irish BER rating bands, primary energy consumption metrics (kWh/m²/year), CO2 emissions factors, and target jumping strategies.

## 1. Irish BER Rating Scale Matrix

| BER Band | Primary Energy (kWh/m²/yr) | Carbon Emissions (kg CO₂/m²/yr) | General Rating Description |
| :--- | :--- | :--- | :--- |
| **A1** | ≤ 25 | ≤ 5 | Nearly Zero Energy Building (NZEB) |
| **A2** | 25.01 - 50 | 5.01 - 10 | Premium High Efficiency / Heat Pump + PV |
| **A3** | 50.01 - 75 | 10.01 - 15 | Super Efficient Retrofit |
| **B1** | 75.01 - 100 | 15.01 - 20 | Excellent Energy Performance |
| **B2** | 100.01 - 125 | 20.01 - 25 | Standard SEAI Grant Target Benchmark |
| **B3** | 125.01 - 150 | 25.01 - 30 | Good Efficiency Level |
| **C1** | 150.01 - 175 | 30.01 - 35 | Moderate Rating |
| **C2** | 175.01 - 200 | 35.01 - 40 | Average Existing Irish Home |
| **C3** | 200.01 - 225 | 40.01 - 45 | Mildly Leaky Structure |
| **D1** | 225.01 - 260 | 45.01 - 52 | High Fossil Fuel Dependence |
| **D2** | 260.01 - 300 | 52.01 - 60 | Poor Thermal Performance |
| **E1** | 300.01 - 340 | 60.01 - 68 | Very High Thermal Losses |
| **E2** | 340.01 - 380 | 68.01 - 76 | Severely Inefficient |
| **F** | 380.01 - 450 | 76.01 - 90 | Extremely Poor Insulation |
| **G** | > 450 | > 90 | Substandard / Maximum Leakiness |

---

## 2. Strategic BER Band Progression Routes

### Route 1: G/F to B2 (Standard Deep Retrofit)
- **Primary Energy Reduction**: ~350+ kWh/m²/yr saved.
- **Required Measures**:
  1. Full attic insulation upgrade (300mm mineral wool).
  2. External wall insulation or pumped cavity fill.
  3. Low-E double/triple glazing replacement.
  4. Air tightness sealing & demand controlled ventilation.
  5. High-efficiency Air-to-Water heat pump installation.

### Route 2: D/C to A2 (NZEB Benchmark Transformation)
- **Primary Energy Reduction**: ~150-200 kWh/m²/yr saved.
- **Required Measures**:
  1. Full fabric wrap (wall & floor edge insulation).
  2. Triple glazing (U-value ≤ 0.8 W/m²K).
  3. Heat pump integration with smart thermostatic controls.
  4. 4.5 kWp Solar PV array + battery storage.

---

## 3. Official NEAP / DEAP Calculation Inputs
- **Primary Energy Factors (Ireland)**:
  - Electricity: 1.75
  - Heating Oil: 1.10
  - Natural Gas: 1.10
- **CO₂ Emission Factors**:
  - Electricity: 0.224 kg CO₂/kWh
  - Heating Oil: 0.264 kg CO₂/kWh
  - Natural Gas: 0.203 kg CO₂/kWh
