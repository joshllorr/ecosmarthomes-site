/**
 * /api/articles-feed.js
 * Vercel Serverless Function: Articles Feed & Filter Endpoint
 * Seamlessly integrates static seed guides with dynamic SEO Hub publications
 */

import { getAllArticles } from './_articles.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { tag, category, page = 1, pageSize = 6 } = req.query || {};

    let items = getAllArticles();

    if (tag) {
      const targetTag = tag.toLowerCase().trim();
      items = items.filter(a => a.tags && a.tags.some(t => t.toLowerCase() === targetTag));
    }

    if (category) {
      const targetCat = category.toLowerCase().trim();
      items = items.filter(a => (a.category || '').toLowerCase() === targetCat);
    }

    const total = items.length;
    const p = parseInt(page, 10) || 1;
    const ps = parseInt(pageSize, 10) || 6;
    const totalPages = Math.ceil(total / ps) || 1;
    const start = (p - 1) * ps;
    const paginated = items.slice(start, start + ps);

    return res.status(200).json({
      items: paginated,
      total,
      page: p,
      pageSize: ps,
      totalPages
    });
  } catch (err) {
    console.error('articles-feed error:', err);
    return res.status(200).json({
      items: [],
      total: 0,
      page: 1,
      pageSize: 6,
      totalPages: 1,
      error: err.message
    });
  }
}
