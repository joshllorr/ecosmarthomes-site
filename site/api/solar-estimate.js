/**
 * /site/api/solar-estimate.js
 * Vercel Serverless Function: Irish Solar PV & Clean Export Guarantee (CEG) Engine
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      eircode = '',
      county = 'Limerick',
      panels = 10,
      hasBattery = false,
      orientation = 'South',
      monthlyBill = 180
    } = req.body || {};

    const panelCount = Math.max(4, Math.min(24, parseInt(panels) || 10));
    const systemSizeKwp = (panelCount * 0.43);

    const regionalYields = {
      'Wexford': 1050, 'Waterford': 1040, 'Cork': 1020, 'Kerry': 1010,
      'Limerick': 980, 'Dublin': 1000, 'Kildare': 990, 'Wicklow': 1010,
      'Galway': 960, 'Clare': 970, 'Tipperary': 990, 'Mayo': 940,
      'Donegal': 920, 'Louth': 980, 'Meath': 990
    };

    const orientationMultipliers = {
      'South': 1.0,
      'South-East': 0.95,
      'South-West': 0.95,
      'East': 0.82,
      'West': 0.82
    };

    const baseYield = regionalYields[county] || 980;
    const orientMult = orientationMultipliers[orientation] || 1.0;

    const totalAnnualKwh = Math.round(systemSizeKwp * baseYield * orientMult);

    const exportTariffPerKwh = 0.24;
    const importTariffPerKwh = 0.34;

    let selfConsumptionPercent = hasBattery ? 0.80 : 0.45;
    let exportPercent = 1.0 - selfConsumptionPercent;

    const selfConsumedKwh = Math.round(totalAnnualKwh * selfConsumptionPercent);
    const exportedKwh = Math.round(totalAnnualKwh * exportPercent);

    const annualBillSavings = Math.round(selfConsumedKwh * importTariffPerKwh);
    const annualCegExportEarnings = Math.round(exportedKwh * exportTariffPerKwh);
    const totalAnnualBenefit = annualBillSavings + annualCegExportEarnings;

    let seaiGrant = 0;
    if (systemSizeKwp <= 2.0) {
      seaiGrant = Math.round(systemSizeKwp * 400);
    } else {
      seaiGrant = Math.min(1800, Math.round(800 + (systemSizeKwp - 2.0) * 350));
    }

    const grossCost = Math.round((systemSizeKwp * 1250) + (hasBattery ? 2800 : 0));
    const netCost = Math.max(0, grossCost - seaiGrant);
    const paybackYears = (netCost / (totalAnnualBenefit || 1)).toFixed(1);
    const lifetime25YrSavings = Math.round((totalAnnualBenefit * 25) - netCost);

    return res.status(200).json({
      success: true,
      data: {
        eircode,
        county,
        panels: panelCount,
        systemSizeKwp: parseFloat(systemSizeKwp.toFixed(2)),
        hasBattery,
        orientation,
        totalAnnualKwh,
        selfConsumedKwh,
        exportedKwh,
        annualBillSavings,
        annualCegExportEarnings,
        totalAnnualBenefit,
        seaiGrant,
        grossCost,
        netCost,
        paybackYears: parseFloat(paybackYears),
        lifetime25YrSavings,
        co2SavedKgPerYear: Math.round(totalAnnualKwh * 0.348)
      }
    });

  } catch (err) {
    console.error('Solar estimator error:', err);
    return res.status(500).json({ error: 'Solar calculation failed: ' + (err.message || err) });
  }
}
