require('dotenv').config();

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Connect using DATABASE_URL (works locally and on Neon/Render)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initializeDatabase() {
  console.log('[Database Init] Connecting to database...');

  try {
    // Step 1: Run schema.sql to create tables
    const schemaPath = path.join(__dirname, 'schema.sql');
    console.log('[Database Init] Reading schema file...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('[Database Init] Executing schema.sql...');
    await pool.query(schemaSql);
    console.log('[Database Init] Schema applied successfully.');

    // Step 2: Run seed data
    console.log('[Database Init] Running seed script...');
    const seed = require('./seed');
    await seed.runSeed();
    console.log('[Database Init] Seeding completed successfully.');

    console.log('[Database Init] Database is fully ready! You can now start the server.');
    process.exit(0);
  } catch (err) {
    console.error('[Database Error]', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initializeDatabase();

