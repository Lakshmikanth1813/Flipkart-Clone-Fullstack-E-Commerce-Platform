const { Pool } = require('pg');
require('dotenv').config();

// Use SSL only in production (Neon, Render etc.)
// Local PostgreSQL does not need SSL
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false
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
