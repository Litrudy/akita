'use strict';

/* Admin API — login/session plus news CRUD and enquiry listing. */

const express = require('express');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const { pool } = require('./db');
const {
  createSession, destroySession,
  setSessionCookie, clearSessionCookie, requireAdmin
} = require('./auth');

const router = express.Router();
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/* ---------- auth ---------- */

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, error: 'too_many_attempts' }
});

router.post('/login', loginLimiter, async (req, res) => {
  const username = str((req.body || {}).username, 60);
  const password = String((req.body || {}).password || '');
  if (!username || !password) {
    return res.status(400).json({ ok: false, error: 'credentials_required' });
  }
  try {
    const [rows] = await pool.execute(
      'SELECT id, username, password_hash FROM admins WHERE username = ?', [username]);
    const admin = rows[0];
    const ok = admin && await bcrypt.compare(password, admin.password_hash);
    if (!ok) return res.status(401).json({ ok: false, error: 'invalid_credentials' });
    setSessionCookie(res, createSession(admin.username));
    res.json({ ok: true, username: admin.username });
  } catch (err) {
    console.error('[admin] login failed: %s', err.message);
    res.status(500).json({ ok: false, error: 'login_failed' });
  }
});

router.post('/logout', (req, res) => {
  destroySession(req);
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get('/me', requireAdmin, (req, res) => {
  res.json({ ok: true, username: req.admin.username });
});

/* ---------- news CRUD ---------- */

function newsPayload(body) {
  const b = body || {};
  return {
    slug: str(b.slug, 120).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, ''),
    position: Number.isFinite(Number(b.position)) ? Number(b.position) : 0,
    status: b.status === 'published' ? 'published' : 'draft',
    meta_label: str(b.meta_label, 160),
    image: str(b.image, 255),
    category_en: str(b.category_en, 120),
    category_fr: str(b.category_fr, 120),
    category_zh: str(b.category_zh, 120),
    title_en: str(b.title_en, 255),
    title_fr: str(b.title_fr, 255),
    title_zh: str(b.title_zh, 255),
    subtitle_en: str(b.subtitle_en, 255),
    subtitle_fr: str(b.subtitle_fr, 255),
    subtitle_zh: str(b.subtitle_zh, 255),
    body_en: str(b.body_en, 100000),
    body_fr: str(b.body_fr, 100000),
    body_zh: str(b.body_zh, 100000),
    facts: str(b.facts, 8000)
  };
}

router.get('/news', requireAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, slug, position, status, title_en, title_zh, updated_at, published_at
       FROM news ORDER BY position ASC, id DESC`);
    res.json({ ok: true, items: rows });
  } catch (err) {
    console.error('[admin] news list failed: %s', err.message);
    res.status(500).json({ ok: false, error: 'query_failed' });
  }
});

router.get('/news/:id', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM news WHERE id = ?', [Number(req.params.id)]);
    if (!rows[0]) return res.status(404).json({ ok: false, error: 'not_found' });
    res.json({ ok: true, item: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'query_failed' });
  }
});

router.post('/news', requireAdmin, async (req, res) => {
  const n = newsPayload(req.body);
  if (!n.slug || !n.title_en) {
    return res.status(400).json({ ok: false, error: 'slug_and_title_en_required' });
  }
  try {
    const [r] = await pool.execute(
      `INSERT INTO news (slug, position, status, meta_label, image,
         category_en, category_fr, category_zh,
         title_en, title_fr, title_zh,
         subtitle_en, subtitle_fr, subtitle_zh,
         body_en, body_fr, body_zh, facts, published_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, ${n.status === 'published' ? 'NOW()' : 'NULL'})`,
      [n.slug, n.position, n.status, n.meta_label, n.image,
       n.category_en, n.category_fr, n.category_zh,
       n.title_en, n.title_fr, n.title_zh,
       n.subtitle_en, n.subtitle_fr, n.subtitle_zh,
       n.body_en, n.body_fr, n.body_zh, n.facts]);
    res.json({ ok: true, id: r.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ ok: false, error: 'slug_exists' });
    }
    console.error('[admin] news create failed: %s', err.message);
    res.status(500).json({ ok: false, error: 'create_failed' });
  }
});

router.put('/news/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const n = newsPayload(req.body);
  if (!n.slug || !n.title_en) {
    return res.status(400).json({ ok: false, error: 'slug_and_title_en_required' });
  }
  try {
    const [r] = await pool.execute(
      `UPDATE news SET slug=?, position=?, status=?, meta_label=?, image=?,
         category_en=?, category_fr=?, category_zh=?,
         title_en=?, title_fr=?, title_zh=?,
         subtitle_en=?, subtitle_fr=?, subtitle_zh=?,
         body_en=?, body_fr=?, body_zh=?, facts=?,
         published_at = CASE
           WHEN ? = 'published' AND published_at IS NULL THEN NOW()
           WHEN ? = 'draft' THEN NULL
           ELSE published_at END
       WHERE id = ?`,
      [n.slug, n.position, n.status, n.meta_label, n.image,
       n.category_en, n.category_fr, n.category_zh,
       n.title_en, n.title_fr, n.title_zh,
       n.subtitle_en, n.subtitle_fr, n.subtitle_zh,
       n.body_en, n.body_fr, n.body_zh, n.facts,
       n.status, n.status, id]);
    if (!r.affectedRows) return res.status(404).json({ ok: false, error: 'not_found' });
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ ok: false, error: 'slug_exists' });
    }
    console.error('[admin] news update failed: %s', err.message);
    res.status(500).json({ ok: false, error: 'update_failed' });
  }
});

router.delete('/news/:id', requireAdmin, async (req, res) => {
  try {
    const [r] = await pool.execute('DELETE FROM news WHERE id = ?', [Number(req.params.id)]);
    if (!r.affectedRows) return res.status(404).json({ ok: false, error: 'not_found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'delete_failed' });
  }
});

/* ---------- enquiries (read-only) ---------- */

router.get('/enquiries', requireAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, kind, name, company, email, phone, origin, destination,
              service, reference, message, lang, email_sent, created_at
       FROM enquiries ORDER BY id DESC LIMIT 200`);
    res.json({ ok: true, items: rows });
  } catch (err) {
    console.error('[admin] enquiries list failed: %s', err.message);
    res.status(500).json({ ok: false, error: 'query_failed' });
  }
});

module.exports = router;
