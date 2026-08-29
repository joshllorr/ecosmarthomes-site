/**
 * EcoSmartHomes - Private Energy Notebook & Bank-Ready PDF Export Engine
 * 2026 Irish Statutory Energy Regulation & Green Mortgage Standards
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'esh_private_notebook';

  // Default Baseline Notebook State
  const defaultState = {
    address: '14 Meadow Grove, Blackrock',
    town: 'Blackrock',
    county: 'Dublin',
    eircode: 'A94 XY82',
    archetype: '3-Bed Semi-Detached (115m²)',
    currentBer: 'D1',
    targetBer: 'A2',
    currentFuel: 'Kerosene Home Heating Oil',
    monthlyHeatingBill: 320,
    lender: 'AIB (Allied Irish Banks)',
    mortgageBalance: 320000,
    grantCap: 35000,
    hpGrant: 12500,
    wallGrant: 8000,
    solarGrant: 1800,
    atticGrant: 2000,
    windowGrant: 5600,
    notes: 'Planned works: Air-to-water heat pump + NSAI SR50 rads, attic insulation, 4.2kWp solar PV. Targeting 3.45% Green Mortgage rate discount.'
  };

  let notebookData = Object.assign({}, defaultState);

  window.loadEnergyNotebook = function() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        notebookData = Object.assign({}, defaultState, JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not parse saved notebook data:', e);
    }
    populateNotebookUI();
  };

  window.saveEnergyNotebook = function() {
    // Read from form inputs
    notebookData.address = document.getElementById('nb-address')?.value || notebookData.address;
    notebookData.county = document.getElementById('nb-county')?.value || notebookData.county;
    notebookData.eircode = document.getElementById('nb-eircode')?.value || notebookData.eircode;
    notebookData.archetype = document.getElementById('nb-archetype')?.value || notebookData.archetype;
    notebookData.currentBer = document.getElementById('nb-current-ber')?.value || notebookData.currentBer;
    notebookData.targetBer = document.getElementById('nb-target-ber')?.value || notebookData.targetBer;
    notebookData.lender = document.getElementById('nb-lender')?.value || notebookData.lender;
    notebookData.mortgageBalance = parseInt(document.getElementById('nb-balance')?.value || '320000', 10);
    notebookData.notes = document.getElementById('nb-notes')?.value || notebookData.notes;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notebookData));
      if (window.showEshToast) {
        window.showEshToast('Notebook Saved Successfully!', '💾');
      }
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    populateNotebookUI();
  };

  function populateNotebookUI() {
    // Populate form inputs
    if (document.getElementById('nb-address')) document.getElementById('nb-address').value = notebookData.address;
    if (document.getElementById('nb-county')) document.getElementById('nb-county').value = notebookData.county;
    if (document.getElementById('nb-eircode')) document.getElementById('nb-eircode').value = notebookData.eircode;
    if (document.getElementById('nb-archetype')) document.getElementById('nb-archetype').value = notebookData.archetype;
    if (document.getElementById('nb-current-ber')) document.getElementById('nb-current-ber').value = notebookData.currentBer;
    if (document.getElementById('nb-target-ber')) document.getElementById('nb-target-ber').value = notebookData.targetBer;
    if (document.getElementById('nb-lender')) document.getElementById('nb-lender').value = notebookData.lender;
    if (document.getElementById('nb-balance')) document.getElementById('nb-balance').value = notebookData.mortgageBalance;
    if (document.getElementById('nb-notes')) document.getElementById('nb-notes').value = notebookData.notes;

    // Calculate Financials & Green Mortgage Slashes
    const greenDiscountPct = 0.0035; // 0.35% green mortgage interest discount
    const annualMortgageSavings = Math.round(notebookData.mortgageBalance * greenDiscountPct);
    const monthlyMortgageSavings = Math.round(annualMortgageSavings / 12);
    const statutoryGrantTotal = notebookData.hpGrant + notebookData.wallGrant + notebookData.solarGrant + notebookData.atticGrant + notebookData.windowGrant;
    const carbonTaxAvoided = Math.round(notebookData.monthlyHeatingBill * 12.35);

    // Populate Bank Dossier Viewport Elements
    if (document.getElementById('dossier-address')) document.getElementById('dossier-address').innerText = notebookData.address;
    if (document.getElementById('dossier-eircode')) document.getElementById('dossier-eircode').innerText = notebookData.eircode + ' · ' + notebookData.county;
    if (document.getElementById('dossier-archetype')) document.getElementById('dossier-archetype').innerText = notebookData.archetype;
    if (document.getElementById('dossier-ber-progression')) document.getElementById('dossier-ber-progression').innerText = `${notebookData.currentBer} ➔ ${notebookData.targetBer} (Compliant)`;
    if (document.getElementById('dossier-lender')) document.getElementById('dossier-lender').innerText = notebookData.lender;
    if (document.getElementById('dossier-grants-total')) document.getElementById('dossier-grants-total').innerText = `€${statutoryGrantTotal.toLocaleString()}`;
    if (document.getElementById('dossier-mortgage-slash')) document.getElementById('dossier-mortgage-slash').innerText = `-€${monthlyMortgageSavings}/mo (-€${annualMortgageSavings.toLocaleString()}/yr)`;
    if (document.getElementById('dossier-carbon-avoided')) document.getElementById('dossier-carbon-avoided').innerText = `€${carbonTaxAvoided.toLocaleString()} Saved`;
    if (document.getElementById('dossier-notes-display')) document.getElementById('dossier-notes-display').innerText = notebookData.notes;
  }

  // 1-Click Bank-Ready PDF Trigger (with Freemium Pass Gate)
  window.downloadBankReadyPDF = function() {
    if (window.requireFreemiumPass) {
      const allowed = window.requireFreemiumPass(() => {
        executePrintDossier();
      });
      if (!allowed) return;
    }
    executePrintDossier();
  };

  function executePrintDossier() {
    window.saveEnergyNotebook();
    if (window.showEshToast) {
      window.showEshToast('Generating Bank-Ready PDF Dossier...', '📄');
    }
    setTimeout(() => {
      window.print();
    }, 400);
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.loadEnergyNotebook();
  });

})();
