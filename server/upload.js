'use strict';

/* Admin image upload: multipart in memory -> sharp (resize + recompress)
   -> uploads/news/YYYY/MM/<random>.webp on disk. Returns the public path. */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { requireAdmin } = require('./auth');

const router = express.Router();

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');
const MAX_BYTES = 8 * 1024 * 1024;          // 8 MB raw upload cap
const MAX_W = 1600;                          // downscale wider images
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.has(file.mimetype)) return cb(null, true);
    cb(Object.assign(new Error('unsupported_type'), { code: 'UNSUPPORTED_TYPE' }));
  }
}).single('image');

router.post('/upload', requireAdmin, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      const code = err.code === 'LIMIT_FILE_SIZE' ? 'file_too_large'
        : err.code === 'UNSUPPORTED_TYPE' ? 'unsupported_type' : 'upload_failed';
      return res.status(400).json({ ok: false, error: code });
    }
    if (!req.file) return res.status(400).json({ ok: false, error: 'no_file' });

    try {
      const now = new Date();
      const yyyy = String(now.getFullYear());
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dir = path.join(UPLOAD_ROOT, 'news', yyyy, mm);
      fs.mkdirSync(dir, { recursive: true });

      const name = crypto.randomBytes(8).toString('hex') + '.webp';
      const abs = path.join(dir, name);

      await sharp(req.file.buffer)
        .rotate()                                   // honour EXIF orientation
        .resize({ width: MAX_W, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(abs);

      const url = `/uploads/news/${yyyy}/${mm}/${name}`;
      res.json({ ok: true, url });
    } catch (e) {
      console.error('[upload] processing failed: %s', e.message);
      res.status(500).json({ ok: false, error: 'processing_failed' });
    }
  });
});

module.exports = router;
