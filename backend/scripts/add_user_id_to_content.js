const db = require('../config/db');

async function migrate() {
    try {
        console.log('Starting migration: Adding user_id to track content ownership...');

        // Add user_id to travel_packages
        console.log('Adding user_id to travel_packages...');
        await db.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='travel_packages' AND column_name='user_id') THEN
                    ALTER TABLE travel_packages ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
                END IF;
            END $$;
        `);

        // Add user_id to accommodations
        console.log('Adding user_id to accommodations...');
        await db.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='accommodations' AND column_name='user_id') THEN
                    ALTER TABLE accommodations ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
                END IF;
            END $$;
        `);

        // Add user_id to attractions (for consistency)
        console.log('Adding user_id to attractions...');
        await db.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attractions' AND column_name='user_id') THEN
                    ALTER TABLE attractions ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
                END IF;
            END $$;
        `);

        console.log('Migration completed successfully.');
        console.log('Added user_id columns to travel_packages, accommodations, and attractions');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
