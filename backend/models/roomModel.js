const db = require('../config/db');

const Room = {
    findByAccommodationId: async (accommodationId) => {
        const { rows } = await db.query('SELECT * FROM rooms WHERE accommodation_id = $1', [accommodationId]);
        return rows.map(row => ({
            id: row.id,
            accommodationId: row.accommodation_id,
            roomType: row.room_type,
            description: row.description,
            pricePerNight: parseFloat(row.price_per_night),
            maxGuests: row.max_guests
        }));
    },

    findById: async (id) => {
        const { rows } = await db.query('SELECT * FROM rooms WHERE id = $1', [id]);
        if (rows.length === 0) return null;
        return { ...rows[0], price_per_night: parseFloat(rows[0].price_per_night) };
    },
};

module.exports = Room;