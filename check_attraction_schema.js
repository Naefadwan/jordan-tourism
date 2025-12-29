const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'backend/.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function checkSchema() {
    try {
        await client.connect();

        console.log("--- Attractions Table Columns ---");
        const resAtt = await client.query(`
            SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns
            WHERE table_name = 'attractions'
            ORDER BY ordinal_position;
        `);
        console.log(JSON.stringify(resAtt.rows, null, 2));

        console.log("\n--- Sample Attraction IDs ---");
        const resIds = await client.query("SELECT id FROM attractions LIMIT 5;");
        console.log(JSON.stringify(resIds.rows, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkSchema();
