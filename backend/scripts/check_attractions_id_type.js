require('dotenv').config({ path: './backend/.env' });
const db = require('../config/db');

async function checkAttractionsSchema() {
    try {
        const { rows } = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'attractions' AND column_name = 'id';
        `);
        console.log('Attractions ID type:', rows);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAttractionsSchema();
