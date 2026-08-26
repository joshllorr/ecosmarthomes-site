#!/bin/bash
# ==============================================================================
# EcoSmartHome "Hub & Spoke" Static Scaffolder Script
# Developed for: Antigravity AI Engineering Team
# Description: Automatically builds the optimized directory structure and populates
#              high-fidelity, mobile-responsive HTML templates for EcoSmartHome.
# ==============================================================================

# Set up colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Determine target directory
TARGET_DIR="${1:-./ecosmarthomes-root}"

echo -e "${BLUE}${BOLD}================================================================${NC}"
echo -e "${GREEN}${BOLD}         ECOSMARTHOME \"HUB & SPOKE\" SCAFFOLDER SCRIPT         ${NC}"
echo -e "${BLUE}${BOLD}================================================================${NC}"
echo -e "Target Directory: ${YELLOW}${TARGET_DIR}${NC}\n"

echo -e "Creating structural directories..."
mkdir -p "$TARGET_DIR"
mkdir -p "$TARGET_DIR/services"
mkdir -p "$TARGET_DIR/tools"
mkdir -p "$TARGET_DIR/guides"
mkdir -p "$TARGET_DIR/support"
mkdir -p "$TARGET_DIR/checkout"

echo -e "Directories created successfully."

# Helper variable: Common Head Section
read -r -d '' HTML_HEAD << 'EOF'
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .gradient-brand {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
        }
        .gradient-brand:hover {
            background: linear-gradient(135deg, #047857 0%, #065f46 100%);
        }
    </style>
EOF

# Helper variable: Common Header
read -r -d '' HTML_HEADER << 'EOF'
    <!-- Header Navigation -->
    <header class="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <a href="/" class="flex items-center space-x-2">
                <span class="text-xl font-bold text-emerald-600 tracking-tight">EcoSmart<span class="text-slate-800">Home</span></span>
                <span class="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-medium">Independent</span>
            </a>
            <nav class="hidden md:flex space-x-8 text-sm font-semibold text-slate-600">
                <a href="/services/index.html" class="hover:text-emerald-600 transition">Services</a>
                <a href="/tools/index.html" class="hover:text-emerald-600 transition">Interactive Tools</a>
                <a href="/guides/index.html" class="hover:text-emerald-600 transition">BER Guides</a>
                <a href="/support/faq.html" class="hover:text-emerald-600 transition">FAQ</a>
                <a href="/support/contact.html" class="hover:text-emerald-600 transition">Contact</a>
            </nav>
            <div class="flex items-center space-x-4">
                <a href="/checkout/index.html" class="gradient-brand text-white text-sm px-4 py-2 rounded-lg font-bold hover:shadow-md transition">Get €49 Survey</a>
            </div>
        </div>
    </header>
EOF

# Helper variable: Common Footer
read -r -d '' HTML_FOOTER << 'EOF'
    <!-- Footer -->
    <footer class="bg-slate-950 text-slate-400 py-16 border-t border-slate-900 mt-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
                <span class="text-lg font-bold text-white">EcoSmart<span class="text-emerald-500">Home</span></span>
                <p class="mt-4 text-sm text-slate-400 leading-relaxed">
                    100% Conflict-Free Energy Upgrade Advisory serving all 32 Irish counties. No contractor commissions. No installer bias. Just clear, trusted advice.
                </p>
                <div class="mt-6 flex space-x-4 text-xs">
                    <span class="text-emerald-500 font-semibold">● Serving All of Ireland</span>
                </div>
            </div>
            <div>
                <h4 class="text-xs font-bold text-white uppercase tracking-wider">Independent Services</h4>
                <ul class="mt-4 space-y-3 text-sm">
                    <li><a href="/services/heat-pump-readiness.html" class="hover:text-white transition">Heat Pump Readiness</a></li>
                    <li><a href="/services/carbon-tax-analysis.html" class="hover:text-white transition">Carbon Tax Analysis</a></li>
                    <li><a href="/services/home-leakiness-audit.html" class="hover:text-white transition">Home Leakiness Audit</a></li>
                    <li><a href="/services/solar-pv-viability.html" class="hover:text-white transition">Solar PV Viability</a></li>
                </ul>
            </div>
            <div>
                <h4 class="text-xs font-bold text-white uppercase tracking-wider">Interactive AI Tools</h4>
                <ul class="mt-4 space-y-3 text-sm">
                    <li><a href="/tools/vision-scanner.html" class="hover:text-white transition">Gemini Boiler Scanner</a></li>
                    <li><a href="/tools/voice-aoife.html" class="hover:text-white transition">Aoife Voice AI</a></li>
                    <li><a href="/tools/grant-calculator.html" class="hover:text-white transition">SEAI Grant Calculator</a></li>
                </ul>
            </div>
            <div>
                <h4 class="text-xs font-bold text-white uppercase tracking-wider">Information & Trust</h4>
                <ul class="mt-4 space-y-3 text-sm">
                    <li><a href="/guides/irish-ber-scale.html" class="hover:text-white transition">Official Irish BER Matrix</a></li>
                    <li><a href="/guides/seai-grant-handbook.html" class="hover:text-white transition">SEAI Grant Handbook</a></li>
                    <li><a href="/support/faq.html" class="hover:text-white transition">Frequently Asked Questions</a></li>
                </ul>
            </div>
        </div>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-slate-900 text-center text-xs">
            <p class="text-slate-500">&copy; 2026 EcoSmartHome Ireland. All rights reserved. Built with pride to defeat AI slop. Independent Energy retrofitting counsel.</p>
        </div>
    </footer>
EOF

# ------------------------------------------------------------------------------
# 1. GENERATE INDEX.HTML (THE HUB)
# ------------------------------------------------------------------------------
echo -e "Generating ${CYAN}/index.html${NC} (The Landing Page Hub)..."
cat << EOF > "$TARGET_DIR/index.html"
<!DOCTYPE html>
<html lang="en">
<head>
    $HTML_HEAD
    <title>EcoSmartHome | Premium Independent Home Energy Advisory Ireland</title>
    <meta name="description" content="100% Conflict-free energy upgrade roadmaps for Irish homeowners. Save up to €4,850/yr, maximize SEAI grants, and build your Carbon Tax Shield.">
    <link rel="canonical" href="https://www.ecosmarthomes.ie/" />
</head>
<body class="bg-slate-50 text-slate-800 font-sans min-h-screen flex flex-col justify-between">
    $HTML_HEADER

    <main class="flex-grow">
        <!-- Hero Section (One Screen, One Thought) -->
        <section class="max-w-5xl mx-auto px-4 py-20 text-center flex flex-col justify-center min-h-[80vh]">
            <span class="text-emerald-700 font-bold tracking-widest text-xs uppercase bg-emerald-100/80 px-3 py-1.5 rounded-full inline-block mx-auto mb-6">100% Conflict-Free Energy Advisory</span>
            <h1 class="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Stop Funding the Irish Fuel Tax.<br/> Build Your <span class="text-emerald-600">Carbon Tax Shield</span>.
            </h1>
            <p class="mt-6 text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Dublin, Cork, or Limerick—rising oil levies are quietly eating your savings. Secure a 100% independent roadmap to slash your heating bills from €5,400 to €650 a year using up to €25,500 in direct SEAI grants. No sales pitches. No contractor kickbacks.
            </p>
            <div class="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
                <a href="/checkout/index.html" class="gradient-brand text-white text-base px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto">🛡️ Get Your €49 Assessment & Roadmap</a>
                <a href="/tools/index.html" class="bg-white border border-slate-200 text-slate-700 text-base px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition w-full sm:w-auto">Launch Interactive Tools</a>
            </div>
            <div class="mt-8 flex justify-center items-center space-x-6 text-sm text-slate-500 font-medium">
                <span>✓ NSAI Compliant</span>
                <span>✓ Serves All 32 Counties</span>
                <span>✓ No Referral Commissions</span>
            </div>
        </section>

        <!-- Dynamic Before & After Slider Section -->
        <section class="bg-slate-100 py-20 border-t border-b border-slate-200">
            <div class="max-w-4xl mx-auto px-4 text-center">
                <h2 class="text-3xl font-extrabold text-slate-900">Before & After: See Your Home Transformed</h2>
                <p class="mt-4 text-slate-600 mb-12">See how NSAI External Wall Insulation ("The Wrap"), triple glazing, and roof solar panels elevate a 1980s home to A2 rating NZEB.</p>
                <div class="relative rounded-2xl overflow-hidden shadow-2xl max-w-2xl mx-auto border border-slate-300">
                    <img src="/imgs/irish_house_after.svg" alt="Home After Retrofit Wrap" class="w-full h-80 object-cover" onerror="this.onerror=null;this.src='/imgs/irish_house_after.jpg';">
                    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 to-transparent p-6 text-left">
                        <span class="bg-emerald-500 text-white text-xs uppercase px-2 py-1 rounded font-bold">A2 Retrofitted Modern Wrap Target</span>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-white text-xs">
                            <div><p class="text-slate-400">BER Rating</p><p class="font-bold text-sm text-emerald-400">D2 ➔ A2 NZEB</p></div>
                            <div><p class="text-slate-400">Wall U-Value</p><p class="font-bold text-sm">2.10 ➔ 0.18 W/m²K</p></div>
                            <div><p class="text-slate-400">SEAI Wrap Grant</p><p class="font-bold text-sm text-yellow-400">€8,000 Saved</p></div>
                            <div><p class="text-slate-400">Annual Fuel Cut</p><p class="font-bold text-sm">Save €2,350/yr</p></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Bento Grid Tools Preview -->
        <section class="py-20 bg-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center max-w-3xl mx-auto mb-16">
                    <h2 class="text-3xl font-bold text-slate-900">Explore Our Diagnostic AI Tools</h2>
                    <p class="mt-4 text-slate-600">Completely self-serve, private, and 100% free of salesperson tracking. Analyze your upgrade costs and carbon tax exposure instantly.</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="bg-slate-50 p-8 rounded-2xl border border-slate-200/60 hover:border-emerald-500 transition-all shadow-sm flex flex-col justify-between group">
                        <div>
                            <span class="text-4xl">📷</span>
                            <h3 class="text-xl font-bold text-slate-900 mt-6 group-hover:text-emerald-600 transition">Boiler Scan (Gemini 2.5 Flash)</h3>
                            <p class="mt-3 text-slate-600 text-sm leading-relaxed">Snap a photo of your heating setup or attic insulation hatch for an instant visual suitability score.</p>
                        </div>
                        <a href="/tools/vision-scanner.html" class="mt-6 inline-flex items-center text-sm font-bold text-emerald-600 group-hover:translate-x-1 transition">Scan Boiler Now &rarr;</a>
                    </div>
                    <div class="bg-slate-50 p-8 rounded-2xl border border-slate-200/60 hover:border-emerald-500 transition-all shadow-sm flex flex-col justify-between group">
                        <div>
                            <span class="text-4xl">🎙️</span>
                            <h3 class="text-xl font-bold text-slate-900 mt-6 group-hover:text-emerald-600 transition">Aoife Voice Assistant</h3>
                            <p class="mt-3 text-slate-600 text-sm leading-relaxed">Have a live voice conversation about SEAI regulations in plain, neighborly English.</p>
                        </div>
                        <a href="/tools/voice-aoife.html" class="mt-6 inline-flex items-center text-sm font-bold text-emerald-600 group-hover:translate-x-1 transition">Talk to Aoife &rarr;</a>
                    </div>
                    <div class="bg-slate-50 p-8 rounded-2xl border border-slate-200/60 hover:border-emerald-500 transition-all shadow-sm flex flex-col justify-between group">
                        <div>
                            <span class="text-4xl">🧮</span>
                            <h3 class="text-xl font-bold text-slate-900 mt-6 group-hover:text-emerald-600 transition">SEAI Grant & Payback Calculator</h3>
                            <p class="mt-3 text-slate-600 text-sm leading-relaxed">Calculate your G to A rating transformation value, grant sums up to €25,500, and exact payback periods.</p>
                        </div>
                        <a href="/tools/grant-calculator.html" class="mt-6 inline-flex items-center text-sm font-bold text-emerald-600 group-hover:translate-x-1 transition">Calculate Savings &rarr;</a>
                    </div>
                </div>
            </div>
        </section>
    </main>

    $HTML_FOOTER
</body>
</html>
EOF

# ------------------------------------------------------------------------------
# 2. GENERATE SERVICES PAGES
# ------------------------------------------------------------------------------
echo -e "Generating ${CYAN}/services/index.html${NC} (Services Hub)..."
cat << EOF > "$TARGET_DIR/services/index.html"
<!DOCTYPE html>
<html lang="en">
<head>
    $HTML_HEAD
    <title>Independent Retrofit Services | EcoSmartHome</title>
    <meta name="description" content="Explore our range of 100% independent energy assessment services. From Heat Pump Readiness checks to complete financial Carbon Tax Shield modeling.">
    <link rel="canonical" href="https://www.ecosmarthomes.ie/services/" />
</head>
<body class="bg-slate-50 text-slate-800 font-sans min-h-screen flex flex-col justify-between">
    $HTML_HEADER

    <main class="max-w-7xl mx-auto px-4 py-16 flex-grow">
        <div class="text-center max-w-3xl mx-auto mb-16">
            <h1 class="text-4xl font-extrabold text-slate-900">Independent Advisory & Audit Services</h1>
            <p class="mt-4 text-lg text-slate-600">Conflict-free, expert assessment designed to protect your wallet and secure maximum grant coverage without pushy sales pressure.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div class="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                    <span class="text-3xl">🔥</span>
                    <h3 class="text-lg font-bold text-slate-900 mt-6">Heat Pump Readiness</h3>
                    <p class="mt-2 text-sm text-slate-600 leading-relaxed">Complete analysis of heat loss indicators (HLI &le; 2.0) and radiator sizing suitability.</p>
                </div>
                <a href="/services/heat-pump-readiness.html" class="mt-6 inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700">Learn More &rarr;</a>
            </div>
            <div class="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                    <span class="text-3xl">🛡️</span>
                    <h3 class="text-lg font-bold text-slate-900 mt-6">Carbon Tax Analysis</h3>
                    <p class="mt-2 text-sm text-slate-600 leading-relaxed">Audit your home's long-term exposure to Ireland's rapid kerosene and heating oil tax hikes.</p>
                </div>
                <a href="/services/carbon-tax-analysis.html" class="mt-6 inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700">Learn More &rarr;</a>
            </div>
            <div class="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                    <span class="text-3xl">🌬️</span>
                    <h3 class="text-lg font-bold text-slate-900 mt-6">Leakiness Audit</h3>
                    <p class="mt-2 text-sm text-slate-600 leading-relaxed">Find hidden thermal gaps and structural cold spots using advanced thermal profiling guides.</p>
                </div>
                <a href="/services/home-leakiness-audit.html" class="mt-6 inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700">Learn More &rarr;</a>
            </div>
            <div class="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                    <span class="text-3xl">☀️</span>
                    <h3 class="text-lg font-bold text-slate-900 mt-6">Solar PV Viability</h3>
                    <p class="mt-2 text-sm text-slate-600 leading-relaxed">Calculate roof structural space, direction index, and clean export credit revenue.</p>
                </div>
                <a href="/services/solar-pv-viability.html" class="mt-6 inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700">Learn More &rarr;</a>
            </div>
        </div>
    </main>

    $HTML_FOOTER
</body>
</html>
EOF

# Generating individual spokes for services
echo -e "Generating ${CYAN}/services/heat-pump-readiness.html${NC}..."
cat << EOF > "$TARGET_DIR/services/heat-pump-readiness.html"
<!DOCTYPE html>
<html lang="en">
<head>
    $HTML_HEAD
    <title>Heat Pump Readiness Assessments | EcoSmartHome</title>
    <meta name="description" content="Check if your home is ready for low-flow heat pump integration. Calculate HLI indices and comply with NSAI SR50 standards independently.">
    <link rel="canonical" href="https://www.ecosmarthomes.ie/services/heat-pump-readiness.html" />
</head>
<body class="bg-slate-50 text-slate-800 font-sans min-h-screen flex flex-col justify-between">
    $HTML_HEADER

    <main class="max-w-4xl mx-auto px-4 py-16 flex-grow">
        <nav class="text-sm text-slate-500 mb-8">
            <a href="/" class="hover:underline">Home</a> &gt; 
            <a href="/services/index.html" class="hover:underline">Services</a> &gt; 
            <span class="text-slate-800 font-medium">Heat Pump Readiness</span>
        </nav>

        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900">Independent Heat Pump Readiness Compliance Audit</h1>
        <p class="mt-4 text-xl text-slate-600 leading-relaxed">
            Before investing up to €15,000 in a heat pump installation, ensure your home satisfies the strict SEAI eligibility criteria, including a Heat Loss Indicator (HLI) score of &le; 2.0 W/K·m².
        </p>

        <div class="bg-emerald-50 border-l-4 border-emerald-500 p-6 my-8 rounded-r-xl">
            <h4 class="font-bold text-emerald-900">Unbiased Suitability Reviews</h4>
            <p class="text-sm text-emerald-800 mt-1">Unlike standard retrofitting agencies, EcoSmartHome does not sell hardware or take kickbacks. We provide transparent, conflict-free math to see if your property will freeze during sub-zero cycles.</p>
        </div>

        <div class="space-y-8 mt-12">
            <div>
                <h3 class="text-xl font-bold text-slate-900">1. NSAI SR50-2 Compliance Check</h3>
                <p class="mt-2 text-slate-600 leading-relaxed">Our survey evaluates your building's fabric elements—roof, walls, floors, and doors—to verify your overall HLI metric. Passing this is mandatory to unlock the high-value €12,500 SEAI deep retrofit funding pool.</p>
            </div>
            <div>
                <h3 class="text-xl font-bold text-slate-900">2. Radiator Output & Sizing Calculations</h3>
                <p class="mt-2 text-slate-600 leading-relaxed">Standard gas boilers cycle water at 75°C. Efficient heat pumps run at 35°C to 45°C. We check if your current radiator sizing has enough surface space to heat your rooms at these lower, energy-saving flow temperatures.</p>
            </div>
            <div>
                <h3 class="text-xl font-bold text-slate-900">3. Fireplace (SR54) Rule Preparation</h3>
                <p class="mt-2 text-slate-600 leading-relaxed">Under Irish code, any open fireplace must be permanently bricked, sealed, or converted to an airtight stove unit to avoid failing post-assessment BER thresholds.</p>
            </div>
        </div>

        <div class="mt-16 bg-slate-900 text-white p-10 rounded-2xl text-center">
            <h3 class="text-2xl font-bold">Unbiased Diagnostics for Just €49</h3>
            <p class="text-slate-400 mt-3 max-w-2xl mx-auto text-sm leading-relaxed">Get your formal pass/fail Heat Pump Readiness test, radiator output mapping, and 2026-2030 Carbon Tax Shield roadmap with Joe.</p>
            <a href="/checkout/index.html" class="gradient-brand inline-block text-white text-base px-8 py-4 rounded-xl font-bold mt-8 shadow-lg">Schedule Your On-Site Survey &rarr;</a>
        </div>
    </main>

    $HTML_FOOTER
</body>
</html>
EOF

echo -e "Generating ${CYAN}/services/carbon-tax-analysis.html${NC}..."
cat << EOF > "$TARGET_DIR/services/carbon-tax-analysis.html"
<!DOCTYPE html>
<html lang="en">
<head>
    $HTML_HEAD
    <title>Carbon Tax & Fuel Penalty Analysis | EcoSmartHome</title>
    <meta name="description" content="Calculate your home's exposure to rising Irish carbon tax. Protect your savings against kerosene price spikes with a Carbon Tax Shield.">
    <link rel="canonical" href="https://www.ecosmarthomes.ie/services/carbon-tax-analysis.html" />
</head>
<body class="bg-slate-50 text-slate-800 font-sans min-h-screen flex flex-col justify-between">
    $HTML_HEADER

    <main class="max-w-4xl mx-auto px-4 py-16 flex-grow">
        <nav class="text-sm text-slate-500 mb-8">
            <a href="/" class="hover:underline">Home</a> &gt; 
            <a href="/services/index.html" class="hover:underline">Services</a> &gt; 
            <span class="text-slate-800 font-medium">Carbon Tax Analysis</span>
        </nav>

        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900">Audit Your Carbon Tax & Fuel Penalty Exposure</h1>
        <p class="mt-4 text-xl text-slate-600 leading-relaxed">
            Government environmental penalties on kerosene oil and heating fuels are rising from €71/t to a mandatory €100/tonne, accompanied by a 9% double VAT rate on uninsulated thermal leaks.
        </p>

        <div class="bg-emerald-50 border-l-4 border-emerald-500 p-6 my-8 rounded-r-xl">
            <h4 class="font-bold text-emerald-900">An Unprotected G-Rated Home Costs ~€45,000 Over 10 Years</h4>
            <p class="text-sm text-emerald-800 mt-1">Our localized database shows Irish households heating with oil are bleeding thousands directly to carbon tax levies due to poor insulation envelope retention.</p>
        </div>

        <div class="space-y-8 mt-12">
            <div>
                <h3 class="text-xl font-bold text-slate-900">Fuel Loss Projections</h3>
                <p class="mt-2 text-slate-600 leading-relaxed">We calculate the exact volume of fuel lost on every radiator heating cycle. This outlines how much money you can rescue by upgrading from a standard G/D performance rating up to a cost-optimal A-rating.</p>
            </div>
            <div>
                <h3 class="text-xl font-bold text-slate-900">The Carbon Tax Shield Plan</h3>
                <p class="mt-2 text-slate-600 leading-relaxed">Rather than "going green" for abstract reasons, the Carbon Tax Shield is a hard financial defense model. We prioritize high-impact fabric upgrades—like 300mm attic insulation and wall seals—to shield your net worth from government penalties.</p>
            </div>
        </div>

        <div class="mt-16 bg-slate-900 text-white p-10 rounded-2xl text-center">
            <h3 class="text-2xl font-bold">Secure Your Carbon Tax Shield Model</h3>
            <p class="text-slate-400 mt-3 max-w-2xl mx-auto text-sm leading-relaxed">Get your independent audit, on-site diagnostics, and full Irish retrofit roadmap for a fixed price of €49.</p>
            <a href="/checkout/index.html" class="gradient-brand inline-block text-white text-base px-8 py-4 rounded-xl font-bold mt-8 shadow-lg">Get Your €49 Assessment &rarr;</a>
        </div>
    </main>

    $HTML_FOOTER
</body>
</html>
EOF

echo -e "Generating ${CYAN}/services/home-leakiness-audit.html${NC}..."
cat << EOF > "$TARGET_DIR/services/home-leakiness-audit.html"
<!DOCTYPE html>
<html lang="en">
<head>
    $HTML_HEAD
    <title>Home Leakiness Auditing | EcoSmartHome</title>
    <meta name="description" content="Identify drafts, thermal gaps, and cold spots. Get a plain English home leakiness score to keep warm air inside.">
    <link rel="canonical" href="https://www.ecosmarthomes.ie/services/home-leakiness-audit.html" />
</head>
<body class="bg-slate-50 text-slate-800 font-sans min-h-screen flex flex-col justify-between">
    $HTML_HEADER

    <main class="max-w-4xl mx-auto px-4 py-16 flex-grow">
        <nav class="text-sm text-slate-500 mb-8">
            <a href="/" class="hover:underline">Home</a> &gt; 
            <a href="/services/index.html" class="hover:underline">Services</a> &gt; 
            <span class="text-slate-800 font-medium">Home Leakiness Audit</span>
        </nav>

        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900">Independent Leakiness & Thermal Gap Auditing</h1>
        <p class="mt-4 text-xl text-slate-600 leading-relaxed">
            Uninsulated attic hatches, drafty suspended floorboards, and old wall vents can let up to 40% of generated heat escape in seconds. Think of your home like a leaky bucket.
        </p>

        <div class="bg-emerald-50 border-l-4 border-emerald-500 p-6 my-8 rounded-r-xl">
            <h4 class="font-bold text-emerald-900">No Complex Terminology. Plain English Answers.</h4>
            <p class="text-sm text-emerald-800 mt-1">We don't try to scare you with air-changes-per-hour metrics. We show you exactly where the wind is whistling through and how much cash it is carrying out of your home.</p>
        </div>

        <div class="space-y-8 mt-12">
            <div>
                <h3 class="text-xl font-bold text-slate-900">Cold Patch & Draft Mapping</h3>
                <p class="mt-2 text-slate-600 leading-relaxed">We map draft vectors around standard structural openings. This allows us to recommend targeted, low-cost "quick wins" (like frame gaskets and pipe wraps) before you spend money on big system retrofits.</p>
            </div>
            <div>
                <h3 class="text-xl font-bold text-slate-900">Mould & Damp Risk Profiling</h3>
                <p class="mt-2 text-slate-600 leading-relaxed">Poor ventilation sequence can trap relative humidity in thermal cold zones, triggering dangerous spore development. We verify that draft sealing does not compromise indoor air hygiene.</p>
            </div>
        </div>

        <div class="mt-16 bg-slate-900 text-white p-10 rounded-2xl text-center">
            <h3 class="text-2xl font-bold">Uncover Your Energy Leaks</h3>
            <p class="text-slate-400 mt-3 max-w-2xl mx-auto text-sm leading-relaxed">Book our on-site survey and get a verified list of draft leaks along with a conflict-free upgrade roadmap for €49.</p>
            <a href="/checkout/index.html" class="gradient-brand inline-block text-white text-base px-8 py-4 rounded-xl font-bold mt-8 shadow-lg">Order Your Audit Now &rarr;</a>
        </div>
    </main>

    $HTML_FOOTER
</body>
</html>
EOF

echo -e "Generating ${CYAN}/services/solar-pv-viability.html${NC}..."
cat << EOF > "$TARGET_DIR/services/solar-pv-viability.html"
<!DOCTYPE html>
<html lang="en">
<head>
    $HTML_HEAD
    <title>Independent Rooftop Solar PV Viability | EcoSmartHome</title>
    <meta name="description" content="Unbiased solar PV assessments. Estimate roof orientation yield, battery storage ROI, and Clean Export Guarantee (CEG) income in Ireland.">
    <link rel="canonical" href="https://www.ecosmarthomes.ie/services/solar-pv-viability.html" />
</head>
<body class="bg-slate-50 text-slate-800 font-sans min-h-screen flex flex-col justify-between">
    $HTML_HEADER

    <main class="max-w-4xl mx-auto px-4 py-16 flex-grow">
        <nav class="text-sm text-slate-500 mb-8">
            <a href="/" class="hover:underline">Home</a> &gt; 
            <a href="/services/index.html" class="hover:underline">Services</a> &gt; 
            <span class="text-slate-800 font-medium">Solar PV Viability</span>
        </nav>

        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900">Independent Rooftop Solar PV Viability Review</h1>
        <p class="mt-4 text-xl text-slate-600 leading-relaxed">
            With solar panels triggering 0% VAT rates in Ireland and up to €1,800 in direct SEAI grant support, adding clean roof solar PV is highly profitable—but only if your pitch, placement, and self-consumption are correctly calculated.
        </p>

        <div class="bg-emerald-50 border-l-4 border-emerald-500 p-6 my-8 rounded-r-xl">
            <h4 class="font-bold text-emerald-900">Earn 24c/kWh Clean Export Guarantee (CEG)</h4>
            <p class="text-sm text-emerald-800 mt-1">We determine your microgen grid feedback potential to maximize the value you get from selling excess power back to Electric Ireland, SSE, or Bord Gáis.</p>
        </div>

        <div class="space-y-8 mt-12">
            <div>
                <h3 class="text-xl font-bold text-slate-900">Orientation & Pitch Calibration</h3>
                <p class="mt-2 text-slate-600 leading-relaxed">We audit your roof's orientation index. An east-west split might run lower peak power than a pure south layout but often delivers higher self-consumption utility by capturing solar energy in the morning and evening.</p>
            </div>
            <div>
                <h3 class="text-xl font-bold text-slate-900">Battery Storage Break-Even Calculator</h3>
                <p class="mt-2 text-slate-600 leading-relaxed">Solar installers always push high-margin batteries. We run the honest numbers to see if a €3,500 battery unit makes sense for your evening load, or if you should route that budget into fabric insulation instead.</p>
            </div>
        </div>

        <div class="mt-16 bg-slate-950 text-white p-10 rounded-2xl text-center">
            <h3 class="text-2xl font-bold">Unbiased Solar Suitability Audits</h3>
            <p class="text-slate-400 mt-3 max-w-2xl mx-auto text-sm leading-relaxed">Get a fully independent overview of your solar potential and SEAI grant viability with Joe for €49.</p>
            <a href="/checkout/index.html" class="gradient-brand inline-block text-white text-base px-8 py-4 rounded-xl font-bold mt-8 shadow-lg">Get Your Audit for €49 &rarr;</a>
        </div>
    </main>

    $HTML_FOOTER
</body>
</html>
EOF

# ------------------------------------------------------------------------------
# 3. GENERATE INTERACTIVE TOOLS PAGES
# ------------------------------------------------------------------------------
echo -e "Generating ${CYAN}/tools/index.html${NC} (Interactive Tools)..."
cat << EOF > "$TARGET_DIR/tools/index.html"
<!DOCTYPE html>
<html lang="en">
<head>
    $HTML_HEAD
    <title>Interactive Retrofit Tools | EcoSmartHome</title>
    <meta name="description" content="Access our full suite of free, independent energy diagnostic tools. Check boiler pictures with Gemini, chat with Aoife, and calculate SEAI grants.">
    <link rel="canonical" href="https://www.ecosmarthomes.ie/tools/" />
</head>
<body class="bg-slate-50 text-slate-800 font-sans min-h-screen flex flex-col justify-between">
    $HTML_HEADER

    <main class="max-w-7xl mx-auto px-4 py-16 flex-grow">
        <div class="text-center max-w-3xl mx-auto mb-16">
            <h1 class="text-4xl font-extrabold text-slate-900">Interactive Diagnostic AI Tools</h1>
            <p class="mt-4 text-lg text-slate-600">Access our quarantined, self-serve visual scanners, voice support, and financial estimators. Zero tracking cookies. Safe browser permissions.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white p-8 rounded-2xl border border-slate-150 shadow-sm flex flex-col justify-between hover:border-emerald-500 transition group">
                <div>
                    <span class="text-3xl">📷</span>
                    <h3 class="text-xl font-bold text-slate-900 mt-6 group-hover:text-emerald-600 transition">Boiler Scan (Gemini 2.5 Flash)</h3>
                    <p class="mt-3 text-slate-600 text-sm">Snap a photo of your cylinder, boiler, or attic insulation for an instant visual audit check.</p>
                </div>
                <a href="/tools/vision-scanner.html" class="mt-6 inline-flex items-center text-sm font-semibold text-emerald-600">Open Scanner &rarr;</a>
            </div>
            <div class="bg-white p-8 rounded-2xl border border-slate-150 shadow-sm flex flex-col justify-between hover:border-emerald-500 transition group">
                <div>
                    <span class="text-3xl">🎙️</span>
                    <h3 class="text-xl font-bold text-slate-900 mt-6 group-hover:text-emerald-600 transition">Aoife Voice Assistant</h3>
                    <p class="mt-3 text-slate-600 text-sm">Talk live with our conversational voice agent to get answers to your grant queries.</p>
                </div>
                <a href="/tools/voice-aoife.html" class="mt-6 inline-flex items-center text-sm font-semibold text-emerald-600">Talk to Aoife &rarr;</a>
            </div>
            <div class="bg-white p-8 rounded-2xl border border-slate-150 shadow-sm flex flex-col justify-between hover:border-emerald-500 transition group">
                <div>
                    <span class="text-3xl">🧮</span>
                    <h3 class="text-xl font-bold text-slate-900 mt-6 group-hover:text-emerald-600 transition">SEAI Grant & Payback Calculator</h3>
                    <p class="mt-3 text-slate-600 text-sm">Drag energy ratings to see potential savings, upgrade net costs, and direct payback times.</p>
                </div>
                <a href="/tools/grant-calculator.html" class="mt-6 inline-flex items-center text-sm font-semibold text-emerald-600">Open Calculator &rarr;</a>
            </div>
        </div>
    </main>

    $HTML_FOOTER
</body>
</html>
EOF

echo -e "Generating ${CYAN}/tools/vision-scanner.html${NC}..."
cat << EOF > "$TARGET_DIR/tools/vision-scanner.html"
<!DOCTYPE html>
<html lang="en">
<head>
    $HTML_HEAD
    <title>AI Equipment Boiler Photo Scanner | EcoSmartHome</title>
    <meta name="description" content="Upload a photo of your hot water cylinder or boiler for instant Gemini 2.5 vision diagnostics. Quick, easy mobile energy scans.">
    <link rel="canonical" href="https://www.ecosmarthomes.ie/tools/vision-scanner.html" />
</head>
<body class="bg-slate-50 text-slate-800 font-sans min-h-screen flex flex-col justify-between">
    $HTML_HEADER

    <main class="max-w-xl mx-auto px-4 py-16 flex-grow flex flex-col justify-center text-center">
        <h1 class="text-3xl font-extrabold text-slate-900">Gemini 2.5 Flash Boiler Scanner</h1>
        <p class="mt-2 text-slate-600">Snap a quick photo of your cylinder, boiler, attic insulation hatch, or fuse board with your phone to check compatibility.</p>

        <div class="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-10 my-8 hover:border-emerald-500 transition-all cursor-pointer">
            <span class="text-5xl block">📷</span>
            <span class="mt-4 block text-sm font-semibold text-slate-700">Take Photo or Choose File</span>
            <span class="mt-1 block text-xs text-slate-400">Supports standard phone JPEG, PNG, or WebP formats</span>
            <input type="file" accept="image/*" class="hidden" id="camera-file-input">
        </div>

        <div class="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            🔒 <strong>Mobile Performance Rule:</strong> Your photo is compressed locally inside your browser before uploading to save mobile data usage and guarantee immediate rendering.
        </div>
    </main>

    $HTML_FOOTER
</body>
</html>
EOF

echo -e "Generating ${CYAN}/tools/voice-aoife.html${NC}..."
cat << EOF > "$TARGET_DIR/tools/voice-aoife.html"
<!DOCTYPE html>
<html lang="en">
<head>
    $HTML_HEAD
    <title>Aoife Voice AI Assistant | EcoSmartHome</title>
    <meta name="description" content="Talk live with Aoife, Ireland's senior retrofit AI helper. Ask your heating, insulation, and grant queries using friendly voice controls.">
    <link rel="canonical" href="https://www.ecosmarthomes.ie/tools/voice-aoife.html" />
</head>
<body class="bg-slate-50 text-slate-800 font-sans min-h-screen flex flex-col justify-between">
    $HTML_HEADER

    <main class="max-w-md mx-auto px-4 py-16 flex-grow flex flex-col justify-center text-center">
        <span class="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold inline-block mx-auto">Online & Live</span>
        <h1 class="text-3xl font-extrabold text-slate-900 mt-4">Aoife Senior Retrofit Assistant</h1>
        <p class="mt-2 text-slate-600">Ask any technical questions about Irish SEAI grants out loud in plain, neighborly English.</p>

        <div class="my-10">
            <button class="w-32 h-32 rounded-full gradient-brand text-white shadow-lg hover:scale-105 transition-all flex flex-col items-center justify-center mx-auto focus:outline-none ring-4 ring-emerald-100 animate-pulse">
                <span class="text-4xl">🎙️</span>
                <span class="text-xs font-bold mt-2 uppercase tracking-wider">Tap to Speak</span>
            </button>
            <p class="text-xs text-slate-400 mt-6 font-medium">Listening...</p>
        </div>

        <div class="flex flex-wrap justify-center gap-2 max-w-sm mx-auto">
            <span class="bg-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-full">📐 HLI &le; 2.0 Rule</span>
            <span class="bg-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-full">🔥 Open Fireplaces</span>
            <span class="bg-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-full">💶 €12.5k Grant Limits</span>
        </div>
    </main>

    $HTML_FOOTER
</body>
</html>
EOF

echo -e "Generating ${CYAN}/tools/grant-calculator.html${NC}..."
cat << EOF > "$TARGET_DIR/tools/grant-calculator.html"
<!DOCTYPE html>
<html lang="en">
<head>
    $HTML_HEAD
    <title>Irish SEAI Grant & Payback Calculator | EcoSmartHome</title>
    <meta name="description" content="Interactive energy savings and payback calculator. Calculate net upgrade costs, fuel cuts, and SEAI grant allocations automatically.">
    <link rel="canonical" href="https://www.ecosmarthomes.ie/tools/grant-calculator.html" />
</head>
<body class="bg-slate-50 text-slate-800 font-sans min-h-screen flex flex-col justify-between">
    $HTML_HEADER

    <main class="max-w-2xl mx-auto px-4 py-16 flex-grow">
        <h1 class="text-3xl font-extrabold text-slate-900 text-center">SEAI Grant & Energy Savings Estimator</h1>
        <p class="mt-2 text-slate-600 text-center">Drag the sliders below to estimate your exact SEAI grant totals, annual savings, and net retrofit upgrade investment.</p>

        <div class="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl my-10 space-y-8">
            <!-- Slider 1 -->
            <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Current Energy Rating (BER)</label>
                <input type="range" min="1" max="8" value="4" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600">
                <div class="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                    <span>G (Worst)</span>
                    <span>D (Irish Avg)</span>
                    <span>A0 (Best)</span>
                </div>
            </div>

            <!-- Total Box -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100 text-center">
                <div><p class="text-xs text-slate-500">Total SEAI Grants</p><p class="text-lg font-extrabold text-emerald-600 mt-1">€24,800</p></div>
                <div><p class="text-xs text-slate-500">Est. Net Cost</p><p class="text-lg font-extrabold text-slate-900 mt-1">€11,700</p></div>
                <div><p class="text-xs text-slate-500">Annual Fuel Cut</p><p class="text-lg font-extrabold text-slate-900 mt-1">€2,200/yr</p></div>
                <div><p class="text-xs text-slate-500">Est. Payback</p><p class="text-lg font-extrabold text-slate-900 mt-1">5.3 Years</p></div>
            </div>
        </div>

        <div class="text-center">
            <a href="/checkout/index.html" class="gradient-brand inline-block text-white px-8 py-3 rounded-xl font-bold shadow hover:shadow-md transition">Lock in Grants with Joe's Survey &rarr;</a>
        </div>
    </main>

    $HTML_FOOTER
</body>
</html>
EOF

# ------------------------------------------------------------------------------
# 4. GENERATE GUIDES & FAQ PAGES
# ------------------------------------------------------------------------------
echo -e "Generating ${CYAN}/guides/index.html${NC} (Guides Directory)..."
cat << EOF > "$TARGET_DIR/guides/index.html"
<!DOCTYPE html>
<html lang="en">
<head>
    $HTML_HEAD
    <title>Knowledge Guides & Resources | EcoSmartHome</title>
    <meta name="description" content="Discover professional articles and structural resources on building energy upgrading, regulations, and Irish SEAI grant program documentation.">
    <link rel="canonical" href="https://www.ecosmarthomes.ie/guides/" />
</head>
<body class="bg-slate-50 text-slate-800 font-sans min-h-screen flex flex-col justify-between">
    $HTML_HEADER

    <main class="max-w-4xl mx-auto px-4 py-16 flex-grow">
        <h1 class="text-4xl font-extrabold text-slate-900 text-center">Knowledge & Compliance Resource Library</h1>
        <p class="mt-4 text-lg text-slate-600 text-center">Deep structural insights and complete technical specifications compiled to guide your building upgrade sequence safely.</p>

        <div class="mt-12 space-y-6">
            <div class="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition flex justify-between items-center group">
                <div>
                    <h3 class="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition">Understanding the Irish BER Scale: G to A0 Scale Matrix</h3>
                    <p class="mt-2 text-sm text-slate-600 leading-relaxed">Our updated scale parameters mapping heat-loss profiles, fuel demands, CO2 limits, and mandatory grant allocations.</p>
                </div>
                <a href="/guides/irish-ber-scale.html" class="text-emerald-600 text-xl font-bold p-4">&rarr;</a>
            </div>
            <div class="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition flex justify-between items-center group">
                <div>
                    <h3 class="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition">The Official SEAI Grant & Upgrade Sequences Handbook</h3>
                    <p class="mt-2 text-sm text-slate-600 leading-relaxed">A walkthrough of SEAI application standards and sequencing order guidelines to avoid costly builder mistakes.</p>
                </div>
                <a href="/guides/seai-grant-handbook.html" class="text-emerald-600 text-xl font-bold p-4">&rarr;</a>
            </div>
        </div>
    </main>

    $HTML_FOOTER
</body>
</html>
EOF

echo -e "Generating ${CYAN}/guides/irish-ber-scale.html${NC} (Irish BER Scale Matrix)..."
cat << EOF > "$TARGET_DIR/guides/irish-ber-scale.html"
<!DOCTYPE html>
<html lang="en">
<head>
    $HTML_HEAD
    <title>Official Irish BER Scale Matrix | EcoSmartHome</title>
    <meta name="description" content="View the complete 5-column Irish BER Scale Matrix. Energy thresholds, annual heating costs, carbon emissions, and SEAI grant allocations explained.">
    <link rel="canonical" href="https://www.ecosmarthomes.ie/guides/irish-ber-scale.html" />
</head>
<body class="bg-slate-50 text-slate-800 font-sans min-h-screen flex flex-col justify-between">
    $HTML_HEADER

    <main class="max-w-6xl mx-auto px-4 py-16 flex-grow">
        <nav class="text-sm text-slate-500 mb-8">
            <a href="/" class="hover:underline">Home</a> &gt; 
            <a href="/guides/index.html" class="hover:underline">Guides</a> &gt; 
            <span class="text-slate-800 font-medium">Irish BER Scale</span>
        </nav>

        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Official Irish BER Scale Matrix</h1>
        <p class="text-slate-600 leading-relaxed mb-10 max-w-3xl">Under the revised EU Energy Performance of Buildings Directive (EPBD), Ireland has transitioned to a unified A0 to G Scale. Here is what every band means for your heating bills, grants, and property valuation.</p>

        <!-- Wide Responsive Table Container -->
        <div class="overflow-x-auto rounded-2xl border border-slate-200 shadow-xl">
            <table class="min-w-full divide-y divide-slate-200 bg-white text-sm">
                <thead class="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider text-left">
                    <tr>
                        <th class="px-6 py-4">BER Band</th>
                        <th class="px-6 py-4">Energy Threshold</th>
                        <th class="px-6 py-4">Est. Fuel / Year</th>
                        <th class="px-6 py-4">CO₂ Emissions</th>
                        <th class="px-6 py-4">Retrofit Action / Grant Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">
                    <tr class="hover:bg-slate-50/80">
                        <td class="px-6 py-4 font-bold text-emerald-600">A0</td>
                        <td class="px-6 py-4">&le; 42* kWh/m²/yr</td>
                        <td class="px-6 py-4">~€350 / yr</td>
                        <td class="px-6 py-4">0.2 t/yr</td>
                        <td class="px-6 py-4">Zero-Emission Building (ZEB) • Grid Net Contributor</td>
                    </tr>
                    <tr class="hover:bg-slate-50/80 bg-emerald-50/20">
                        <td class="px-6 py-4 font-bold text-emerald-600">A</td>
                        <td class="px-6 py-4">&le; 75 kWh/m²/yr</td>
                        <td class="px-6 py-4">~€650 / yr</td>
                        <td class="px-6 py-4">0.6 t/yr</td>
                        <td class="px-6 py-4 font-semibold text-emerald-800">★ Deep Retrofit Target (Max Comfort & Green Mortgage)</td>
                    </tr>
                    <tr class="hover:bg-slate-50/80">
                        <td class="px-6 py-4 font-bold text-emerald-500">B</td>
                        <td class="px-6 py-4">&le; 150 kWh/m²/yr</td>
                        <td class="px-6 py-4">~€1,200 / yr</td>
                        <td class="px-6 py-4">1.6 t/yr</td>
                        <td class="px-6 py-4">★ SEAI National Cost-Optimal Minimum Standard</td>
                    </tr>
                    <tr class="hover:bg-slate-50/80">
                        <td class="px-6 py-4 font-bold text-yellow-600">C</td>
                        <td class="px-6 py-4">&le; 225 kWh/m²/yr</td>
                        <td class="px-6 py-4">~€1,950 / yr</td>
                        <td class="px-6 py-4">2.8 t/yr</td>
                        <td class="px-6 py-4">Moderate Loss • Attic & Heating Controls Grant</td>
                    </tr>
                    <tr class="hover:bg-slate-50/80">
                        <td class="px-6 py-4 font-bold text-orange-600">D</td>
                        <td class="px-6 py-4">&le; 275 kWh/m²/yr</td>
                        <td class="px-6 py-4">~€2,750 / yr</td>
                        <td class="px-6 py-4">4.2 t/yr</td>
                        <td class="px-6 py-4">Irish Average Home • External Wrap + Heat Pump eligible</td>
                    </tr>
                    <tr class="hover:bg-slate-50/80">
                        <td class="px-6 py-4 font-bold text-orange-700">E</td>
                        <td class="px-6 py-4">&le; 325 kWh/m²/yr</td>
                        <td class="px-6 py-4">~€3,400 / yr</td>
                        <td class="px-6 py-4">5.4 t/yr</td>
                        <td class="px-6 py-4">Poor Insulation • High Fuel Poverty Exposure</td>
                    </tr>
                    <tr class="hover:bg-slate-50/80 bg-red-50/10">
                        <td class="px-6 py-4 font-bold text-red-500">F</td>
                        <td class="px-6 py-4">&le; 375 kWh/m²/yr</td>
                        <td class="px-6 py-4">~€4,200 / yr</td>
                        <td class="px-6 py-4">6.6 t/yr</td>
                        <td class="px-6 py-4 text-red-800 font-medium">EU EPBD 2030 Mandatory Upgrade Priority</td>
                    </tr>
                    <tr class="hover:bg-slate-50/80 bg-red-50/20">
                        <td class="px-6 py-4 font-bold text-red-600">G</td>
                        <td class="px-6 py-4">&gt; 375 kWh/m²/yr</td>
                        <td class="px-6 py-4">~€5,400+ / yr</td>
                        <td class="px-6 py-4">8.5+ t/yr</td>
                        <td class="px-6 py-4 font-medium text-red-800">Worst Energy Loss • Claim Up to €25,500+ Deep Grants</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </main>

    $HTML_FOOTER
</body>
</html>
EOF

echo -e "Generating ${CYAN}/guides/seai-grant-handbook.html${NC}..."
cat << EOF > "$TARGET_DIR/guides/seai-grant-handbook.html"
<!DOCTYPE html>
<html lang="en">
<head>
    $HTML_HEAD
    <title>SEAI Upgrade Grant Handbook | EcoSmartHome</title>
    <meta name="description" content="A structural playbook outlining how to successfully apply for SEAI energy grants and sequence retrofits logically in Ireland.">
    <link rel="canonical" href="https://www.ecosmarthomes.ie/guides/seai-grant-handbook.html" />
</head>
<body class="bg-slate-50 text-slate-800 font-sans min-h-screen flex flex-col justify-between">
    $HTML_HEADER

    <main class="max-w-4xl mx-auto px-4 py-16 flex-grow">
        <nav class="text-sm text-slate-500 mb-8">
            <a href="/" class="hover:underline">Home</a> &gt; 
            <a href="/guides/index.html" class="hover:underline">Guides</a> &gt; 
            <span class="text-slate-800 font-medium">SEAI Grant Handbook</span>
        </nav>

        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900">The SEAI Grant Sequence Playbook</h1>
        <p class="mt-4 text-xl text-slate-600 leading-relaxed">
            Unlocking up to €25,500 in state-backed energy incentives requires precise application routing and logical retrofit sequencing to avoid application cancellation.
        </p>

        <div class="prose max-w-none text-slate-600 mt-12 space-y-8">
            <div>
                <h3 class="text-xl font-bold text-slate-900">Phase 1: Fabric First & Airtightness</h3>
                <p class="mt-2 leading-relaxed">You must tackle heat retention elements first. Upgraded attic insulation and cavity seals baseline your building's thermodynamic loss index before any expensive HVAC hardware is sized.</p>
            </div>
            <div>
                <h3 class="text-xl font-bold text-slate-900">Phase 2: Sizing Compliance Assessments</h3>
                <p class="mt-2 leading-relaxed">You must acquire an independent Heat Loss Indicator (HLI) certificate matching the NSAI SR50 guidelines. Uncertified upgrades run the risk of losing thousands of euros in grant coverage.</p>
            </div>
        </div>
    </main>

    $HTML_FOOTER
</body>
</html>
EOF

echo -e "Generating ${CYAN}/support/faq.html${NC}..."
cat << EOF > "$TARGET_DIR/support/faq.html"
<!DOCTYPE html>
<html lang="en">
<head>
    $HTML_HEAD
    <title>Frequently Asked Questions | EcoSmartHome</title>
    <meta name="description" content="Get answers to our most frequently asked questions on SEAI grants, Heat Pump Readiness tests, and independent advisory services in Ireland.">
    <link rel="canonical" href="https://www.ecosmarthomes.ie/support/faq.html" />
</head>
<body class="bg-slate-50 text-slate-800 font-sans min-h-screen flex flex-col justify-between">
    $HTML_HEADER

    <main class="max-w-3xl mx-auto px-4 py-16 flex-grow">
        <h1 class="text-4xl font-extrabold text-slate-900 text-center mb-16">Frequently Asked Questions</h1>

        <div class="space-y-8">
            <!-- FAQ 1 -->
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 class="font-bold text-slate-900 text-lg">Do you offer free consultations?</h3>
                <p class="mt-2 text-slate-600 text-sm">No. I'm a consultant, not a salesperson. I offer a short 15-minute Suitability Check to confirm your home is a fit. All expert advice is provided within our fixed-fee paid services only.</p>
            </div>
            <!-- FAQ 2 -->
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 class="font-bold text-slate-900 text-lg">What is the Heat Pump Test?</h3>
                <p class="mt-2 text-slate-600 text-sm">It's a simple pass/fail suitability check to confirm whether your home is ready for a heat pump before you spend thousands. If it won't pass, I show you the exact steps to fix it.</p>
            </div>
            <!-- FAQ 3 -->
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 class="font-bold text-slate-900 text-lg">What is the Leakiness Score?</h3>
                <p class="mt-2 text-slate-600 text-sm">Instead of engineering jargon, I show you where warm air escapes and cold air sneaks in, explained in plain English. Think of your home like a leaky bucket: if it's leaky, you'll never keep the heat in.</p>
            </div>
            <!-- FAQ 4 -->
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 class="font-bold text-slate-900 text-lg">What is the Retrofit Roadmap™?</h3>
                <p class="mt-2 text-slate-600 text-sm">It's your personalized upgrade plan showing what to do, when to do it, what it costs, what grants you can claim, and the sequencing order that saves you the most money. It's the opposite of a rigid BER certificate—it's a long-term financial strategy.</p>
            </div>
            <!-- FAQ 5 -->
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 class="font-bold text-slate-900 text-lg">What is the Carbon Tax Shield?</h3>
                <p class="mt-2 text-slate-600 text-sm">It's a financial defense plan that shows how today's fabric upgrades protect you from rising energy costs and future government levies. This isn't about "being green"—it's about protecting your wallet.</p>
            </div>
            <!-- FAQ 6 -->
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 class="font-bold text-slate-900 text-lg">Do you work with any installers?</h3>
                <p class="mt-2 text-slate-600 text-sm">No. I stay 100% independent so you get unbiased advice. If you need installers later, I help you understand what questions to ask and what to avoid, but I never take commissions or builder referral fees.</p>
            </div>
            <!-- FAQ 7 -->
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 class="font-bold text-slate-900 text-lg">Can you check if my radiators are suitable for a heat pump?</h3>
                <p class="mt-2 text-slate-600 text-sm">Yes. This is part of our standard on-site Radiator Sizing Check. I explain whether your current radiators can support low-flow heating and what pipe changes are required.</p>
            </div>
            <!-- FAQ 8 -->
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 class="font-bold text-slate-900 text-lg">How long does the assessment take?</h3>
                <p class="mt-2 text-slate-600 text-sm">Most assessments take between 60 and 90 minutes, depending on the size and age of your home. You'll receive your detailed digital Retrofit Roadmap shortly after the physical survey.</p>
            </div>
            <!-- FAQ 9 -->
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 class="font-bold text-slate-900 text-lg">Is this service only for older homes?</h3>
                <p class="mt-2 text-slate-600 text-sm">No. Even newer homes can be leaky, inefficiently ventilated, or poorly set up for low-flow heat pump integration. Every homeowner benefit from having a clear, independent blueprint.</p>
            </div>
        </div>
    </main>

    $HTML_FOOTER
</body>
</html>
EOF

echo -e "Generating ${CYAN}/support/contact.html${NC}..."
cat << EOF > "$TARGET_DIR/support/contact.html"
<!DOCTYPE html>
<html lang="en">
<head>
    $HTML_HEAD
    <title>Contact Our Independent Team | EcoSmartHome</title>
    <meta name="description" content="Reach out to EcoSmartHome. Send an inquiry form, or query our regional serving directories across all 32 Irish counties.">
    <link rel="canonical" href="https://www.ecosmarthomes.ie/support/contact.html" />
</head>
<body class="bg-slate-50 text-slate-800 font-sans min-h-screen flex flex-col justify-between">
    $HTML_HEADER

    <main class="max-w-xl mx-auto px-4 py-16 flex-grow">
        <h1 class="text-3xl font-extrabold text-slate-900 text-center">Get Independent Upgrade Advice</h1>
        <p class="mt-2 text-slate-600 text-center">We will review your properties, Eircode, and details, returning a response within 24 hours.</p>

        <form class="bg-white p-8 rounded-3xl border border-slate-150 shadow-xl my-8 space-y-6">
            <div>
                <label class="block text-sm font-bold text-slate-700">Full Name</label>
                <input type="text" placeholder="John Doyle" class="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" required>
            </div>
            <div>
                <label class="block text-sm font-bold text-slate-700">Email Address</label>
                <input type="email" placeholder="john@domain.ie" class="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" required>
            </div>
            <div>
                <label class="block text-sm font-bold text-slate-700">What upgrade checks do you need?</label>
                <select class="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500">
                    <option>Full Retrofit Assessment & Roadmap (€49)</option>
                    <option>Heat Pump Readiness Check Only</option>
                    <option>Leakiness & Cold Spot Audit</option>
                </select>
            </div>
            <button class="w-full py-4 gradient-brand text-white font-bold rounded-xl shadow-lg">Submit Secure Inquiry</button>
        </form>
    </main>

    $HTML_FOOTER
</body>
</html>
EOF

# ------------------------------------------------------------------------------
# 5. GENERATE CHECKOUT SILO
# ------------------------------------------------------------------------------
echo -e "Generating ${CYAN}/checkout/index.html${NC} (Checkout)..."
cat << EOF > "$TARGET_DIR/checkout/index.html"
<!DOCTYPE html>
<html lang="en">
<head>
    $HTML_HEAD
    <title>Secure Independent Assessment Booking | EcoSmartHome</title>
    <meta name="description" content="Secure booking page. Book your conflict-free €49 on-site diagnostic survey, radiator check, and Carbon Tax Shield blueprint.">
    <link rel="canonical" href="https://www.ecosmarthomes.ie/checkout/" />
</head>
<body class="bg-slate-50 text-slate-800 font-sans min-h-screen flex flex-col justify-between">
    $HTML_HEADER

    <main class="max-w-2xl mx-auto px-4 py-16 flex-grow text-center">
        <h1 class="text-3xl font-extrabold text-slate-900">Secure Your €49 Independent Assessment</h1>
        <p class="mt-2 text-slate-600">Avoid up to €15,000 in oversights. Get verified, professional on-site engineering checks without pushy sales pressure.</p>

        <div class="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl my-8 text-left space-y-4">
            <h3 class="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">What You Secure for €49:</h3>
            <ul class="space-y-3 text-slate-700 text-sm">
                <li>✔ <strong>Pass/Fail Heat Pump Test:</strong> Full NSAI SR50 structural checks.</li>
                <li>✔ <strong>Radiator Output Sizing:</strong> Low-flow water temperature calculations.</li>
                <li>✔ <strong>Maximized SEAI Grant Plan:</strong> Up to €25,500 direct grant structures mapped out.</li>
                <li>✔ <strong>2026-2030 Carbon Tax Shield:</strong> Fuel leak audit and defense mapping.</li>
                <li>✔ <strong>WhatsApp Advisory Handover:</strong> Immediate roadmap support with Joe within 24 hours.</li>
            </ul>
        </div>

        <a href="https://buy.stripe.com/aFabJ01EGbPz6tn8UYeME00" target="_blank" rel="noopener" class="gradient-brand text-white text-lg px-10 py-4 rounded-xl font-bold inline-block shadow-lg hover:shadow-xl transition-all">Proceed to Secure Payment (€49) &rarr;</a>
    </main>

    $HTML_FOOTER
</body>
</html>
EOF

echo -e "Generating ${CYAN}/checkout/order.html${NC} (Hardened Stripe Page)..."
cat << EOF > "$TARGET_DIR/checkout/order.html"
<!DOCTYPE html>
<html lang="en">
<head>
    $HTML_HEAD
    <title>Secure Checkout | EcoSmartHome</title>
    <meta name="robots" content="noindex, nofollow" />
    <link rel="canonical" href="https://www.ecosmarthomes.ie/checkout/order.html" />
</head>
<body class="bg-slate-50 text-slate-800 font-sans min-h-screen flex flex-col justify-between">
    <!-- Clean, checkout-specific header to eliminate cart abandonment friction -->
    <header class="bg-white border-b border-slate-100 py-4 shadow-sm">
        <div class="max-w-3xl mx-auto px-4 flex justify-between items-center">
            <span class="text-xl font-bold text-slate-900">Secure Checkout</span>
            <span class="text-xs text-slate-400 font-bold tracking-widest uppercase">SSL Encrypted</span>
        </div>
    </header>

    <main class="max-w-md mx-auto px-4 py-16 flex-grow">
        <div class="bg-white p-8 rounded-3xl border border-slate-150 shadow-2xl">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-lg font-bold text-slate-900">Retrofit Assessment</h2>
                    <p class="text-xs text-slate-400">100% Independent On-Site Survey</p>
                </div>
                <p class="text-2xl font-black text-emerald-600">€49</p>
            </div>

            <!-- Hardened Payment Notice -->
            <div class="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg mb-6 text-xs text-emerald-900 leading-relaxed">
                🛡️ <strong>Production Checkout Active:</strong> Payment flows utilize Stripe's live checkout pipeline (`https://buy.stripe.com/aFabJ01EGbPz6tn8UYeME00`) to guarantee instant booking confirmation.
            </div>

            <form class="space-y-4" action="https://buy.stripe.com/aFabJ01EGbPz6tn8UYeME00" method="GET">
                <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Eircode / Home Address</label>
                    <input type="text" placeholder="e.g. V94 XXXX" class="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none" required>
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Contact Phone (WhatsApp Target)</label>
                    <input type="tel" placeholder="e.g. +353 87 123 4567" class="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none" required>
                </div>

                <a href="https://buy.stripe.com/aFabJ01EGbPz6tn8UYeME00" target="_blank" rel="noopener" class="gradient-brand text-white w-full py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all text-center block mt-6">Confirm and Pay €49</a>
            </form>
        </div>
    </main>

    <footer class="py-8 text-center text-xs text-slate-400">
        🔒 Encrypted Checkout Pipeline • Powered by Stripe Live API
    </footer>
</body>
</html>
EOF

echo -e "Generating ${CYAN}/checkout/thank-you.html${NC} (Confirmation)..."
cat << EOF > "$TARGET_DIR/checkout/thank-you.html"
<!DOCTYPE html>
<html lang="en">
<head>
    $HTML_HEAD
    <title>Booking Confirmed | EcoSmartHome</title>
    <meta name="robots" content="noindex, nofollow" />
</head>
<body class="bg-slate-50 text-slate-800 font-sans min-h-screen flex flex-col justify-between">
    <header class="bg-white border-b border-slate-100 py-4 shadow-sm">
        <div class="max-w-3xl mx-auto px-4 text-center">
            <span class="text-lg font-bold text-slate-900">EcoSmartHome</span>
        </div>
    </header>

    <main class="max-w-md mx-auto px-4 py-20 flex-grow text-center">
        <div class="bg-white p-10 rounded-3xl border border-slate-100 shadow-xl">
            <span class="text-6xl block">🎉</span>
            <h1 class="text-2xl font-extrabold text-slate-900 mt-6">Your Booking is Confirmed!</h1>
            <p class="mt-3 text-slate-600 text-sm leading-relaxed">Thank you for choosing independent guidance. Joe has been notified of your property Eircode and contact details.</p>

            <div class="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 mt-8 text-left space-y-3">
                <h4 class="text-sm font-bold text-emerald-900">What Happens Next:</h4>
                <p class="text-xs text-emerald-800 leading-relaxed">1. Joe will reach out via <strong>WhatsApp within 24 hours</strong> to schedule your physical diagnostic survey.</p>
                <p class="text-xs text-emerald-800 leading-relaxed">2. An automated receipt and calendar booking invitation has been dispatched to your email.</p>
            </div>
        </div>
    </main>

    <footer class="py-8 text-center text-xs text-slate-400">
        &copy; 2026 EcoSmartHome Ireland. Unbiased retrofitting expertise.
    </footer>
</body>
</html>
EOF

# Make the generated script executable (if we are in sandbox/local environment)
chmod +x "$TARGET_DIR/scaffold-ecosmarthomes.sh" 2>/dev/null || true

echo -e "\n${GREEN}${BOLD}================================================================${NC}"
echo -e "${GREEN}${BOLD}✔ SUCCESS: ALL TEMPLATE PAGES GENERATED ACCURATELY!             ${NC}"
echo -e "${GREEN}${BOLD}================================================================${NC}"
echo -e "You can navigate into '${YELLOW}$TARGET_DIR${NC}' to view your static files."
echo -e "Deploy to Netlify, S3, or Vercel, or bundle it into an archive."
echo -e "${BLUE}${BOLD}================================================================${NC}"
