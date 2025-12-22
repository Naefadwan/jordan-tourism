const db = require('../config/db');

async function addTicketDateColumn() {
    try {
        console.log('Adding ticket_date column to package_bookings...');
        await db.query(`
            ALTER TABLE package_bookings 
            ADD COLUMN ticket_date DATE;
        `);
        console.log('Column ticket_date added successfully.');
    } catch (err) {
        if (err.code === '42701') { // duplicate_column
            console.log('Column ticket_date already exists.');
        } else {
            console.error('Error adding column:', err);
        }
    } finally {
        process.exit();
    }
}

addTicketDateColumn();
