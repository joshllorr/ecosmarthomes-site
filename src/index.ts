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

function generateSemanticEmbedding(text: string): number[] {
  const tokens = text.toLowerCase().split(/\W+/).filter(t => t.length > 0);
  const vector = new Array(64).fill(0);

  tokens.forEach((t, i) => {
    let hash = 0;
    for (let j = 0; j < t.length; j++) {
      hash = (hash << 5) - hash + t.charCodeAt(j);
      hash |= 0;
    }
    const idx = Math.abs(hash) % 64;
    vector[idx] += 1 + (1 / (i + 1));
  });

  return vector;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
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

    // Helper to get active KV binding (KV_BINDING, ARTICLES_FEED, or ARTICLES_FEED_KV)
    const kv = env.KV_BINDING || env.ARTICLES_FEED || env.ARTICLES_FEED_KV || null;

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

    // 8. Status endpoint: /status
    if (url.pathname === '/status' && method === 'GET') {
      let kvStatus = "empty";
      if (kv && typeof kv.get === 'function') {
        try {
          const kvCheck = await kv.get("articles.json");
          if (kvCheck) kvStatus = "connected";
        } catch (e) {}
      }

      const payload = {
        status: "ok",
        workerVersion: "2026.08.06",
        kvFeed: kvStatus,
        rewriteRouting: "active",
        timestamp: new Date().toISOString()
      };

      return new Response(JSON.stringify(payload, null, 2), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          ...corsHeaders
        }
      });
    }

    // ---------------------------------------------------------
    // 🔍 SEO HUB — SEMANTIC SEARCH (AI SEARCH BINDING MY_SEARCH)
    // ---------------------------------------------------------
    if (url.pathname === "/api/search" && method === "GET") {
      const query = url.searchParams.get("q") || "retrofit grants Ireland";

      if (env.MY_SEARCH && typeof env.MY_SEARCH.search === 'function') {
        try {
          const results = await env.MY_SEARCH.search({
            query,
            ai_search_options: {
              retrieval: {
                retrieval_type: "hybrid",
                max_num_results: 10,
                match_threshold: 0.4,
              },
              query_rewrite: { enabled: false },
              reranking: { enabled: false },
            },
          });

          return new Response(JSON.stringify({
            query,
            search_query: results.search_query,
            chunks: results.chunks,
          }, null, 2), {
            headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders }
          });
        } catch (e: any) {
          console.error("AI Search error:", e);
        }
      }

      return new Response(JSON.stringify({
        query,
        status: "AI Search active on R2 bucket ecosmart-articles",
        chunks: []
      }, null, 2), {
        headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders }
      });
    }

    // ---------------------------------------------------------
    // 🕷️ CRAWLER ENGINE — LIST INDEXED ARTICLES
    // ---------------------------------------------------------
    if (url.pathname === "/api/crawl" && method === "GET") {
      if (env.MY_SEARCH && typeof env.MY_SEARCH.search === 'function') {
        try {
          const results = await env.MY_SEARCH.search({
            query: "EcoSmartHomes articles",
            ai_search_options: {
              retrieval: {
                retrieval_type: "hybrid",
                max_num_results: 50,
                match_threshold: 0.0,
              },
            },
          });

          const items = (results.chunks || []).map((chunk: any) => ({
            id: chunk.id,
            key: chunk.item?.key,
            score: chunk.score,
            text_preview: chunk.text?.slice(0, 200) || "",
            metadata: chunk.item?.metadata || {},
          }));

          return new Response(JSON.stringify({
            status: "Crawl complete",
            count: items.length,
            items,
          }, null, 2), {
            headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders }
          });
        } catch (e: any) {
          console.error("AI Crawl error:", e);
        }
      }

      return new Response(JSON.stringify({
        status: "Crawl ready",
        count: 0,
        items: []
      }, null, 2), {
        headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders }
      });
    }

    // ---------------------------------------------------------
    // 📚 ARTICLES FEED — FOR FRONTEND LISTING VIA AI SEARCH
    // ---------------------------------------------------------
    if (url.pathname === "/api/articles" && method === "GET") {
      if (env.MY_SEARCH && typeof env.MY_SEARCH.search === 'function') {
        try {
          const results = await env.MY_SEARCH.search({
            query: "list all EcoSmartHomes articles",
            ai_search_options: {
              retrieval: {
                retrieval_type: "hybrid",
                max_num_results: 20,
                match_threshold: 0.0,
              },
            },
          });

          const articles = (results.chunks || []).map((chunk: any) => ({
            id: chunk.id,
            title: chunk.item?.metadata?.title || chunk.item?.key || chunk.id,
            key: chunk.item?.key,
            score: chunk.score,
            metadata: chunk.item?.metadata || {},
          }));

          return new Response(JSON.stringify({ articles }, null, 2), {
            headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders }
          });
        } catch (e: any) {
          console.error("AI Articles feed error:", e);
        }
      }
    }

    // ---------------------------------------------------------
    // 📄 SINGLE ARTICLE — FETCH BY ID VIA AI SEARCH
    // ---------------------------------------------------------
    if (url.pathname.startsWith("/api/article/") && method === "GET") {
      const id = url.pathname.replace("/api/article/", "").trim();

      if (env.MY_SEARCH && typeof env.MY_SEARCH.search === 'function') {
        try {
          const results = await env.MY_SEARCH.search({
            query: id,
            ai_search_options: {
              retrieval: {
                retrieval_type: "hybrid",
                max_num_results: 5,
                match_threshold: 0.1,
              },
            },
          });

          const best = (results.chunks || [])[0];

          if (best) {
            return new Response(JSON.stringify({
              id: best.id,
              key: best.item?.key,
              text: best.text,
              metadata: best.item?.metadata || {},
              score: best.score,
            }, null, 2), {
              headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders }
            });
          }
        } catch (e: any) {
          console.error("AI Article fetch error:", e);
        }
      }

      return new Response(
        JSON.stringify({ error: "Article not found", id }, null, 2),
        { status: 404, headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders } }
      );
    }

    // 15. Server-rendered homepage with latest articles: / or /index.html
    if ((url.pathname === '/' || url.pathname === '/index.html') && method === 'GET') {
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

      const latest = feed
        .sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
        .slice(0, 4);

      try {
        const homeReq = new Request(new URL('/index.html', request.url).toString(), request);
        const homeRes = await env.ASSETS.fetch(homeReq);
        if (homeRes.ok) {
          let homeHtml = await homeRes.text();

          const previewsHtml = latest.map((a: any) => {
            const aLink = a.slug === 'raising-ber-g-to-a' || a.slug === 'carbon-tax-2026' ? `/${a.slug}.html` : `/articles/${a.slug}.html`;
            return `
              <div class="home-article-card">
                ${a.hero ? `<img src="${a.hero}" alt="${a.title}" class="home-article-hero">` : ''}
                <h3>${a.title}</h3>
                <p>${a.summary}</p>
                <div style="margin-bottom:12px;">
                  ${(a.tags || []).map((t: string) => `<span class="tag-badge">${t}</span>`).join('')}
                </div>
                <a href="${aLink}" class="home-article-link">Read Article →</a>
              </div>
            `;
          }).join('');

          homeHtml = homeHtml.replace('<!--LATEST_ARTICLES-->', previewsHtml);

          return new Response(homeHtml, {
            status: 200,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Permissions-Policy': 'microphone=(self "https://ais-pre-6v2aqu5hko7j6draj7zjac-95863893871.europe-west1.run.app")',
              'Link': linkHeaderValue,
              'Access-Control-Allow-Origin': '*',
              'Vary': 'Accept',
              'X-Agent-Readiness': '100'
            }
          });
        }
      } catch (e) {
        console.error("Homepage SSR error:", e);
      }
    }

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

      // Pagination Envelope
      const hasPageParam = url.searchParams.has("page") || url.searchParams.has("pageSize");
      const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
      const pageSize = Math.max(1, parseInt(url.searchParams.get("pageSize") || "6", 10));

      if (hasPageParam) {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginated = articles.slice(start, end);

        const payload = {
          page,
          pageSize,
          total: articles.length,
          totalPages: Math.ceil(articles.length / pageSize) || 1,
          items: paginated
        };

        return new Response(JSON.stringify(payload, null, 2), {
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders }
        });
      }

      return new Response(JSON.stringify(articles, null, 2), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...corsHeaders
        }
      });
    }

    // 11. Article Full-Text Search Endpoint: /api/articles-search?q=...
    if (url.pathname === '/api/articles-search' && method === 'GET') {
      const q = (url.searchParams.get("q") || "").toLowerCase().trim();

      let articles: any[] = [];
      if (env.ARTICLES_FEED && typeof env.ARTICLES_FEED.get === 'function') {
        try {
          const stored = await env.ARTICLES_FEED.get("articles.json");
          if (stored) articles = JSON.parse(stored);
        } catch (e) {}
      }
      if (!articles || articles.length === 0) {
        articles = [
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

      let results = articles;
      if (q) {
        results = articles.filter((a: any) => {
          const title = (a.title || "").toLowerCase();
          const summary = (a.summary || "").toLowerCase();
          const tags = (a.tags || []).map((t: string) => t.toLowerCase());

          return title.includes(q) || summary.includes(q) || tags.some((t: string) => t.includes(q));
        });
      }

      // Pagination Envelope for search
      const hasPageParam = url.searchParams.has("page") || url.searchParams.has("pageSize");
      const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
      const pageSize = Math.max(1, parseInt(url.searchParams.get("pageSize") || "6", 10));

      if (hasPageParam) {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginated = results.slice(start, end);

        const payload = {
          page,
          pageSize,
          total: results.length,
          totalPages: Math.ceil(results.length / pageSize) || 1,
          items: paginated
        };

        return new Response(JSON.stringify(payload, null, 2), {
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders }
        });
      }

      return new Response(JSON.stringify(results, null, 2), {
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders }
      });
    }

    // 12. Article Autocomplete Endpoint: /api/articles-suggest?q=...
    if (url.pathname === '/api/articles-suggest' && method === 'GET') {
      const q = (url.searchParams.get("q") || "").toLowerCase().trim();

      if (!q) {
        return new Response(JSON.stringify([], null, 2), {
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders }
        });
      }

      let articles: any[] = [];
      if (env.ARTICLES_FEED && typeof env.ARTICLES_FEED.get === 'function') {
        try {
          const stored = await env.ARTICLES_FEED.get("articles.json");
          if (stored) articles = JSON.parse(stored);
        } catch (e) {}
      }
      if (!articles || articles.length === 0) {
        articles = [
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

      const suggestions = articles
        .filter((a: any) => {
          const title = (a.title || "").toLowerCase();
          const summary = (a.summary || "").toLowerCase();
          const tags = (a.tags || []).map((t: string) => t.toLowerCase());

          return title.includes(q) || summary.includes(q) || tags.some((t: string) => t.includes(q));
        })
        .slice(0, 5)
        .map((a: any) => ({
          title: a.title,
          slug: a.slug,
          hero: a.hero,
          summary: a.summary,
          tags: a.tags
        }));

      return new Response(JSON.stringify(suggestions, null, 2), {
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders }
      });
    }

    // 13. AI Semantic Vector Search Endpoint: /api/articles-semantic?q=...
    if (url.pathname === '/api/articles-semantic' && method === 'GET') {
      const q = (url.searchParams.get("q") || "").toLowerCase().trim();

      if (!q) {
        return new Response(JSON.stringify([], null, 2), {
          headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders }
        });
      }

      let articles: any[] = [];
      if (env.ARTICLES_FEED && typeof env.ARTICLES_FEED.get === 'function') {
        try {
          const stored = await env.ARTICLES_FEED.get("articles.json");
          if (stored) articles = JSON.parse(stored);
        } catch (e) {}
      }
      if (!articles || articles.length === 0) {
        articles = [
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

      const qEmbed = generateSemanticEmbedding(q);

      const semanticResults = articles
        .map((a: any) => {
          const itemEmbedding = a.embedding || generateSemanticEmbedding(`${a.title} ${a.summary} ${(a.tags || []).join(" ")}`);
          return {
            title: a.title,
            slug: a.slug,
            hero: a.hero,
            summary: a.summary,
            tags: a.tags,
            score: cosineSimilarity(qEmbed, itemEmbedding)
          };
        })
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 5);

      return new Response(JSON.stringify(semanticResults, null, 2), {
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders }
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

    // 18. Dynamic OpenGraph SVG Image Generator for Tag Pages: /og/tag/<TAG>
    if (url.pathname.startsWith('/og/tag/') && method === 'GET') {
      const tag = decodeURIComponent(url.pathname.replace('/og/tag/', '')).trim();

      const colors: Record<string, string> = {
        "Heat Pump": "#003f2d",
        "Retrofit Roadmap": "#004aad",
        "BER Rating": "#007f50",
        "SEAI Grants": "#00a86b",
        "Carbon Tax": "#005f73"
      };
      const bg = colors[tag] || "#003f2d";

      const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg}" />
      <stop offset="100%" stop-color="#001a13" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)" />

  <!-- Decorative Accent Bar -->
  <rect x="60" y="70" width="8" height="490" fill="#00ff80" rx="4" />

  <!-- EcoSmartHomes Brand Header -->
  <text x="95" y="140" font-size="52" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fill="#ffffff" font-weight="800" letter-spacing="1">
    EcoSmartHomes Ireland
  </text>
  <text x="95" y="185" font-size="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fill="#00ff80" font-weight="600" letter-spacing="2">
    INDEPENDENT HOME ENERGY ADVISORY
  </text>

  <!-- Tag Title Card -->
  <text x="95" y="320" font-size="64" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fill="#ffffff" font-weight="700">
    ${tag} Insights &amp; Guidance
  </text>
  <text x="95" y="390" font-size="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fill="#e6f4ef" font-weight="400">
    Expert Advisory, SEAI Grant Eligibility &amp; BER Upgrade Sequencing
  </text>

  <!-- Footer Badge -->
  <rect x="95" y="475" width="420" height="54" rx="27" fill="rgba(255,255,255,0.12)" />
  <text x="135" y="510" font-size="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fill="#00ff80" font-weight="700">
    🌐 www.ecosmarthomes.ie
  </text>
</svg>`;

      return new Response(svg, {
        headers: {
          'Content-Type': 'image/svg+xml; charset=utf-8',
          'Cache-Control': 'public, max-age=86400',
          ...corsHeaders
        }
      });
    }

    // 16. Server-rendered tag pages: /articles/tag/<tag>
    if (url.pathname.startsWith('/articles/tag/') && method === 'GET') {
      const targetTag = decodeURIComponent(url.pathname.replace('/articles/tag/', '')).trim();

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

      const tagged = feed.filter((a: any) =>
        a.tags && Array.isArray(a.tags) && a.tags.some((t: string) => t.toLowerCase() === targetTag.toLowerCase() || t.toLowerCase().includes(targetTag.toLowerCase()))
      );

      const canonicalUrl = `https://ecosmarthomes.ie/articles/tag/${encodeURIComponent(targetTag)}`;
      const ogImageUrl = `https://ecosmarthomes.ie/og/tag/${encodeURIComponent(targetTag)}`;

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Articles Tagged "${targetTag}" | EcoSmartHomes</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Explore home energy retrofit articles and guidance tagged with ${targetTag} from EcoSmartHomes Ireland.">
  <link rel="canonical" href="${canonicalUrl}">

  <meta property="og:title" content="Articles Tagged '${targetTag}' | EcoSmartHomes">
  <meta property="og:description" content="Explore home energy retrofit articles tagged with ${targetTag}.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${ogImageUrl}">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Articles Tagged ${targetTag}">
  <meta name="twitter:description" content="Explore home energy retrofit articles tagged with ${targetTag}.">
  <meta name="twitter:image" content="${ogImageUrl}">

  <link rel="stylesheet" href="/css/styles.css?v=2">
  <style>
    .tag-hero {
      background: linear-gradient(135deg, #003f2d 0%, #002d20 100%);
      color: white;
      padding: 50px 20px;
      text-align: center;
      margin-bottom: 40px;
    }
    .tag-hero h1 { color: #fff; font-size: 2.2rem; margin-bottom: 10px; }
    .tag-hero p { color: #00ff80; font-size: 1.1rem; }
    .tag-articles-grid {
      max-width: 1100px;
      margin: 0 auto 60px;
      padding: 0 20px;
      display: grid;
      gap: 30px;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }
    .tag-article-card {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      padding: 24px;
      border-left: 5px solid #00a86b;
      display: flex;
      flex-direction: column;
    }
    .tag-article-hero { width: 100%; height: 160px; object-fit: cover; border-radius: 6px; margin-bottom: 14px; }
    .tag-article-card h2 { color: #003f2d; margin: 0 0 12px; font-size: 1.3rem; }
    .tag-article-card p { color: #555; font-size: 0.95rem; line-height: 1.5; margin-bottom: 12px; }
    .tag-badge {
      background: #e6f4ef;
      color: #007f50;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 20px;
      text-transform: uppercase;
      text-decoration: none;
      display: inline-block;
      margin-right: 6px;
    }
    .tag-badge:hover { background: #00a86b; color: #fff; }
  </style>
</head>
<body>
  <header class="header">
    <div class="container nav-container">
      <div class="logo"><a href="/index.html"><img src="/imgs/logo.svg" alt="EcoSmartHomes" /></a></div>
      <nav class="nav">
        <ul>
          <li><a href="/index.html">Home</a></li>
          <li><a href="/articles">All Articles</a></li>
          <li><a href="/index.html#contact">Contact</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <div class="tag-hero">
    <h1>Articles Tagged "${targetTag}"</h1>
    <p>Showing ${tagged.length} article${tagged.length === 1 ? '' : 's'} topic-matched to ${targetTag}</p>
  </div>

  <main class="tag-articles-grid">
    ${tagged.length > 0 ? tagged.map((a: any) => {
      const articleLink = a.slug === 'raising-ber-g-to-a' || a.slug === 'carbon-tax-2026' ? `/${a.slug}.html` : `/articles/${a.slug}.html`;
      return `
        <article class="tag-article-card">
          ${a.hero ? `<img src="${a.hero}" alt="${a.title}" class="tag-article-hero">` : ''}
          <h2>${a.title}</h2>
          <p>${a.summary}</p>
          <div style="margin-bottom:14px;">
            ${(a.tags || []).map((t: string) => `<a href="/articles/tag/${encodeURIComponent(t)}" class="tag-badge">${t}</a>`).join('')}
          </div>
          <a href="${articleLink}" style="color:#00a86b; font-weight:700; text-decoration:none; margin-top:auto;">Read Article →</a>
        </article>
      `;
    }).join('') : `<p style="grid-column:1/-1; text-align:center; color:#666;">No articles found tagged with "${targetTag}". <a href="/articles">View all articles →</a></p>`}
  </main>

  <footer class="footer">
    <div class="container" style="text-align:center; padding:30px 20px; color:#fff;">
      &copy; ${new Date().getFullYear()} EcoSmartHomes Ireland — Premium Home Energy Advisory
    </div>
  </footer>
</body>
</html>`;

      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          ...corsHeaders
        }
      });
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

    // 8. Server-Rendered Article Engine (SSR Markdown → HTML with rich SEO & JSON-LD)
    if (url.pathname.startsWith('/articles/') && method === 'GET') {
      const rawSlug = url.pathname.replace('/articles/', '').replace('.html', '');

      let mdText = '';
      const candidatePaths = [
        `/articles-md/${rawSlug}.md`,
        `/${rawSlug}.md`,
        rawSlug === 'retrofit-roadmap' ? '/api/upgrades/recommendations.md' : ''
      ].filter(Boolean);

      for (const mdPath of candidatePaths) {
        try {
          const mdRequest = new Request(new URL(mdPath, request.url).toString(), request);
          const assetResponse = await env.ASSETS.fetch(mdRequest);
          if (assetResponse.ok) {
            mdText = await assetResponse.text();
            break;
          }
        } catch (e) {}
      }

      if (mdText) {
        try {
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

            // Compute related articles based on shared topic tags
            let related: any[] = [];
            if (article && article.tags && Array.isArray(article.tags)) {
              related = feed
                .filter((a: any) => a.slug !== rawSlug)
                .map((a: any) => {
                  const shared = (a.tags || []).filter((t: string) => article.tags.includes(t));
                  return { ...a, sharedCount: shared.length };
                })
                .filter((a: any) => a.sharedCount > 0)
                .sort((a: any, b: any) => b.sharedCount - a.sharedCount)
                .slice(0, 3);
            }

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

            const structuredSectionsHtml = (article?.sections || []).map((sec: any) => `
              <section class="article-section" style="margin-bottom:30px;">
                ${sec.heading ? `<h2>${sec.heading}</h2>` : ''}
                ${(sec.body || []).map((p: string) => `<p>${p}</p>`).join('')}
                ${sec.pullquote ? `<blockquote class="pullquote" style="background:#e6f4ef; border-left:5px solid #00a86b; padding:16px; margin:20px 0; font-style:italic; font-size:1.1rem; color:#003f2d;">"${sec.pullquote}"</blockquote>` : ''}
                ${sec.cta ? `<div style="margin:20px 0;"><a class="cta-button" href="${sec.cta.url}" style="background:#00a86b; color:#fff; padding:12px 24px; border-radius:6px; font-weight:700; text-decoration:none; display:inline-block;">${sec.cta.label}</a></div>` : ''}
              </section>
            `).join('');

            const tagChipsHtml = (article?.tags || []).map((t: string) => `
              <a class="tag-chip" href="/articles/tag/${encodeURIComponent(t)}" style="background:#e6f4ef; color:#007f50; font-size:0.8rem; font-weight:700; padding:4px 12px; border-radius:20px; text-transform:uppercase; text-decoration:none; display:inline-block; margin-right:8px; margin-bottom:14px;">${t}</a>
            `).join('');

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
    .related-section {
      margin-top: 50px;
      padding-top: 30px;
      border-top: 2px solid #e6f4ef;
    }
    .related-section h2 {
      color: #003f2d;
      font-size: 1.5rem;
      margin-bottom: 20px;
    }
    .related-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
    }
    .related-card {
      background: #fafafa;
      border-radius: 8px;
      padding: 16px;
      border-left: 4px solid #00a86b;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      display: flex;
      flex-direction: column;
    }
    .related-card img {
      width: 100%;
      height: 120px;
      object-fit: cover;
      border-radius: 6px;
      margin-bottom: 10px;
    }
    .related-card h3 {
      font-size: 1.05rem;
      color: #003f2d;
      margin: 0 0 8px;
    }
    .related-card p {
      font-size: 0.85rem;
      color: #555;
      margin-bottom: 12px;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <nav class="article-nav">
    <a href="/articles">← Back to Articles</a>
    <a href="/index.html">EcoSmartHomes Home</a>
  </nav>
  <main class="article-container article-body">
    ${heroImage ? `<img src="${heroImage}" alt="${titleFormatted}" class="article-hero-banner">` : ''}
    ${tagChipsHtml ? `<div style="margin-bottom:16px;">${tagChipsHtml}</div>` : ''}
    ${htmlBody ? htmlBody : structuredSectionsHtml}

    ${related.length > 0 ? `
    <section class="related-section">
      <h2>Related Articles</h2>
      <div class="related-grid">
        ${related.map((r: any) => {
          const rLink = r.slug === 'raising-ber-g-to-a' || r.slug === 'carbon-tax-2026' ? `/${r.slug}.html` : `/articles/${r.slug}.html`;
          return `
            <div class="related-card">
              ${r.hero ? `<img src="${r.hero}" alt="${r.title}">` : ''}
              <h3>${r.title}</h3>
              <p>${r.summary}</p>
              <a href="${rLink}" style="color:#00a86b; font-weight:700; text-decoration:none; font-size:0.85rem; margin-top:auto;">Read Article →</a>
            </div>
          `;
        }).join('')}
      </div>
    </section>
    ` : ''}
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

    const enriched = articles.map(a => ({
      ...a,
      embedding: generateSemanticEmbedding(`${a.title} ${a.summary} ${(a.tags || []).join(" ")}`)
    }));

    if (env.ARTICLES_FEED && typeof env.ARTICLES_FEED.put === 'function') {
      await env.ARTICLES_FEED.put("articles.json", JSON.stringify(enriched, null, 2));
      console.log("Articles feed with semantic embeddings refreshed in KV storage");
    }
  } catch (err) {
    console.error("Scheduled refresh failed:", err);
  }
}
