const { Pool } = require('pg');
require('dotenv').config({ path: '../backend/.env' }); // Adjust path to .env if needed

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function migrate() {
    try {
        console.log('Starting schema update...');

        // Check if column exists
        const checkQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='role';
        `;
        const { rows } = await pool.query(checkQuery);

        if (rows.length === 0) {
            console.log('Adding role column to users table...');
            await pool.query(`
                ALTER TABLE users 
                ADD COLUMN role VARCHAR(50) DEFAULT 'user';
            `);
            console.log('Column added successfully.');
        } else {
            console.log('Role column already exists. Skipping.');
        }

        // Optional: Set a specific user as admin for testing if needed
        // await pool.query("UPDATE users SET role = 'admin' WHERE email = 'admin@example.com'");

        console.log('Migration complete.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
