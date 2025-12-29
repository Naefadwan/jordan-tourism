const db = require('../config/db');

const Attraction = {
    findAll: async (filters = {}) => {
        let query = "SELECT * FROM attractions WHERE 1=1";
        const conditions = [];
        const values = [];

        if (filters.approval_status) {
            conditions.push(`approval_status = $${values.length + 1}`);
            values.push(filters.approval_status);
        } else if (!filters.includePending) {
            conditions.push("approval_status = 'approved'");
        }

        if (filters.category && filters.category !== 'all') {
            conditions.push(`category = $${values.length + 1}`);
            values.push(filters.category);
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
            category: row.category,
            price: row.price,
            rating: row.rating,
            reviews: row.reviews_count,
            location: row.location,
            description: row.description,
            duration: row.duration,
            image: row.image_url || 'public/placeholder-image.jpg',
            approval_status: row.approval_status
        }));

        return mappedRows;
    },

    findById: async (id, filters = {}) => {
        let query = "SELECT * FROM attractions WHERE id = $1";
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
            category: row.category,
            price: row.price,
            rating: row.rating,
            reviews: row.reviews_count,
            location: row.location,
            description: row.description,
            duration: row.duration,
            image: row.image_url || 'public/placeholder-image.jpg',
            approval_status: row.approval_status
        };
    },

    create: async (data) => {
        const { name, category, description, location, duration, price, image_url } = data;
        const { rows } = await db.query(
            'INSERT INTO attractions (name, category, description, location, duration, price, image_url, rating, reviews_count, approval_status) VALUES ($1, $2, $3, $4, $5, $6, $7, 4.5, 0, $8) RETURNING *',
            [name, category, description, location, duration, price, image_url, data.approval_status || 'pending']
        );
        return rows[0];
    },

    update: async (id, data) => {
        const fields = [];
        const values = [];
        let index = 1;

        for (const [key, value] of Object.entries(data)) {
            const dbKey = key === 'image_url' || key === 'image' ? 'image_url' : key;
            if (value !== undefined) {
                fields.push(`${dbKey} = $${index++}`);
                values.push(value);
            }
        }

        if (fields.length === 0) return null;

        values.push(id);
        const query = `UPDATE attractions SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;

        const { rows } = await db.query(query, values);
        return rows[0];
    },

    delete: async (id) => {
        const { rows } = await db.query(
            'DELETE FROM attractions WHERE id = $1 RETURNING *',
            [id]
        );
        return rows[0];
    }
};

module.exports = Attraction;
