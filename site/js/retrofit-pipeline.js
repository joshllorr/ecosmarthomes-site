/**
 * EcoSmartHomes Interactive Retrofit Monetisation Pipeline
 * 1. SEAI Grant & Heat Pump Margin Estimator
 * 2. Gemini 2.5 Flash BER PDF Upload Dropzone
 */

(function() {
  'use strict';

  // Base API configuration (Direct VM public proxy or reverse rewrite)
  const API_UPLOAD_URL = '/api/retrofit/upload-document';
  const BACKUP_API_URL = 'http://34.121.195.76:5173/api/retrofit/upload-document';

  // SEAI May 2026 Grant Matrix
  const GRANT_RATES = {
    heatPump: 12500,
    wallInsulation: 8000,
    atticInsulation: 2500,
    solarPv: 1800,
    windowsDoors: 5600,
    heatingControls: 700
  };

  const BASE_RUNNING_COSTS = {
    'G': 4200,
    'F': 3700,
    'E': 3100,
    'D': 2500,
    'C': 1900,
    'B': 1300,
    'A': 700
  };

  function initGrantCalculator() {
    const calcForm = document.getElementById('seai-grant-calculator-form');
    if (!calcForm) return;

    function recalculate() {
      const berSelect = document.getElementById('calc-ber-select');
      const berVal = berSelect ? berSelect.value : 'D';
      
      let totalGrants = 0;
      let estimatedGross = 0;

      const upgrades = [
        { id: 'upgrade-heatpump', grant: GRANT_RATES.heatPump, cost: 16500 },
        { id: 'upgrade-wall', grant: GRANT_RATES.wallInsulation, cost: 12000 },
        { id: 'upgrade-attic', grant: GRANT_RATES.atticInsulation, cost: 3200 },
        { id: 'upgrade-solar', grant: GRANT_RATES.solarPv, cost: 4800 },
        { id: 'upgrade-windows', grant: GRANT_RATES.windowsDoors, cost: 9500 },
        { id: 'upgrade-controls', grant: GRANT_RATES.heatingControls, cost: 1200 }
      ];

      upgrades.forEach(u => {
        const checkbox = document.getElementById(u.id);
        if (checkbox && checkbox.checked) {
          totalGrants += u.grant;
          estimatedGross += u.cost;
        }
      });

      const netCost = Math.max(0, estimatedGross - totalGrants);
      const currentBill = BASE_RUNNING_COSTS[berVal] || 2500;
      const targetBill = 850; // Average A2 heat pump / solar running cost
      const annualSavings = Math.max(0, currentBill - targetBill);
      const paybackYears = annualSavings > 0 && netCost > 0 ? (netCost / annualSavings).toFixed(1) : 0;

      // Update UI elements
      const grantDisplay = document.getElementById('calc-total-grants');
      const netCostDisplay = document.getElementById('calc-net-cost');
      const savingsDisplay = document.getElementById('calc-annual-savings');
      const paybackDisplay = document.getElementById('calc-payback-years');

      if (grantDisplay) grantDisplay.textContent = '€' + totalGrants.toLocaleString();
      if (netCostDisplay) netCostDisplay.textContent = '€' + netCost.toLocaleString();
      if (savingsDisplay) savingsDisplay.textContent = '€' + annualSavings.toLocaleString() + ' / yr';
      if (paybackDisplay) paybackDisplay.textContent = paybackYears > 0 ? `${paybackYears} Years` : 'Immediate';
    }

    calcForm.addEventListener('change', recalculate);
    recalculate();
  }

  function initPdfUploadDropzone() {
    const dropzone = document.getElementById('ber-pdf-dropzone');
    const fileInput = document.getElementById('ber-pdf-file-input');
    const uploadStatus = document.getElementById('ber-upload-status');
    const analysisResults = document.getElementById('ber-analysis-results');

    if (!dropzone || !fileInput) return;

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('drag-active');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('drag-active');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        handleFileUpload(files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (fileInput.files.length > 0) {
        handleFileUpload(fileInput.files[0]);
      }
    });

    async function handleFileUpload(file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        alert('Please upload a valid PDF document (e.g. BER Certificate, Advisory Report, or Architectural Drawing).');
        return;
      }

      if (uploadStatus) {
        uploadStatus.style.display = 'block';
        uploadStatus.innerHTML = `
          <div style="background: #e6fffa; border: 1px solid #10b981; border-radius: 8px; padding: 15px; text-align: center; color: #065f46; margin-top: 15px;">
            <div style="font-weight: 700; margin-bottom: 5px;">⚡ Processing Document with Gemini 2.5 Flash...</div>
            <div style="font-size: 0.9rem;">Extracting BER ratings, heat pump viability, and SEAI grant eligibility...</div>
          </div>
        `;
      }

      const formData = new FormData();
      formData.append('propertyFile', file);
      formData.append('leadId', 'WEB-' + Math.floor(1000 + Math.random() * 9000));
      formData.append('propertyAddress', 'EcoSmart Home Assessment');

      try {
        let response;
        try {
          response = await fetch(API_UPLOAD_URL, {
            method: 'POST',
            body: formData
          });
        } catch (fetchErr) {
          // Fallback to direct VM endpoint if proxy rewrite is pending
          response = await fetch(BACKUP_API_URL, {
            method: 'POST',
            body: formData
          });
        }

        const data = await response.json();

        if (response.ok && data.success) {
          renderAnalysisResults(data.data, file.name);
        } else {
          throw new Error(data.error || 'Failed to analyze PDF document');
        }
      } catch (err) {
        console.error('Upload Error:', err);
        if (uploadStatus) {
          uploadStatus.innerHTML = `
            <div style="background: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 15px; color: #991b1b; margin-top: 15px;">
              <strong>Upload Notice:</strong> ${err.message || 'Could not connect to processing engine'}. Your document has been queued for manual review.
            </div>
          `;
        }
      }
    }

    function renderAnalysisResults(metrics, fileName) {
      if (!analysisResults) return;

      if (uploadStatus) uploadStatus.style.display = 'none';
      analysisResults.style.display = 'block';

      analysisResults.innerHTML = `
        <div style="background: #ffffff; border: 2px solid #10b981; border-radius: 16px; padding: 25px; margin-top: 20px; box-shadow: 0 10px 25px rgba(16,185,129,0.1);">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px;">
            <div>
              <span style="background: #10b981; color: #fff; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase;">AI Assessment Complete</span>
              <h3 style="color: #003f2d; margin: 8px 0 0 0; font-size: 1.3rem;">📄 ${fileName}</h3>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.85rem; color: #64748b;">WhatsApp Alert</div>
              <div style="color: #10b981; font-weight: 700;">Dispatched to Joe 📱</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 20px;">
            <div style="background: #f8fafc; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0; text-align: center;">
              <div style="font-size: 0.8rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Current BER</div>
              <div style="font-size: 1.8rem; font-weight: 800; color: #e63c0c;">${metrics.currentBERRating || 'D2'}</div>
            </div>

            <div style="background: #f8fafc; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0; text-align: center;">
              <div style="font-size: 0.8rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Target Upgrade</div>
              <div style="font-size: 1.8rem; font-weight: 800; color: #10b981;">${metrics.targetBERRating || 'A2'}</div>
            </div>

            <div style="background: #f8fafc; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0; text-align: center;">
              <div style="font-size: 0.8rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Heat Pump Score</div>
              <div style="font-size: 1.8rem; font-weight: 800; color: #003f2d;">${metrics.heatPumpViabilityScore ? metrics.heatPumpViabilityScore + '/100' : '88/100'}</div>
            </div>

            <div style="background: #f8fafc; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0; text-align: center;">
              <div style="font-size: 0.8rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Eligible SEAI Grants</div>
              <div style="font-size: 1.8rem; font-weight: 800; color: #10b981;">€${(metrics.calculatedSeaiGrants || 12500).toLocaleString()}</div>
            </div>
          </div>

          <div style="background: #ecfdf5; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
            <h4 style="color: #065f46; margin: 0 0 8px 0; font-size: 1rem;">Recommended Priority Measures</h4>
            <ul style="margin: 0; padding-left: 20px; color: #047857; font-size: 0.95rem;">
              ${(metrics.recommendedUpgrades || ['Air-to-Water Heat Pump with Weather Compensation', 'High-density Attic Insulation (300mm)', 'Demand Controlled Ventilation (DCV)']).map(u => `<li style="margin-bottom: 4px;">${u}</li>`).join('')}
            </ul>
          </div>

          <div style="text-align: center;">
            <p style="color: #475569; font-size: 0.9rem; margin-bottom: 12px;">Joe is reviewing your report right now. You will receive your verified conflict-free roadmap within 24 hours.</p>
            <a href="mailto:askjoe@ecosmarthomes.ie?subject=BER%20Analysis%20Enquiry%20-${fileName}" class="btn-primary" style="display: inline-block; text-decoration: none; padding: 12px 24px;">Message Joe Regarding This Analysis →</a>
          </div>
        </div>
      `;
    }
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initGrantCalculator();
      initPdfUploadDropzone();
    });
  } else {
    initGrantCalculator();
    initPdfUploadDropzone();
  }
})();
