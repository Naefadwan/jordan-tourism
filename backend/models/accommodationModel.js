const db = require('../config/db');

const Accommodation = {
    findAll: async (filters = {}) => {
        let query = 'SELECT * FROM accommodations';
        const conditions = [];
        const values = [];

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
            query += ' WHERE ' + conditions.join(' AND ');
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
            mainImage: row.main_image_url || 'public/placeholder-image.jpg'
        }));
        return mappedRows;
    },

    findById: async (id) => {
        const { rows } = await db.query('SELECT * FROM accommodations WHERE id = $1', [id]);
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
            mainImage: row.main_image_url || 'public/placeholder-image.jpg'
        };
    },

    create: async (data) => {
        const { name, type, location, description, main_image_url, price, from_price } = data;
        const { rows } = await db.query(
            'INSERT INTO accommodations (name, type, location, description, main_image_url, price, from_price) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, type, location, description, main_image_url, price || 0, from_price || price || 0]
        );
        return rows[0];
    },

    update: async (id, data) => {
        const { name, type, location, description, main_image_url, price, from_price } = data;
        const { rows } = await db.query(
            'UPDATE accommodations SET name = $1, type = $2, location = $3, description = $4, main_image_url = COALESCE($5, main_image_url), price = $6, from_price = $7 WHERE id = $8 RETURNING *',
            [name, type, location, description, main_image_url, price || 0, from_price || price || 0, id]
        );
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