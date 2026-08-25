export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const targetPath = url.pathname.replace('/api/whatsapp', '');
  const targetUrl = `http://34.121.195.76:5173/api/whatsapp${targetPath}${url.search}`;

  try {
    return await fetch(targetUrl, {
      method: context.request.method,
      headers: context.request.headers,
      body: context.request.body,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Backend proxy error', details: err.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
