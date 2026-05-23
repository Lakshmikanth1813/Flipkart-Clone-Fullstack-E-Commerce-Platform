const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Helper to get all categories
router.get('/categories', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get products with search, category filter, rating filter, and price filter
router.get('/', async (req, res) => {
  try {
    const { category, search, brand, rating_min, price_min, price_max, sort } = req.query;
    
    let queryText = `
      SELECT p.*, c.name as category_name, c.slug as category_slug, 
             pi.image_url as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCounter = 1;

    // Filter by Category slug
    if (category) {
      queryText += ` AND c.slug = $${paramCounter}`;
      queryParams.push(category);
      paramCounter++;
    }

    // Search query (matches title or brand or description)
    if (search) {
      queryText += ` AND (p.title ILIKE $${paramCounter} OR p.brand ILIKE $${paramCounter} OR p.description ILIKE $${paramCounter})`;
      queryParams.push(`%${search}%`);
      paramCounter++;
    }

    // Filter by Brand
    if (brand) {
      queryText += ` AND p.brand ILIKE $${paramCounter}`;
      queryParams.push(brand);
      paramCounter++;
    }

    // Filter by Minimum Rating
    if (rating_min) {
      queryText += ` AND p.rating >= $${paramCounter}`;
      queryParams.push(parseFloat(rating_min));
      paramCounter++;
    }

    // Filter by Min Price
    if (price_min) {
      queryText += ` AND p.price >= $${paramCounter}`;
      queryParams.push(parseFloat(price_min));
      paramCounter++;
    }

    // Filter by Max Price
    if (price_max) {
      queryText += ` AND p.price <= $${paramCounter}`;
      queryParams.push(parseFloat(price_max));
      paramCounter++;
    }

    // Sorting
    if (sort === 'price_asc') {
      queryText += ` ORDER BY p.price ASC`;
    } else if (sort === 'price_desc') {
      queryText += ` ORDER BY p.price DESC`;
    } else if (sort === 'rating') {
      queryText += ` ORDER BY p.rating DESC`;
    } else {
      queryText += ` ORDER BY p.id ASC`; // default sorting
    }

    const result = await db.query(queryText, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single product details with all images
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch product details
    const productRes = await db.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `, [id]);

    if (productRes.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productRes.rows[0];

    // Fetch all images for this product
    const imagesRes = await db.query(`
      SELECT id, image_url, is_primary 
      FROM product_images 
      WHERE product_id = $1 
      ORDER BY is_primary DESC, id ASC
    `, [id]);

    product.images = imagesRes.rows;

    res.json(product);
  } catch (err) {
    console.error(`Error fetching product ${req.params.id}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
