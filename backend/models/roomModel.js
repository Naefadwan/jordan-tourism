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
        return { ...rows[0], pricePerNight: parseFloat(rows[0].price_per_night) };
    },

    create: async (data) => {
        const { accommodationId, roomType, description, pricePerNight, maxGuests } = data;
        const { rows } = await db.query(
            'INSERT INTO rooms (accommodation_id, room_type, description, price_per_night, max_guests) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [accommodationId, roomType, description, pricePerNight, maxGuests]
        );
        return rows[0];
    },

    update: async (id, data) => {
        const fields = [];
        const values = [];
        let index = 1;

        const mapping = {
            accommodationId: 'accommodation_id',
            roomType: 'room_type',
            description: 'description',
            pricePerNight: 'price_per_night',
            maxGuests: 'max_guests'
        };

        for (const [key, value] of Object.entries(data)) {
            const dbKey = mapping[key] || key;
            if (value !== undefined) {
                fields.push(`${dbKey} = $${index++}`);
                values.push(value);
            }
        }

        if (fields.length === 0) return null;

        values.push(id);
        const query = `UPDATE rooms SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    delete: async (id) => {
        const { rows } = await db.query('DELETE FROM rooms WHERE id = $1 RETURNING *', [id]);
        return rows[0];
    }
};

module.exports = Room;