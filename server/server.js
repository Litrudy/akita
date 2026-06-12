'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { pool, ping } = require('./db');
const { sendEnquiryMail } = require('./mailer');

const app = express();
const PORT = Number(process.env.PORT || 3000);

if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '64kb' }));

/* CORS: explicit allow-list in production (ALLOWED_ORIGINS), permissive in dev */
const allowed = (process.env.ALLOWED_ORIGINS || '')
  .split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: allowed.length ? allowed : true,
  methods: ['GET', 'POST'],
  maxAge: 86400
}));

/* rate limit the API: 10 submissions / 10 minutes / IP */
app.use('/api/', rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, error: 'too_many_requests' }
}));

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

app.get('/api/health', async (_req, res) => {
  let db = false;
  try { db = await ping(); } catch { /* db down — report it, stay up */ }
  res.json({ ok: true, db });
});

app.post('/api/enquiry', async (req, res) => {
  const b = req.body || {};

  /* honeypot: bots fill the invisible "website" field — pretend success */
  if (str(b.website, 200)) return res.json({ ok: true });

  const e = {
    kind: b.kind === 'tracking' ? 'tracking' : 'quote',
    name: str(b.name, 120),
    company: str(b.company, 160),
    email: str(b.email, 190),
    phone: str(b.phone, 60),
    origin: str(b.origin, 160),
    destination: str(b.destination, 160),
    service: str(b.service, 120),
    reference: str(b.reference, 160),
    message: str(b.message, 5000),
    lang: ['en', 'fr', 'zh'].includes(b.lang) ? b.lang : 'en',
    ip: str(req.ip, 64),
    user_agent: str(req.get('user-agent') || '', 255)
  };

  if (e.kind === 'quote') {
    if (!e.name || !EMAIL_RE.test(e.email)) {
      return res.status(400).json({ ok: false, error: 'name_and_valid_email_required' });
    }
  } else if (!e.reference) {
    return res.status(400).json({ ok: false, error: 'reference_required' });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO enquiries
         (kind, name, company, email, phone, origin, destination, service, reference, message, lang, ip, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [e.kind, e.name, e.company, e.email, e.phone, e.origin, e.destination,
       e.service, e.reference, e.message, e.lang, e.ip, e.user_agent]
    );
    e.id = result.insertId;
  } catch (err) {
    console.error('[db] insert failed: %s', err.message);
    return res.status(500).json({ ok: false, error: 'storage_failed' });
  }

  const sent = await sendEnquiryMail(e);
  if (sent) {
    pool.execute('UPDATE enquiries SET email_sent = 1 WHERE id = ?', [e.id])
      .catch(err => console.error('[db] flag update failed: %s', err.message));
  }

  res.json({ ok: true, id: e.id, mailed: sent });
});

app.use((_req, res) => res.status(404).json({ ok: false, error: 'not_found' }));

app.listen(PORT, () => {
  console.log(`Akita server listening on http://localhost:${PORT}`);
});
