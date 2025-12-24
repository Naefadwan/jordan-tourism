const db = require('./backend/config/db');
require('dotenv').config({ path: './backend/.env' });

async function check() {
    try {
        const tables = ['accommodations', 'packages', 'bookings', 'users'];
        for (const table of tables) {
            const { rows } = await db.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '${table}'
            `);
            console.log(`Columns for ${table}:`, rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}
check();
