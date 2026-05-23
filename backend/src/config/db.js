const { Pool } = require('pg');
require('dotenv').config();

// Create a pool using values from .env file only
// Make sure you have a .env file in the backend folder (see .env.example)
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME
});

pool.on('connect', () => {
  // Connection successfully established
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => {
    return pool.query(text, params);
  },
  pool
};
