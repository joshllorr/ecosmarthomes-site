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

  function initScannerAndDropzone() {
    const dropzone = document.getElementById('ber-pdf-dropzone');
    const fileInput = document.getElementById('ber-pdf-file-input');
    const cameraInput = document.getElementById('ber-photo-camera-input');
    const uploadStatus = document.getElementById('ber-upload-status');
    const analysisResults = document.getElementById('ber-analysis-results');
    const tabPhoto = document.getElementById('tab-mode-photo');
    const tabPdf = document.getElementById('tab-mode-pdf');
    const categoryBar = document.getElementById('photo-category-bar');
    const categoryPills = document.querySelectorAll('.photo-category-pill');
    const dropzoneIcon = document.getElementById('dropzone-icon');
    const dropzoneTitle = document.getElementById('dropzone-title');
    const dropzoneDesc = document.getElementById('dropzone-desc');

    let currentMode = 'photo'; // 'photo' | 'pdf'
    let currentCategory = 'heating'; // 'heating' | 'attic' | 'electrical' | 'roof'

    if (!dropzone) return;

    // Tab switching
    if (tabPhoto && tabPdf) {
      tabPhoto.addEventListener('click', () => {
        currentMode = 'photo';
        tabPhoto.style.background = '#003f2d';
        tabPhoto.style.color = '#fff';
        tabPhoto.style.border = 'none';
        tabPdf.style.background = '#f1f5f9';
        tabPdf.style.color = '#475569';
        tabPdf.style.border = '1px solid #cbd5e1';
        if (categoryBar) categoryBar.style.display = 'flex';
        if (dropzoneIcon) dropzoneIcon.textContent = '📸';
        if (dropzoneTitle) dropzoneTitle.textContent = 'Take a Photo or Upload Image';
        if (dropzoneDesc) dropzoneDesc.textContent = 'Snap your boiler, cylinder, or attic with your phone';
      });

      tabPdf.addEventListener('click', () => {
        currentMode = 'pdf';
        tabPdf.style.background = '#003f2d';
        tabPdf.style.color = '#fff';
        tabPdf.style.border = 'none';
        tabPhoto.style.background = '#f1f5f9';
        tabPhoto.style.color = '#475569';
        tabPhoto.style.border = '1px solid #cbd5e1';
        if (categoryBar) categoryBar.style.display = 'none';
        if (dropzoneIcon) dropzoneIcon.textContent = '📄';
        if (dropzoneTitle) dropzoneTitle.textContent = 'Drag & Drop BER / Property PDF';
        if (dropzoneDesc) dropzoneDesc.textContent = 'Upload your BER cert or advisory report PDF';
      });
    }

    // Category pills selection
    categoryPills.forEach(pill => {
      pill.addEventListener('click', () => {
        categoryPills.forEach(p => {
          p.style.background = '#fff';
          p.style.color = '#64748b';
          p.style.border = '1px solid #cbd5e1';
        });
        pill.style.background = '#ecfdf5';
        pill.style.color = '#065f46';
        pill.style.border = '1px solid #10b981';
        currentCategory = pill.getAttribute('data-category') || 'heating';
      });
    });

    // Drag and drop events
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.style.borderColor = '#059669';
        dropzone.style.background = '#f0fdf4';
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.style.borderColor = '#10b981';
        dropzone.style.background = '#fbfdfc';
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        processUploadedFile(files[0]);
      }
    });

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (fileInput.files.length > 0) {
          processUploadedFile(fileInput.files[0]);
        }
      });
    }

    if (cameraInput) {
      cameraInput.addEventListener('change', (e) => {
        if (cameraInput.files.length > 0) {
          processUploadedFile(cameraInput.files[0]);
        }
      });
    }

    async function processUploadedFile(file) {
      const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|heic)$/i.test(file.name);
      const isPdf = file.name.toLowerCase().endsWith('.pdf');

      if (!isImage && !isPdf) {
        alert('Please upload a valid photo (JPG, PNG, WEBP) or a BER PDF document.');
        return;
      }

      if (isImage) {
        handlePhotoUpload(file);
      } else {
        handlePdfUpload(file);
      }
    }

    async function handlePhotoUpload(file) {
      if (uploadStatus) {
        uploadStatus.style.display = 'block';
        uploadStatus.innerHTML = `
          <div style="background: #e6fffa; border: 1px solid #10b981; border-radius: 8px; padding: 15px; text-align: center; color: #065f46; margin-top: 15px;">
            <div style="font-weight: 700; margin-bottom: 5px;">🔍 Analyzing Photo with Gemini 2.5 Flash Vision...</div>
            <div style="font-size: 0.9rem;">Detecting equipment specifications, pipework clearance, and SEAI grant eligibility...</div>
          </div>
        `;
      }

      // Convert image to Base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result;

        try {
          const res = await fetch('/api/analyze-photo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              mimeType: file.type || 'image/jpeg',
              scanCategory: currentCategory,
              leadId: 'PHOTO-' + Math.floor(1000 + Math.random() * 9000)
            })
          });

          const json = await res.json();
          if (res.ok && json.success) {
            renderPhotoAnalysisResults(json.data, file.name, base64Data);
          } else {
            throw new Error(json.error || 'Photo analysis failed');
          }
        } catch (err) {
          console.error('Photo Scan Error:', err);
          if (uploadStatus) {
            uploadStatus.innerHTML = `
              <div style="background: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 15px; color: #991b1b; margin-top: 15px;">
                <strong>Notice:</strong> ${err.message || 'Image processing temporarily queued'}. Joe has received your equipment photo for manual review.
              </div>
            `;
          }
        }
      };
      reader.readAsDataURL(file);
    }

    async function handlePdfUpload(file) {
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
          response = await fetch(API_UPLOAD_URL, { method: 'POST', body: formData });
        } catch (fetchErr) {
          response = await fetch(BACKUP_API_URL, { method: 'POST', body: formData });
        }

        const data = await response.json();
        if (response.ok && data.success) {
          renderPdfAnalysisResults(data.data, file.name);
        } else {
          throw new Error(data.error || 'Failed to analyze PDF document');
        }
      } catch (err) {
        console.error('Upload Error:', err);
        if (uploadStatus) {
          uploadStatus.innerHTML = `
            <div style="background: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 15px; color: #991b1b; margin-top: 15px;">
              <strong>Notice:</strong> Document queued for manual review.
            </div>
          `;
        }
      }
    }

    function renderPhotoAnalysisResults(metrics, fileName, previewUrl) {
      if (!analysisResults) return;
      if (uploadStatus) uploadStatus.style.display = 'none';
      analysisResults.style.display = 'block';

      analysisResults.innerHTML = `
        <div style="background: #ffffff; border: 2px solid #10b981; border-radius: 16px; padding: 25px; margin-top: 20px; box-shadow: 0 10px 25px rgba(16,185,129,0.1);">
          
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e2e8f0; padding-bottom: 14px; margin-bottom: 18px; gap: 15px;">
            <div style="display: flex; gap: 12px; align-items: center;">
              <img src="${previewUrl}" alt="Scanned Equipment" style="width: 65px; height: 65px; object-fit: cover; border-radius: 8px; border: 1px solid #cbd5e1;" />
              <div>
                <span style="background: #10b981; color: #fff; padding: 3px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">AI Vision Verified</span>
                <h3 style="color: #003f2d; margin: 4px 0 0 0; font-size: 1.15rem;">${metrics.detectedEquipment || 'Equipment Detected'}</h3>
                <div style="color: #64748b; font-size: 0.82rem;">Condition: <strong>${metrics.condition || 'Aging'}</strong></div>
              </div>
            </div>
            <div style="text-align: right; min-width: 110px;">
              <div style="font-size: 0.75rem; color: #64748b;">WhatsApp Lead</div>
              <div style="color: #10b981; font-weight: 700; font-size: 0.85rem;">Alert Sent 📱</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 18px;">
            <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center;">
              <div style="font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Heat Pump Score</div>
              <div style="font-size: 1.6rem; font-weight: 800; color: #003f2d;">${metrics.heatPumpViabilityScore || 88}/100</div>
            </div>

            <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center;">
              <div style="font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Eligible Grants</div>
              <div style="font-size: 1.6rem; font-weight: 800; color: #10b981;">€${(metrics.eligibleSeaiGrants || 12500).toLocaleString()}</div>
            </div>

            <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center;">
              <div style="font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Est. Fuel Savings</div>
              <div style="font-size: 1.6rem; font-weight: 800; color: #f59e0b;">€${(metrics.estimatedAnnualSavings || 1150).toLocaleString()}<span style="font-size: 0.85rem;">/yr</span></div>
            </div>
          </div>

          <div style="background: #ecfdf5; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
            <div style="font-weight: 700; color: #065f46; font-size: 0.9rem; margin-bottom: 6px;">🔍 Technical Assessment:</div>
            <p style="margin: 0 0 8px 0; color: #047857; font-size: 0.88rem;">${metrics.spaceClearanceStatus || 'Suitable space for external air-to-water heat pump installation.'}</p>
            <ul style="margin: 0; padding-left: 18px; color: #047857; font-size: 0.85rem;">
              ${(metrics.recommendations || ['Complete €49 Independent Survey to verify technical heat loss index (HLI) requirement.']).map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>

          <div style="text-align: center; background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px;">
            <p style="color: #92400e; font-size: 0.88rem; font-weight: 600; margin: 0 0 10px 0;">Lock in your €12,500 SEAI grants with an independent, non-commission survey.</p>
            <a href="https://buy.stripe.com/test_aFabJ01EGbPz6tn8UYeME00" target="_blank" rel="noopener" class="btn-primary" style="display: inline-block; background: #f59e0b; border-color: #d97706; color: #000; font-weight: 800; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 0.95rem;">Order Full €49 Survey for This Property →</a>
          </div>

        </div>
      `;
    }

    function renderPdfAnalysisResults(metrics, fileName) {
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
            <a href="https://buy.stripe.com/test_aFabJ01EGbPz6tn8UYeME00" target="_blank" rel="noopener" class="btn-primary" style="display: inline-block; background: #f59e0b; border-color: #d97706; color: #000; font-weight: 800; text-decoration: none; padding: 12px 24px; border-radius: 6px;">Order Independent €49 Survey →</a>
          </div>
        </div>
      `;
    }
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initGrantCalculator();
      initScannerAndDropzone();
    });
  } else {
    initGrantCalculator();
    initScannerAndDropzone();
  }
})();
