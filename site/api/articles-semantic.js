/**
 * /api/articles-semantic.js
 * Vercel Serverless Function: Articles Autocomplete & Semantic Suggestions
 */

import articlesData from '../site/data/articles-feed.json' assert { type: 'json' };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { q = '' } = req.query || {};
  const query = q.toLowerCase().trim();

  if (!query) {
    return res.status(200).json([]);
  }

  const matches = articlesData
    .filter(a => (a.title || '').toLowerCase().includes(query) || (a.tags || []).some(t => t.toLowerCase().includes(query)))
    .slice(0, 5)
    .map(a => ({
      title: a.title,
      slug: a.slug,
      tags: a.tags
    }));

  return res.status(200).json(matches);
}
