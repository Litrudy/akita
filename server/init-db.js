'use strict';

/* One-off database initialisation: runs schema.sql against the configured
   MySQL server. Usage:  npm run db:init  */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'akita_app',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    await conn.query(sql);
    const [rows] = await conn.query(
      "SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = ? AND table_name = 'enquiries'",
      [process.env.DB_NAME || 'akita']
    );
    console.log(rows[0].n === 1
      ? 'OK — database "akita" ready, table "enquiries" exists.'
      : 'Schema executed, but table check failed — inspect manually.');
  } catch (err) {
    if (err.code === 'ER_DBACCESS_DENIED_ERROR' || err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied: %s', err.message);
      console.error('If the app account cannot create databases, run schema.sql once as root:');
      console.error('  mysql -u root -p < schema.sql');
      console.error('and grant the app account:  GRANT ALL ON akita.* TO \'akita_app\'@\'localhost\';');
    } else {
      console.error('Init failed:', err.message);
    }
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

main();
