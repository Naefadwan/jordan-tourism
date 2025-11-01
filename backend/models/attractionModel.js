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
            conditions.push(`(COALESCE(name, '') ILIKE $${values.length + 1} OR COALESCE(description, '') ILIKE $${values.length + 1})`);
            values.push(searchParam);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        const { rows } = await db.query(query, values);

        // Map database snake_case columns to frontend camelCase properties
        const mappedRows = rows.map(row => ({
            id: row.id,
            name: row.name,
            category: row.category,
            price: row.price,
            rating: row.rating,
            reviews: row.reviews_count, // Map reviews_count to reviews
            location: row.location,
            description: row.description,
            duration: row.duration,
            image: row.image_url || 'public/placeholder-image.jpg' // Fallback image
        }));

        return mappedRows;
    },

    findById: async (id) => {
        const { rows } = await db.query('SELECT * FROM attractions WHERE id = $1', [id]);
        if (rows.length === 0) return null;
        
        const row = rows[0];
        // Map database snake_case columns to frontend camelCase properties
        return {
            id: row.id,
            name: row.name,
            category: row.category,
            price: row.price,
            rating: row.rating,
            reviews: row.reviews_count, // Map reviews_count to reviews
            location: row.location,
            description: row.description,
            duration: row.duration,
            image: row.image_url || 'public/placeholder-image.jpg' // Fallback image
        };
    }
};

module.exports = Attraction;