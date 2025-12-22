const db = require('../config/db');

const User = {
    create: async ({ fullName, email, password, role = 'user' }) => {
        const query = `
            INSERT INTO users (full_name, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, full_name, email, role;
        `;
        const values = [fullName, email, password, role];
        const { rows } = await db.query(query, values);
        return rows[0];
    },
    findByEmail: async (email) => {
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await db.query(query, [email]);
        return rows.length > 0 ? rows[0] : null;
    },
    findAll: async () => {
        const query = 'SELECT id, full_name, email, role FROM users ORDER BY id ASC';
        const { rows } = await db.query(query);
        return rows;
    },
    delete: async (id) => {
        const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
        const { rows } = await db.query(query, [id]);
        return rows.length > 0 ? rows[0] : null;
    },
    update: async (id, { fullName, email, role }) => {
        const query = `
            UPDATE users 
            SET full_name = $1, email = $2, role = $3
            WHERE id = $4
            RETURNING id, full_name, email, role;
        `;
        const values = [fullName, email, role, id];
        const { rows } = await db.query(query, values);
        return rows.length > 0 ? rows[0] : null;
    },
    findById: async (id) => {
        const query = 'SELECT id, full_name, email, role FROM users WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows.length > 0 ? rows[0] : null;
    }
};

module.exports = User;