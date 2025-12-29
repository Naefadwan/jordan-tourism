const db = require('../config/db');

async function migrate() {
    try {
        console.log('Starting migration...');

        // 1. Add approval_status to travel_packages
        console.log('Adding approval_status to travel_packages...');
        await db.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='travel_packages' AND column_name='approval_status') THEN
                    ALTER TABLE travel_packages ADD COLUMN approval_status VARCHAR(20) DEFAULT 'approved';
                END IF;
            END $$;
        `);
        // Note: Existing ones are 'approved', but new ones will be 'pending' (handled in model/controller)

        // 2. Add approval_status to attractions
        console.log('Adding approval_status to attractions...');
        await db.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attractions' AND column_name='approval_status') THEN
                    ALTER TABLE attractions ADD COLUMN approval_status VARCHAR(20) DEFAULT 'approved';
                END IF;
            END $$;
        `);

        // 3. Add approval_status to accommodations
        console.log('Adding approval_status to accommodations...');
        await db.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='accommodations' AND column_name='approval_status') THEN
                    ALTER TABLE accommodations ADD COLUMN approval_status VARCHAR(20) DEFAULT 'approved';
                END IF;
            END $$;
        `);

        // 4. Create otp_verifications table
        console.log('Creating otp_verifications table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS otp_verifications (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                otp VARCHAR(6) NOT NULL,
                purpose VARCHAR(50) NOT NULL, -- e.g., 'registration'
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
