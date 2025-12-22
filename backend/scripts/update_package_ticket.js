const db = require('../config/db');

async function updatePackageTicket() {
    try {
        console.log('Updating package 3 has_ticket to true...');
        await db.query('UPDATE travel_packages SET has_ticket = true WHERE id = 3');
        console.log('Update complete.');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

updatePackageTicket();
