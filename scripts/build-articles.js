/**
 * scripts/build-articles.js
 * Automated SEO-Hub Article Compiler
 * Compiles articles-json/*.json into static HTML pages, updates feed & sitemap
 */

const fs = require('fs');
const path = require('path');

const ARTICLES_JSON_DIR = path.join(__dirname, '..', 'articles-json');
const SITE_ARTICLES_DIR = path.join(__dirname, '..', 'site', 'articles');
const SITE_ROOT_DIR = path.join(__dirname, '..', 'site');
const FEED_FILE = path.join(__dirname, '..', 'site', 'data', 'articles-feed.json');
const SITEMAP_FILE = path.join(__dirname, '..', 'site', 'sitemap-articles.xml');

if (!fs.existsSync(SITE_ARTICLES_DIR)) {
  fs.mkdirSync(SITE_ARTICLES_DIR, { recursive: true });
}

const feedData = JSON.parse(fs.readFileSync(FEED_FILE, 'utf8'));

console.log(`✅ Loaded ${feedData.length} articles from articles-feed.json`);

// Build sitemap-articles.xml
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.ecosmarthomes.ie/articles/</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
${feedData.map(a => `  <url>
    <loc>https://www.ecosmarthomes.ie/${a.slug}.html</loc>
    <lastmod>${a.date || '2026-08-25'}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>https://www.ecosmarthomes.ie/articles/${a.slug}.html</loc>
    <lastmod>${a.date || '2026-08-25'}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(SITEMAP_FILE, sitemapXml, 'utf8');
console.log(`✅ Generated sitemap-articles.xml with ${feedData.length * 2 + 1} URLs`);
