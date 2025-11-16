const db = require('../config/db');

const Package = {
    async findAll() {
        const { rows } = await db.query(
            `SELECT p.*,
              a.name AS accommodation_name,
              a.main_image_url AS accommodation_image
       FROM travel_packages p
       LEFT JOIN accommodations a ON p.accommodation_id = a.id
       WHERE p.is_active = true
       ORDER BY p.from_price ASC`
        );
        return rows;
    },

    async findById(id) {
        const { rows } = await db.query(
            `SELECT p.*,
              a.name AS accommodation_name,
              a.main_image_url AS accommodation_image
       FROM travel_packages p
       LEFT JOIN accommodations a ON p.accommodation_id = a.id
       WHERE p.id = $1 AND p.is_active = true`,
            [id]
        );
        return rows[0] || null;
    },

    async findAttractionsForPackage(packageId) {
        const { rows } = await db.query(
            `SELECT tpa.day_number,
              tpa.is_included,
              att.*
       FROM travel_package_attractions tpa
       JOIN attractions att ON tpa.attraction_id = att.id
       WHERE tpa.package_id = $1
       ORDER BY tpa.day_number, att.name`,
            [packageId]
        );
        return rows;
    }
};

module.exports = Package;
