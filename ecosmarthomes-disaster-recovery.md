# EcoSmartHome Disaster Recovery Runbook

**Version:** 2.1.0  
**Last Updated:** August 28, 2026  
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

### 2. Isolate the Failure Domain
- **HTTP 500 / 502 / 504 on Webpages:** Vercel edge deployment or DNS configuration issue.
- **HTTP 500 on `/api/checkout/create-session` or `/api/webhooks/stripe`:** Stripe API secret key mismatch or Supabase database timeout.
- **Client-Side Script Errors in Tools:** Verify asset integrity in `/js/smart-nav.js`, `/js/whatsapp-widget.js`, `/js/solar-estimator.js`.

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

## 🏗️ Production System Architecture & Endpoints (August 28, 2026)

### 1. Multi-Audience Onboarding Triumvirate (`index.html`)
- **🏠 Homeowner Carbon Tax Rescue (`#wallet-rescue-wizard`):**
  - Fuel selector (`🔥 Oil`, `💨 Gas`, `⚡ Electric`) + winter spend slider (€100–€650/mo).
  - Live ticking Carbon Tax Penalty Clock calculating statutory 2026–2030 compounding liability (€4,320.00).
  - Shield Deployment animation: shatters penalty clock down to `€0.00` and displays customized grant breakdown (-€25.5k SEAI grants, -€180/mo Green Mortgage, €54/mo net bill).
- **💼 Estate Agent Commission Booster (`#agent-rescue-wizard`):**
  - Simplified 8-category BER rating selector (G to A) + property asking price presets (€175k–€950k).
  - Live ESRI-calibrated Property Equity Surge engine (e.g. `+€24,500` equity, `+€368` extra commission).
  - 1-Click Daft.ie Listing Blurb Copy tool with animated clipboard toast.
- **⚡ Installer / Retrofitter Van-to-Verdict Portal (`#installer-rescue-wizard`):**
  - Rapid archetype intake (`3-Bed Semi`, `4-Bed Detached`, `3-Bed Bungalow`, `2-Bed Apt`).
  - NSAI SR50-2:2024 low-flow radiator matrix with live `🟢 Compliant OK` and `⚠️ Oversizing Required` badges.
  - 1-Click SEAI-Compliant Tender Draft Generator + Outsource Technical Survey €49 Hand-Off.

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
- Handles the €49 Independent Retrofit Engineering Survey with Joe.
- Triggers `/api/checkout/create-session` and posts customer metadata (Name, Email, Phone, Eircode) directly to Supabase and Stripe.

### 4. Smart Scroll & Mobile Navigation
- **`css/smart-nav.css` & `js/smart-nav.js`:**
  - Header glides away on scroll down (`translateY(-110%)`) and returns instantly on scroll up.
  - Off-canvas slide-out drawer (`#esh-side-drawer`) hosting all 11 tools.
  - Input Focus Auto-Hide: Floating WhatsApp pill and Aoife launcher auto-fade during mobile keyboard input.
  - 75px bottom safety margin on mobile viewports (< 768px).

---

## 🔒 Disaster Recovery Contact Directory

| Role | Contact Name | Channel | Response SLA |
|:---|:---|:---|:---|
| **System Owner** | Joe | WhatsApp / Direct Call | Immediate |
| **Lead Developer** | Antigravity AI Engineering | GitHub / Workspace | < 1 hour (Critical) |
| **Hosting Support** | Vercel Support | vercel.com/help | < 2 hours (Pro) |
| **Payment Gateway** | Stripe Support | dashboard.stripe.com | < 2 hours (Priority) |
| **Database Support** | Supabase Support | supabase.com/dashboard | < 4 hours (Pro) |
