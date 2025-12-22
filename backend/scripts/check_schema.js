const db = require('../config/db');

async function checkSchema() {
    try {
        const { rows } = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'package_bookings';
        `);
        console.log('Columns in package_bookings:', rows.map(r => r.column_name));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkSchema();
