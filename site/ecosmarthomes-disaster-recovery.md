# EcoSmartHome Disaster Recovery Runbook & Operations Standard

**Version:** 3.9.0 (Unified One-Page EcoOS & 8-Bar Standard)  
**Last Updated:** September 9, 2026  
**Release Tag:** `v3.9-ecos-8bar`  
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
- **Client-Side Script Errors / Stuck Modals:** Check asset integrity in `/js/smart-nav.js`, `/js/persona-router.js`, `/js/property-auditor.js`, `/js/esh-os.js`, `/js/voice-advisor.js`.
- **CSS Stacking / Floating Button Collision:**
  - Verify `z-index` hierarchy in `/css/smart-nav.css`:
    - Floating Blueprint Pill (`.eco-os-floating-blueprint`): `z-index: 99990;`
    - Radial Hub Container (`.fab-radial-container`): `z-index: 1050;`
    - Fixed Bottom Dock (`#esh-mobile-dock`): `z-index: 999990;`
    - Modal Scrims & Drawers (`#esh-side-drawer`, `#esh-drawer-overlay`): `z-index: 1000000;`
  - Ensure mobile floating blueprint stays anchored to bottom-left:
    `left: 14px; bottom: calc(84px + env(safe-area-inset-bottom, 16px)); right: auto;`
- **Persona Switching / Click Event Lock:** Verify that `initAntigravityVoiceHubListeners` in `smart-nav.js` does NOT attach listeners to `document.documentElement` (`<html>`) or `document.body`, and that `window._voicePersonaSyncing` re-entrancy lock is functioning.
- **Payment / Booking Errors (`/checkout/`):** Verify Stripe webhook signing secret (`STRIPE_WEBHOOK_SECRET`) and Supabase PostgreSQL pool connection.

### 3. Immediate Git / Vercel Rollback Protocol

To immediately restore the platform to the certified stable release tag (`v3.9-ecos-8bar`):
```pwsh
cd c:\xampp\htdocs\EcoSmartHome\site

# 1. Fetch remote tags and commits
git fetch --all --tags

# 2. Hard reset local workspace to certified release tag
git reset --hard v3.9-ecos-8bar

# 3. Synchronize /site/ mirror directory
python scratch/sync_full_mirror.py

# 4. Trigger instant Vercel redeployment
git push origin main --force
```

---

## 🏗️ Production Architecture & Core System Map (v3.9.0)

### 1. Unified One-Page In-Place Persona System (`smart-nav.js` & `index.html`)
- **Five Dedicated Real-Time Views (Zero Page Reload, Zero Scroll Hijacking):**
  1. 🏠 **Homeowner Portal (`#view-panel-homeowner`):** Carbon Tax Rescue, Heat Loss Indicator (HLI), 24c Solar CEG calculator, and up to €35,000 in SEAI One-Stop-Shop Deep Retrofit grants.
  2. 💼 **Estate Agent Portal (`#view-panel-agent`):** ESRI-calibrated Property Equity Surge engine (+€38,500 vendor uplift), Daft.ie/MyHome.ie compliant copy generator, and green mortgage selling points.
  3. ⚡ **Installer Portal (`#view-panel-installer`):** NSAI SR50-2:2024 low-flow radiator sizing matrix (45°C flow, Delta-T 30), tender RFP generator, and outsourced technical survey dispatch.
  4. 🛡️ **Audit & Review Command Center (`#view-panel-audit`):** 100% conflict-free contractor quote red-liner, multimodal AI Computer Vision Snap & Audit dropzone (`#snap-audit`), and buffer tank verification.
  5. 🔍 **View All Tools (`#view-panel-all`):** Complete catalogue of all 11+ independent Irish energy engines.
- **Desktop Persona Pills & Mobile Dropdown Capsule:**
  - High-visibility pill bar in desktop header (`.persona-pill`).
  - Adaptive dropdown capsule on mobile (`#mobile-persona-toggle-btn` + `#mobile-current-persona-label`).
  - Active state attributes mirrored onto root: `<html data-persona="...">` and `<body data-persona="...">`.
- **Event Listener Scope Protection:**
  - All advisor audio listeners in `initAntigravityVoiceHubListeners` are bound strictly to explicit element IDs (`accordion-btn-installer`, `accordion-btn-agent`, `accordion-btn-homeowner`) with guards excluding `<html>` and `<body>`.
  - Re-entrancy guard `window._voicePersonaSyncing` prevents voice persona synchronization from looping back into UI resets.

### 2. Modernized 8-Bar Irish BER Scale Standard (G to A0)
- **Official SEAI & Dept of Housing Framework (May 24, 2026):**
  - Legacy 15-band sub-tier notation (`A1-A3, B1-B3, C1-C3, D1-D2, E1-E2`) has been completely modernized into Ireland's 8 primary energy categories: **`G, F, E, D, C, B, A, A0`**.
  - **A0 Rating:** Zero-Emission Building (ZEB) / Net-Zero energy exporter (< 0 kWh/m²/yr, micro-generation exporter).
- **Universal Baseline Progression:**
  - Standardized across EcoOS Live, Private Energy Notebook, and Technical Dossiers to **`G ➔ A0`**.
  - Statutory Grant Cap: **`Up to €35,000`** in One-Stop-Shop Deep Retrofit combined funding (replacing outdated €10,500 single-measure references).
- **Retroactive Client Session Migration:**
  - `loadInitialState()` in `/js/esh-os.js` automatically upgrades legacy cached `localStorage` data (`D1` / `A2` / `10500`) to `G` / `A0` and `€35,000`.

### 3. Native iOS/Android Mobile Bottom Navigation Dock (`#esh-mobile-dock`)
- **Five Fixed Touch Targets (Height: 65px + Safe Area Inset):**
  1. `[ 🏠 Home ]`: Returns instantly to Homeowner portal (`window.onMobileDockHome()`).
  2. `[ 🎛️ Profiles ]`: Opens the full modal persona selector (`window.onMobileDockProfiles()`).
  3. `[ 🛡️ Central Elevated FAB ]` (`#mobile-dock-audit-fab`):
     - High-contrast cyan shield icon inside an elevated 54px circle (`top: -14px`) with emerald glow.
     - Tapping activates the **Audit & Review Command Center** (`window.onMobileDockAudit()`), smoothly transitions to `#view-panel-audit`, and scrolls straight to `#snap-audit`.
     - Displays active illuminated halo (`.dock-fab-center.active`) when Audit persona is active.
     - Universal routing handler with `isMainAppPage()` and `getMainAppHomeUrl()` guarantees seamless operation across root, subdirectory (`/site/`), and local `file:///` test environments.
  4. `[ 📋 Reports ]`: Slides open the off-canvas Mobile Tool Sheet Modal (`#esh-mobile-tool-sheet`) with all 11 energy engines.
  5. `[ 💳 Checkout ]`: Direct shortcut to `/checkout/` (€149 Survey Booking).

### 4. Zero-Overlap Mobile UI/UX Layout Clearance
- **Floating Blueprint Pill (`.eco-os-floating-blueprint`):**
  - **Desktop Viewport (> 768px):** Anchored to bottom-right (`bottom: 24px; right: 24px;`).
  - **Mobile Viewport (≤ 768px):** Anchored cleanly to the **bottom-left**:
    `left: 14px; right: auto; bottom: calc(84px + env(safe-area-inset-bottom, 16px));`
  - Compacted mobile font sizing ensures 14px clearance above the dock and zero overlap with the center `🛡️` button or right-hand `+` radial FAB.
- **Desktop Zero Dead Space:**
  - Removed redundant 420px dark green bottom void below copyright bar on desktop viewports by resetting `padding-bottom: 0 !important;` on desktop while maintaining a clean 75px clearance spacer on mobile.

### 5. Static Sidebar Tools Tab & Right-Anchored Drawer
- Pinned static sidebar trigger tab (`#esh-side-tab-toggle`) positioned on the right viewport edge.
- Off-canvas tool drawer (`#esh-side-drawer`) opens cleanly from the right edge with high-contrast persona accordions and direct tool launchers.

### 6. The 11 Core Irish Energy Engines
1. **Contractor Quote vs Fair Market Price Speedometer:** `/quote-auditor/` (`quote-auditor/index.html`)
2. **1-Tap Contractor Quote Comparator & Dispute Generator:** `/quote-comparator/` (`quote-comparator/index.html`)
3. **Irish Carbon Tax Shield & Retrofit War Room Terminal:** `/#carbon-tax-war-room` & `/carbon-tax/` (Statutory €64 -> €100/tonne penalty clock, laser defense pods).
4. **Live Irish Green Mortgage Arbitrage Bank Ticker:** `/#green-mortgage-ticker` & `/green-mortgage/` (AIB 3.45%, Haven 3.45%, BOI 3.55%, PTSB 3.60%).
5. **Interactive 26-County Irish Solar & Micro-Climate Yield Map:** `/#county-solar-map` & `/solar/` (24c/kWh Clean Export earnings, local installer directory).
6. **SEAI One-Stop-Shop vs Individual Grants Decision Matrix:** `/#grant-matrix-calculator` (Turnkey OSS vs Direct Contractor Hiring).
7. **Interactive Before vs After House Transformation Cutaway Slider:** `/#transformation-slider` (Official 8-Step G to A0 Net-Zero Energy Scale).
8. **1-Click Daft.ie & Eircode Property Auditor:** Hero Scanner on `/` (8 Irish building archetypes, floor area, year built).
9. **NSAI SR50-2:2024 Low-Flow Radiator & Heat Pump Sizer:** `/radiator-sizer/`
10. **Official Simplified BER Scale (A0 to G) "What-If" Matrix:** `/ber-matrix/`
11. **Contractor Tender Specification RFP Generator:** `/tender-generator/`

---

## 🔒 Security, Business Contacts & Anti-Tamper Configuration

### 1. Official Communications Direct Route
- **WhatsApp Support & Consultation Dispatch:** `+353 83 966 2197` (International: `353839662197`, Local: `083 966 2197`)
- **Automated Routing:** Verified across `/js/whatsapp-widget.js`, `api/whatsapp-bot.js`, and all tool dossier dispatchers.

### 2. Analytics & Conversion Tracking
- **Google Tag Manager Container ID:** `AW-3013797648`
- **Verification:** Verified 200 OK hits across all HTML pages with `window.dataLayer` enhanced conversion tracking.

### 3. Vercel Staging Mirror Parity Rule
- Production root and `/site/` staging directory MUST maintain 100% byte-for-byte synchronization.
- Automated validation: Dual-directory parity verified across all 11+ engines, style sheets, and scripts.

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

---

### Version 3.9.0 Release Notes (September 9, 2026)
- **Modernized 8-Bar Scale (G to A0)**: Deprecated legacy 15-band `D1 ➔ A2` data; standardized on G ➔ A0 with €35,000 One-Stop-Shop grant cap and automatic localStorage migration.
- **Mobile Dock Center Button Transformation**: Converted center FAB from redundant `🔄` return button to high-contrast `🛡️` Audit & Review portal launcher with active illumination.
- **Mobile UI/UX Layout Collision Resolution**: Left-docked floating blueprint pill on mobile (`left: 14px; bottom: 84px`), completely eliminating collisions with the dock FAB and radial `+` trigger.
- **Desktop Persona Switching Event Scope Resolution**: Eliminated `<html>` listener capture bug in `initAntigravityVoiceHubListeners`, delivering instant desktop portal switching with zero reload.
- **Eliminated Desktop Dead Space**: Removed 420px void below footer copyright on desktop viewports.
- **Static Sidebar Tools Pin & Drawer Anchoring**: Anchored tools drawer to the right with pinned static sidebar tab.
