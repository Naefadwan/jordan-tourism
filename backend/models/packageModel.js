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
    },

    async create(data) {
        const {
            slug, name, description, from_price, nights,
            origin_city, destination_city, includes_flights,
            accommodation_id, image_url
        } = data;

        const { rows } = await db.query(
            `INSERT INTO travel_packages 
            (slug, name, description, from_price, nights, origin_city, destination_city, includes_flights, accommodation_id, image_url, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
            RETURNING *`,
            [slug, name, description, from_price, nights, origin_city, destination_city, includes_flights, accommodation_id, image_url]
        );
        return rows[0];
    },

    async delete(id) {
        const { rows } = await db.query(
            `UPDATE travel_packages SET is_active = false WHERE id = $1 RETURNING *`,
            [id]
        );
        return rows[0];
    }
};

module.exports = Package;
