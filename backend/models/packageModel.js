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
            accommodation_id, image_url, has_ticket, ticket_price
        } = data;

        const { rows } = await db.query(
            `INSERT INTO travel_packages 
            (slug, name, description, from_price, nights, origin_city, destination_city, includes_flights, accommodation_id, image_url, is_active, has_ticket, ticket_price)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, $11, $12)
            RETURNING *`,
            [slug, name, description, from_price, nights, origin_city, destination_city, includes_flights, accommodation_id, image_url, has_ticket || false, ticket_price || 0]
        );
        return rows[0];
    },

    async update(id, data) {
        const {
            slug, name, description, from_price, nights,
            origin_city, destination_city, includes_flights,
            accommodation_id, image_url, has_ticket, ticket_price
        } = data;

        const { rows } = await db.query(
            `UPDATE travel_packages 
            SET slug = $1, name = $2, description = $3, from_price = $4, nights = $5, 
                origin_city = $6, destination_city = $7, includes_flights = $8, 
                accommodation_id = $9, image_url = COALESCE($10, image_url), 
                has_ticket = $11, ticket_price = $12
            WHERE id = $13 RETURNING *`,
            [slug, name, description, from_price, nights, origin_city, destination_city, includes_flights, accommodation_id, image_url, has_ticket, ticket_price, id]
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
