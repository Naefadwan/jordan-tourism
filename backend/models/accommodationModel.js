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

        // Map database snake_case columns to frontend camelCase properties if needed
        const mappedRows = rows.map(row => ({
            id: row.id,
            name: row.name,
            type: row.type,
            location: row.location,
            description: row.description,
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
            mainImage: row.main_image_url || 'public/placeholder-image.jpg'
        };
    }
};

module.exports = Accommodation;