const db = require('../config/db');

async function checkPackage() {
    try {
        const { rows } = await db.query('SELECT * FROM travel_packages WHERE id = 3');
        console.log('Package 3:', rows[0]);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkPackage();
