export const onRequestPost: PagesFunction = async ({ request, env }) => {
  try {
    const body: any = await request.json();
    const slug = (body.slug || '').replace(/^\/articles\//, '').replace(/\.html$/, '').trim();
    const html = body.html || body.content || '';
    const title = body.title || slug;
    const description = body.description || 'Independent home energy retrofit advisory article from EcoSmartHomes Ireland.';
    const tags = body.tags || ['Retrofit', 'SEAI Grants', 'BER Rating'];

    if (!slug || !html) {
      return new Response(JSON.stringify({ error: 'Missing required fields: slug and html/content are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const articleData = {
      title,
      slug,
      content: html,
      description,
      tags,
      published_at: new Date().toISOString()
    };

    // 1. Store in KV
    const kv = env.ARTICLES || env.KV_BINDING || env.ARTICLES_FEED || env.ARTICLES_FEED_KV || null;
    if (kv && typeof kv.put === 'function') {
      try {
        await kv.put(`article:${slug}`, JSON.stringify(articleData));
        await kv.put(slug, html);
      } catch (kvErr) {
        console.error('KV storage error:', kvErr);
      }
    }

    // 2. Store in ARTICLES_META if available
    if (env.ARTICLES_META && typeof env.ARTICLES_META.put === 'function') {
      try {
        await env.ARTICLES_META.put(slug, JSON.stringify(articleData));
      } catch (metaErr) {
        console.error('KV META storage error:', metaErr);
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      success: true,
      slug,
      url: `https://www.ecosmarthomes.ie/articles/${slug}.html`,
      message: `Article '${title}' published successfully!`
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
