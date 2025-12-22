const db = require('../config/db');

const Attraction = {
    findAll: async (filters = {}) => {
        let query = 'SELECT * FROM attractions';
        const conditions = [];
        const values = [];

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
            query += ' WHERE ' + conditions.join(' AND ');
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
            image: row.image_url || 'public/placeholder-image.jpg'
        }));

        return mappedRows;
    },

    findById: async (id) => {
        const { rows } = await db.query('SELECT * FROM attractions WHERE id = $1', [id]);
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
            image: row.image_url || 'public/placeholder-image.jpg'
        };
    },

    create: async (data) => {
        const { name, category, description, location, duration, price, image_url } = data;
        const { rows } = await db.query(
            'INSERT INTO attractions (name, category, description, location, duration, price, image_url, rating, reviews_count) VALUES ($1, $2, $3, $4, $5, $6, $7, 4.5, 0) RETURNING *',
            [name, category, description, location, duration, price, image_url]
        );
        return rows[0];
    },

    update: async (id, data) => {
        const { name, category, description, location, duration, price, image_url } = data;
        const { rows } = await db.query(
            'UPDATE attractions SET name = $1, category = $2, description = $3, location = $4, duration = $5, price = $6, image_url = COALESCE($7, image_url) WHERE id = $8 RETURNING *',
            [name, category, description, location, duration, price, image_url, id]
        );
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
