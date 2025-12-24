require('dotenv').config({ path: './backend/.env' });
const db = require('./backend/config/db');

async function checkBookings() {
    try {
        const { rows } = await db.query(`
      SELECT b.id, b.booking_reference, a.name as acc_name, a.main_image_url as acc_img
      FROM bookings b
      LEFT JOIN accommodations a ON b.accommodation_id = a.id
      LIMIT 10;
    `);
        console.log('Recent bookings with joined data:');
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkBookings();
