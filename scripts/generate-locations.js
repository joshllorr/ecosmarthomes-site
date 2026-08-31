/**
 * scripts/generate-locations.js
 * Programmatic Irish Town SEO Domination Engine
 * Generates hyper-local, high-converting landing pages for Irish locations.
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'site', 'data', 'irish-locations.json');
const LOCATIONS_DIR = path.join(__dirname, '..', 'site', 'locations');
const SITEMAP_FILE = path.join(__dirname, '..', 'site', 'sitemap-locations.xml');

if (!fs.existsSync(LOCATIONS_DIR)) {
  fs.mkdirSync(LOCATIONS_DIR, { recursive: true });
}

const rawData = fs.readFileSync(DATA_FILE, 'utf8');
const counties = JSON.parse(rawData);

let allUrls = [];
let totalTownsCount = 0;

function generateTownHtml(county, town, siblingTowns) {
  const pageTitle = `SEAI Grants & Heat Pump Retrofits in ${town.name}, Co. ${county.county} (2026)`;
  const metaDesc = `Claim up to €12,500 in SEAI Heat Pump & Insulation Grants in ${town.name}, Co. ${county.county}. Local average BER ${town.avgBerRating}, cut heating costs by €${town.potentialSavings}/year. Book €49 independent survey.`;
  const canonicalUrl = `https://www.ecosmarthomes.ie/locations/${county.slug}/${town.slug}.html`;

  const schemaLocal = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `EcoSmartHomes Ireland - ${town.name} Advisory`,
    "description": metaDesc,
    "url": canonicalUrl,
    "telephone": "+353899590537",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": town.name,
      "addressRegion": county.county,
      "postalCode": town.postcode,
      "addressCountry": "IE"
    },
    "areaServed": `${town.name}, Co. ${county.county}`,
    "priceRange": "€49 - €12,500"
  };

  const schemaFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `How much is an SEAI Heat Pump Grant in ${town.name}, Co. ${county.county}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Homeowners in ${town.name} can claim up to €12,500 in government SEAI grants for an Air-to-Water heat pump and heating controls upgrade. Additional grants include €2,500 for attic insulation, €8,000 for external wall insulation, and €1,800 for solar PV panels.`
        }
      },
      {
        "@type": "Question",
        "name": `What is the average BER rating in ${town.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `According to SEAI open records, the average domestic building energy rating in ${town.name} is ${town.avgBerRating}. Most homes built in the ${town.housingType} era rely on ${town.primaryHeating}, spending over €2,500 annually on heating.`
        }
      },
      {
        "@type": "Question",
        "name": `How do I book an independent retrofit survey in ${town.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `EcoSmartHomes provides 100% independent, non-commission retrofit surveys for homeowners in ${town.name} for just €49. You receive a verified HLI calculation, grant breakdown, and contractor roadmap with zero installer bias.`
        }
      },
      {
        "@type": "Question",
        "name": `How much can I save by replacing my oil/gas boiler in ${town.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Typical homes in ${town.name} switching from older ${town.primaryHeating} to an A2-rated heat pump and solar PV setup save an estimated €${town.potentialSavings} per year on domestic energy bills.`
        }
      }
    ]
  };

  const siblingLinks = siblingTowns
    .filter(t => t.slug !== town.slug)
    .map(t => `<a href="/locations/${county.slug}/${t.slug}.html" style="display: inline-block; background: #ffffff; border: 1px solid #cbd5e1; color: #003f2d; font-weight: 600; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 0.85rem; margin: 4px;">📍 ${t.name}</a>`)
    .join(' ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <meta name="description" content="${metaDesc}">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="stylesheet" href="../../css/style.css">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${metaDesc}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:type" content="website">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  ${JSON.stringify(schemaLocal, null, 2)}
  </script>
  <script type="application/ld+json">
  ${JSON.stringify(schemaFaq, null, 2)}
  </script>

  <style>
    .loc-hero {
      background: radial-gradient(120% 120% at 50% -10%, #004d38 0%, #00241b 60%, #001711 100%);
      color: #fff;
      padding: 70px 20px 50px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .stat-pill { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center; }
    .stat-val { font-size: 1.8rem; font-weight: 800; color: #10b981; }
    .stat-lbl { font-size: 0.8rem; text-transform: uppercase; color: #cbd5e1; font-weight: 600; }
    .faq-box { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-bottom: 14px; }
    .faq-q { font-weight: 700; color: #003f2d; font-size: 1.05rem; margin-bottom: 6px; }
    .faq-a { color: #475569; font-size: 0.92rem; line-height: 1.6; margin: 0; }
  </style>
</head>
<body style="background: #f8fafc; color: #1e293b;">

  <!-- Header Navigation -->
  <header class="main-nav-bar" style="background: rgba(0, 36, 27, 0.95); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 12px 0; position: sticky; top: 0; z-index: 1000; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);">
    <div class="container" style="display: flex; justify-content: space-between; align-items: center;">
      <a href="/" style="color: #fff; font-weight: 900; font-size: 1.25rem; text-decoration: none; display: flex; align-items: center; gap: 8px; letter-spacing: -0.02em;">
        <span>🏡</span> EcoSmart<strong style="color: #34f5c5;">Homes</strong>
      </a>
      <div style="display: flex; gap: 15px; align-items: center;">
        <button type="button" class="btn-tools-drawer-toggle" onclick="window.openToolsDrawer()" aria-label="Open Tools Drawer">☰ Tools</button>
        <a href="/locations/" style="color: #cbd5e1; text-decoration: none; font-size: 0.85rem; font-weight: 600;">Town Directory</a>
        <a href="/checkout/" target="_blank" rel="noopener" class="btn-primary" style="background: #f59e0b; color: #00241b; font-weight: 800; text-decoration: none; padding: 8px 16px; border-radius: 8px; font-size: 0.82rem; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);">Book €49 Survey</a>
      </div>
    </div>
  </header>

  <!-- Breadcrumb -->
  <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 10px 0; font-size: 0.85rem; color: #64748b;">
    <div class="container">
      <a href="/" style="color: #003f2d; text-decoration: none;">Home</a> &gt; 
      <a href="/locations/" style="color: #003f2d; text-decoration: none;">Locations</a> &gt; 
      <a href="/locations/#${county.slug}" style="color: #003f2d; text-decoration: none;">Co. ${county.county}</a> &gt; 
      <span style="color: #00241b; font-weight: 600;">${town.name}</span>
    </div>
  </div>

  <!-- Hero Section -->
  <section class="loc-hero">
    <div class="container">
      <div style="max-width: 850px; margin: 0 auto; text-align: center;">
        <span style="background: #10b981; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase;">SEAI Grant Advisory · ${town.name}</span>
        <h1 style="font-size: 2.3rem; margin: 15px 0 10px 0; line-height: 1.2;">SEAI Retrofit & Heat Pump Grants in ${town.name}, Co. ${county.county}</h1>
        <p style="font-size: 1.05rem; color: #cbd5e1; margin-bottom: 30px;">
          Unlock up to <strong>€12,500</strong> in government grants to upgrade your home from <strong>${town.avgBerRating}</strong> to an <strong>A2 BER rating</strong>. Independent, non-commission guidance.
        </p>

        <!-- Stats Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 14px; margin-bottom: 30px;">
          <div class="stat-pill">
            <div class="stat-val">${town.totalAuditedHomes.toLocaleString()}</div>
            <div class="stat-lbl">Audited Homes in Area</div>
          </div>
          <div class="stat-pill">
            <div class="stat-val" style="color: #f59e0b;">${town.avgBerRating}</div>
            <div class="stat-lbl">Local Average BER</div>
          </div>
          <div class="stat-pill">
            <div class="stat-val">€${town.eligibleGrant.toLocaleString()}</div>
            <div class="stat-lbl">Max SEAI Grant</div>
          </div>
          <div class="stat-pill">
            <div class="stat-val">€${town.potentialSavings.toLocaleString()}</div>
            <div class="stat-lbl">Est. Bill Slash / yr</div>
          </div>
        </div>

        <a href="/checkout/" target="_blank" rel="noopener" class="btn-primary" style="background: #f59e0b; color: #000; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 1.1rem; display: inline-block;">Book ${town.name} €49 Independent Survey →</a>
      </div>
    </div>
  </section>

  <!-- Technical Housing Profile -->
  <section style="padding: 60px 0; background: #ffffff;">
    <div class="container" style="max-width: 900px;">
      <h2 style="color: #003f2d; font-size: 1.7rem; margin-bottom: 12px;">Local Housing Profile & Retrofit Viability in ${town.name}</h2>
      <p style="color: #475569; font-size: 1rem; line-height: 1.7; margin-bottom: 25px;">
        Properties in <strong>${town.name} (${town.postcode})</strong> largely comprise <strong>${town.housingType}</strong> constructed with standard cavity or hollow block walls. The majority of households operate on <strong>${town.primaryHeating}</strong>, resulting in elevated winter bills and unnecessary carbon tax exposure.
      </p>

      <div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 20px; border-radius: 0 10px 10px 0; margin-bottom: 35px;">
        <h3 style="color: #003f2d; font-size: 1.15rem; margin: 0 0 8px 0;">🎯 Top Priority Upgrade for ${town.name}: ${town.topUpgrade}</h3>
        <p style="color: #475569; margin: 0; font-size: 0.95rem; line-height: 1.6;">
          By upgrading attic insulation to 300mm and installing an Air-to-Water heat pump with smart weather compensation, homeowners in ${town.name} typically lower their heat loss index (HLI) below 2.0 W/K/m², qualifying for maximum SEAI grant reimbursement.
        </p>
      </div>

      <!-- Grant Rates Matrix -->
      <h3 style="color: #003f2d; font-size: 1.3rem; margin-bottom: 15px;">Official May 2026 SEAI Grant Rates for ${town.name}</h3>
      <div style="overflow-x: auto; margin-bottom: 40px;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.95rem;">
          <thead>
            <tr style="background: #003f2d; color: #fff;">
              <th style="padding: 12px 16px;">Energy Measure</th>
              <th style="padding: 12px 16px;">SEAI Grant (May 2026)</th>
              <th style="padding: 12px 16px;">Typical Payback</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0; background: #fff;">
              <td style="padding: 12px 16px; font-weight: 600;">Air-to-Water Heat Pump System</td>
              <td style="padding: 12px 16px; color: #10b981; font-weight: 700;">€12,500</td>
              <td style="padding: 12px 16px;">3.5 - 5 Years</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
              <td style="padding: 12px 16px; font-weight: 600;">External Wall Insulation (The Wrap)</td>
              <td style="padding: 12px 16px; color: #10b981; font-weight: 700;">€8,000</td>
              <td style="padding: 12px 16px;">4 - 6 Years</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background: #fff;">
              <td style="padding: 12px 16px; font-weight: 600;">Attic & Rafter Insulation (300mm)</td>
              <td style="padding: 12px 16px; color: #10b981; font-weight: 700;">€2,500</td>
              <td style="padding: 12px 16px;">1.5 - 2.5 Years</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
              <td style="padding: 12px 16px; font-weight: 600;">Solar PV Panels & Export Tariffs (CEG)</td>
              <td style="padding: 12px 16px; color: #10b981; font-weight: 700;">€1,800</td>
              <td style="padding: 12px 16px;">3 - 4 Years</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Embedded Photo & BER Dropzone -->
      <div style="background: #f8fafc; border: 2px solid #10b981; border-radius: 16px; padding: 30px; margin-bottom: 45px; text-align: center;">
        <span style="background: #10b981; color: #fff; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Gemini 2.5 Flash Vision</span>
        <h3 style="color: #003f2d; font-size: 1.4rem; margin: 10px 0 6px 0;">Snap Your ${town.name} Boiler or Drop Your BER Cert</h3>
        <p style="color: #64748b; font-size: 0.92rem; margin-bottom: 20px;">Upload a photo of your heating setup or existing BER PDF to get an instant AI technical viability check for your home.</p>
        <a href="/#scanner-box" class="btn-primary" style="background: #003f2d; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 700; font-size: 0.95rem; display: inline-block;">Open AI Photo & PDF Scanner →</a>
      </div>

      <!-- Frequently Asked Questions -->
      <h2 style="color: #003f2d; font-size: 1.6rem; margin-bottom: 20px;">Frequently Asked Questions in ${town.name}</h2>
      <div class="faq-box">
        <div class="faq-q">How much is an SEAI Heat Pump Grant in ${town.name}?</div>
        <p class="faq-a">Homeowners in ${town.name} can claim up to €12,500 in government SEAI grants for an Air-to-Water heat pump and heating controls upgrade.</p>
      </div>
      <div class="faq-box">
        <div class="faq-q">What is the average BER rating in ${town.name}?</div>
        <p class="faq-a">According to SEAI open records, the average domestic building energy rating in ${town.name} is ${town.avgBerRating}. Most homes built in the ${town.housingType} era rely on ${town.primaryHeating}.</p>
      </div>
      <div class="faq-box">
        <div class="faq-q">Who provides independent non-commission retrofit surveys in ${town.name}?</div>
        <p class="faq-a">EcoSmartHomes provides 100% independent, non-commission retrofit surveys for homeowners in ${town.name} for just €49. You receive a verified HLI calculation and contractor roadmap with zero installer bias.</p>
      </div>
      <div class="faq-box">
        <div class="faq-q">How much can I save by replacing my heating system in ${town.name}?</div>
        <p class="faq-a">Typical homes in ${town.name} switching to an A2-rated heat pump and solar PV setup save an estimated €${town.potentialSavings} per year on domestic heating bills.</p>
      </div>

      <!-- Nearby Towns Internal Linking Mesh -->
      <div style="margin-top: 50px; padding-top: 30px; border-top: 1px solid #e2e8f0;">
        <h4 style="color: #003f2d; margin-bottom: 12px;">Other Locations in Co. ${county.county}:</h4>
        <div>${siblingLinks}</div>
      </div>

    </div>
  </section>

  <!-- Footer -->
  <footer style="background: #00261b; color: #94a3b8; padding: 40px 0; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.85rem;">
    <div class="container" style="text-align: center;">
      <p style="color: #fff; font-weight: 700; margin-bottom: 6px;">EcoSmartHomes Ireland · Independent Energy Advisory</p>
      <p style="margin-bottom: 15px;">Serving homeowners across ${town.name}, Co. ${county.county}, and all 26 Irish counties.</p>
      <p style="font-size: 0.8rem; color: #64748b;">© 2026 EcoSmartHomes.ie · 100% Conflict-Free Energy Advisory</p>
    </div>
  </footer>

</body>
</html>`;
}

function generateDirectoryIndex(counties) {
  const countySections = counties.map(c => {
    const townList = c.towns.map(t => 
      `<li style="margin-bottom: 8px;">
        <a href="/locations/${c.slug}/${t.slug}.html" style="color: #003f2d; text-decoration: none; font-weight: 600;">📍 ${t.name}</a>
        <span style="font-size: 0.8rem; color: #64748b; margin-left: 6px;">(Avg ${t.avgBerRating} · Grants to €${t.eligibleGrant.toLocaleString()})</span>
      </li>`
    ).join('');

    return `
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 25px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <h3 style="color: #003f2d; font-size: 1.3rem; margin: 0 0 15px 0; border-bottom: 2px solid #10b981; padding-bottom: 8px;" id="${c.slug}">
          Co. ${c.county} <span style="font-size: 0.85rem; color: #10b981; font-weight: 600;">(${c.province})</span>
        </h3>
        <ul style="list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px;">
          ${townList}
        </ul>
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SEAI Grants & Heat Pump Directory - All Irish Towns & Counties</title>
  <meta name="description" content="Explore SEAI Heat Pump Grants, average BER ratings, and independent retrofit survey advice across 3,000+ towns and districts in Ireland.">
  <link rel="canonical" href="https://www.ecosmarthomes.ie/locations/">
  <link rel="stylesheet" href="../css/style.css">
</head>
<body style="background: #f8fafc; color: #1e293b;">

  <header class="main-nav-bar" style="background: rgba(0, 36, 27, 0.95); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 12px 0; position: sticky; top: 0; z-index: 1000; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);">
    <div class="container" style="display: flex; justify-content: space-between; align-items: center;">
      <a href="/" style="color: #fff; font-weight: 900; font-size: 1.25rem; text-decoration: none; display: flex; align-items: center; gap: 8px; letter-spacing: -0.02em;">
        <span>🏡</span> EcoSmart<strong style="color: #34f5c5;">Homes</strong>
      </a>
      <div style="display: flex; align-items: center; gap: 10px;">
        <button type="button" class="btn-tools-drawer-toggle" onclick="window.openToolsDrawer()" aria-label="Open Tools Drawer">☰ Tools</button>
        <a href="/checkout/" target="_blank" rel="noopener" class="btn-primary" style="background: #f59e0b; color: #00241b; font-weight: 800; text-decoration: none; padding: 8px 16px; border-radius: 8px; font-size: 0.82rem; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);">Book €49 Survey</a>
      </div>
    </div>
  </header>

  <div style="background: radial-gradient(120% 120% at 50% -10%, #004d38 0%, #00241b 60%, #001711 100%); color: #fff; padding: 60px 20px 45px 20px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div class="container">
      <h1 style="font-size: 2.4rem; margin: 0 0 12px 0; font-weight: 900; letter-spacing: -0.02em;">Irish Towns & Counties SEAI Grant Directory</h1>
      <p style="color: #cbd5e1; font-size: 1.1rem; max-width: 700px; margin: 0 auto 20px auto; line-height: 1.6;">
        Find local BER housing statistics, typical heat pump payback periods, and official May 2026 SEAI grant figures for your town.
      </p>
    </div>
  </div>

  <main style="padding: 50px 0;">
    <div class="container" style="max-width: 950px;">
      ${countySections}
    </div>
  </main>

  <footer style="background: #00261b; color: #94a3b8; padding: 40px 0; text-align: center; font-size: 0.85rem;">
    <div class="container">
      <p style="color: #fff; font-weight: 700; margin-bottom: 6px;">EcoSmartHomes Ireland · Independent Retrofit Platform</p>
      <p>© 2026 EcoSmartHomes.ie · All rights reserved.</p>
    </div>
  </footer>

</body>
</html>`;
}

// Generate all town files
counties.forEach(county => {
  const countyDir = path.join(LOCATIONS_DIR, county.slug);
  if (!fs.existsSync(countyDir)) {
    fs.mkdirSync(countyDir, { recursive: true });
  }

  county.towns.forEach(town => {
    const html = generateTownHtml(county, town, county.towns);
    const townFile = path.join(countyDir, `${town.slug}.html`);
    fs.writeFileSync(townFile, html, 'utf8');

    const locUrl = `https://www.ecosmarthomes.ie/locations/${county.slug}/${town.slug}.html`;
    allUrls.push(locUrl);
    totalTownsCount++;
  });
});

// Generate Directory Index
const directoryHtml = generateDirectoryIndex(counties);
fs.writeFileSync(path.join(LOCATIONS_DIR, 'index.html'), directoryHtml, 'utf8');
allUrls.push('https://www.ecosmarthomes.ie/locations/');

// Generate XML Sitemap for Locations
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(SITEMAP_FILE, sitemapXml, 'utf8');

console.log(`✅ Generated ${totalTownsCount} hyper-local Irish town landing pages across ${counties.length} counties!`);
console.log(`✅ Generated Directory index at site/locations/index.html`);
console.log(`✅ Generated XML sitemap at site/sitemap-locations.xml with ${allUrls.length} URLs!`);
