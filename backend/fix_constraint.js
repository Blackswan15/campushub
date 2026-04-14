const pool = require('./config/db');

async function fix() {
  try {
    await pool.query('ALTER TABLE registrations DROP INDEX unique_registration');
    console.log('Dropped unique_registration');
  } catch (err) { console.error(err.message); }

  try {
    await pool.query('ALTER TABLE registrations DROP INDEX unique_sub_reg');
    console.log('Dropped unique_sub_reg');
  } catch (err) { console.error(err.message); }

  try {
    await pool.query('ALTER TABLE registrations DROP INDEX unique_registration_sub_event');
    console.log('Dropped unique_registration_sub_event');
  } catch (err) { console.error(err.message); }

  try {
    await pool.query('ALTER TABLE registrations ADD UNIQUE KEY unique_registration (user_id, sub_event_id)');
    console.log('Added unique_registration (user_id, sub_event_id)');
  } catch (err) { console.error(err.message); }

  process.exit();
}
fix();
