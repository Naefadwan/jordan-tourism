const { Pool } = require('pg');
const path = require('path');
// Try loading from explicit path
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('Current directory:', process.cwd());
console.log('DATABASE_URL loaded:', !!process.env.DATABASE_URL);
console.log('DB_SSL value:', process.env.DB_SSL);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function checkColumns() {
    try {
        console.log('Checking users table columns...');
        const { rows: columns } = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);
        console.log('Columns:', columns.map(c => c.column_name).join(', '));
    } catch (err) {
        console.error('Error checking columns:', err.message);
    } finally {
        await pool.end();
    }
}

checkColumns();
