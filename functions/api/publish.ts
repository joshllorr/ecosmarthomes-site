export const onRequestPost: PagesFunction = async ({ request, env }) => {
  try {
    const body = await request.json();
    const { slug, html, title } = body;

    if (!slug || !html) {
      return new Response(JSON.stringify({ error: 'Missing slug or html' }), { status: 400 });
    }

    // Store article HTML in KV
    await env.ARTICLES.put(slug, html);

    // Store metadata
    await env.ARTICLES_META.put(
      slug,
      JSON.stringify({
        title,
        slug,
        published_at: new Date().toISOString(),
      })
    );

    return new Response(JSON.stringify({ ok: true, slug }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
