const db = require('../config/db');
const path = require('path');
// Ensure dotenv is loaded if db.js doesn't load it for us (it likely does if we run from backend root)
// But db.js has require('dotenv').config() at the top.

async function addColumn() {
    try {
        console.log('Checking bookings table for payment_intent_id...');

        // We can't use db.query directly for schema info maybe? 
        // Yes we can, it's just SQL.

        const { rows: columns } = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'bookings' AND column_name = 'payment_intent_id'
        `);

        if (columns.length === 0) {
            console.log('Adding payment_intent_id column to bookings table...');
            await db.query('ALTER TABLE bookings ADD COLUMN payment_intent_id VARCHAR(255)');
            console.log('Column added successfully.');
        } else {
            console.log('Column payment_intent_id already exists.');
        }
    } catch (err) {
        console.error('Error updating schema:', err);
    } finally {
        // We can't easily close the pool from here since db.js doesn't export it, 
        // but the process will exit anyway.
        // Actually, node process might hang if pool is open.
        // But for a one-off script, we can force exit.
        console.log('Done.');
        process.exit(0);
    }
}

addColumn();
