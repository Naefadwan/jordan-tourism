const db = require('../config/db');

async function updateSchema() {
    try {
        console.log('Checking travel_packages table for ticket fields...');
        const { rows: pkgColumns } = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'travel_packages'
        `);

        if (!pkgColumns.some(c => c.column_name === 'has_ticket')) {
            console.log('Adding has_ticket to travel_packages...');
            await db.query('ALTER TABLE travel_packages ADD COLUMN has_ticket BOOLEAN DEFAULT FALSE');
        }
        if (!pkgColumns.some(c => c.column_name === 'ticket_price')) {
            console.log('Adding ticket_price to travel_packages...');
            await db.query('ALTER TABLE travel_packages ADD COLUMN ticket_price DECIMAL(10, 2) DEFAULT 0');
        }

        console.log('Checking package_bookings table for ticket field...');
        const { rows: bookingColumns } = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'package_bookings'
        `);

        if (!bookingColumns.some(c => c.column_name === 'has_ticket')) {
            console.log('Adding has_ticket to package_bookings...');
            await db.query('ALTER TABLE package_bookings ADD COLUMN has_ticket BOOLEAN DEFAULT FALSE');
        }

        console.log('Schema update complete.');
    } catch (err) {
        console.error('Error updating schema:', err);
    } finally {
        console.log('Done.');
        process.exit(0);
    }
}

updateSchema();
