'use strict';

/* Public news API — read-only, published items only. */

const express = require('express');
const { pool } = require('./db');

const router = express.Router();

const NEWS_FIELDS = `id, slug, position, meta_label,
  category_en, category_fr, category_zh,
  title_en, title_fr, title_zh,
  subtitle_en, subtitle_fr, subtitle_zh,
  body_en, body_fr, body_zh, facts, published_at`;

/* facts text -> array; one line per fact:
   value_en | value_fr | value_zh | label_en | label_fr | label_zh */
function parseFacts(text) {
  if (!text) return [];
  return text.split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const p = line.split('|').map(s => s.trim());
      return {
        value_en: p[0] || '', value_fr: p[1] || '', value_zh: p[2] || '',
        label_en: p[3] || '', label_fr: p[4] || '', label_zh: p[5] || ''
      };
    });
}

function shape(row) {
  return Object.assign({}, row, { facts: parseFacts(row.facts) });
}

router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ${NEWS_FIELDS} FROM news
       WHERE status = 'published'
       ORDER BY position ASC, id DESC`
    );
    res.json({ ok: true, items: rows.map(shape) });
  } catch (err) {
    console.error('[news] list failed: %s', err.message);
    res.status(500).json({ ok: false, error: 'query_failed' });
  }
});

module.exports = router;
