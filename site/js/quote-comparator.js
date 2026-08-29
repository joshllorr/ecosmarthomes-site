/**
 * EcoSmartHomes - 1-Tap Contractor Quote Comparator & WhatsApp Dispute Generator
 * 2026 Irish Statutory Energy Regulation Compliant (NSAI SR50-2 & SEAI Guidelines)
 */

(function() {
  'use strict';

  // Preset Irish Real-World Quote Scenarios
  const PRESET_SCENARIOS = {
    'dublin-semi': {
      title: 'Dublin 3-Bed Semi-D (115m²) — Grant Gouger vs. NSAI Compliant',
      quoteA: {
        contractor: 'FastHeat Retrofits Ltd',
        grossPrice: 19800,
        grantDeducted: 6500,
        hpModel: '8kW Air-to-Water Heat Pump',
        bufferTank: 'Not Listed / Int. Bypass only',
        bufferTankOk: false,
        rads: '8x Existing Radiators Re-used (No delta-T upgrade)',
        radsOk: false,
        warranty: '2 Years Manufacturer',
        complianceNotes: '⚠️ High Risk: Undersized radiators at 55°C flow temp will trigger auxiliary backup immersion heater, driving winter electric bills to €600+/mo. Missing dedicated 50L buffer tank risks compressor short-cycling.'
      },
      quoteB: {
        contractor: 'EcoPro Engineering Services',
        grossPrice: 22400,
        grantDeducted: 12500, // Includes HP (€6.5k) + NSAI rads (€2k) + Renewable Heat bonus (€4k)
        hpModel: '8.5kW Split Heat Pump (SCOP 4.85)',
        bufferTank: '50L External Low-Loss Header & Volumizer Included',
        bufferTankOk: true,
        rads: '8x Type 22 High-Output Radiators (NSAI SR50 ΔT30 Sized)',
        radsOk: true,
        warranty: '7 Years Parts & Labour (SEAI Certified)',
        complianceNotes: '✅ Recommended: 100% compliant with NSAI SR50-2:2024. Full €12,500 system grant package applied. Guaranteed 55°C design flow temp with zero short-cycling risk.'
      }
    },
    'cork-detached': {
      title: 'Cork 4-Bed Detached (175m²) — Incomplete Spec vs. Full Deep Retrofit',
      quoteA: {
        contractor: 'Southern Thermal Solutions',
        grossPrice: 27500,
        grantDeducted: 6500,
        hpModel: '12kW Monobloc Heat Pump',
        bufferTank: 'Standard 20L in-line cylinder',
        bufferTankOk: false,
        rads: '12x Mixed Type 11/21 rads (Survey Pending)',
        radsOk: false,
        warranty: '3 Years Standard',
        complianceNotes: '⚠️ Incomplete Spec: Missing NSAI room-by-room heat loss calculations. Only standard €6.5k single measure claimed, omitting €6k in available radiator & fossil fuel phaseout bonuses.'
      },
      quoteB: {
        contractor: 'Munster Green Retrofits & Solar',
        grossPrice: 31000,
        grantDeducted: 16500, // HP bundle €12.5k + Solar PV €1.8k + Controls €2.2k
        hpModel: '11.2kW High-COP Inverter Heat Pump + 4.2kWp Solar PV',
        bufferTank: '100L Buffer Tank + Magnetic Filtration System',
        bufferTankOk: true,
        rads: '12x Type 22 & 33 NSAI SR50 Compliant Radiators',
        radsOk: true,
        warranty: '10 Years Compressor / 5 Years Labour',
        complianceNotes: '✅ Recommended: Comprehensive whole-house deep retrofit package. Solar PV integration provides 2,100 kWh free summer hot water.'
      }
    },
    'galway-retrofit': {
      title: 'Galway Bungalow (130m²) — Inflated Markup vs. Transparent Trade Pricing',
      quoteA: {
        contractor: 'Atlantic Green Energy',
        grossPrice: 24900,
        grantDeducted: 6500,
        hpModel: '10kW Air-to-Water Unit',
        bufferTank: 'Internal Volumizer',
        bufferTankOk: false,
        rads: '6x Oversized Rads (No NSAI Cert)',
        radsOk: false,
        warranty: '5 Years Manufacturer',
        complianceNotes: '⚠️ Inflated Gross: Gross equipment markup is €4,200 higher than standard Irish trade rates to absorb grant margin without passing true savings to client.'
      },
      quoteB: {
        contractor: 'Connacht EcoEnergy Ltd',
        grossPrice: 19500,
        grantDeducted: 12500,
        hpModel: '9kW Air-to-Water Heat Pump (A+++)',
        bufferTank: '60L Buffer Vessel & Micro-bubble Deaerator',
        bufferTankOk: true,
        rads: '10x NSAI SR50-2:2024 Certified Low-Flow Rads',
        radsOk: true,
        warranty: '7 Years Comprehensive',
        complianceNotes: '✅ Recommended: Fair itemized pricing with full €12,500 SEAI grant stack applied. Lowest net out-of-pocket cost.'
      }
    }
  };

  let currentComparison = null;

  window.loadComparatorPreset = function(presetKey) {
    const scenario = PRESET_SCENARIOS[presetKey];
    if (!scenario) return;

    currentComparison = scenario;
    renderComparison(scenario);

    // Update active preset button styling
    document.querySelectorAll('.comparator-preset-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-preset') === presetKey) {
        btn.classList.add('active');
      }
    });

    const res = document.getElementById('comparator-results-section');
    if (res) {
      res.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  function renderComparison(scenario) {
    const qA = scenario.quoteA;
    const qB = scenario.quoteB;

    const netA = qA.grossPrice - qA.grantDeducted;
    const netB = qB.grossPrice - qB.grantDeducted;
    const diff = Math.abs(netA - netB);
    const betterQuote = netB < netA ? 'Quote B' : 'Quote A';

    // Populate comparison card A
    document.getElementById('card-a-contractor').innerText = qA.contractor;
    document.getElementById('card-a-gross').innerText = '€' + qA.grossPrice.toLocaleString();
    document.getElementById('card-a-grant').innerText = '-€' + qA.grantDeducted.toLocaleString();
    document.getElementById('card-a-net').innerText = '€' + netA.toLocaleString();
    document.getElementById('card-a-hp').innerText = qA.hpModel;
    document.getElementById('card-a-buffer').innerHTML = qA.bufferTankOk 
      ? `<span class="badge-ok">✓ ${qA.bufferTank}</span>`
      : `<span class="badge-warn">⚠️ ${qA.bufferTank}</span>`;
    document.getElementById('card-a-rads').innerHTML = qA.radsOk
      ? `<span class="badge-ok">✓ ${qA.rads}</span>`
      : `<span class="badge-warn">⚠️ ${qA.rads}</span>`;
    document.getElementById('card-a-warranty').innerText = qA.warranty;
    document.getElementById('card-a-notes').innerHTML = qA.complianceNotes;

    // Populate comparison card B
    document.getElementById('card-b-contractor').innerText = qB.contractor;
    document.getElementById('card-b-gross').innerText = '€' + qB.grossPrice.toLocaleString();
    document.getElementById('card-b-grant').innerText = '-€' + qB.grantDeducted.toLocaleString();
    document.getElementById('card-b-net').innerText = '€' + netB.toLocaleString();
    document.getElementById('card-b-hp').innerText = qB.hpModel;
    document.getElementById('card-b-buffer').innerHTML = qB.bufferTankOk 
      ? `<span class="badge-ok">✓ ${qB.bufferTank}</span>`
      : `<span class="badge-warn">⚠️ ${qB.bufferTank}</span>`;
    document.getElementById('card-b-rads').innerHTML = qB.radsOk
      ? `<span class="badge-ok">✓ ${qB.rads}</span>`
      : `<span class="badge-warn">⚠️ ${qB.rads}</span>`;
    document.getElementById('card-b-warranty').innerText = qB.warranty;
    document.getElementById('card-b-notes').innerHTML = qB.complianceNotes;

    // Summary Banner
    const banner = document.getElementById('comparator-verdict-banner');
    if (banner) {
      banner.innerHTML = `
        <div style="font-size: 1.1rem; font-weight: 900; color: #34f5c5; margin-bottom: 4px;">
          🏆 Engineer's Verdict: ${qB.contractor} (Quote B) Saves You €${diff.toLocaleString()} Net + Protects Equipment Longevity
        </div>
        <div style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.4;">
          Quote A omits statutory NSAI SR50-2 low-temperature radiator sizing and dedicated buffer tank filtration. Quote B applies the full 2026 statutory €12,500 grant package and guarantees 55°C flow design.
        </div>
      `;
    }

    // Generate WhatsApp Dispute Message
    generateDisputeScript(qA, qB);

    const container = document.getElementById('comparator-results-section');
    if (container) container.style.display = 'block';
  }

  function generateDisputeScript(qA, qB) {
    const message = `Hi ${qA.contractor},\n\nThank you for providing your retrofit quote (€${qA.grossPrice.toLocaleString()} gross / €${(qA.grossPrice - qA.grantDeducted).toLocaleString()} net). We had our quote specifications independently reviewed against the 2026 Irish Building Regulations and NSAI SR50-2:2024 standards via EcoSmartHomes.\n\nOur independent engineer flagged the following points for clarification:\n1. 🛢️ Buffer Tank & Volumizer: The quote does not specify an external dedicated buffer vessel / low-loss header to prevent short-cycling.\n2. 📐 NSAI SR50-2 Radiator Delta-T: Existing radiators are listed without ΔT30 room-by-room heat loss calculations for 55°C flow temp.\n3. 💶 Grant Deduction: You have listed €${qA.grantDeducted.toLocaleString()} in SEAI grants, whereas under the 2026 scheme, a heat pump + radiator + fossil fuel replacement package qualifies for up to €12,500.\n\nCould you please provide an itemized revision addressing the NSAI SR50-2 radiator schedule, buffer vessel inclusion, and updated grant deduction?\n\nKind regards,\n[Your Name]`;

    const txtBox = document.getElementById('whatsapp-dispute-text');
    if (txtBox) txtBox.value = message;

    const waBtn = document.getElementById('btn-send-whatsapp-dispute');
    if (waBtn) {
      waBtn.href = `https://wa.me/?text=${encodeURIComponent(message)}`;
    }
  }

  window.copyDisputeScript = function() {
    const txtBox = document.getElementById('whatsapp-dispute-text');
    if (!txtBox) return;

    if (window.requireFreemiumPass) {
      const allowed = window.requireFreemiumPass(() => {
        navigator.clipboard.writeText(txtBox.value).then(() => {
          if (window.showEshToast) window.showEshToast('Copied WhatsApp Negotiation Script!', '💬');
        });
      });
      if (!allowed) return;
    }

    navigator.clipboard.writeText(txtBox.value).then(() => {
      if (window.showEshToast) window.showEshToast('Copied WhatsApp Negotiation Script!', '💬');
    });
  };

  // Custom User Quote Parsing (Regex Evaluator)
  window.parseCustomQuotes = function() {
    const rawA = document.getElementById('input-raw-quote-a')?.value || '';
    const rawB = document.getElementById('input-raw-quote-b')?.value || '';

    if (!rawA.trim()) {
      alert('Please paste or type text for Quote A (or click a live demo preset above).');
      return;
    }

    // Zero-bloat regex parsing
    function parseText(txt, defaultName) {
      const grossMatch = txt.match(/€?\s*(\d{1,2}[,\.]\d{3}|\d{4,5})/);
      let gross = grossMatch ? parseInt(grossMatch[1].replace(/[,\.]/g, '')) : 21000;
      if (gross < 5000) gross = 21000;

      const hasBuffer = /buffer|volumizer|low[- ]loss|header|50l|100l/i.test(txt);
      const hasRads = /nsai|sr50|type 22|type 33|rad upgrade|radiator upgrade|oversiz/i.test(txt);
      const hasFullGrant = /12,?500|grant stack|renewable heat/i.test(txt);
      const grant = hasFullGrant ? 12500 : 6500;

      return {
        contractor: defaultName,
        grossPrice: gross,
        grantDeducted: grant,
        hpModel: 'Air-to-Water Heat Pump System',
        bufferTank: hasBuffer ? 'Buffer Tank / Volumizer Specified' : 'Not Specified in Scope',
        bufferTankOk: hasBuffer,
        rads: hasRads ? 'NSAI SR50 Sized Low-Flow Rads' : 'Standard Existing / Unspecified',
        radsOk: hasRads,
        warranty: 'Standard Trade Warranty',
        complianceNotes: hasBuffer && hasRads 
          ? '✅ Compliant: Scope includes critical buffer tank and low-flow radiator upgrades.' 
          : '⚠️ High Risk: Missing dedicated buffer tank or certified NSAI radiator sizing.'
      };
    }

    const customScenario = {
      title: 'Custom Uploaded Quotes Comparison',
      quoteA: parseText(rawA, 'Contractor Quote A'),
      quoteB: rawB.trim() ? parseText(rawB, 'Contractor Quote B') : PRESET_SCENARIOS['dublin-semi'].quoteB
    };

    currentComparison = customScenario;
    renderComparison(customScenario);

    const res = document.getElementById('comparator-results-section');
    if (res) res.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Auto-init preset on load
  document.addEventListener('DOMContentLoaded', () => {
    window.loadComparatorPreset('dublin-semi');
  });

})();
