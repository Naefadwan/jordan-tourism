const db = require('../config/db');

const AttractionBooking = {
    create: async (data) => {
        const {
            booking_reference,
            user_id,
            attraction_id,
            booking_date,
            num_guests,
            total_price,
            payment_intent_id
        } = data;

        const query = `
            INSERT INTO attraction_bookings (
                booking_reference, user_id, attraction_id, booking_date, 
                num_guests, total_price, payment_intent_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;

        const values = [
            booking_reference, user_id, attraction_id, booking_date,
            num_guests, total_price, payment_intent_id
        ];

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    findByUserId: async (userId) => {
        const query = `
            SELECT 
                b.*, 
                a.name as attraction_name, 
                a.image_url as attraction_image,
                a.location as attraction_location
            FROM attraction_bookings b
            LEFT JOIN attractions a ON b.attraction_id = a.id
            WHERE b.user_id = $1
            ORDER BY b.booking_date DESC;
        `;
        const { rows } = await db.query(query, [userId]);
        return rows;
    },

    findById: async (id) => {
        const query = 'SELECT * FROM attraction_bookings WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }
};

module.exports = AttractionBooking;
