'use strict';

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'akita_app',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'akita',
  waitForConnections: true,
  connectionLimit: 5,
  charset: 'utf8mb4_unicode_ci'
});

async function ping() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
    return true;
  } finally {
    conn.release();
  }
}

module.exports = { pool, ping };
