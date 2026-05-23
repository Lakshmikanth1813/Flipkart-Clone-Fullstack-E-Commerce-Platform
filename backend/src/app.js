const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Apply Middlewares
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse incoming JSON request bodies

// Mount Modular API Routes
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/user');

app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes);

// Basic API Health Check Route
app.get('/api/health', async (req, res) => {
  try {
    // Quick probe query to confirm DB connectivity
    await db.query('SELECT 1');
    res.json({ 
      status: 'healthy', 
      message: 'Flipkart Clone API server is running, database is connected successfully.' 
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'unhealthy', 
      message: 'API server is running, but database connection failed.',
      error: err.message
    });
  }
});

// Start Express API Server
app.listen(PORT, () => {
  console.log(`[API Server] Express server is running on http://localhost:${PORT}`);
  console.log(`[API Server] Health check available at http://localhost:${PORT}/api/health`);
});

module.exports = app;
