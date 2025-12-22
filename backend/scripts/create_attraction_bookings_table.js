require('dotenv').config({ path: './backend/.env' });
const db = require('../config/db');

async function createAttractionBookingsTable() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS attraction_bookings (
                id SERIAL PRIMARY KEY,
                booking_reference VARCHAR(50) UNIQUE NOT NULL,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                attraction_id VARCHAR REFERENCES attractions(id) ON DELETE SET NULL,
                booking_date DATE NOT NULL,
                num_guests INTEGER NOT NULL,
                total_price DECIMAL(10, 2) NOT NULL,
                status VARCHAR(20) DEFAULT 'confirmed',
                payment_intent_id VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('attraction_bookings table created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error creating table:', error);
        process.exit(1);
    }
}

createAttractionBookingsTable();
