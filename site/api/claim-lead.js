/**
 * /site/api/claim-lead.js
 * Vercel Serverless Function: Contractor Exclusive Lead Unlocking
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
    const { leadId = 'LEAD-CASTLETROY-8821', partnerId = 'SEAI-CONTRACTOR-DEMO' } = req.body || {};

    const timestamp = new Date().toISOString();

    const unmaskedLead = {
      leadId,
      claimedByPartner: partnerId,
      claimStatus: 'CLAIMED · 100% EXCLUSIVE ACCESS',
      claimedAt: timestamp,
      homeowner: {
        fullName: "John O'Connor",
        phone: "+353871234567",
        phoneFormatted: "+353 87 123 4567",
        email: "john.oconnor@munsterhome.ie",
        address: "14 Butterfield Close, Castletroy, Limerick",
        eircode: "V94 X7Y2",
        preferredContactTime: "Evenings (After 5:30 PM)"
      },
      diagnostic: {
        dwellingType: "1990s 4-Bed Semi-Detached (138 m²)",
        currentBer: "D1 (248 kWh/m²/yr)",
        targetBer: "A2 (45 kWh/m²/yr)",
        hliHeatLoss: "1.88 W/K/m² (Pre-screened under 2.0 limit)",
        targetUpgrades: [
          "10kW Air-to-Water Monobloc Heat Pump",
          "300L High-Recovery Stainless Steel Cylinder",
          "4.3 kWp Rooftop Solar PV (10 x 430W Panels)",
          "300mm Attic Mineral Wool Top-up"
        ],
        seaiGrantBreakdown: {
          heatPumpGrant: "€12,500",
          solarPvGrant: "€1,800",
          atticGrant: "€2,500",
          totalSeaiFunding: "€16,800"
        },
        estimatedContractorGrossBudget: "€22,500 - €26,000",
        homeownerNetBudget: "€5,700 - €9,200"
      },
      directActions: {
        telUrl: "tel:+353871234567",
        whatsappUrl: "https://wa.me/353871234567?text=Hi%20John,%20this%20is%20your%20SEAI%20registered%20retrofit%20partner%20following%20up%20on%20your%20EcoSmartHomes%20survey.",
        mailtoUrl: "mailto:john.oconnor@munsterhome.ie?subject=EcoSmartHomes%20SEAI%20Retrofit%20Follow-up"
      }
    };

    return res.status(200).json({
      success: true,
      message: `Lead ${leadId} successfully claimed! Homeowner contact information and full technical dossier have been unlocked.`,
      data: unmaskedLead
    });

  } catch (err) {
    console.error('Lead claim error:', err);
    return res.status(500).json({ error: 'Failed to claim lead: ' + (err.message || err) });
  }
}
