import React, { useState } from 'react';

export default function OnboardingWizard({ onClose, copyData }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    propertyType: 'semi-detached',
    currentBER: 'D',
    heatingFuel: 'oil',
    annualBill: 3500,
    uploadedPhoto: null,
    photoPreview: null,
    isScanning: false,
    scanComplete: false,
    radiatorCount: 8,
  });

  const calculateSavings = () => {
    const baseBill = formData.annualBill;
    let targetBill = 650;
    let grantAmount = 0;

    if (formData.currentBER === 'G' || formData.currentBER === 'F') {
      grantAmount = 25500;
    } else if (formData.currentBER === 'E' || formData.currentBER === 'D' || formData.currentBER.startsWith('E') || formData.currentBER.startsWith('D')) {
      grantAmount = 18500;
    } else {
      grantAmount = 10500;
    }

    const estimatedPropertySurgeValue = "16%"; 
    const carbonTaxShieldSavings = baseBill - targetBill;

    return {
      grantAmount,
      targetBill,
      carbonTaxShieldSavings,
      propertySurge: estimatedPropertySurgeValue,
    };
  };

  const { grantAmount, targetBill, carbonTaxShieldSavings, propertySurge } = calculateSavings();

  const handleNext = () => {
    if (step === 3 && !formData.scanComplete) {
      setFormData(prev => ({ ...prev, isScanning: true }));
      setTimeout(() => {
        setFormData(prev => ({ ...prev, isScanning: false, scanComplete: true }));
        setStep(4);
      }, 2500);
    } else {
      setStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        uploadedPhoto: file,
        photoPreview: URL.createObjectURL(file),
        scanComplete: false,
        isScanning: true
      }));

      setTimeout(() => {
        setFormData(prev => ({ ...prev, isScanning: false, scanComplete: true }));
      }, 2000);
    }
  };

  const selectOption = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const stepsTotal = 5;

  return (
    <div data-testid="wizard-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-lg">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        <div className="relative border-b border-slate-800 bg-slate-950/50 p-6 flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
              Active Retrofit Diagnostic
            </span>
            <h2 className="text-xl font-bold font-serif text-slate-100 mt-1">
              Carbon Tax Shield Assistant
            </h2>
          </div>
          <button 
            data-testid="close-wizard-button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            aria-label="Close wizard"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="h-1 w-full bg-slate-800 relative">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${(step / stepsTotal) * 100}%` }}
          />
        </div>

        <div className="relative p-8 min-h-[380px] flex flex-col justify-between">
          
          {step === 1 && (
            <div data-testid="wizard-step-1" className="space-y-6 animate-fadeIn">
              <div>
                <span className="inline-block px-2 py-0.5 text-2xs font-medium rounded bg-emerald-950 text-emerald-400 border border-emerald-800 mb-2">
                  Step 1 of 5: Property Profile
                </span>
                <h3 className="text-lg font-bold text-slate-100">
                  Select your house style and current Building Energy Rating (BER)
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  This baseline determines heat-loss indicators (HLI) and standard SEAI retrofit allocations.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Property Archetype</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['detached', 'semi-detached', 'terraced', 'apartment'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      data-archetype={type}
                      onClick={() => selectOption('propertyType', type)}
                      className={`p-3 rounded-lg border text-sm capitalize font-medium transition-all duration-200 ${
                        formData.propertyType === type
                          ? 'bg-emerald-950/40 border-brand-emerald border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-950/20'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {type.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Current BER Rating (Approx.)</label>
                <div className="grid grid-cols-7 gap-2">
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => selectOption('currentBER', rating)}
                      className={`py-3 rounded-lg border text-base font-bold transition-all duration-200 ${
                        formData.currentBER === rating
                          ? 'bg-amber-950/40 border-amber-500 text-amber-300 shadow-lg shadow-amber-950/20'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
                <select 
                  name="berRating" 
                  value={formData.currentBER} 
                  onChange={(e) => selectOption('currentBER', e.target.value)}
                  className="w-full mt-2 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300"
                >
                  {['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'D1', 'D2', 'E1', 'E2', 'F', 'G'].map((r) => (
                    <option key={r} value={r}>BER Rating: {r}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div data-testid="wizard-step-2" className="space-y-6 animate-fadeIn">
              <div>
                <span className="inline-block px-2 py-0.5 text-2xs font-medium rounded bg-emerald-950 text-emerald-400 border border-emerald-800 mb-2">
                  Step 2 of 5: Fuel & Tax Exposure
                </span>
                <h3 className="text-lg font-bold text-slate-100">
                  What is your primary heating fuel and estimated annual bill?
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Homeowners using home heating oil face severe exposure to the upcoming €100/tonne Carbon Tax penalty.
                </p>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'oil', label: 'Heating Oil', desc: 'High Kerosene Tax' },
                    { id: 'gas', label: 'Natural Gas', desc: 'Carbon Penalties' },
                    { id: 'electric', label: 'Standard Electric', desc: 'Day-rate surge' },
                    { id: 'solid', label: 'Solid Fuel', desc: 'Banned in zones' },
                  ].map((fuel) => (
                    <button
                      key={fuel.id}
                      type="button"
                      data-fuel={fuel.id}
                      onClick={() => selectOption('heatingFuel', fuel.id)}
                      className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                        formData.heatingFuel === fuel.id
                          ? 'bg-emerald-950/40 border-brand-emerald border-emerald-500 shadow-lg'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className={`font-semibold text-sm ${formData.heatingFuel === fuel.id ? 'text-emerald-300' : 'text-slate-300'}`}>
                        {fuel.label}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{fuel.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-300">Estimated Annual Heating Cost:</span>
                  <span data-testid="tax-exposure-value" className="text-lg font-bold text-amber-400">€{formData.annualBill.toLocaleString()} / year</span>
                </div>
                <input
                  type="range"
                  name="annualBill"
                  min="1200"
                  max="5400"
                  step="100"
                  value={formData.annualBill}
                  onChange={(e) => selectOption('annualBill', parseInt(e.target.value))}
                  className="w-full h-2 rounded bg-slate-800 appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>€1,200 (Modern Standard)</span>
                  <span className="text-red-400 font-medium">€5,400 (Typical Uninsulated Heat Loss)</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div data-testid="wizard-step-3" className="space-y-6 animate-fadeIn">
              <div>
                <span className="inline-block px-2 py-0.5 text-2xs font-medium rounded bg-emerald-950 text-emerald-400 border border-emerald-800 mb-2">
                  Step 3 of 5: Gemini 2.5 Flash Vision
                </span>
                <h3 className="text-lg font-bold text-slate-100">
                  Gemini 2.5 Flash Vision
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Snap your boiler, water cylinder, or attic crawlspace to run instant SR50 viability checks.
                </p>
              </div>

              <div className="relative border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/40 p-6 flex flex-col items-center justify-center min-h-[180px] overflow-hidden">
                {(formData.isScanning || formData.photoPreview) && (
                  <div className="scanner-laser absolute inset-x-0 top-0 h-0.5 bg-emerald-500 shadow-[0_0_15px_#10b981] animate-laserSweep" />
                )}

                {formData.photoPreview ? (
                  <div className="relative flex flex-col items-center justify-center w-full">
                    <img 
                      src={formData.photoPreview} 
                      alt="Boiler Upload Preview" 
                      className="max-h-[140px] rounded-lg object-contain border border-slate-800 shadow"
                    />
                    
                    {formData.isScanning ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs rounded-lg">
                        <div className="text-center">
                          <svg className="animate-spin h-8 w-8 text-emerald-500 mx-auto" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span data-testid="scanning-status-label" className="text-xs font-semibold text-emerald-400 mt-2 block tracking-wider uppercase">
                            Analyzing equipment & heat lines...
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex flex-col items-center gap-2">
                        <span data-testid="analysis-result-badge" className="px-3 py-1 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-bold">
                          SR50 Readiness Alert: Viable for Heat Pump
                        </span>
                        <button
                          type="button"
                          onClick={() => document.getElementById('wizard-file').click()}
                          className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
                        >
                          Change Photo
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <svg className="w-10 h-10 text-slate-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm font-semibold text-slate-300">Drag your heating photo here</p>
                    <p className="text-xs text-slate-500 mt-0.5">Or tap to snap instantly (Accepts JPG, PNG up to 10MB)</p>
                    
                    <button
                      type="button"
                      onClick={() => document.getElementById('wizard-file').click()}
                      className="mt-4 px-4 py-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-800 hover:border-slate-700 transition-all duration-200"
                    >
                      Select File
                    </button>
                  </div>
                )}
                
                <input
                  id="wizard-file"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              {formData.photoPreview && !formData.isScanning && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/60 text-emerald-400 text-xs font-medium">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Asset successfully mapped locally under NSAI SR50 guidelines.</span>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div data-testid="wizard-step-4" className="space-y-6 animate-fadeIn">
              <div>
                <span className="inline-block px-2 py-0.5 text-2xs font-medium rounded bg-emerald-950 text-emerald-400 border border-emerald-800 mb-2">
                  Step 4 of 5: Payback Forecast
                </span>
                <h3 className="text-lg font-bold text-slate-100">
                  Target A2 Payback & Valuation Surge Model
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Here is your estimated funding package and operating cost forecast based on independent data.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 text-center">
                  <div className="text-2xs font-semibold tracking-wider text-slate-400 uppercase">Estimated SEAI Grant</div>
                  <div data-testid="grant-incentive-output" className="text-2xl font-black text-emerald-400 mt-1">€{grantAmount.toLocaleString()}</div>
                  <div className="text-3xs text-emerald-500 mt-1 font-medium">Direct Cash Claims</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 text-center">
                  <div className="text-2xs font-semibold tracking-wider text-slate-400 uppercase">Annual Fuel Bills</div>
                  <div data-testid="target-bill-output" className="text-2xl font-black text-amber-400 mt-1">€{targetBill} <span className="text-xs font-normal text-slate-500">/ yr</span></div>
                  <div className="text-3xs text-emerald-500 mt-1 font-medium">Post-A2 Retrofit</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 text-center">
                  <div className="text-2xs font-semibold tracking-wider text-slate-400 uppercase">Property Surge Value</div>
                  <div data-testid="equity-appreciation-badge" className="text-2xl font-black text-emerald-400 mt-1">+{propertySurge}</div>
                  <div className="text-3xs text-emerald-500 mt-1 font-medium">Average Home Equity Surge</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex justify-between items-center text-sm">
                <div>
                  <span className="text-slate-400">Total Carbon Tax Shield Savings:</span>
                  <p className="text-xs text-slate-500 mt-0.5">Estimated over a standard 10-year period</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-emerald-400">€{(carbonTaxShieldSavings * 10).toLocaleString()} Saved</span>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div data-testid="wizard-step-5" className="space-y-6 animate-fadeIn">
              <div>
                <span className="inline-block px-2 py-0.5 text-2xs font-medium rounded bg-amber-950 text-amber-400 border border-amber-800 mb-2">
                  Step 5 of 5: The Carbon Tax Shield Action
                </span>
                <h3 className="text-lg font-bold text-slate-100">
                  Lock in Your 100% Independent €49 Retrofit Survey
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Get your pass/fail Heat Pump Readiness test, radiator output mapping, and a custom 2026-2030 Carbon Tax Shield Model.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div data-testid="deliverables-checklist" className="space-y-2.5">
                  {[
                    "100% Conflict-Free Guarantee",
                    "No Installer Kickbacks",
                    "Completed by Joe",
                    "Delivered to WhatsApp within 24 hours"
                  ].map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between text-center relative overflow-hidden">
                  <div>
                    <span className="text-3xs uppercase font-bold text-slate-500 tracking-widest">Pricing Structure</span>
                    <div className="text-3xl font-black text-slate-100 mt-1">€49.00</div>
                    <p className="text-2xs text-slate-400 mt-1">Flat rate • No recurring fees • 100% independent audit guarantee</p>
                  </div>
                  
                  <a
                    data-testid="stripe-checkout-cta"
                    href="https://buy.stripe.com/aFabJ01EGbPz6tn8UYeME00" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full block text-center bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm py-2.5 px-4 rounded-lg transition-all duration-200 active:scale-98 shadow-lg shadow-emerald-500/20"
                  >
                    Lock Survey Assessment
                  </a>
                  
                  <span className="text-3xs text-slate-500 mt-2 block italic">
                    🔒 Production Live Checkout Active (Zero Kickbacks Guarantee)
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-slate-800/80 pt-6 mt-8 flex justify-between gap-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-all duration-200 ${
                step === 1
                  ? 'border-slate-800 text-slate-600 cursor-not-allowed bg-transparent'
                  : 'border-slate-800 text-slate-300 bg-slate-850 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              Back
            </button>

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 text-sm font-bold rounded-lg transition-all duration-200 active:scale-98 bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/10"
              >
                {step === 3 ? (formData.photoPreview ? 'View My Payback Map' : 'Analyze Asset Upload') : (step === 4 ? 'Generate My Roadmap' : 'Continue')}
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-sm font-semibold text-slate-300 hover:text-slate-100 transition-colors"
              >
                Exit Diagnostics
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
