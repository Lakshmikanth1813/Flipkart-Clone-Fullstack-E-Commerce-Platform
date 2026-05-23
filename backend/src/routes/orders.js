const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middlewares/auth');

// Secure all order routes using the authentication middleware
router.use(auth);

// GET /api/orders - Get user's order history
router.get('/', async (req, res) => {
  const userId = req.userId;
  try {
    // Fetch all orders with details of shipping address
    const ordersRes = await db.query(`
      SELECT o.*, a.name as address_name, a.phone as address_phone, 
             a.pincode, a.locality, a.address_line, a.city, a.state
      FROM orders o
      LEFT JOIN addresses a ON o.address_id = a.id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
    `, [userId]);

    const orders = ordersRes.rows;

    // For each order, fetch the corresponding ordered items
    for (const order of orders) {
      const itemsRes = await db.query(`
        SELECT oi.* 
        FROM order_items oi
        WHERE oi.order_id = $1
        ORDER BY oi.id ASC
      `, [order.id]);
      order.items = itemsRes.rows;
    }

    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/orders - Place an order (Transactional!)
router.post('/', async (req, res) => {
  const userId = req.userId;
  const { address_id, payment_method = 'cod' } = req.body;

  if (!address_id) {
    return res.status(400).json({ error: 'address_id is required' });
  }

  // 1. Begin SQL Transaction
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 2. Fetch current cart items to calculate prices and check stock
    const cartRes = await client.query(`
      SELECT ci.product_id, ci.quantity, p.price, p.stock, p.title,
             pi.image_url as primary_image
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      WHERE ci.user_id = $1
    `, [userId]);

    if (cartRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cannot place order. Shopping cart is empty.' });
    }

    const cartItems = cartRes.rows;

    // 3. Calculate total price and check stock levels
    let totalPrice = 0.00;
    for (const item of cartItems) {
      totalPrice += parseFloat(item.price) * item.quantity;

      // Validate stock levels
      if (item.stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          error: `Insufficient stock for product: "${item.title}". Only ${item.stock} left in stock.` 
        });
      }
    }

    // 4. Create unique Order ID (Flipkart OD prefix + 15 digits timestamp/random)
    const timestampStr = Date.now().toString();
    const randomStr = Math.floor(100 + Math.random() * 900).toString();
    const orderId = `OD${timestampStr}${randomStr}`;

    // 5. Insert order record
    const paymentStatus = payment_method === 'cod' ? 'pending' : 'paid';
    await client.query(`
      INSERT INTO orders (id, user_id, address_id, total_price, payment_method, payment_status, order_status)
      VALUES ($1, $2, $3, $4, $5, $6, 'processing')
    `, [orderId, userId, address_id, totalPrice, payment_method, paymentStatus]);

    // 6. Insert order items & Update product stock
    for (const item of cartItems) {
      // Snapshot item at checkout time
      await client.query(`
        INSERT INTO order_items (order_id, product_id, quantity, price, title, image_url)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [orderId, item.product_id, item.quantity, item.price, item.title, item.primary_image]);

      // Decrement stock
      await client.query(`
        UPDATE products 
        SET stock = stock - $1 
        WHERE id = $2
      `, [item.quantity, item.product_id]);
    }

    // 7. Keep user's cart items (do not clear cart after order placement as per user request)
    // cart items remain in the cart unless manually removed.

    // 8. Commit SQL Transaction
    await client.query('COMMIT');

    res.status(201).json({
      message: 'Order placed successfully',
      order_id: orderId,
      total_price: totalPrice,
      payment_method,
      payment_status: paymentStatus
    });
  } catch (err) {
    // Rollback transaction in case of any failure
    await client.query('ROLLBACK');
    console.error('Transaction rollback. Error placing order:', err);
    res.status(500).json({ error: 'Internal server error during order placement' });
  } finally {
    // Release client back to pool
    client.release();
  }
});

module.exports = router;
