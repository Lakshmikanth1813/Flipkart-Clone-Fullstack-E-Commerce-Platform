const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const seed = require('./seed');
require('dotenv').config();

async function initializeDatabase() {
  const dbName = process.env.DB_NAME;
  console.log(`[Database Init] Starting database setup for '${dbName}'...`);

  // Step 1: Connect to default 'postgres' database to check/create the clone database
  // Connect to default 'postgres' DB first to check/create the target database
  const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: 'postgres'
  });

  try {
    await client.connect();
    
    // Check if database exists
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    
    if (res.rowCount === 0) {
      console.log(`[Database Init] Database '${dbName}' does not exist. Creating it now...`);
      // CREATE DATABASE cannot be executed inside a transaction block, run it directly
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`[Database Init] Database '${dbName}' created successfully.`);
    } else {
      console.log(`[Database Init] Database '${dbName}' already exists.`);
    }
  } catch (err) {
    console.error('[Database Error] Error checking/creating database:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }

  // Step 2: Read and run schema.sql on our new/existing flipkart_clone database
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    console.log(`[Database Init] Reading schema file: ${schemaPath}`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('[Database Init] Executing schema.sql...');
    await db.query(schemaSql);
    console.log('[Database Init] Schema applied successfully.');

    // Step 3: Run seeder
    console.log('[Database Init] Executing database seed script...');
    await seed.runSeed();
    console.log('[Database Init] Seeding completed successfully.');

    console.log('[Database Init] Database is fully ready! You can now start the API server.');
    process.exit(0);
  } catch (err) {
    console.error('[Database Error] Error running schema or seeding:', err);
    process.exit(1);
  }
}

initializeDatabase();
