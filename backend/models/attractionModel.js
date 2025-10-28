const db = require('../config/db');

const Attraction = {
    findAll: async () => {
        const { rows } = await db.query('SELECT * FROM attractions');
        
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
            image: row.image_url // Map image_url to image
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
            image: row.image_url // Map image_url to image
        };
    }
};

module.exports = Attraction;