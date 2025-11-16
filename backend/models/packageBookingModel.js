const db = require('../config/db');

const PackageBooking = {
    async findByUserId(userId) {
        const { rows } = await db.query(
            `SELECT pb.*,
              p.name AS package_name,
              p.image_url AS package_image
       FROM package_bookings pb
       JOIN travel_packages p ON pb.package_id = p.id
       WHERE pb.user_id = $1
       ORDER BY pb.created_at DESC`,
            [userId]
        );
        return rows;
    },

    async create({
        booking_reference,
        user_id,
        package_id,
        start_date,
        end_date,
        guests,
        total_price,
        payment_intent_id
    }) {
        const { rows } = await db.query(
            `INSERT INTO package_bookings
       (booking_reference, user_id, package_id, start_date, end_date,
        guests, total_price, payment_intent_id, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'confirmed')
       RETURNING *`,
            [
                booking_reference,
                user_id,
                package_id,
                start_date,
                end_date,
                guests,
                total_price,
                payment_intent_id
            ]
        );
        return rows[0];
    }
};

module.exports = PackageBooking;
