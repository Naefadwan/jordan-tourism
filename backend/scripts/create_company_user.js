const User = require('../models/userModel');
const bcrypt = require('bcryptjs'); // Ensure bcryptjs is installed in backend

async function createCompanyUser() {
    try {
        const email = 'company@gojo.com';
        const password = 'company123';
        const fullName = 'GOJO Test Company';

        console.log(`Creating company user: ${email}`);

        // Check if exists
        const existing = await User.findByEmail(email);
        if (existing) {
            console.log('User already exists. Updating role to "company" just in case...');
            // We'll need a direct DB call for update if User model doesn't have update
            // For now, let's just log it.
            console.log('Existing user:', existing);
            if (existing.role !== 'company') {
                console.log('Please delete this user or update their role manually.');
            }
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            role: 'company'
        });

        console.log('Company user created successfully:', newUser);
    } catch (err) {
        console.error('Error creating user:', err);
    } finally {
        // give it a moment to flush logs
        setTimeout(() => process.exit(0), 500);
    }
}

createCompanyUser();
