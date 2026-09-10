# EcoSmartHome Disaster Recovery Runbook

**Version:** 3.9.0  
**Last Updated:** September 9, 2026  
**Classification:** Internal Technical Operations & Architecture Standard  
**Target Audience:** Joe (Platform Owner) & Antigravity AI Engineering Team  

This document serves as the operational standard for monitoring, diagnosing, recovering, and maintaining the EcoSmartHome production ecosystem. It covers the Vercel hosting platform, static Hub & Spoke architecture, Supabase PostgreSQL telemetry databases, dedicated Stripe `/checkout/` gateway, off-canvas smart navigation, and the complete 11-tool energy suite.

---

## 🚨 Incident Response Protocol (Quick Start)

If the live production site is reported down, or if payments/tools fail, execute these three steps immediately:

### 1. Check Status Dashboards
- **Vercel Status:** [status.vercel.com](https://status.vercel.com) *(Edge Functions & Static Hosting)*
- **Supabase Status:** [status.supabase.com](https://status.supabase.com) *(Database & APIs)*
- **Stripe Status:** [status.stripe.com](https://status.stripe.com) *(Payments & Webhooks)*
- **Google Cloud / Web Audio APIs:** [status.cloud.google.com](https://status.cloud.google.com)

### 2. Isolate the Failure Domain
- **HTTP 500 / 502 / 504 on Webpages:** Vercel edge deployment or DNS configuration issue.
- **HTTP 500 on `/api/checkout/create-session` or `/api/webhooks/stripe`:** Stripe API secret key mismatch or Supabase database timeout.
- **Client-Side Script Errors in Tools:** Verify asset integrity in `/js/smart-nav.js`, `/js/persona-router.js`, `/js/esh-os.js`, `/js/whatsapp-widget.js`, `/js/solar-estimator.js`.
- **Persona Switching / Event Capture:** Ensure `initAntigravityVoiceHubListeners` in `smart-nav.js` does NOT attach listeners to `<html>` or `<body>` and `window._voicePersonaSyncing` is active.

### 3. Immediate Git / Vercel Rollback Protocol
```pwsh
cd c:\xampp\htdocs\EcoSmartHome\site
# 1. Fetch latest git remote state
git fetch origin main

# 2. Revert to verified stable commit
git reset --hard HEAD~1

# 3. Force-push to trigger instant Vercel CI/CD redeployment (< 90 seconds)
git push origin main --force
```

---

## 🏗️ Production System Architecture & Endpoints (September 9, 2026)

### 1. Five-Audience One-Page Persona Portal System (`index.html`)
- **🏠 Homeowner Carbon Tax Rescue (`#view-panel-homeowner`):**
  - Instant Roadmap Simulator with zero-scroll dual-mode view switcher: `Grant & Shield Telemetry` ⇄ `Day-1 Cashflow Decider (Out-of-Pocket)`.
  - Dynamic SBCI 3.55% low-cost green loan amortization vs. displaced kerosene/gas bills (+€57 to +€114/mo in-pocket profit).
  - Fuel selector (`🔥 Oil`, `💨 Gas`, `⚡ Electric`) + winter spend slider.
  - Live ticking Carbon Tax Penalty Clock calculating statutory 2026–2030 compounding liability.
  - Shield Deployment animation: shatters penalty clock down to `€0.00` and displays customized grant breakdown (up to €35,000 SEAI One-Stop-Shop grants, -€180/mo Green Mortgage, €54/mo net bill).
- **💼 Estate Agent Commission Booster (`#view-panel-agent`):**
  - Modernized 8-category BER rating selector (G to A0) + property asking price presets.
  - Live ESRI-calibrated Property Equity Surge engine (e.g. `+€38,500` equity, `+€577` extra commission).
  - 1-Click Daft.ie / MyHome.ie Listing Copy tool with animated clipboard toast.
- **⚡ Installer / Retrofitter Van-to-Verdict Portal (`#view-panel-installer`):**
  - Rapid archetype intake (`3-Bed Semi`, `4-Bed Detached`, `3-Bed Bungalow`, `2-Bed Apt`).
  - NSAI SR50-2:2024 low-flow radiator matrix with live `🟢 Compliant OK` and `⚠️ Oversizing Required` badges.
  - 1-Click SEAI-Compliant Tender Draft Generator + Outsource Technical Survey €49 Hand-Off.
- **🛡️ Audit & Review Command Center (`#view-panel-audit`):**
  - 100% conflict-free contractor quote red-liner.
  - Multimodal AI Computer Vision Snap & Audit dropzone (`#snap-audit`) for equipment photos.
- **🔍 View All Tools (`#view-panel-all`):**
  - Instant searchable showcase of all 11+ independent Irish energy engines.

### 2. Complete 11-Tool Energy Engine Suite
1. **Solar PV & 24c Clean Export Simulator:** `/solar/` (`solar/index.html`)
2. **Contractor Quote Speedometer Gauge:** `/quote-auditor/` (`quote-auditor/index.html`)
3. **Smart Meter & Battery Arbitrage Slasher:** `/battery-arbitrage/` (`battery-arbitrage/index.html`)
4. **Radiator Flow & Low-Flow Heat Pump Sizer:** `/radiator-sizer/` (`radiator-sizer/index.html`)
5. **Zero-Out-of-Pocket SBCI Loan & Grant Stacker:** `/retrofit-loan/` (`retrofit-loan/index.html`)
6. **Simplified 8-Category BER (A0 to G) Matrix:** `/ber-matrix/` (`ber-matrix/index.html`)
7. **Contractor Tender Specification RFP Generator:** `/tender-generator/` (`tender-generator/index.html`)
8. **Carbon Tax Liability Ticker:** `/carbon-tax/` (`carbon-tax/index.html`)
9. **Green Mortgage 3.45% Arbitrage Slasher:** `/green-mortgage/` (`green-mortgage/index.html`)
10. **33 Irish Towns Regional SEO Directory:** `/locations/` (`locations/index.html`)
11. **Ask Aoife Voice & AI Energy Advisor:** `/tools/voice-aoife.html` (`tools/voice-aoife.html`)

### 3. Payment & Booking Architecture
- Dedicated on-site gateway: `/checkout/` (`checkout/index.html`, `checkout/order.html`, `checkout/thank-you.html`)
- Handles the €149 Independent Retrofit Engineering Survey with Joe.
- Triggers `/api/checkout/create-session` and posts customer metadata (Name, Email, Phone, Eircode) directly to Supabase and Stripe.

### 4. Smart Navigation & Native Mobile Dock
- **`css/smart-nav.css` & `js/smart-nav.js`:**
  - Header glides away on scroll down (`translateY(-110%)`) and returns instantly on scroll up.
  - Off-canvas slide-out drawer (`#esh-side-drawer`) hosting all 11 tools, triggered via pinned sidebar tab (`#esh-side-tab-toggle`).
  - Fixed mobile bottom dock (`#esh-mobile-dock`) with central elevated `🛡️` Audit & Review launcher.
  - Zero-overlap layout: floating blueprint pill docked on the bottom-left (`left: 14px; bottom: 84px`), completely clear of the center dock FAB and right-hand `+` radial trigger.
  - Zero desktop dead space: footer copyright rests cleanly at the bottom of desktop viewports.

---

## 🔒 Disaster Recovery Contact Directory

| Role | Contact Name | Channel | Response SLA |
|:---|:---|:---|:---|
| **System Owner** | Joe | WhatsApp / Direct Call (+353 83 966 2197) | Immediate |
| **Lead Developer** | Antigravity AI Engineering | GitHub / Workspace | < 1 hour (Critical) |
| **Hosting Support** | Vercel Support | vercel.com/help | < 2 hours (Pro) |
| **Payment Gateway** | Stripe Support | dashboard.stripe.com | < 2 hours (Priority) |
| **Database Support** | Supabase Support | supabase.com/dashboard | < 4 hours (Pro) |
