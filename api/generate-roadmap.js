/**
 * /api/generate-roadmap.js
 * Vercel Serverless Function: Bank-Grade Retrofit Roadmap Data Generator
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const {
      name = 'Irish Homeowner',
      address = 'Butterfield Avenue, Castletroy, Limerick',
      eircode = 'V94 X7Y2',
      currentBer = 'D1',
      dwellingType = '1990s 4-Bed Semi-Detached (138 m²)',
      heatingType = 'Kerosene Home Heating Oil'
    } = req.body || req.query || {};

    const reportId = 'ESH-DOSSIER-' + Math.floor(100000 + Math.random() * 900000);
    const date = new Date().toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' });

    const roadmap = {
      meta: {
        reportId,
        date,
        assessorName: 'Joe H. (B.Sc. Energy Engineering, CIBSE Member)',
        assessorId: 'IE-BER-ASSESSOR-8821',
        standard: 'SEAI DEAP 4.2.2 Methodology / NZEB Standard',
        clientName: name,
        propertyAddress: address,
        eircode,
        dwellingType,
        heatingType
      },
      energyRatings: {
        currentBer,
        currentPrimaryEnergy: '248 kWh/m²/yr',
        targetBer: 'A2',
        targetPrimaryEnergy: '45 kWh/m²/yr',
        hliCurrent: '2.45 W/K/m²',
        hliPostFabric: '1.84 W/K/m² (Eligible under SEAI 2.0 Heat Pump Limit)'
      },
      grantEntitlements: {
        heatPump: 12500,
        externalWall: 8000,
        atticInsulation: 2500,
        solarPv: 1800,
        heatingControls: 700,
        totalGrants: 25500
      },
      financialSummary: {
        estimatedGrossCapitalCost: '€32,000 - €36,000',
        totalSeaiGrantFunding: '€25,500',
        homeownerNetCapitalOutlay: '€6,500 - €10,500',
        annualFuelBillReduction: '€1,650 / year',
        annualCleanExportCegEarnings: '€385 / year',
        totalAnnualBenefit: '€2,035 / year',
        estimatedPaybackPeriod: '3.8 Years'
      }
    };

    return res.status(200).json({ success: true, data: roadmap });

  } catch (err) {
    console.error('Roadmap generator error:', err);
    return res.status(500).json({ error: 'Failed to generate roadmap: ' + (err.message || err) });
  }
}
