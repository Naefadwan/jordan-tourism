const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function updateSchema() {
    try {
        console.log('Checking accommodations table columns...');
        const { rows: columns } = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'accommodations'
        `);
        console.log('Current columns:', columns.map(c => c.column_name));

        if (!columns.some(c => c.column_name === 'price')) {
            console.log('Adding price column to accommodations...');
            await pool.query('ALTER TABLE accommodations ADD COLUMN price DECIMAL(10, 2) DEFAULT 0');
        }

        if (!columns.some(c => c.column_name === 'from_price')) {
            // Some newer code might use from_price to match packages
            console.log('Adding from_price column to accommodations...');
            await pool.query('ALTER TABLE accommodations ADD COLUMN from_price DECIMAL(10, 2) DEFAULT 0');
        }

        console.log('Checking travel_packages table for ticket fields...');
        const { rows: pkgColumns } = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'travel_packages'
        `);
        console.log('Current travel_packages columns:', pkgColumns.map(c => c.column_name));

        if (!pkgColumns.some(c => c.column_name === 'has_ticket')) {
            console.log('Adding has_ticket and ticket_price to travel_packages...');
            await pool.query('ALTER TABLE travel_packages ADD COLUMN has_ticket BOOLEAN DEFAULT FALSE');
            await pool.query('ALTER TABLE travel_packages ADD COLUMN ticket_price DECIMAL(10, 2) DEFAULT 0');
        }

        console.log('Checking package_bookings table for ticket field...');
        const { rows: bookingColumns } = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'package_bookings'
        `);
        console.log('Current package_bookings columns:', bookingColumns.map(c => c.column_name));

        if (!bookingColumns.some(c => c.column_name === 'has_ticket')) {
            console.log('Adding has_ticket to package_bookings...');
            await pool.query('ALTER TABLE package_bookings ADD COLUMN has_ticket BOOLEAN DEFAULT FALSE');
        }

        console.log('Schema update complete.');
    } catch (err) {
        console.error('Error updating schema:', err);
    } finally {
        await pool.end();
    }
}

updateSchema();
