const db = require('../config/db');

const User = {
    create: async ({ fullName, email, password }) => {
        const query = `
            INSERT INTO users (full_name, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, full_name, email;
        `;
        const values = [fullName, email, password];
        const { rows } = await db.query(query, values);
        return rows[0];
    },
    findByEmail: async (email) => {
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await db.query(query, [email]);
        return rows.length > 0 ? rows[0] : null;
    },
};

module.exports = User;