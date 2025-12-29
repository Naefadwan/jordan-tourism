const db = require('../config/db');

const Package = {
    async findAll(filters = {}) {
        let query = `
            SELECT p.*,
              a.name AS accommodation_name,
              a.main_image_url AS accommodation_image
            FROM travel_packages p
            LEFT JOIN accommodations a ON p.accommodation_id = a.id
            WHERE p.is_active = true
        `;
        const values = [];

        // Filter by user_id (for company users to see only their own content)
        if (filters.user_id) {
            values.push(filters.user_id);
            query += ` AND p.user_id = $${values.length}`;
        }

        if (filters.approval_status) {
            values.push(filters.approval_status);
            query += ` AND p.approval_status = $${values.length}`;
        } else if (!filters.includePending) {
            query += " AND p.approval_status = 'approved'";
        }

        query += " ORDER BY p.from_price ASC";

        const { rows } = await db.query(query, values);
        return rows;
    },

    async findById(id, filters = {}) {
        let query = `
            SELECT p.*,
              a.name AS accommodation_name,
              a.main_image_url AS accommodation_image
            FROM travel_packages p
            LEFT JOIN accommodations a ON p.accommodation_id = a.id
            WHERE p.id = $1 AND p.is_active = true
        `;
        const values = [id];

        if (filters.approval_status) {
            values.push(filters.approval_status);
            query += ` AND p.approval_status = $${values.length}`;
        } else if (!filters.includePending) {
            query += " AND p.approval_status = 'approved'";
        }

        const { rows } = await db.query(query, values);
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
            accommodation_id, image_url, has_ticket, ticket_price, user_id
        } = data;

        const { rows } = await db.query(
            `INSERT INTO travel_packages 
            (slug, name, description, from_price, nights, origin_city, destination_city, includes_flights, accommodation_id, image_url, is_active, has_ticket, ticket_price, approval_status, user_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, $11, $12, $13, $14)
            RETURNING *`,
            [slug, name, description, from_price, nights, origin_city, destination_city, includes_flights, accommodation_id, image_url, has_ticket || false, ticket_price || 0, data.approval_status || 'pending', user_id]
        );
        return rows[0];
    },

    async update(id, data) {
        const fields = [];
        const values = [];
        let index = 1;

        for (const [key, value] of Object.entries(data)) {
            // Map camelCase to snake_case if necessary, or just use keys directly if they match DB
            // In this project, controllers usually send snake_case or we handle mapping here.
            // Let's handle the specific fields used in this model.
            const dbKey = key === 'fromPrice' ? 'from_price' :
                key === 'originCity' ? 'origin_city' :
                    key === 'destinationCity' ? 'destination_city' :
                        key === 'includesFlights' ? 'includes_flights' :
                            key === 'accommodationId' ? 'accommodation_id' :
                                key === 'imageUrl' ? 'image_url' : key;

            if (value !== undefined) {
                fields.push(`${dbKey} = $${index++}`);
                values.push(value);
            }
        }

        if (fields.length === 0) return null;

        values.push(id);
        const query = `UPDATE travel_packages SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;

        const { rows } = await db.query(query, values);
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
