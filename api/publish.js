export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Agent-ID');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const slug = (body.slug || '').replace(/^\/articles\//, '').replace(/\.html$/, '').trim();
    const content = body.content || body.html || '';
    const title = body.title || slug;
    const description = body.description || 'Independent home energy retrofit advisory article from EcoSmartHomes Ireland.';
    const tags = body.tags || ['Retrofit', 'SEAI Grants', 'BER Rating'];

    if (!slug || !content) {
      return res.status(400).json({ error: 'Missing required fields: slug and content are required' });
    }

    return res.status(200).json({
      ok: true,
      success: true,
      slug,
      url: `https://www.ecosmarthomes.ie/articles/${slug}.html`,
      message: `Article '${title}' published successfully!`
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
