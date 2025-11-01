const db = require('../config/db');

const Booking = {
    findByUserId: async (userId) => {
        const query = `
            SELECT
                b.id,
                b.booking_reference,
                b.check_in_date,
                b.check_out_date,
                b.total_price,
                b.status,
                a.name as accommodation_name,
                a.main_image_url as accommodation_image
            FROM bookings b
            JOIN accommodations a ON b.accommodation_id = a.id
            WHERE b.user_id = $1
            ORDER BY b.check_in_date DESC;
        `;
        const { rows } = await db.query(query, [userId]);
        return rows;
    },

    create: async (bookingData) => {
        const { booking_reference, user_id, accommodation_id, room_id, check_in_date, check_out_date, num_guests, base_price, fees_and_taxes, total_price, special_requests } = bookingData;
        const query = `
            INSERT INTO bookings (booking_reference, user_id, accommodation_id, room_id, check_in_date, check_out_date, num_guests, base_price, fees_and_taxes, total_price, special_requests, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'confirmed')
            RETURNING id, booking_reference, total_price;
        `;
        const values = [booking_reference, user_id, accommodation_id, room_id, check_in_date, check_out_date, num_guests, base_price, fees_and_taxes, total_price, special_requests];

        const { rows } = await db.query(query, values);
        return rows[0];
    },
};

module.exports = Booking;