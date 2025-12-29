const db = require('../config/db');

const OTP = {
    async create(email, otp, purpose) {
        // Expiration in 10 minutes
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const query = `
            INSERT INTO otp_verifications (email, otp, purpose, expires_at)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [email, otp, purpose, expiresAt];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    async verify(email, otp, purpose) {
        const query = `
            SELECT * FROM otp_verifications
            WHERE email = $1 AND otp = $2 AND purpose = $3 AND expires_at > CURRENT_TIMESTAMP
            ORDER BY created_at DESC
            LIMIT 1;
        `;
        const { rows } = await db.query(query, [email, otp, purpose]);
        return rows.length > 0;
    },

    async deleteByEmail(email, purpose) {
        const query = 'DELETE FROM otp_verifications WHERE email = $1 AND purpose = $2';
        await db.query(query, [email, purpose]);
    }
};

module.exports = OTP;
