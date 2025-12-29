const { Client } = require('pg');

const connStr = "postgres://neondb_owner:npg_u3BSt4vMRePj@ep-autumn-snowflake-a2h98mca-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require";

async function testUpdate() {
    const client = new Client({ connectionString: connStr });
    try {
        await client.connect();
        console.log("Connected to DB");

        // Try updating 'wadi-rum' to 'rejected'
        const res = await client.query(
            "UPDATE attractions SET approval_status = $1 WHERE id = $2 RETURNING *",
            ['rejected', 'wadi-rum']
        );

        console.log("Update result:", res.rows[0]);
    } catch (err) {
        console.error("Update failed:", err.message);
    } finally {
        await client.end();
    }
}

testUpdate();
