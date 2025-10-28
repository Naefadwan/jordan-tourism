const db = require('../config/db');

const Accommodation = {
    findAll: async () => {
        const { rows } = await db.query('SELECT * FROM accommodations');

        // Map database snake_case columns to frontend camelCase properties if needed
        const mappedRows = rows.map(row => ({
            id: row.id,
            name: row.name,
            type: row.type,
            location: row.location,
            description: row.description,
            mainImage: row.main_image_url
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
            mainImage: row.main_image_url
        };
    }
};

module.exports = Accommodation;