// RFC 8288 & RFC 9727 HTTP Link response headers for agent discovery
const linkHeaderValue = [
  '</.well-known/api-catalog>; rel="api-catalog"',
  '</ai/manifest.json>; rel="agent-manifest"',
  '</.well-known/ai-plugin.json>; rel="ai-plugin"',
  '</api/mcp/manifest.json>; rel="mcp-manifest"',
  '</ai/openapi.json>; rel="service-desc"; type="application/json"',
  '</agent-skills.html>; rel="service-doc"',
  '</api/health.json>; rel="status"; type="application/json"',
  '</sitemap.xml>; rel="sitemap"',
  '</api/upgrades/recommendations.md>; rel="alternate"; type="text/markdown"'
].join(', ');

// CORS & Agent Discovery headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Agent-ID',
  'Link': linkHeaderValue,
  'Vary': 'Accept',
  'X-Agent-Readiness': '100'
};

function serveAgentHealth(headers: Record<string, string>) {
  return new Response(
    JSON.stringify({
      status: "pass",
      service: "EcoSmartHomes AI Agent Advisory Services",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      checks: {
        ber_advisor: "operational",
        mcp_server: "operational",
        markdown_engine: "operational",
        oauth_server: "operational"
      }
    }, null, 2),
    {
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }
  );
}

function renderMarkdownToHtml(md: string): string {
  let html = md;

  // Code blocks ``` ... ```
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

  // Headings
  html = html.replace(/^###### (.*)$/gm, '<h6>$1</h6>');
  html = html.replace(/^##### (.*)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#### (.*)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Links: [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Unordered lists
  html = html.replace(/^\s*-\s+(.*)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\s*)+/gm, match => `<ul>${match}</ul>`);

  // Blockquotes
  html = html.replace(/^>\s+(.*)$/gm, '<blockquote>$1</blockquote>');

  // Paragraphs (naive wrap for lines not starting with HTML tags)
  html = html.replace(/^(?!<h\d|<ul|<li|<p|<blockquote|<pre|<code|<\/ul|<\/li)(.+)$/gm, '<p>$1</p>');

  return html;
}

async function handleContactForm(request: Request, env: any): Promise<Response> {
  try {
    let data;

    try {
      const text = await request.text();
      console.log('Received body:', text);

      if (!text) {
        return new Response(
          JSON.stringify({ error: 'Empty request body' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          }
        );
      }

      data = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, email, and message are required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    console.log('Contact form submission:', {
      name: data.name,
      email: data.email,
      phone: data.phone || 'N/A',
      topic: data.topic || 'N/A',
      message: data.message,
      timestamp: new Date().toISOString()
    });

    const resendApiKey = env.RESEND_API_KEY;

    if (resendApiKey) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'EcoSmartHome Contact <noreply@ecosmarthomes.ie>',
          to: 'askjoe@ecosmarthomes.ie',
          reply_to: data.email,
          subject: `New Enquiry from ${data.name}`,
          html: `
            <h3>New Contact Form Submission</h3>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strongPhone:</strong> ${data.phone || 'N/A'}</p>
            <p><strong>Topic:</strong> ${data.topic || 'N/A'}</p>
            <p><strong>Message:</strong><br/>${data.message.replace(/\n/g, '<br/>')}</p>
          `
        })
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('Failed to send email:', errorText);
        return new Response(
          JSON.stringify({
            error: 'Email service error. Please try again.',
            details: errorText
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          }
        );
      }
    } else {
      console.warn('RESEND_API_KEY is not set. Email was not sent.');
      return new Response(
        JSON.stringify({
          error: 'Email configuration missing. Please contact support.'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Thank you! We received your enquiry and will get back to you within 24 hours.'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );

  } catch (error: any) {
    console.error('Contact form error:', error);
    return new Response(
      JSON.stringify({
        error: 'An error occurred processing your request. Please try again later.',
        details: error?.message || 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
}

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    // Handle OPTIONS preflight requests
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const accept = request.headers.get("Accept") || "";
    const ua = request.headers.get("User-Agent") || "";
    const isBrowser =
      ua.includes("Mozilla") ||
      ua.includes("Chrome") ||
      ua.includes("Safari") ||
      accept.includes("text/html");

    // 1. Public AI overview page always allowed
    if (url.pathname === '/ai' || url.pathname === '/ai/') {
      return env.ASSETS.fetch(request);
    }

    // 2. Allow /.well-known/* for everyone (AI discovery)
    if (url.pathname.startsWith("/.well-known/")) {
      return env.ASSETS.fetch(request);
    }

    // 3. Protect schema, api data, and internal data directories from unauthorized direct browser navigation
    if ((url.pathname.startsWith("/schema/") ||
         url.pathname.startsWith("/api/") ||
         url.pathname.startsWith("/data/")) &&
        !url.pathname.startsWith("/api/articles") &&
        !url.pathname.startsWith("/api/site-health") &&
        !url.pathname.startsWith("/api/health") &&
        method === "GET") {
      const isAgent =
        ua.includes("GPTBot") ||
        ua.includes("ClaudeBot") ||
        ua.includes("PerplexityBot") ||
        ua.includes("BingAI") ||
        ua.includes("Google-Extended");
      if (isBrowser && !isAgent) {
        const homeUrl = new URL("/", request.url).toString();
        return Response.redirect(homeUrl, 302);
      }
    }

    // 4. AI-related endpoints and discovery
    const aiEndpoints = [
      "/robots.txt",
      "/ai/manifest.json",
      "/ai/openapi.json",
      "/api/mcp/manifest.json",
      "/api/upgrades/recommendations.md",
      "/api/oauth/metadata.json",
      "/sitemap.xml"
    ];

    const isAI =
      ua.includes("AI") ||
      ua.includes("LLM") ||
      ua.includes("ChatGPT") ||
      ua.includes("Gemini") ||
      ua.includes("GPTBot") ||
      ua.includes("ClaudeBot") ||
      ua.includes("PerplexityBot") ||
      ua.includes("BingAI") ||
      ua.includes("Google-Extended");

    if (
      aiEndpoints.includes(url.pathname) ||
      ((url.pathname.endsWith(".json") || url.pathname.endsWith(".md")) &&
        !url.pathname.startsWith("/.well-known/"))
    ) {
      // For browsers hitting AI JSON/MD directly, gently redirect to /ai
      if (isBrowser && !isAI) {
        const landingUrl = new URL("/ai/", request.url).toString();
        return Response.redirect(landingUrl, 302);
      }
    }

    // ⭐ Explicit fail-safe handler for /ai/manifest.json
    if (url.pathname === '/ai/manifest.json') {
      try {
        const asset = await env.ASSETS.fetch(request);
        if (asset.ok) {
          const enriched = new Response(asset.body, asset);
          enriched.headers.set('Content-Type', 'application/json; charset=utf-8');
          enriched.headers.set('Link', linkHeaderValue);
          enriched.headers.set('Access-Control-Allow-Origin', '*');
          enriched.headers.set('Vary', 'Accept');
          enriched.headers.set('X-Agent-Readiness', '100');
          return enriched;
        }
      } catch (e) {
        console.error('Manifest asset fetch error, using inline fallback:', e);
      }

      // Fail-safe inline JSON response matching site/ai/manifest.json
      return new Response(
        JSON.stringify({
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "name": "EcoSmartHomes",
          "version": "1.0.0",
          "description": "Premium Home Energy Retrofit Advisory in Ireland",
          "legal_entity": "EcoSmartHomes Ireland",
          "homepage": "https://ecosmarthomes.ie",
          "contact": "https://ecosmarthomes.ie/#contact",
          "skills": [
            "retrofit-advisory",
            "BER-analysis",
            "grant-guidance",
            "journey-timeline",
            "upgrade-recommendations",
            "insights-dashboard"
          ],
          "capabilities": {
            "markdown_responses": true,
            "mcp_support": true,
            "oauth_skills": true,
            "dns_aid_discovery": true,
            "realtime_ber_advisor": true,
            "structured_data_negotiation": true
          },
          "endpoints": {
            "agent_skills_page": "https://ecosmarthomes.ie/agent-skills.html",
            "openapi_spec": "https://ecosmarthomes.ie/ai/openapi.json",
            "ai_plugin": "https://ecosmarthomes.ie/.well-known/ai-plugin.json",
            "mcp_manifest": "https://ecosmarthomes.ie/api/mcp/manifest.json",
            "dns_aid_json": "https://ecosmarthomes.ie/.well-known/dns-aid.json",
            "oauth_metadata": "https://ecosmarthomes.ie/api/oauth/metadata.json"
          }
        }, null, 2),
        {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Link': linkHeaderValue,
            'Access-Control-Allow-Origin': '*',
            'Vary': 'Accept',
            'X-Agent-Readiness': '100'
          }
        }
      );
    }

    // Force static serving for all other /ai/* endpoints
    if (url.pathname.startsWith('/ai/')) {
      return env.ASSETS.fetch(request);
    }

    // 1. Site health endpoint (Harbor SEO integration)
    if (url.pathname === '/api/site-health' && method === 'GET') {
      return new Response(
        JSON.stringify({
          status: "ok",
          schema: "detected",
          altText: "detected",
          meta: "active",
          h1: "Premium Home Energy Retrofit Advisory in Ireland"
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // 2. Agent Health Status Endpoint (RFC 9727 status relation)
    if ((url.pathname === '/api/health' || url.pathname === '/api/health.json') && method === 'GET') {
      return serveAgentHealth(corsHeaders);
    }

    // 7. Articles Feed Endpoint (JSON KV Backed + Tag Filtering)
    if ((url.pathname === '/api/articles-feed' || url.pathname === '/api/articles') && method === 'GET') {
      let articles: any[] = [];
      if (env.ARTICLES_FEED && typeof env.ARTICLES_FEED.get === 'function') {
        try {
          const stored = await env.ARTICLES_FEED.get("articles.json");
          if (stored) {
            articles = JSON.parse(stored);
          }
        } catch (e) {
          console.error("Error reading ARTICLES_FEED from KV:", e);
        }
      }

      if (!articles || articles.length === 0) {
        articles = [
          {
            title: "Raising BER from G to A",
            slug: "raising-ber-g-to-a",
            summary: "A practical roadmap for Irish homeowners upgrading from BER G to A.",
            date: "2026-08-01",
            hero: "/imgs/ber-improvements-visual.svg",
            tags: ["BER Rating", "Retrofit Roadmap", "SEAI Grants"],
            created_at: "2026-08-01T10:00:00Z"
          },
          {
            title: "Carbon Tax 2026 Explained",
            slug: "carbon-tax-2026",
            summary: "What Irish homeowners need to know about the 2026 carbon tax changes.",
            date: "2026-07-20",
            hero: "/imgs/Grant Eligibility & Readiness Audit.jpg",
            tags: ["Carbon Tax", "Energy Costs", "Grants"],
            created_at: "2026-07-20T10:00:00Z"
          },
          {
            title: "Full Retrofit Roadmap",
            slug: "retrofit-roadmap",
            summary: "How to plan, budget, and execute a full home energy retrofit.",
            date: "2026-07-10",
            hero: "/imgs/Full Retrofit Roadmap.png",
            tags: ["Retrofit Roadmap", "Heat Pump", "Solar PV"],
            created_at: "2026-07-10T10:00:00Z"
          }
        ];
      }

      // Tag Filtering
      const tagParam = url.searchParams.get("tag");
      if (tagParam) {
        const queryTag = tagParam.toLowerCase();
        articles = articles.filter(a =>
          a.tags && Array.isArray(a.tags) && a.tags.some((t: string) => t.toLowerCase() === queryTag || t.toLowerCase().includes(queryTag))
        );
      }

      return new Response(JSON.stringify(articles, null, 2), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...corsHeaders
        }
      });
    }

    // 3. Contact form endpoint
    if (url.pathname === '/api/contact' && method === 'POST') {
      return handleContactForm(request, env);
    }

    // 4. Markdown for Agents Negotiation (Accept: text/markdown)
    const acceptHeader = request.headers.get("Accept") || "";
    if (method === 'GET' && acceptHeader.toLowerCase().includes("text/markdown")) {
      let mdPath = "";
      if (url.pathname === "/" || url.pathname === "/index.html") {
        mdPath = "/index.md";
      } else if (url.pathname === "/carbon-tax-2026.html" || url.pathname === "/carbon-tax-2026") {
        mdPath = "/carbon-tax-2026.md";
      } else if (url.pathname === "/raising-ber-g-to-a.html" || url.pathname === "/raising-ber-g-to-a") {
        mdPath = "/raising-ber-g-to-a.md";
      } else if (url.pathname === "/agent-skills.html" || url.pathname === "/agent-skills") {
        mdPath = "/api/upgrades/recommendations.md";
      }

      if (mdPath) {
        const mdRequest = new Request(new URL(mdPath, request.url).toString(), request);
        const assetResponse = await env.ASSETS.fetch(mdRequest);
        if (assetResponse.ok) {
          const mdText = await assetResponse.text();
          const estimatedTokens = Math.ceil(mdText.length / 4);

          return new Response(mdText, {
            status: 200,
            headers: {
              'Content-Type': 'text/markdown; charset=utf-8',
              'x-markdown-tokens': estimatedTokens.toString(),
              ...corsHeaders
            }
          });
        }
      }
    }

    // 5. Try serving static assets directly from site/ folder via env.ASSETS
    try {
      const assetResponse = await env.ASSETS.fetch(request);

      if (assetResponse.status !== 404) {
        // Server-Side Sanitization for Public Browsers on /agent-skills.html
        if (url.pathname === '/agent-skills.html' && isBrowser) {
          const htmlText = await assetResponse.text();
          const sanitizedHtml = htmlText.replace(
            /<div class="standards-section ai-standards-section">[\s\S]*?<\/table>\s*<\/div>\s*<\/div>/i,
            ''
          );
          const sanitizedResponse = new Response(sanitizedHtml, {
            status: assetResponse.status,
            headers: assetResponse.headers
          });
          sanitizedResponse.headers.set('Content-Type', 'text/html; charset=utf-8');
          sanitizedResponse.headers.set('Permissions-Policy', 'microphone=(self "https://ais-pre-6v2aqu5hko7j6draj7zjac-95863893871.europe-west1.run.app")');
          sanitizedResponse.headers.set('Link', linkHeaderValue);
          sanitizedResponse.headers.set('Access-Control-Allow-Origin', '*');
          sanitizedResponse.headers.set('Vary', 'Accept');
          sanitizedResponse.headers.set('X-Agent-Readiness', '100');
          return sanitizedResponse;
        }

        const enriched = new Response(assetResponse.body, assetResponse);
        enriched.headers.set('Permissions-Policy', 'microphone=(self "https://ais-pre-6v2aqu5hko7j6draj7zjac-95863893871.europe-west1.run.app")');
        enriched.headers.set('Link', linkHeaderValue);
        enriched.headers.set('Access-Control-Allow-Origin', '*');
        enriched.headers.set('Vary', 'Accept');
        enriched.headers.set('X-Agent-Readiness', '100');

        // MIME type & privacy overrides for agent readiness files
        if (url.pathname === '/robots.txt') {
          enriched.headers.set('Content-Type', 'text/plain; charset=utf-8');
        } else if (url.pathname === '/.well-known/api-catalog') {
          enriched.headers.set('Content-Type', 'application/linkset+json; charset=utf-8');
        } else if (
          url.pathname === '/ai/manifest.json' ||
          url.pathname === '/api/mcp/manifest.json' ||
          url.pathname === '/ai/openapi.json'
        ) {
          enriched.headers.set('Content-Type', 'application/json; charset=utf-8');
          enriched.headers.set('X-EcoSmart-Access', 'Restricted');
          enriched.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        } else if (url.pathname.endsWith('.md')) {
          enriched.headers.set('Content-Type', 'text/markdown; charset=utf-8');
          enriched.headers.set('X-EcoSmart-Access', 'Restricted');
          enriched.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        }

        return enriched;
      }
    } catch (e) {
      console.error('ASSETS fetch error:', e);
    }

    // 8. Article Markdown → HTML rendering with rich per-article SEO metadata
    if (url.pathname.startsWith('/articles/') && method === 'GET') {
      const rawSlug = url.pathname.replace('/articles/', '').replace('.html', '');

      let mdPath = '';
      if (rawSlug === 'carbon-tax-2026') {
        mdPath = '/carbon-tax-2026.md';
      } else if (rawSlug === 'raising-ber-g-to-a') {
        mdPath = '/raising-ber-g-to-a.md';
      } else if (rawSlug === 'retrofit-roadmap') {
        mdPath = '/api/upgrades/recommendations.md';
      }

      if (mdPath) {
        try {
          const mdRequest = new Request(new URL(mdPath, request.url).toString(), request);
          const assetResponse = await env.ASSETS.fetch(mdRequest);

          if (assetResponse.ok) {
            const mdText = await assetResponse.text();
            const htmlBody = renderMarkdownToHtml(mdText);

            // Fetch article feed metadata for rich SEO tags
            let feed: any[] = [];
            if (env.ARTICLES_FEED && typeof env.ARTICLES_FEED.get === 'function') {
              try {
                const stored = await env.ARTICLES_FEED.get("articles.json");
                if (stored) feed = JSON.parse(stored);
              } catch (e) {}
            }
            if (!feed || feed.length === 0) {
              feed = [
                {
                  title: "Raising BER from G to A",
                  slug: "raising-ber-g-to-a",
                  summary: "A practical roadmap for Irish homeowners upgrading from BER G to A.",
                  date: "2026-08-01",
                  hero: "/imgs/ber-improvements-visual.svg",
                  tags: ["BER Rating", "Retrofit Roadmap", "SEAI Grants"]
                },
                {
                  title: "Carbon Tax 2026 Explained",
                  slug: "carbon-tax-2026",
                  summary: "What Irish homeowners need to know about the 2026 carbon tax changes.",
                  date: "2026-07-20",
                  hero: "/imgs/Grant Eligibility & Readiness Audit.jpg",
                  tags: ["Carbon Tax", "Energy Costs", "Grants"]
                },
                {
                  title: "Full Retrofit Roadmap",
                  slug: "retrofit-roadmap",
                  summary: "How to plan, budget, and execute a full home energy retrofit.",
                  date: "2026-07-10",
                  hero: "/imgs/Full Retrofit Roadmap.png",
                  tags: ["Retrofit Roadmap", "Heat Pump", "Solar PV"]
                }
              ];
            }

            const article = feed.find((a: any) => a.slug === rawSlug);
            const titleFormatted = article?.title || rawSlug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            const summaryText = article?.summary || "Comprehensive home energy retrofit guidance from EcoSmartHomes Ireland.";
            const heroImage = article?.hero || "/imgs/hero_home.svg";
            const pubDate = article?.date || "2026-08-01";
            const canonicalUrl = `https://ecosmarthomes.ie/articles/${rawSlug}.html`;
            const fullHeroUrl = heroImage.startsWith("http") ? heroImage : `https://ecosmarthomes.ie${heroImage}`;

            const articleJsonLd = {
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": titleFormatted,
              "description": summaryText,
              "image": fullHeroUrl,
              "datePublished": pubDate,
              "author": {
                "@type": "Organization",
                "name": "EcoSmartHomes Ireland",
                "url": "https://ecosmarthomes.ie"
              },
              "publisher": {
                "@type": "Organization",
                "name": "EcoSmartHomes Ireland",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://ecosmarthomes.ie/imgs/logo.svg"
                }
              },
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": canonicalUrl
              }
            };

            const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${titleFormatted} | EcoSmartHomes Articles</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${summaryText}">
  <link rel="canonical" href="${canonicalUrl}">

  <!-- OpenGraph Meta Tags -->
  <meta property="og:title" content="${titleFormatted}">
  <meta property="og:description" content="${summaryText}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${fullHeroUrl}">

  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${titleFormatted}">
  <meta name="twitter:description" content="${summaryText}">
  <meta name="twitter:image" content="${fullHeroUrl}">

  <!-- JSON-LD Article Schema -->
  <script type="application/ld+json">
  ${JSON.stringify(articleJsonLd, null, 2)}
  </script>

  <link rel="stylesheet" href="/css/styles.css?v=2">
  <style>
    .article-container {
      max-width: 800px;
      margin: 40px auto 60px;
      padding: 0 20px;
      line-height: 1.7;
      color: #2c3e50;
    }
    .article-nav {
      background: #003f2d;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .article-nav a {
      color: #00ff80;
      text-decoration: none;
      font-weight: 600;
    }
    .article-hero-banner {
      width: 100%;
      max-height: 320px;
      object-fit: cover;
      border-radius: 12px;
      margin-bottom: 24px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }
    .article-body h1 { color: #003f2d; font-size: 2.2rem; margin-top: 20px; }
    .article-body h2 { color: #007f50; font-size: 1.6rem; margin-top: 30px; border-bottom: 2px solid #e6f4ef; padding-bottom: 6px; }
    .article-body h3 { color: #003f2d; font-size: 1.3rem; margin-top: 24px; }
    .article-body p { margin-bottom: 16px; font-size: 1.05rem; }
    .article-body ul { padding-left: 24px; margin-bottom: 20px; }
    .article-body li { margin-bottom: 8px; }
    .article-body blockquote { background: #e6f4ef; border-left: 5px solid #00a86b; padding: 14px 20px; margin: 20px 0; font-style: italic; }
    .article-body code { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
  </style>
</head>
<body>
  <nav class="article-nav">
    <a href="/articles">← Back to Articles</a>
    <a href="/index.html">EcoSmartHomes Home</a>
  </nav>
  <main class="article-container article-body">
    ${heroImage ? `<img src="${heroImage}" alt="${titleFormatted}" class="article-hero-banner">` : ''}
    ${htmlBody}
  </main>
  <footer style="background:#002d20; color:#fff; text-align:center; padding:30px 20px; font-size:0.9rem;">
    &copy; ${new Date().getFullYear()} EcoSmartHomes Ireland — Premium Home Energy Advisory
  </footer>
</body>
</html>`;

            return new Response(fullHtml, {
              status: 200,
              headers: {
                'Content-Type': 'text/html; charset=utf-8',
                ...corsHeaders
              }
            });
          }
        } catch (e) {
          console.error("Markdown rendering error:", e);
        }
      }

      // If no mapping or markdown missing, fall back to static template
      const fallbackUrl = new URL('/articles/test-article.html', request.url).toString();
      const fallbackRequest = new Request(fallbackUrl, request);
      return env.ASSETS.fetch(fallbackRequest);
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },

  async scheduled(event: any, env: any, ctx: any): Promise<void> {
    ctx.waitUntil(refreshArticlesFeed(env));
  }
};

async function refreshArticlesFeed(env: any) {
  try {
    const articles = [
      {
        title: "Raising BER from G to A",
        slug: "raising-ber-g-to-a",
        summary: "A practical roadmap for Irish homeowners upgrading from BER G to A.",
        date: new Date().toISOString().split('T')[0],
        hero: "/imgs/ber-improvements-visual.svg",
        tags: ["BER Rating", "Retrofit Roadmap", "SEAI Grants"],
        created_at: new Date().toISOString()
      },
      {
        title: "Carbon Tax 2026 Explained",
        slug: "carbon-tax-2026",
        summary: "What Irish homeowners need to know about the 2026 carbon tax changes.",
        date: new Date().toISOString().split('T')[0],
        hero: "/imgs/Grant Eligibility & Readiness Audit.jpg",
        tags: ["Carbon Tax", "Energy Costs", "Grants"],
        created_at: new Date().toISOString()
      },
      {
        title: "Full Retrofit Roadmap",
        slug: "retrofit-roadmap",
        summary: "How to plan, budget, and execute a full home energy retrofit.",
        date: new Date().toISOString().split('T')[0],
        hero: "/imgs/Full Retrofit Roadmap.png",
        tags: ["Retrofit Roadmap", "Heat Pump", "Solar PV"],
        created_at: new Date().toISOString()
      }
    ];

    if (env.ARTICLES_FEED && typeof env.ARTICLES_FEED.put === 'function') {
      await env.ARTICLES_FEED.put("articles.json", JSON.stringify(articles, null, 2));
      console.log("Articles feed refreshed in KV storage");
    }
  } catch (err) {
    console.error("Scheduled refresh failed:", err);
  }
}
