const db = require('../config/db');

const Accommodation = {
    findAll: async (filters = {}) => {
        let query = "SELECT * FROM accommodations WHERE 1=1";
        const conditions = [];
        const values = [];

        // Filter by user_id (for company users to see only their own content)
        if (filters.user_id) {
            conditions.push(`user_id = $${values.length + 1}`);
            values.push(filters.user_id);
        }

        if (filters.approval_status) {
            conditions.push(`approval_status = $${values.length + 1}`);
            values.push(filters.approval_status);
        } else if (!filters.includePending) {
            conditions.push("approval_status = 'approved'");
        }

        if (filters.type && filters.type !== 'all') {
            conditions.push(`type = $${values.length + 1}`);
            values.push(filters.type);
        }

        if (filters.search && filters.search.trim() !== '') {
            const searchParam = `%${filters.search.trim()}%`;
            conditions.push(
                `(COALESCE(name, '') ILIKE $${values.length + 1} 
          OR COALESCE(location, '') ILIKE $${values.length + 1})`
            );
            values.push(searchParam);
        }

        if (conditions.length > 0) {
            query += ' AND ' + conditions.join(' AND ');
        }

        const { rows } = await db.query(query, values);

        const mappedRows = rows.map(row => ({
            id: row.id,
            name: row.name,
            type: row.type,
            location: row.location,
            description: row.description,
            price: parseFloat(row.price || 0),
            fromPrice: parseFloat(row.from_price || row.price || 0),
            mainImage: row.main_image_url || 'public/placeholder-image.jpg',
            approval_status: row.approval_status
        }));
        return mappedRows;
    },

    findById: async (id, filters = {}) => {
        let query = "SELECT * FROM accommodations WHERE id = $1";
        const values = [id];

        if (filters.approval_status) {
            values.push(filters.approval_status);
            query += ` AND approval_status = $${values.length}`;
        } else if (!filters.includePending) {
            query += " AND approval_status = 'approved'";
        }

        const { rows } = await db.query(query, values);
        if (rows.length === 0) return null;
        const row = rows[0];
        return {
            id: row.id,
            name: row.name,
            type: row.type,
            location: row.location,
            description: row.description,
            price: parseFloat(row.price || 0),
            fromPrice: parseFloat(row.from_price || row.price || 0),
            mainImage: row.main_image_url || 'public/placeholder-image.jpg',
            approval_status: row.approval_status
        };
    },

    create: async (data) => {
        const { name, type, location, description, main_image_url, price, from_price, user_id } = data;
        const { rows } = await db.query(
            'INSERT INTO accommodations (name, type, location, description, main_image_url, price, from_price, approval_status, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [name, type, location, description, main_image_url, price || 0, from_price || price || 0, data.approval_status || 'pending', user_id]
        );
        return rows[0];
    },

    update: async (id, data) => {
        const fields = [];
        const values = [];
        let index = 1;

        for (const [key, value] of Object.entries(data)) {
            const dbKey = key === 'main_image_url' || key === 'imageUrl' ? 'main_image_url' : key;
            if (value !== undefined) {
                fields.push(`${dbKey} = $${index++}`);
                values.push(value);
            }
        }

        if (fields.length === 0) return null;

        values.push(id);
        const query = `UPDATE accommodations SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    delete: async (id) => {
        const { rows } = await db.query(
            'DELETE FROM accommodations WHERE id = $1 RETURNING *',
            [id]
        );
        return rows[0];
    }
};

module.exports = Accommodation;