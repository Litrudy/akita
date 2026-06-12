'use strict';

/* Minimal in-memory session store for the single-admin panel.
   Sessions are lost on restart — admins simply log in again. */

const crypto = require('crypto');

const COOKIE = 'akita_admin';
const TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

const sessions = new Map(); // token -> { username, expires }

function parseCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach(part => {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

function createSession(username) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { username, expires: Date.now() + TTL_MS });
  return token;
}

function getSession(req) {
  const token = parseCookies(req)[COOKIE];
  if (!token) return null;
  const s = sessions.get(token);
  if (!s) return null;
  if (s.expires < Date.now()) { sessions.delete(token); return null; }
  return { token, username: s.username };
}

function destroySession(req) {
  const token = parseCookies(req)[COOKIE];
  if (token) sessions.delete(token);
}

/* NOTE: add "; Secure" once the site runs behind HTTPS on the server. */
function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie',
    `${COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${TTL_MS / 1000}`);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`);
}

function requireAdmin(req, res, next) {
  const s = getSession(req);
  if (!s) return res.status(401).json({ ok: false, error: 'unauthorized' });
  req.admin = s;
  next();
}

module.exports = {
  createSession, getSession, destroySession,
  setSessionCookie, clearSessionCookie, requireAdmin
};
