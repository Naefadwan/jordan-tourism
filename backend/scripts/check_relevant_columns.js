const db = require('../config/db');

async function checkColumns() {
    try {
        const tables = ['accommodations', 'travel_packages', 'bookings', 'package_bookings', 'attraction_bookings'];
        for (const table of tables) {
            const { rows } = await db.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '${table}'
            `);
            console.log(`Columns for ${table}:`, rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkColumns();
