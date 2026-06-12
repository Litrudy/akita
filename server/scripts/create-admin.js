'use strict';

/* Create or reset an admin account.
   Usage: node scripts/create-admin.js <username> <password>  */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function main() {
  const [username, password] = process.argv.slice(2);
  if (!username || !password) {
    console.error('Usage: node scripts/create-admin.js <username> <password>');
    process.exit(1);
  }
  if (password.length < 10) {
    console.error('Refusing: password must be at least 10 characters.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  await conn.execute(
    `INSERT INTO admins (username, password_hash) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
    [username, hash]);
  await conn.end();
  console.log(`OK — admin "${username}" created/updated.`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
