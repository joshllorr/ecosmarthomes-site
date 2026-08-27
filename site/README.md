# EcoSmartHome "Hub & Spoke" Web Architecture

This repository contains the refactored, mobile-optimized, high-converting static website codebase for EcoSmartHome. It has been redesigned from a single, endless-scrolling landing page into a high-performance "Hub & Spoke" content silo architecture. This structure eliminates cognitive overload, speeds up mobile performance, and establishes search engine entry points (SEO landers) for targeted local Irish retrofit terms.

Designed specifically for the Antigravity AI development team, this repository integrates clean UX, robust pre-deployment routing validators, and automated CI/CD pipeline checks.

---

## 📂 Repository Layout

Following the execution of the scaffolder script, your repository structure is organized as follows:

```
.
├── index.html                           # THE HUB: High-converting "Carbon Tax Shield" main landing page
├── README.md                            # This developer documentation
├── scaffold-ecosmarthomes.sh            # Automated Hub & Spoke static page scaffolder
├── site-validator.py                    # Pre-deployment technical SEO & checkout validator
├── .github/
│   └── workflows/
│       └── site-validator.yml           # GitHub Actions automated pre-deployment testing pipeline
├── services/                            # SILO 1: Targeted service landing pages (SEO Spokes)
│   ├── index.html                       # Services Directory
│   ├── heat-pump-readiness.html         # Radiator sizing & NSAI SR50/HLI checks
│   ├── carbon-tax-analysis.html        # Projections on €100/t oil heating penalties
│   ├── home-leakiness-audit.html        # Diagnostic guide to building envelope drafts
│   └── solar-pv-viability.html          # Rooftop orientation, battery setup, and microgen credits
├── tools/                               # SILO 2: Heavy interactive JS diagnostics (isolated)
│   ├── index.html                       # Tools Bento-grid directory
│   ├── vision-scanner.html              # Gemini 2.5 Flash boiler/attic camera uploader
│   ├── voice-aoife.html                 # Aoife Voice AI streaming audio permission socket
│   └── grant-calculator.html            # Touch-friendly SEAI grant & bill payback slider
├── guides/                              # SILO 3: Compliance & authority base (text-rich)
│   ├── index.html                       # Guides resource index
│   ├── irish-ber-scale.html             # The official 5-column Irish BER Matrix (G to A ratings)
│   └── seai-grant-handbook.html         # Upgrade sequencing and certification guide
├── support/                             # SILO 4: Friction reduction & regional maps
│   ├── faq.html                         # Consolidated home of the 9 technical & advisory FAQs
│   └── contact.html                     # Contact layout with location-based contractor filter
└── checkout/                            # SILO 5: Frictionless checkout paths (Stripe production-ready)
    ├── index.html                       # Pitch for Joe's independent €49 survey assessment
    ├── order.html                       # Hardened checkout page (no navigation distraction)
    └── thank-you.html                   # Receipt landing page triggering the WhatsApp webhook
```

---

## 🚀 Getting Started

### 1. Codebase Scaffolding
If you have not already scaffolded the folder layout, run the included utility script from the root of your project directory to construct all directories and seed them with the SEO-grounded, high-converting templates:

```bash
bash scaffold-ecosmarthomes.sh ./dist
```

### 2. Local Development Server
Because the templates utilize clean URL routing (omitting `.html` suffixes where possible to avoid duplicate index penalties), you should run a local server that handles directory index fallbacks cleanly.

**Option A: Python (Built-in, zero-config)**
```bash
python3 -m http.server 8000 --directory ./dist
```
Then navigate to `http://localhost:8000` in your web browser.

**Option B: Node.js (Live-server for hot reloading)**
```bash
npm install -g live-server
live-server ./dist --entry-file=index.html
```

---

## 🎨 Integrating & Styling the Tailwind CSS Templates

The scaffolded template pages are fully pre-loaded with Tailwind CSS CDN hooks and optimized for the "one screen, one thought" mobile layout.

### Styling Rules & Visual DNA
- **Colors & Contrast**:
  - Primary Headings: Deep Charcoal (`#1a1a1a` to `#2d3748`) to project authority and trust.
  - Brand Accent: Vibrant Emerald Green (`#059669` / `text-emerald-600`) representing independent green energy.
  - Muted Backgrounds: Warm Off-White/Light Gray (`#f9fafb`) used for alternating content sections and tables.
- **Mobile-First Grid Alignment**: Ensure all sections utilize `min-h-[100dvh]` or `h-screen` viewport heights to maintain strict screen segmentation on mobile devices.
- **Interactivity Containers**:
  - Keep camera file upload input wrapper tap-targets strictly above a minimum 48px boundary.
  - Format data tables (like the 5-column BER Scale Matrix in `/guides/irish-ber-scale.html`) with horizontal `overflow-x-auto` to prevent viewport breakout.

### Programmatic Copy Replacements
If you are integrating this codebase into a dynamic framework (like React, Next.js, or Vue), import the companion `ecosmarthomes-copy-deck.json` to decouple the localized Irish fuel-tax copy from your layout code.

---

## 🛡️ Pre-Deployment Verification

We have included automated verification systems to ensure that the production environment is completely hardened against SEO, duplicate pathing, and Stripe checkout issues before code merges.

### 1. Live Check Tests
Use `site-validator.py` to scan your local build directory or audit the live staging site.

Scan local static build files:
```bash
python3 site-validator.py --local-dir ./dist
```

Audit staging URLs recursively for broken links, console errors, or duplicate path penalties:
```bash
python3 site-validator.py --live-url https://staging.ecosmarthomes.ie
```

### 2. CI/CD Integration (GitHub Actions)
The repository is pre-configured with a GitHub Actions pipeline (`site-validator-pipeline.yml`). To activate it:
1. Copy `.github/workflows/site-validator.yml` to your repository.
2. Push your code. On every push or Pull Request to the `main` or `staging` branches, GitHub will spin up an isolated environment, run the validator, and automatically block the merge if critical issues are discovered (such as a hardcoded Stripe Test mode parameter).

---

## 📝 Critical Production Checklist

Prior to running a deployment, confirm the following items:
- [x] **Stripe Production URLs**: No occurrences of Stripe Test URLs (`buy.stripe.com/test_...`) remain on any billing path. Payment links point exclusively to `/checkout/`.
- [x] **No Test Keys**: No occurrences of Stripe Test API keys (`sk_test_`, `pk_test_`) exist within frontend or backend routes.
- [x] **Canonical Tags**: Self-referential `<link rel="canonical">` tags are populated with the final absolute URL of the domain on every static page to prevent duplicate content crawling.
- [x] **Clean Routing**: All internal links utilize clean, slash-terminated routing paths or clean `.html` targets as required by your static host provider.
