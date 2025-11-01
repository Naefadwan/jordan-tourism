const db = require('../config/db');

const Like = {
    findByUserId: async (userId) => {
        const query = 'SELECT attraction_id FROM user_likes WHERE user_id = $1';
        const { rows } = await db.query(query, [userId]);
        return rows.map(row => row.attraction_id);
    },

    add: async (userId, attractionId) => {
        const query = 'INSERT INTO user_likes (user_id, attraction_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *';
        const { rows } = await db.query(query, [userId, attractionId]);
        return rows[0];
    },

    remove: async (userId, attractionId) => {
        const query = 'DELETE FROM user_likes WHERE user_id = $1 AND attraction_id = $2';
        await db.query(query, [userId, attractionId]);
        return { success: true };
    }
};

module.exports = Like;