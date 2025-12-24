const db = require('../config/db');

async function addPriceColumns() {
    try {
        console.log('Adding price and from_price columns to accommodations table...');

        // Add price column
        await db.query(`
            ALTER TABLE accommodations 
            ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT 0;
        `);
        console.log('✓ Added price column');

        // Add from_price column
        await db.query(`
            ALTER TABLE accommodations 
            ADD COLUMN IF NOT EXISTS from_price DECIMAL(10, 2) DEFAULT 0;
        `);
        console.log('✓ Added from_price column');

        // Verify the changes
        const { rows } = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'accommodations'
            ORDER BY ordinal_position;
        `);

        console.log('\nUpdated accommodations table schema:');
        rows.forEach(row => {
            console.log(`  - ${row.column_name} (${row.data_type})`);
        });

        console.log('\n✅ Migration completed successfully!');
    } catch (err) {
        console.error('❌ Error during migration:', err);
    } finally {
        process.exit();
    }
}

addPriceColumns();
