const { Pool } = require('pg');
require('dotenv').config();

// The pool will use the DATABASE_URL from the .env file automatically
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Export a query function that will be used throughout the application
module.exports = {
    query: (text, params) => pool.query(text, params),
};