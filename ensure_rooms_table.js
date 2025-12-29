const db = require('./backend/config/db');

async function createRoomsTable() {
    try {
        console.log('Checking/Creating rooms table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS rooms (
                id SERIAL PRIMARY KEY,
                accommodation_id INTEGER REFERENCES accommodations(id) ON DELETE CASCADE,
                room_type VARCHAR(255) NOT NULL,
                description TEXT,
                price_per_night DECIMAL(10, 2) NOT NULL,
                max_guests INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Rooms table is ready.');
    } catch (err) {
        console.error('Error creating rooms table:', err);
    } finally {
        process.exit();
    }
}

createRoomsTable();
