const db = require('../config/db');

async function checkSchema() {
    try {
        const { rows } = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'accommodations'
            ORDER BY ordinal_position;
        `);
        console.log('Columns in accommodations table:');
        rows.forEach(row => {
            console.log(`  - ${row.column_name} (${row.data_type})`);
        });
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

checkSchema();
