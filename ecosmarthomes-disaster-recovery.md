# EcoSmartHome Disaster Recovery Runbook & Operations Standard

**Version:** 3.8.1 (Flash Enterprise)  
**Last Updated:** September 3, 2026  
**Release Tag:** `v3.8-flash`  
**Classification:** Internal Technical Operations, Disaster Recovery & Architecture Standard  
**Target Audience:** Joe (Platform Owner) & Antigravity AI Engineering Team  

---

## 🚨 Emergency Incident Response Protocol (Quick Start)

If the live production site is reported down, if tools/modals fail to load, or if checkout/voice services experience degradation, execute these diagnostic and recovery procedures immediately:

### 1. Check Cloud Status Dashboards
- **Vercel Hosting & Edge Network:** [status.vercel.com](https://status.vercel.com)
- **Supabase Database & Auth:** [status.supabase.com](https://status.supabase.com)
- **Stripe Payments & Webhooks:** [status.stripe.com](https://status.stripe.com)
- **Google Cloud / Web Audio APIs:** [status.cloud.google.com](https://status.cloud.google.com)

### 2. Isolate the Failure Domain
- **HTTP 500 / 502 / 504 on Webpages:** Check Vercel edge deployment logs or DNS A/CNAME records.
- **Client-Side Script Errors / Stuck Modals:** Check asset integrity in `/js/smart-nav.js`, `/js/persona-router.js`, `/js/property-auditor.js`, `/js/voice-advisor.js`.
- **CSS Stacking / Floating Button Collision:** Verify `z-index` stacking order in `/css/smart-nav.css` and `/css/voice-advisor.css` (`#personaModal` 1000010, `.mobile-persona-dropdown-wrapper` 1000000, `#esh-mobile-dock` 999990, floating buttons `bottom: 76px !important`).
- **Payment / Booking Errors (`/checkout/`):** Verify Stripe webhook signing secret (`STRIPE_WEBHOOK_SECRET`) and Supabase PostgreSQL pool connection.

### 3. Immediate Git / Vercel Rollback Protocol

To immediately restore the platform to the last certified stable release tag (`v3.8-flash`):
```pwsh
cd c:\xampp\htdocs\EcoSmartHome\site

# 1. Fetch remote tags and commits
git fetch --all --tags

# 2. Hard reset local workspace to certified release tag
git reset --hard v3.8-flash

# 3. Synchronize /site/ mirror directory
python scratch/sync_full_mirror.py

# 4. Trigger instant Vercel redeployment
git push origin main --force
```

---

## 🏗️ Production Architecture & Core System Map (v3.8.1)

### 1. Dual-Row Responsive Navigation & Mobile Slider (`smart-nav.js` & `smart-nav.css`)
- **Row 1 (Brand & Primary Action):**
  - Left: 🏡 `EcoSmartHomes` Logo (28px high-vis vector).
  - Center: `[ 🏠 Homeowner ▾ ]` Adaptive Persona Dropdown Capsule.
  - Right: `☰ Tools` Off-Canvas Drawer Toggle.
  - Strict Row 1 isolation on mobile (`< 768px`) eliminates clipping of pricing and survey buttons.
- **Row 2 (Mobile Top Menu Slider - `#mobileTopMenuSlider`):**
  - Touch-swipeable horizontal track with 11 tools.
  - Custom WebKit scrollbar matching desktop baseline:
    - Track: `background: rgba(255, 255, 255, 0.08); border-radius: 9999px;`
    - Thumb: `linear-gradient(90deg, #34f5c5, #10b981); border-radius: 9999px; box-shadow: 0 0 8px rgba(52, 245, 197, 0.6);`
    - Height: `4px`.
  - Automatic active chip highlighter with smooth auto-centering on navigation.

### 2. 3-Advisor Voice & Persona Switchboard (`persona-router.js` & `voice-advisor.js`)
- **Three Dedicated Irish Advisory Roles:**
  - 🏡 **Aoife (Homeowner Advisor):** Lower heating bills, size radiators, and claim up to €35,000 in SEAI retrofit grants.
  - 💼 **Eimear (Estate Agent / Valuer):** Explain BER uplift, unlock +€38k valuation equity surge, and highlight 3.45% green mortgages.
  - ⚡ **Declan (Installer / Retrofitter):** NSAI SR50 45°C Delta-T 30 sizing, heat loss formulas, and digital data packs.
- **Automatic 500ms Pop-Up Engine:**
  - Slides in at 500ms on first session visit with `cubic-bezier(0.16, 1, 0.3, 1)` and 18px backdrop blur.
  - Controlled by `sessionStorage.getItem("ESH_sessionModalDismissed")`.
- **Persona Memory Awareness:**
  - Detects returning users via `localStorage.getItem("ESH_lastPersona")`.
  - Card automatically blooms with `.active-halo` (Aoife green, Eimear amber, Declan cyan).
  - Displays `✨ Last Selected Advisor` badge and dynamic `Continue with [Name] →` CTA.
- **Smooth Instant Dismissal & Direct Browsing:**
  - Instant `display: none !important; pointer-events: none;`.
  - Direct browsing button ("Explore all tools without selecting a role") sets `window.setPersona('all')`.
- **Acoustic Handoff Chimes (Web Audio API):**
  - Aoife: C5 (523.25 Hz) -> G5 (783.99 Hz)
  - Eimear: D5 (587.33 Hz) -> A5 (880.00 Hz)
  - Declan: F4 (349.23 Hz) -> C5 (523.25 Hz)

### 3. The 11 Core Irish Energy Engines
1. **Contractor Quote vs Fair Market Price Speedometer:** `/quote-auditor/` (`quote-auditor/index.html`)
2. **1-Tap Contractor Quote Comparator & Dispute Generator:** `/quote-comparator/` (`quote-comparator/index.html`)
3. **Irish Carbon Tax Shield & Retrofit War Room Terminal:** `/#carbon-tax-war-room` & `/carbon-tax/` (Statutory €64 -> €100/tonne penalty clock, laser defense pods).
4. **Live Irish Green Mortgage Arbitrage Bank Ticker:** `/#green-mortgage-ticker` & `/green-mortgage/` (AIB 3.45%, Haven 3.45%, BOI 3.55%, PTSB 3.60%).
5. **Interactive 26-County Irish Solar & Micro-Climate Yield Map:** `/#county-solar-map` & `/solar/` (24c/kWh Clean Export earnings, local installer directory).
6. **SEAI One-Stop-Shop vs Individual Grants Decision Matrix:** `/#grant-matrix-calculator` (Turnkey OSS vs Direct Contractor Hiring).
7. **Interactive Before vs After House Transformation Cutaway Slider:** `/#transformation-slider` (Official 8-Step G to A0 Net-Zero Energy Scale).
8. **1-Click Daft.ie & Eircode Property Auditor:** Hero Scanner on `/` (8 Irish building archetypes, floor area, year built).
9. **NSAI SR50-2:2024 Low-Flow Radiator & Heat Pump Sizer:** `/radiator-sizer/`
10. **33 Irish Towns Regional SEO Directory:** `/locations/` (e.g. `/locations/cork/kinsale.html`)
11. **Comprehensive Pricing & Consultation Dossier Framework:** `/pricing/` (€149 Virtual Survey, €249 Physical Audit, €499 Full Tender Pack)

---

## 🔒 Security, Business Contacts & Anti-Tamper Configuration

### 1. Official Communications Direct Route
- **WhatsApp Support & Consultation Dispatch:** `+353 83 966 2197` (International: `353839662197`, Local: `083 966 2197`)
- **Automated Routing:** Verified across `/js/whatsapp-widget.js`, `api/whatsapp-bot.js`, and all 11 tool dossier dispatchers.

### 2. Analytics & Conversion Tracking
- **Google Tag Manager Container ID:** `AW-3013797648`
- **Verification:** Verified 200 OK hits across all 53 HTML files with `window.dataLayer` enhanced conversion tracking.

### 3. Vercel Staging Mirror Parity Rule
- Production root and `/site/` staging directory MUST maintain 100% byte-for-byte synchronization.
- Automated validation script: `python scratch/run_comprehensive_audit.py` (Rule Module 7).

---

## 🧪 Operational Health & Verification Test Commands

Run these health checks inside `c:\xampp\htdocs\EcoSmartHome\site` after any deployment or recovery action:

```pwsh
# 1. Master Enterprise Audit (25/25 Checks)
python scratch/run_comprehensive_audit.py

# 2. Functional Regression Suite (All 8 Modules)
python scratch/test_functional_regression.py

# 3. Mobile Top Menu Slider & Responsive Navigation Test
python scratch/test_mobile_top_slider.py

# 4. Agent Routing & Web Audio Chime Test
python scratch/test_agent_routing.py

# 5. Quick Implementation Checklist (Frontend, Backend, DB, Security, Analytics)
python scratch/test_implementation_checklist.py
```

---

## 📞 Emergency Escalation Contacts

| Role | Contact Name | Channel | Response SLA |
| :--- | :--- | :--- | :--- |
| **Platform Owner** | Joe | Direct Call / WhatsApp (+353 83 966 2197) | Immediate (< 15 mins) |
| **Lead AI Architect** | Antigravity AI Engineering | GitHub Issues / Workspace Transcript | < 1 hour (Critical) |
| **Edge Hosting** | Vercel Enterprise Support | vercel.com/help | < 2 hours |
| **Payment Processor** | Stripe Priority Support | dashboard.stripe.com | < 2 hours |
| **Telemetry Database** | Supabase Cloud Support | supabase.com/dashboard | < 4 hours |


### Version 3.8.1 Additions (September 2026)
- **Interactive Irish Home Digital Twin Simulator** (`/digital-twin/`): Pure SVG architectural cross-section with 5 interactive retrofit toggles, 8-step BER gauge (G to A0), and €35k SEAI grant stacker.
- **26-County Province Dropdown Drawer** (`#countyProvinceDrawer`): Grouped county selection under Munster, Leinster, Connacht, and Ulster, reducing landing page height by >5,000px on mobile.
- **Mobile Segmented Switchers & Category Carousels**: Deployed across 11-Tool Hub, SEAI Grants Matrix, Green Mortgage Ticker, and Carbon Tax War Room.
