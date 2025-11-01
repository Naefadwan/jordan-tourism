const { Pool } = require('pg');
require('dotenv').config();
// Configure database connection - supports both connection string and individual parameters
let poolConfig;

if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
    // Validate and use connection string if provided
    const dbUrl = process.env.DATABASE_URL.trim();
    if (!dbUrl.startsWith('postgres://') && !dbUrl.startsWith('postgresql://')) {
        console.error('Invalid DATABASE_URL format. Must start with postgres:// or postgresql://');
        console.error('Example: postgresql://username:password@localhost:5432/database_name');
    }
    
    // Parse the URL to validate it (optional - for debugging)
    try {
        const url = new URL(dbUrl);
        if (!url.username || !url.password) {
            console.warn('Warning: DATABASE_URL may be missing username or password');
        }
    } catch (e) {
        console.error('Invalid DATABASE_URL format:', e.message);
    }
    
    poolConfig = { connectionString: dbUrl };
} else {
    // Use individual parameters
    if (!process.env.DB_NAME || !process.env.DB_USER) {
        console.error('Database configuration error: DB_NAME and DB_USER must be set in .env file');
        console.error('Alternatively, provide a DATABASE_URL connection string');
        console.error('Current DB_NAME:', process.env.DB_NAME || 'NOT SET');
        console.error('Current DB_USER:', process.env.DB_USER || 'NOT SET');
    }
    
    const password = process.env.DB_PASSWORD;
    if (password === undefined || password === null || password === '') {
        console.warn('Warning: DB_PASSWORD is not set or is empty. Connection may fail.');
    }
    
    poolConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: password ? String(password) : '',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    };
}

const pool = new Pool(poolConfig);

// Test the connection
pool.on('connect', () => {
    console.log('Database connected successfully');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Export a query function that will be used throughout the application
module.exports = {
    query: (text, params) => pool.query(text, params),
};