const db = require('../config/db');

const User = {
    create: async ({ fullName, email, password, role = 'user', companyName, businessLicense, phone, address, accountStatus = 'approved' }) => {
        const query = `
            INSERT INTO users (full_name, email, password_hash, role, company_name, business_license, phone, address, account_status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, full_name, email, role, company_name, business_license, phone, address, account_status;
        `;
        const values = [fullName, email, password, role, companyName || null, businessLicense || null, phone || null, address || null, accountStatus];
        const { rows } = await db.query(query, values);
        return rows[0];
    },
    findByEmail: async (email) => {
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await db.query(query, [email]);
        return rows.length > 0 ? rows[0] : null;
    },
    findAll: async (filters = {}) => {
        let query = 'SELECT id, full_name, email, role, company_name, business_license, phone, address, account_status, created_at FROM users WHERE 1=1';
        const values = [];

        if (filters.role) {
            values.push(filters.role);
            query += ` AND role = $${values.length}`;
        }

        if (filters.accountStatus) {
            values.push(filters.accountStatus);
            query += ` AND account_status = $${values.length}`;
        }

        query += ' ORDER BY id ASC';
        const { rows } = await db.query(query, values);
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
        const query = 'SELECT id, full_name, email, role, company_name, business_license, phone, address, account_status FROM users WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows.length > 0 ? rows[0] : null;
    },
    updateAccountStatus: async (id, status) => {
        const query = `
            UPDATE users 
            SET account_status = $1
            WHERE id = $2
            RETURNING id, full_name, email, role, company_name, business_license, phone, address, account_status;
        `;
        const values = [status, id];
        const { rows } = await db.query(query, values);
        return rows.length > 0 ? rows[0] : null;
    }
};

module.exports = User;