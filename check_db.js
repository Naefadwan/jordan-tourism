const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function check() {
    try {
        const tables = ['accommodations', 'packages', 'bookings'];
        for (const table of tables) {
            console.log(`Checking ${table} table columns...`);
            const { rows: columns } = await pool.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = '${table}'
            `);
            console.log(`Columns for ${table}:`, columns.map(c => c.column_name).join(', '));
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

check();
