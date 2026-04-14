const pool = require('./config/db');

async function run() {
  try {
    await pool.query('ALTER TABLE departments ADD COLUMN image_url VARCHAR(500) DEFAULT NULL');
    console.log('Added image_url to departments');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') console.log('image_url already exists in departments');
    else console.error(err);
  }

  try {
    await pool.query('ALTER TABLE clubs ADD COLUMN image_url VARCHAR(500) DEFAULT NULL');
    console.log('Added image_url to clubs');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') console.log('image_url already exists in clubs');
    else console.error(err);
  }

  process.exit(0);
}

run();
