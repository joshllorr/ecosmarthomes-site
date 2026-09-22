/**
 * /api/publish.js
 * Vercel Serverless Function: Webhook receiver for EcoSmartHomes SEO Hub articles
 */

import { addDynamicArticle } from './_articles.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Agent-ID');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Send POST to publish.' });
  }

  try {
    const body = req.body || {};
    const slug = (body.slug || '').replace(/^\/articles\//, '').replace(/\.html$/, '').trim();
    const content = body.content || body.html || '';
    const title = body.title || slug;
    const summary = body.summary || body.description || 'Independent home energy retrofit advisory article from EcoSmartHomes Ireland.';
    const tags = Array.isArray(body.tags) && body.tags.length > 0 ? body.tags : ['Retrofit', 'SEAI Grants', 'BER Rating'];
    const category = body.category || tags[0] || 'Retrofit';
    const hero = body.hero || '/imgs/logo.svg';
    const date = body.date || new Date().toLocaleDateString('en-IE', { month: 'long', day: 'numeric', year: 'numeric' });

    if (!slug || !content) {
      return res.status(400).json({ error: 'Missing required fields: slug and content are required' });
    }

    const articleRecord = {
      slug: `articles/${slug}`,
      url: `/articles/${slug}.html`,
      title,
      summary,
      date,
      category,
      tags,
      hero,
      author: body.author || 'EcoSmartHomes Technical Advisory Desk'
    };

    // Store in active feed cache
    addDynamicArticle(articleRecord);

    return res.status(200).json({
      ok: true,
      success: true,
      slug: articleRecord.slug,
      url: `https://www.ecosmarthomes.ie/articles/${slug}.html`,
      message: `Article '${title}' published successfully!`,
      article: articleRecord
    });
  } catch (err) {
    console.error('Publish error:', err);
    return res.status(500).json({ error: err.message });
  }
}
