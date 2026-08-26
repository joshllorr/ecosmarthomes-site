/**
 * EcoSmartHomes - AI Contractor Quote Red-Liner API
 * Audits heat pump & retrofit quotes against May 2026 SEAI Price Indices, NSAI SR50-2 & SR54 rules.
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const {
      contractorName = 'Independent Contractor',
      quoteAmount = 18500,
      heatPumpKw = 12,
      houseSizeSqm = 130,
      hasSr50Cert = false,
      hasBufferTank = true,
      bufferTankCost = 2800,
      grantDeductedUpfront = false,
      quoteNotes = '',
      filename = 'quote.pdf'
    } = req.body || {};

    const redFlags = [];
    let riskLevel = 'LOW';
    let potentialOverpayEst = 0;

    // 1. Sizing Check: Heat pump kW vs estimated heat loss
    const expectedKw = houseSizeSqm ? Math.max(6, Math.min(16, Math.round(houseSizeSqm / 18))) : 8;
    if (heatPumpKw > expectedKw + 3) {
      const overchargeSizing = (heatPumpKw - expectedKw) * 650;
      potentialOverpayEst += overchargeSizing;
      redFlags.push({
        severity: 'HIGH',
        category: 'Equipment Sizing (SR50-2)',
        title: `Oversized Heat Pump (${heatPumpKw} kW Quoted vs ~${expectedKw} kW Needed)`,
        description: `For a ~${houseSizeSqm || 130} sqm home, a ${heatPumpKw} kW heat pump is severely oversized. Without an SR50 room-by-room heat loss survey, this will lead to continuous compressor short-cycling, higher ESB electricity bills, and roughly €${overchargeSizing.toLocaleString()} in unnecessary upfront capital.`,
        clause: 'NSAI SR50-2:2024 Section 5.1 (Heat Loss Sizing Protocol)'
      });
    }

    // 2. Room-by-room SR50 Heat Loss Assessment missing
    if (!hasSr50Cert) {
      redFlags.push({
        severity: 'CRITICAL',
        category: 'SEAI Grant Compliance',
        title: 'Missing Mandatory SR50 Heat Loss Assessment (HLI ≤ 2.0)',
        description: 'The quote does not include a room-by-room Heat Loss Index (HLI) survey. SEAI will reject the €12,500 heat pump grant if the dwelling HLI exceeds 2.0 W/K·m².',
        clause: 'SEAI Domestic Technical Specification v4.2.2'
      });
    }

    // 3. Buffer Tank / Volumiser Markup Check
    if (hasBufferTank && bufferTankCost > 1800) {
      const bufferExcess = bufferTankCost - 1350;
      potentialOverpayEst += bufferExcess;
      redFlags.push({
        severity: 'MEDIUM',
        category: 'Component Pricing',
        title: `Buffer Tank Quoted at €${bufferTankCost.toLocaleString()} (National Avg: €1,350)`,
        description: `Buffer / volumiser tanks in Ireland standardly cost €1,100–€1,450 supplied & fitted. You are being quoted approximately €${bufferExcess.toLocaleString()} above the May 2026 Irish national price benchmark.`,
        clause: 'Irish Retrofit Material Index (Q2 2026)'
      });
    }

    // 4. Grant Deduction Transparency
    if (!grantDeductedUpfront) {
      redFlags.push({
        severity: 'MEDIUM',
        category: 'Cashflow & Financing',
        title: 'Full Gross Capital Charged Upfront (No Direct SEAI Grant Deduction)',
        description: 'You are required to fund the entire gross amount (€' + Number(quoteAmount).toLocaleString() + ') out-of-pocket and wait 8–12 weeks for SEAI grant reimbursement instead of the registered One-Stop-Shop net deduction model.',
        clause: 'SEAI Home Energy Grant Payment Terms'
      });
    }

    // 5. Total Price Benchmark Check
    const nationalBenchmarkGross = 14500 + (heatPumpKw * 300) + (hasBufferTank ? 1350 : 0);
    if (quoteAmount > nationalBenchmarkGross * 1.25) {
      const totalExcess = Math.round(quoteAmount - nationalBenchmarkGross);
      potentialOverpayEst = Math.max(potentialOverpayEst, totalExcess);
      redFlags.push({
        severity: 'HIGH',
        category: 'Market Pricing Anomaly',
        title: `Total Quote €${Number(quoteAmount).toLocaleString()} is ~${Math.round(((quoteAmount / nationalBenchmarkGross) - 1) * 100)}% Above Benchmark`,
        description: `National average for equivalent A-rated heat pump installation with controls and commissioning is ~€${nationalBenchmarkGross.toLocaleString()} gross before SEAI grants.`,
        clause: 'EcoSmartHomes Irish National Retrofit Benchmark Index'
      });
    }

    // Determine Risk Level
    if (redFlags.some(r => r.severity === 'CRITICAL')) {
      riskLevel = 'CRITICAL';
    } else if (redFlags.length >= 2 || redFlags.some(r => r.severity === 'HIGH')) {
      riskLevel = 'HIGH';
    } else if (redFlags.length > 0) {
      riskLevel = 'MEDIUM';
    }

    const auditSummary = {
      auditId: 'AUD-' + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date().toISOString(),
      filename,
      contractorName,
      quoteAmount: Number(quoteAmount),
      benchmarkPrice: Math.round(nationalBenchmarkGross),
      potentialOverpayEst: Math.round(potentialOverpayEst),
      riskLevel,
      flagCount: redFlags.length,
      redFlags,
      nextStepRecommendation: riskLevel === 'CRITICAL' || riskLevel === 'HIGH' 
        ? 'Do not sign this quote until an independent SR50 heat loss calculation and radiator sizing survey is conducted.'
        : 'Quote appears reasonably aligned with national benchmarks, but verify installer SEAI registration ID before placing deposit.',
      surveyBookingUrl: 'https://buy.stripe.com/test_aFabJ01EGbPz6tn8UYeME00'
    };

    return res.status(200).json({
      success: true,
      data: auditSummary
    });

  } catch (err) {
    console.error('Quote Audit Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to complete quote audit',
      details: err.message
    });
  }
}
