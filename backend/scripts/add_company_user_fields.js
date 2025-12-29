const db = require('../config/db');

async function migrate() {
    try {
        console.log('Starting migration: Adding company user fields...');

        // 1. Add company-specific fields to users table
        console.log('Adding company_name column...');
        await db.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='company_name') THEN
                    ALTER TABLE users ADD COLUMN company_name VARCHAR(255);
                END IF;
            END $$;
        `);

        console.log('Adding business_license column...');
        await db.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='business_license') THEN
                    ALTER TABLE users ADD COLUMN business_license VARCHAR(100);
                END IF;
            END $$;
        `);

        console.log('Adding phone column...');
        await db.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone') THEN
                    ALTER TABLE users ADD COLUMN phone VARCHAR(20);
                END IF;
            END $$;
        `);

        console.log('Adding address column...');
        await db.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='address') THEN
                    ALTER TABLE users ADD COLUMN address TEXT;
                END IF;
            END $$;
        `);

        // 2. Add account_status column with default 'approved'
        console.log('Adding account_status column...');
        await db.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='account_status') THEN
                    ALTER TABLE users ADD COLUMN account_status VARCHAR(20) DEFAULT 'approved';
                END IF;
            END $$;
        `);

        // Update existing users to have 'approved' status
        console.log('Updating existing users to approved status...');
        await db.query(`
            UPDATE users 
            SET account_status = 'approved' 
            WHERE account_status IS NULL;
        `);

        console.log('Migration completed successfully.');
        console.log('Added columns: company_name, business_license, phone, address, account_status');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
