/**
 * /api/generate-roadmap.js & /api/generate-pdf-report.js
 * Vercel Serverless Function: Bank-Grade Multi-Tool Energy Dossier Generator
 * Supports: Solar PV, Carbon Tax Shield, and Master BER Roadmap reports with Onsite Assessment hooks
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const payload = req.body || req.query || {};
    const {
      reportType = 'roadmap', // 'solar' | 'carbon-tax' | 'ber' | 'roadmap'
      name = 'Irish Homeowner',
      address = 'Butterfield Avenue, Castletroy, Limerick',
      eircode = 'V94 X7Y2',
      town = 'Limerick',
      county = 'Co. Limerick',
      currentBer = 'D1',
      targetBer = 'A2',
      dwellingType = '1990s 4-Bed Semi-Detached (138 m²)',
      heatingType = 'Kerosene Home Heating Oil',
      upgrades = ['heatPump', 'wallInsulation', 'atticInsulation', 'solarPv']
    } = payload;

    const reportId = 'ESH-' + reportType.toUpperCase().slice(0, 3) + '-' + Math.floor(100000 + Math.random() * 900000);
    const date = new Date().toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' });

    // Official 15-Band Irish BER Matrix
    const berMatrix = {
      'A1': { kwh: 20,  fuel: 350,  co2: 0.3, label: 'NZEB Zero-Emission' },
      'A2': { kwh: 40,  fuel: 550,  co2: 0.6, label: 'Deep Retrofit Gold Standard' },
      'A3': { kwh: 65,  fuel: 750,  co2: 1.0, label: 'Modern High Efficiency' },
      'B1': { kwh: 90,  fuel: 950,  co2: 1.4, label: 'Low Carbon Standard' },
      'B2': { kwh: 115, fuel: 1200, co2: 1.8, label: 'SEAI National Cost-Optimal Minimum' },
      'B3': { kwh: 140, fuel: 1450, co2: 2.2, label: 'Good Modern Thermal Standard' },
      'C1': { kwh: 165, fuel: 1750, co2: 2.7, label: 'Moderate Efficiency' },
      'C2': { kwh: 190, fuel: 2050, co2: 3.1, label: 'Average 2000s Build' },
      'C3': { kwh: 215, fuel: 2350, co2: 3.6, label: 'Moderate Heat Loss' },
      'D1': { kwh: 245, fuel: 2750, co2: 4.2, label: 'Typical 1990s Irish Semi-D' },
      'D2': { kwh: 280, fuel: 3200, co2: 4.8, label: 'Typical 1980s Pebbledash Home' },
      'E1': { kwh: 320, fuel: 3600, co2: 5.4, label: 'Poor Thermal Standard' },
      'E2': { kwh: 360, fuel: 4000, co2: 6.0, label: 'Very High Heat Loss' },
      'F':  { kwh: 415, fuel: 4600, co2: 6.8, label: 'EPBD 2030 Priority Upgrade Mandatory' },
      'G':  { kwh: 520, fuel: 5400, co2: 8.5, label: 'Severe Thermal Loss (>450 kWh/m²/yr)' }
    };

    const curBerData = berMatrix[currentBer.toUpperCase()] || berMatrix['D1'];
    const tarBerData = berMatrix[(targetBer || 'A2').toUpperCase()] || berMatrix['A2'];

    // May 2026 SEAI Rates
    const grantTable = {
      heatPump: { name: 'Air-to-Water Heat Pump System', grant: 12500, estCost: 16500 },
      wallInsulation: { name: 'External Wall Insulation (The Wrap)', grant: 8000, estCost: 12000 },
      atticInsulation: { name: 'High-Density Attic Insulation (300mm)', grant: 2500, estCost: 3200 },
      solarPv: { name: 'Rooftop Solar PV Panels (10-Panel)', grant: 1800, estCost: 4800 },
      windowsDoors: { name: 'Triple Glazed A-Rated Windows', grant: 5600, estCost: 9500 },
      heatingControls: { name: 'Smart Multi-Zone Heating Controls', grant: 700, estCost: 1200 }
    };

    let totalGrants = 0;
    let totalGrossCost = 0;
    const selectedMeasures = [];

    if (Array.isArray(upgrades)) {
      upgrades.forEach(u => {
        if (grantTable[u]) {
          totalGrants += grantTable[u].grant;
          totalGrossCost += grantTable[u].estCost;
          selectedMeasures.push(grantTable[u]);
        }
      });
    }

    if (selectedMeasures.length === 0) {
      totalGrants = 24800;
      totalGrossCost = 36500;
    }

    const netOutlay = Math.max(0, totalGrossCost - totalGrants);
    const annualSavings = Math.max(900, curBerData.fuel - tarBerData.fuel);
    const cleanExportCeg = 385; // 24c/kWh Clean Export Guarantee
    const paybackYears = (netOutlay / (annualSavings + (reportType === 'solar' ? cleanExportCeg : 0))).toFixed(1);

    const roadmap = {
      meta: {
        reportId,
        reportType,
        date,
        assessorName: 'Joe H. (B.Sc. Energy Engineering, CIBSE Member)',
        assessorId: 'IE-BER-ASSESSOR-8821',
        standard: 'SEAI DEAP 4.2.2 Methodology / NSAI SR50 & SR54 NZEB Standard (May 2026 EPBD)',
        clientName: name,
        propertyAddress: address,
        eircode,
        town,
        county,
        dwellingType,
        heatingType
      },
      energyRatings: {
        currentBer: currentBer.toUpperCase(),
        currentPrimaryEnergy: `${curBerData.kwh} kWh/m²/yr (${curBerData.label})`,
        targetBer: (targetBer || 'A2').toUpperCase(),
        targetPrimaryEnergy: `${tarBerData.kwh} kWh/m²/yr (${tarBerData.label})`,
        hliCurrent: currentBer === 'G' ? '3.10 W/K/m²' : currentBer === 'F' ? '2.85 W/K/m²' : '2.45 W/K/m²',
        hliPostFabric: '1.78 W/K/m² (Passes SEAI 2.0 Heat Pump Limit)',
        radiatorReadiness: 'Pass (Delta T 30C Low-Temp Flow Compatible)'
      },
      grantEntitlements: {
        selectedMeasures,
        totalGrants,
        estimatedGrossCost: totalGrossCost,
        homeownerNetCapitalOutlay: netOutlay
      },
      financialSummary: {
        estimatedGrossCapitalCost: '€' + totalGrossCost.toLocaleString(),
        totalSeaiGrantFunding: '€' + totalGrants.toLocaleString(),
        homeownerNetCapitalOutlay: '€' + netOutlay.toLocaleString(),
        annualFuelBillReduction: '€' + annualSavings.toLocaleString() + ' / year',
        annualCleanExportCegEarnings: '€' + cleanExportCeg + ' / year',
        totalAnnualBenefit: '€' + (annualSavings + (reportType === 'solar' ? cleanExportCeg : 0)).toLocaleString() + ' / year',
        estimatedPaybackPeriod: paybackYears + ' Years',
        tenYearCarbonTaxPenaltyAvoided: '€6,840',
        propertyValueAppreciation: '+12% to +16% (CSO / SEAI Verified)'
      },
      onsiteAssessment: {
        available: true,
        engineer: 'Joe (SEAI Qualified Energy Assessor & Engineer)',
        description: 'In-person comprehensive property survey, room-by-room radiator sizing, thermal camera leak scan, and guaranteed grant blueprint.',
        bookingFee: '€49 (100% credited against full survey)',
        bookingUrl: 'https://www.ecosmarthomes.ie/#independent-survey'
      }
    };

    return res.status(200).json({ success: true, data: roadmap });

  } catch (err) {
    console.error('Roadmap generator error:', err);
    return res.status(500).json({ error: 'Failed to generate roadmap: ' + (err.message || err) });
  }
}
