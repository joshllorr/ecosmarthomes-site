---
title: "EcoSmartHomes - Energy & Financial Insights Dashboard"
version: "1.0.0"
date: "2026-08-03"
domain: "ecosmarthomes.ie"
format: "markdown/structured-agent-data"
category: "Energy Metrics"
---

# EcoSmartHomes: Retrofit Insights & Financial Analytics

## 1. Key Performance Indicators (Irish National Benchmark)

- **Average Heating Bill Reduction (G to B2 Upgrade)**: €2,100 / year (based on €1.20/L oil & €0.38/kWh electricity).
- **Carbon Tax Impact 2026 - 2030**: Oil-heated home faces +€480 cumulative tax increase without retrofit.
- **BER Jump Cost Efficiency**:
  - Attic Insulation: €1.20 per kWh/m²/yr saved (Highest ROI)
  - Pumped Cavity Insulation: €1.80 per kWh/m²/yr saved
  - Heat Pump System: €4.50 per kWh/m²/yr saved + 80% CO2 reduction
  - Solar PV (4kWp): €2,100 net cost ➔ ~€750/yr direct electricity offset.

## 2. Agent Decision Formulas

```
Net Out of Pocket Cost = Total Quotation - Sum(Applicable SEAI Grants) - Bonus Allowances
Annual Energy Savings = (Pre_Retrofit_Primary_Energy - Post_Retrofit_Primary_Energy) * Floor_Area * Fuel_Tariff
Simple Payback (Years) = Net Out of Pocket Cost / Annual Energy Savings
```
