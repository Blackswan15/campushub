const pool = require('./config/db');

async function check() {
  const [rows] = await pool.query('SHOW CREATE TABLE registrations');
  console.log(rows[0]['Create Table']);
  process.exit();
}

check();
