/**
 * /api/articles-search.js
 * Vercel Serverless Function: Articles Search Endpoint
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
    const { q = '', tag, category, page = 1, pageSize = 6 } = req.query || {};
    const query = q.toLowerCase().trim();

    let items = getAllArticles();

    let results = items.filter(a => {
      let matchesQuery = true;
      if (query) {
        matchesQuery = (a.title || '').toLowerCase().includes(query) ||
                       (a.summary || '').toLowerCase().includes(query) ||
                       (a.tags || []).some(t => t.toLowerCase().includes(query));
      }
      let matchesTag = true;
      if (tag) {
        matchesTag = (a.tags || []).some(t => t.toLowerCase() === tag.toLowerCase().trim());
      }
      let matchesCategory = true;
      if (category) {
        matchesCategory = (a.category || '').toLowerCase() === category.toLowerCase().trim();
      }
      return matchesQuery && matchesTag && matchesCategory;
    });

    const total = results.length;
    const p = parseInt(page, 10) || 1;
    const ps = parseInt(pageSize, 10) || 6;
    const totalPages = Math.ceil(total / ps) || 1;
    const start = (p - 1) * ps;
    const paginated = results.slice(start, start + ps);

    return res.status(200).json({
      items: paginated,
      total,
      page: p,
      pageSize: ps,
      totalPages
    });
  } catch (err) {
    console.error('articles-search error:', err);
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
