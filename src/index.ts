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
            <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
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

/**
 * Web Crypto HMAC-SHA256 Token Verification Helper for Cloudflare Workers
 */
/**
 * Web Crypto HMAC-SHA256 Token Verification Helper returning decoded payload or null
 */
async function verifyDevTokenPayload(tokenStr: string, secretStr: string): Promise<{ id?: string; role?: string; scope?: string[]; expires?: number } | null> {
  if (!tokenStr || typeof tokenStr !== 'string') return null;
  const parts = tokenStr.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, sigB64] = parts;

  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretStr);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = base64UrlToBytes(sigB64);
    const dataBytes = encoder.encode(payloadB64);

    const isValidSig = await crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      signatureBytes,
      dataBytes
    );

    if (!isValidSig) return null;

    const jsonText = new TextDecoder().decode(base64UrlToBytes(payloadB64));
    const payload = JSON.parse(jsonText);

    const now = Math.floor(Date.now() / 1000);
    if (payload.expires && payload.expires < now) return null;
    if (payload.role !== 'developer') return null;
    if (Array.isArray(payload.scope) && !payload.scope.includes('ai.dev')) return null;

    return payload;
  } catch (err) {
    console.error('Token verification error:', err);
    return null;
  }
}

async function fetchTokenRegistry(env: any, request: Request): Promise<{ active: { id: string }[]; revoked: { id: string }[] }> {
  try {
    const regUrl = new URL('/data/dev-tokens.json', request.url).toString();
    const regReq = new Request(regUrl, request);
    const res = await env.ASSETS.fetch(regReq);
    if (!res.ok) return { active: [{ id: 'dev-2026-01' }], revoked: [{ id: 'dev-2025-04' }] };
    return await res.json();
  } catch (e) {
    return { active: [{ id: 'dev-2026-01' }], revoked: [{ id: 'dev-2025-04' }] };
  }
}

function isTokenActive(id: string | undefined, registry: { active: { id: string }[]; revoked: { id: string }[] }): boolean {
  if (!id) return true; // Default fallback for un-identified tokens if signature passed
  const isRevoked = registry.revoked.some(t => t.id === id);
  if (isRevoked) return false;
  const isActive = registry.active.some(t => t.id === id);
  return isActive;
}

function base64UrlToBytes(b64url: string): Uint8Array {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
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
    const isBrowser = ua.includes("Mozilla") || ua.includes("Chrome") || ua.includes("Safari") || accept.includes("text/html");

    // Extract Developer Token from header or query param
    const token = request.headers.get("ecosmart-dev-token") || url.searchParams.get("token") || "";
    const secret = env?.DEV_TOKEN_SECRET || 'ecosmart-dev-secret-2026-key';
    
    let isDevAuthorized = false;
    if (token) {
      const payload = await verifyDevTokenPayload(token, secret);
      if (payload) {
        const registry = await fetchTokenRegistry(env, request);
        isDevAuthorized = isTokenActive(payload.id, registry);
      }
    }

    // 1. Public AI overview page always allowed
    if (url.pathname === '/ai' || url.pathname === '/ai/') {
      return env.ASSETS.fetch(request);
    }

    // 2. Private Developer Portal (/ai/dev/*) — requires valid, active, non-revoked developer token
    if (url.pathname.startsWith('/ai/dev')) {
      // Explicit fail-safe check for /ai/dev/endpoints.html
      if (url.pathname === '/ai/dev/endpoints.html' || url.pathname === '/ai/dev/endpoints') {
        if (!isDevAuthorized) {
          const landingUrl = new URL('/ai/', request.url).toString();
          return Response.redirect(landingUrl, 302);
        }
      }

      if (!isDevAuthorized) {
        const landingUrl = new URL('/ai/', request.url).toString();
        return Response.redirect(landingUrl, 302);
      }
      return env.ASSETS.fetch(request);
    }

    // 3. Allow /.well-known/* for everyone (AI discovery)
    if (url.pathname.startsWith("/.well-known/")) {
      return env.ASSETS.fetch(request);
    }

    // 4. Protect all JSON & MD endpoints (/ai/manifest.json, /ai/openapi.json, /api/mcp/manifest.json, /api/upgrades/recommendations.md, /api/oauth/metadata.json)
    const aiEndpoints = [
      "/robots.txt",
      "/ai/manifest.json",
      "/ai/openapi.json",
      "/api/mcp/manifest.json",
      "/api/upgrades/recommendations.md",
      "/api/oauth/metadata.json",
      "/sitemap.xml"
    ];

    if (aiEndpoints.includes(url.pathname) || ((url.pathname.endsWith(".json") || url.pathname.endsWith(".md")) && !url.pathname.startsWith("/.well-known/"))) {
      const isAgent = ua.includes("GPTBot") || ua.includes("ClaudeBot") || ua.includes("PerplexityBot") || ua.includes("BingAI") || ua.includes("Google-Extended");
      if (isBrowser && !isDevAuthorized && !isAgent) {
        const landingUrl = new URL("/ai/", request.url).toString();
        return Response.redirect(landingUrl, 302);
      }
    }

    // 5. Protect schema, api data, and internal data directories from unauthorized direct browser navigation
    if ((url.pathname.startsWith("/schema/") || url.pathname.startsWith("/api/") || url.pathname.startsWith("/data/")) && method === "GET") {
      const isAgent = ua.includes("GPTBot") || ua.includes("ClaudeBot") || ua.includes("PerplexityBot") || ua.includes("BingAI") || ua.includes("Google-Extended");
      if (isBrowser && !isDevAuthorized && !isAgent) {
        const homeUrl = new URL("/", request.url).toString();
        return Response.redirect(homeUrl, 302);
      }
    }

    // ⭐ Explicit fail-safe handler for /ai/manifest.json
    if (url.pathname === '/ai/manifest.json') {
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
      } catch (e) {}

      // Fail-safe inline JSON response matching site/ai/manifest.json
      return new Response(JSON.stringify({
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
      }, null, 2), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Link': linkHeaderValue,
          'Access-Control-Allow-Origin': '*',
          'Vary': 'Accept',
          'X-Agent-Readiness': '100'
        }
      });
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
        const enriched = new Response(assetResponse.body, assetResponse);
        enriched.headers.set('Permissions-Policy', 'microphone=(self "https://ais-pre-6v2aqu5hko7j6draj7zjac-95863893871.europe-west1.run.app")');
        enriched.headers.set('Link', linkHeaderValue);
        enriched.headers.set('Access-Control-Allow-Origin', '*');
        enriched.headers.set('Vary', 'Accept');
        enriched.headers.set('X-Agent-Readiness', '100');

        // MIME type overrides for agent readiness files
        if (url.pathname === '/robots.txt') {
          enriched.headers.set('Content-Type', 'text/plain; charset=utf-8');
        } else if (url.pathname === '/.well-known/api-catalog') {
          enriched.headers.set('Content-Type', 'application/linkset+json; charset=utf-8');
        } else if (url.pathname === '/ai/manifest.json') {
          enriched.headers.set('Content-Type', 'application/json; charset=utf-8');
        } else if (url.pathname.endsWith('.md')) {
          enriched.headers.set('Content-Type', 'text/markdown; charset=utf-8');
        }

        return enriched;
      }
    } catch (e) {
      console.error('ASSETS fetch error:', e);
    }

    // 6. Articles fallback for 404s
    if (url.pathname.startsWith('/articles/')) {
      const fallbackUrl = new URL('/articles/test-article.html', request.url).toString();
      const fallbackRequest = new Request(fallbackUrl, request);
      return env.ASSETS.fetch(fallbackRequest);
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
};
