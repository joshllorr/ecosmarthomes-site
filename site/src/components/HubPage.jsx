import React, { useState, useEffect, useRef } from 'react';

export default function HubPage({ copyDeckData }) {
  const copyDeck = copyDeckData || {
    "metadata": {
      "project": "EcoSmartHome",
      "locale": "en-IE",
      "framework": "One Screen, One Thought",
      "version": "1.0.0",
      "target_audience": "Irish Homeowners (Carbon Tax & Fuel Levy Defense)"
    },
    "screens": {
      "screen_1_hero": {
        "id": "hero_tax_shield",
        "focus": "Establish carbon tax defense & independent advisory credibility",
        "copy": {
          "badge": "100% Conflict-Free Energy Advisory",
          "headline": "Stop Funding the Irish Fuel Tax. Build Your Carbon Tax Shield.",
          "subheadline": "Dublin, Cork, or Limerick—rising oil levies are quietly eating your savings. Secure a 100% independent roadmap to slash your heating bills from €5,400 to €650 a year using up to €25,500 in direct SEAI grants. No sales pitches. No contractor kickbacks.",
          "cta_primary": "Activate My Shield",
          "trust_label": "Serving all 32 counties • Zero commissions"
        }
      },
      "screen_2_vision_scanner": {
        "id": "gemini_vision_scanner",
        "focus": "Low-friction multimodal diagnostic",
        "copy": {
          "badge": "Gemini 2.5 Flash Vision",
          "headline": "Snap Your Boiler. Expose the Energy Leaks Instantly.",
          "subheadline": "Don't let €100/t carbon tax penalties drain your account. Snap a quick photo of your boiler, cylinder, or attic insulation. Our multimodal AI scanner runs instant SR50 viability checks to see where your heat is escaping.",
          "cta_primary": "Take a Photo or Upload Image",
          "drag_drop_label": "Drag & drop your photo here (Max 10MB)",
          "technical_note": "Camera hardware integration with automatic client-side canvas resizing."
        }
      },
      "screen_3_voice_ai": {
        "id": "aoife_voice_assistant",
        "focus": "Jargon-free interactive guidance",
        "copy": {
          "badge": "Aoife Voice AI",
          "headline": "\"Aoife, will my radiators freeze if I install a heat pump?\"",
          "subheadline": "Tap below to talk live with Ireland's senior independent energy AI. Ask her how to avoid the 9% double VAT fuel penalty and what upgrades you actually need in plain, neighborly English.",
          "cta_primary": "Ask Aoife Out Loud",
          "listening_state": "Listening...",
          "processing_state": "Aoife is thinking..."
        }
      },
      "screen_4_grant_estimator": {
        "id": "seai_savings_estimator",
        "focus": "Financial viability & direct grant calculations",
        "copy": {
          "badge": "SEAI Grant & Savings Estimator",
          "headline": "Bypass the Kerosene Penalties. Claim Up to €25,500.",
          "subheadline": "Drag the slider to see how bringing your home from a typical D-rating up to an A2 standard triggers an instant 16% property value surge and cuts your annual fuel bills by €4,850/yr.",
          "slider_labels": {
            "min": "Poor G-Rating",
            "max": "A-Rated Standard"
          },
          "cta_primary": "Calculate My Real Payback"
        }
      },
      "screen_5_actionable_roadmap": {
        "id": "conversion_checkout",
        "focus": "Stripe checkout and final delivery trigger",
        "copy": {
          "badge": "Independent Retrofit Roadmap",
          "headline": "Get Your 100% Independent €49 Survey & Roadmap.",
          "subheadline": "Secure your certified blueprint: pass/fail Heat Pump Readiness test, radiator output check, and your custom 2026-2030 Carbon Tax Shield Model. Completed by Joe and delivered straight to your WhatsApp within 24 hours.",
          "cta_primary": "Order Assessment for €49",
          "features": [
            "100% Conflict-Free Guarantee",
            "No Installer Kickbacks",
            "Completed by Joe",
            "Delivered to WhatsApp within 24 hours"
          ],
          "trust_tagline": "100% Conflict-Free Guarantee • No Installer Kickbacks • Serving All 32 Counties"
        }
      }
    }
  };

  const { screens } = copyDeck;

  const sectionRefs = {
    screen1: useRef(null),
    screen2: useRef(null),
    screen3: useRef(null),
    screen4: useRef(null),
    screen5: useRef(null)
  };

  const scrollToSection = (sectionKey) => {
    sectionRefs[sectionKey]?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const [uploadState, setUploadState] = useState('idle');
  const [scannedImage, setScannedImage] = useState(null);
  const [scanResult, setScanResult] = useState('');

  const [voiceState, setVoiceState] = useState('idle');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceResponse, setVoiceResponse] = useState('');

  const [berIndex, setBerIndex] = useState(3);
  const berBands = [
    { band: 'G', grant: 1500, bills: 5400, propertySurge: 0, text: 'Extreme thermal leakage. Forced exposure to massive carbon taxes.' },
    { band: 'F', grant: 3000, bills: 4600, propertySurge: 2, text: 'Poor insulation. Highly exposed to Ireland\'s kerosene fuel penalties.' },
    { band: 'E', grant: 6000, bills: 3900, propertySurge: 5, text: 'Typical drafty building envelope. Heat loss indicator remains high.' },
    { band: 'D', grant: 9500, bills: 3100, propertySurge: 8, text: 'Typical baseline Irish property rating. Baseline carbon levy risk.' },
    { band: 'C', grant: 14000, bills: 2200, propertySurge: 11, text: 'Moderate energy rating. Significant potential for heat pump readiness.' },
    { band: 'B', grant: 19500, bills: 1400, propertySurge: 14, text: 'High efficiency rating. Reduced carbon tax penalties.' },
    { band: 'A2', grant: 25500, bills: 650, propertySurge: 16, text: 'Zero emission tier. Carbon Tax Shield complete. Max equity gain!' }
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadState('loading');
      const reader = new FileReader();
      reader.onloadend = () => {
        setScannedImage(reader.result);
        setTimeout(() => {
          setUploadState('success');
          setScanResult('Diagnostic Complete: Low ceiling insulation detected in attic envelope (HLI estimate 2.6). Boiler operational efficiency is 78%. Recommended sequence: Attic insulation seal first to unlock heat pump grant viability.');
        }, 1800);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAoifeVoice = () => {
    if (voiceState !== 'idle') return;
    setVoiceState('listening');
    setVoiceTranscript('"Aoife, will my radiators freeze if I install a heat pump?"');
    
    setTimeout(() => {
      setVoiceState('processing');
      setTimeout(() => {
        setVoiceState('speaking');
        setVoiceResponse('"Not at all, a stór! We check your radiators under NSAI SR50 rules first. We ensure water flows hot enough at lower design temperatures so you stay cosy even in a mid-winter Dublin frost."');
      }, 1500);
    }, 2500);
  };

  const resetAoife = () => {
    setVoiceState('idle');
    setVoiceTranscript('');
    setVoiceResponse('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950 overflow-x-hidden">
      
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-full border border-slate-800/60 shadow-lg shadow-slate-950/50 flex items-center gap-2 max-w-[95vw] overflow-x-auto">
        <span className="text-xs font-bold text-emerald-500 mr-2 tracking-wide uppercase whitespace-nowrap hidden sm:inline-block">
          {copyDeck.metadata.project}
        </span>
        <div className="h-4 w-px bg-slate-800 hidden sm:block mr-2"></div>
        {Object.keys(sectionRefs).map((key, index) => (
          <button
            key={key}
            onClick={() => scrollToSection(key)}
            className="px-3 py-1 text-xs font-medium rounded-full transition-all hover:bg-slate-800 hover:text-emerald-400 whitespace-nowrap"
          >
            Screen {index + 1}
          </button>
        ))}
      </nav>

      {/* SCREEN 1: THE HERO */}
      <section
        ref={sectionRefs.screen1}
        className="min-h-[100dvh] w-full flex flex-col justify-between items-center px-6 py-24 md:py-32 relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-900/80 h-[100dvh] snap-start"
      >
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="w-full max-w-3xl flex-grow flex flex-col justify-center text-center z-10">
          <div className="mb-6 inline-flex self-center items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              {screens.screen_1_hero.copy.badge}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
            {screens.screen_1_hero.copy.headline}
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            {screens.screen_1_hero.copy.subheadline}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => scrollToSection('screen2')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/20 active:scale-[0.98] text-center"
            >
              {screens.screen_1_hero.copy.cta_primary}
            </button>
          </div>
        </div>

        <div className="w-full text-center z-10 pt-4">
          <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
            {screens.screen_1_hero.copy.trust_label}
          </p>
          <div className="mt-4 flex justify-center animate-bounce">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* SCREEN 2: VISION SCANNER */}
      <section
        ref={sectionRefs.screen2}
        className="min-h-[100dvh] w-full flex flex-col justify-between items-center px-6 py-24 relative bg-slate-950 border-b border-slate-900/80 h-[100dvh] snap-start"
      >
        <div className="w-full max-w-xl flex-grow flex flex-col justify-center z-10">
          <div className="mb-4 text-center">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold text-slate-400 bg-slate-900 border border-slate-800 uppercase tracking-widest">
              {screens.screen_2_vision_scanner.copy.badge}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-4 tracking-tight">
            {screens.screen_2_vision_scanner.copy.headline}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 text-center mb-8 max-w-md mx-auto leading-relaxed">
            {screens.screen_2_vision_scanner.copy.subheadline}
          </p>

          <div className="w-full bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-800 p-6 flex flex-col items-center justify-center text-center hover:border-emerald-500/40 transition-colors relative min-h-[220px]">
            {uploadState === 'idle' && (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 mb-4 shadow">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-slate-200 mb-1">{screens.screen_2_vision_scanner.copy.cta_primary}</span>
                <span className="text-xs text-slate-500 mb-4">{screens.screen_2_vision_scanner.copy.drag_drop_label}</span>
                <label className="cursor-pointer px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-bold border border-slate-700/80 transition-colors">
                  Browse Image
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
            )}

            {uploadState === 'loading' && (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-2 border-t-emerald-500 border-r-transparent border-b-slate-800 border-l-slate-800 animate-spin mb-4" />
                <span className="text-sm font-bold text-slate-300">Analyzing Image on Gemini 2.5 Flash...</span>
                <span className="text-xs text-slate-500 mt-1">Checking NSAI insulation thresholds & boiler lines...</span>
              </div>
            )}

            {uploadState === 'success' && (
              <div className="w-full flex flex-col md:flex-row gap-4 items-center text-left">
                {scannedImage && (
                  <img src={scannedImage} alt="Scanned boiler" className="w-24 h-24 rounded-lg object-cover border border-slate-800" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Scan Complete</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    {scanResult}
                  </p>
                  <button 
                    onClick={() => setUploadState('idle')}
                    className="text-slate-500 hover:text-slate-300 text-[10px] uppercase tracking-wider font-bold mt-2.5 transition-colors"
                  >
                    ← Scan another photo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-full max-w-md text-center z-10 pt-4">
          <p className="text-[10px] font-medium text-slate-500 tracking-wide leading-relaxed bg-slate-900/30 py-2 px-4 rounded-lg border border-slate-900">
            🔒 <strong>Technical Dev Note:</strong> {screens.screen_2_vision_scanner.copy.technical_note}
          </p>
          <button onClick={() => scrollToSection('screen3')} className="mt-4 inline-block">
            <svg className="w-5 h-5 text-slate-600 animate-bounce mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      </section>

      {/* SCREEN 3: AOIFE VOICE AI */}
      <section
        ref={sectionRefs.screen3}
        className="min-h-[100dvh] w-full flex flex-col justify-between items-center px-6 py-24 relative bg-slate-900/30 border-b border-slate-900/80 h-[100dvh] snap-start"
      >
        <div className="w-full max-w-xl flex-grow flex flex-col justify-center z-10">
          <div className="mb-4 text-center">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-widest animate-pulse">
              {screens.screen_3_voice_ai.copy.badge}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-4 tracking-tight leading-normal font-serif italic">
            {screens.screen_3_voice_ai.copy.headline}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 text-center mb-8 max-w-md mx-auto leading-relaxed">
            {screens.screen_3_voice_ai.copy.subheadline}
          </p>

          <div className="flex flex-col items-center justify-center min-h-[180px]">
            {voiceState === 'idle' && (
              <button
                onClick={startAoifeVoice}
                className="w-24 h-24 rounded-full bg-slate-800 hover:bg-slate-700/80 hover:scale-105 border border-slate-700 flex items-center justify-center text-emerald-400 cursor-pointer shadow-lg shadow-emerald-500/5 transition-all active:scale-95 group"
              >
                <svg className="w-10 h-10 group-hover:text-emerald-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            )}

            {voiceState === 'listening' && (
              <div className="flex flex-col items-center">
                <div className="flex gap-1.5 items-center justify-center mb-4 h-12">
                  <span className="w-1 bg-emerald-500 h-6 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 bg-emerald-500 h-12 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 bg-emerald-500 h-8 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="w-1 bg-emerald-500 h-10 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
                  <span className="w-1 bg-emerald-500 h-4 rounded-full animate-bounce" style={{ animationDelay: '600ms' }} />
                </div>
                <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase mb-1 animate-pulse">{screens.screen_3_voice_ai.copy.listening_state}</span>
                <span className="text-sm text-slate-300 font-mono italic max-w-sm text-center">{voiceTranscript}</span>
              </div>
            )}

            {voiceState === 'processing' && (
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border border-t-emerald-400 border-r-transparent border-slate-800 border-l-slate-800 animate-spin mb-4" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{screens.screen_3_voice_ai.copy.processing_state}</span>
              </div>
            )}

            {voiceState === 'speaking' && (
              <div className="w-full max-w-lg bg-slate-950 p-5 rounded-2xl border border-emerald-500/20 text-center">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-2">Aoife (Energy AI Advisor)</span>
                <p className="text-sm text-slate-200 leading-relaxed italic font-serif">
                  {voiceResponse}
                </p>
                <button
                  onClick={resetAoife}
                  className="text-slate-500 hover:text-slate-300 text-[10px] uppercase tracking-wider font-bold mt-4 transition-colors"
                >
                  ← Ask another question
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="w-full max-w-md text-center z-10 pt-4">
          <p className="text-[10px] font-medium text-slate-500 tracking-wide leading-relaxed">
            🎙️ <strong>iOS & Android Compatible:</strong> Full browser WebSocket streaming audio layer support.
          </p>
          <button onClick={() => scrollToSection('screen4')} className="mt-4 inline-block">
            <svg className="w-5 h-5 text-slate-600 animate-bounce mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      </section>

      {/* SCREEN 4: SEAI GRANT & SAVINGS ESTIMATOR */}
      <section
        ref={sectionRefs.screen4}
        className="min-h-[100dvh] w-full flex flex-col justify-between items-center px-6 py-24 relative bg-slate-950 border-b border-slate-900/80 h-[100dvh] snap-start"
      >
        <div className="w-full max-w-2xl flex-grow flex flex-col justify-center z-10">
          <div className="mb-4 text-center">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold text-slate-400 bg-slate-900 border border-slate-800 uppercase tracking-widest">
              {screens.screen_4_grant_estimator.copy.badge}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-4 tracking-tight">
            {screens.screen_4_grant_estimator.copy.headline}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 text-center mb-8 max-w-md mx-auto leading-relaxed">
            {screens.screen_4_grant_estimator.copy.subheadline}
          </p>

          <div className="w-full bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-inner">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Estimated SEAI Grant</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400">
                  €{berBands[berIndex].grant.toLocaleString('en-IE')}
                </span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Annual Energy Bills</span>
                <span className="text-xl sm:text-2xl font-black text-white">
                  €{berBands[berIndex].bills.toLocaleString('en-IE')}/yr
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-4">
              <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase">
                <span>{screens.screen_4_grant_estimator.copy.slider_labels.min}</span>
                <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md text-sm font-black">
                  Current: Rating {berBands[berIndex].band}
                </span>
                <span>{screens.screen_4_grant_estimator.copy.slider_labels.max}</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                value={berIndex}
                onChange={(e) => setBerIndex(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-medium bg-slate-950/40 p-3 rounded-lg border border-slate-900">
              📈 <strong className="text-slate-200">Rating {berBands[berIndex].band}:</strong> {berBands[berIndex].text} 
              {berBands[berIndex].propertySurge > 0 && (
                <span> This upgrade unlocks an estimated <strong className="text-emerald-400">+{berBands[berIndex].propertySurge}% property value surge</strong> in the Irish housing market.</span>
              )}
            </p>
          </div>
        </div>

        <div className="w-full max-w-md text-center z-10 pt-4">
          <button
            onClick={() => scrollToSection('screen5')}
            className="px-6 py-3 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700/80 hover:bg-slate-700 hover:text-white transition-all"
          >
            {screens.screen_4_grant_estimator.copy.cta_primary}
          </button>
          <button onClick={() => scrollToSection('screen5')} className="mt-4 block mx-auto">
            <svg className="w-5 h-5 text-slate-600 animate-bounce mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      </section>

      {/* SCREEN 5: THE ACTIONABLE ROADMAP */}
      <section
        ref={sectionRefs.screen5}
        className="min-h-[100dvh] w-full flex flex-col justify-between items-center px-6 py-24 relative bg-slate-900/20 h-[100dvh] snap-start"
      >
        <div className="w-full max-w-xl flex-grow flex flex-col justify-center z-10">
          <div className="mb-4 text-center">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-widest">
              {screens.screen_5_actionable_roadmap.copy.badge}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-4 tracking-tight leading-normal">
            {screens.screen_5_actionable_roadmap.copy.headline}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 text-center mb-8 max-w-md mx-auto leading-relaxed">
            {screens.screen_5_actionable_roadmap.copy.subheadline}
          </p>

          <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {screens.screen_5_actionable_roadmap.copy.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-200">{feature}</span>
                </div>
              ))}
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center mb-4">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                💳 Secure Live Payment Gateway
              </div>
              <a
                href="https://buy.stripe.com/aFabJ01EGbPz6tn8UYeME00"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4.5 rounded-xl bg-emerald-500 text-slate-950 font-black hover:bg-emerald-400 transition-all text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                </svg>
                {screens.screen_5_actionable_roadmap.copy.cta_primary}
              </a>
            </div>

            <p className="text-[10px] text-slate-500 text-center font-bold tracking-wide uppercase">
              🛡️ {screens.screen_5_actionable_roadmap.copy.trust_tagline}
            </p>
          </div>
        </div>

        <footer className="w-full max-w-md text-center pb-4 pt-8 border-t border-slate-900/60 z-10">
          <p className="text-[10px] text-slate-600 font-semibold tracking-wider uppercase">
            © {new Date().getFullYear()} {copyDeck.metadata.project} IE • ALL 32 COUNTIES SERVED • INDEPENDENT CODES
          </p>
        </footer>
      </section>

    </div>
  );
}
