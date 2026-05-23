const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middlewares/auth');

// Secure all cart routes using the authentication middleware
router.use(auth);

// GET /api/cart - Get user's cart items
router.get('/', async (req, res) => {
  const userId = req.userId;
  try {
    const result = await db.query(`
      SELECT ci.id, ci.product_id, ci.quantity, 
             p.title, p.brand, p.price, p.original_price, p.stock,
             pi.image_url as primary_image
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      WHERE ci.user_id = $1
      ORDER BY ci.created_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching cart items:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/cart - Add item to cart (UPSERT)
router.post('/', async (req, res) => {
  const userId = req.userId;
  const { product_id, quantity = 1 } = req.body;

  if (!product_id) {
    return res.status(400).json({ error: 'product_id is required' });
  }

  try {
    // Check product stock first
    const prodRes = await db.query('SELECT stock, title FROM products WHERE id = $1', [product_id]);
    if (prodRes.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const product = prodRes.rows[0];

    // Check if item already exists in cart
    const cartRes = await db.query(
      'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [userId, product_id]
    );

    let newQuantity = quantity;
    if (cartRes.rowCount > 0) {
      newQuantity = cartRes.rows[0].quantity + quantity;
      
      // Validate stock limits
      if (newQuantity > product.stock) {
        newQuantity = product.stock; // Cap at max available stock
      }

      await db.query(
        'UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND product_id = $3',
        [newQuantity, userId, product_id]
      );
    } else {
      // Validate initial stock
      if (newQuantity > product.stock) {
        newQuantity = product.stock;
      }
      
      await db.query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)',
        [userId, product_id, newQuantity]
      );
    }

    res.status(200).json({ message: 'Product added to cart successfully', product_id, quantity: newQuantity });
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/cart/:product_id - Update quantity in cart
router.put('/:product_id', async (req, res) => {
  const userId = req.userId;
  const { product_id } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined || quantity <= 0) {
    return res.status(400).json({ error: 'Valid positive quantity is required' });
  }

  try {
    // Check product stock limits
    const prodRes = await db.query('SELECT stock FROM products WHERE id = $1', [product_id]);
    if (prodRes.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const stock = prodRes.rows[0].stock;

    let targetQuantity = parseInt(quantity);
    if (targetQuantity > stock) {
      targetQuantity = stock; // Cap at max stock
    }

    const updateRes = await db.query(
      'UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND product_id = $3 RETURNING id',
      [targetQuantity, userId, product_id]
    );

    if (updateRes.rowCount === 0) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    res.json({ message: 'Cart updated successfully', product_id, quantity: targetQuantity });
  } catch (err) {
    console.error('Error updating cart item quantity:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/cart/:product_id - Remove item from cart
router.delete('/:product_id', async (req, res) => {
  const userId = req.userId;
  const { product_id } = req.params;

  try {
    const deleteRes = await db.query(
      'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2 RETURNING id',
      [userId, product_id]
    );

    if (deleteRes.rowCount === 0) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    res.json({ message: 'Product removed from cart successfully', product_id });
  } catch (err) {
    console.error('Error deleting cart item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
