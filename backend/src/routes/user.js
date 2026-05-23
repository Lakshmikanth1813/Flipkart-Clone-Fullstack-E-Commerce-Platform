const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const auth = require('../middlewares/auth');

// POST /api/user/register - Register a new user
router.post('/register', async (req, res) => {
  const { email, password, name, phone } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    
    // Check if email already exists
    const userExistRes = await db.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (userExistRes.rowCount > 0) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    if (phone && phone.trim()) {
      const normalizedPhone = phone.trim();
      // Check if phone already exists
      const phoneExistRes = await db.query('SELECT id FROM users WHERE phone = $1', [normalizedPhone]);
      if (phoneExistRes.rowCount > 0) {
        return res.status(400).json({ error: 'An account with this phone number already exists' });
      }
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user into database
    const result = await db.query(`
      INSERT INTO users (email, password_hash, name, phone)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, name, phone, created_at
    `, [normalizedEmail, passwordHash, name.trim(), phone && phone.trim() ? phone.trim() : null]);

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// POST /api/user/login - Log in an existing user (supports email or phone lookup)
router.post('/login', async (req, res) => {
  const { emailOrPhone, password } = req.body;

  if (!emailOrPhone || !password) {
    return res.status(400).json({ error: 'Email/Mobile number and password are required' });
  }

  const inputVal = emailOrPhone.trim();
  const isEmail = inputVal.includes('@');
  
  const queryStr = isEmail
    ? 'SELECT * FROM users WHERE email = $1'
    : 'SELECT * FROM users WHERE phone = $1';

  try {
    const result = await db.query(queryStr, [isEmail ? inputVal.toLowerCase() : inputVal]);
    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid email/mobile number or password' });
    }

    const user = result.rows[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email/mobile number or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// ============================================
// Secure Routes below (require Authentication)
// ============================================
router.use(auth);

// GET /api/user/profile - Get profile of the current active user
router.get('/profile', async (req, res) => {
  try {
    const result = await db.query('SELECT id, email, name, phone, created_at FROM users WHERE id = $1', [req.userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/user/addresses - Get shipping addresses for the user
router.get('/addresses', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, id DESC', [req.userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching addresses:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/user/addresses - Create a new shipping address
router.post('/addresses', async (req, res) => {
  const { name, phone, pincode, locality, address_line, city, state, landmark, alternate_phone, address_type = 'home', is_default = false } = req.body;

  if (!name || !phone || !pincode || !locality || !address_line || !city || !state) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  try {
    // If setting this address as default, unset other defaults
    if (is_default) {
      await db.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [req.userId]);
    }

    // Check if this is the first address, if so, make it default automatically
    const countRes = await db.query('SELECT count(*) FROM addresses WHERE user_id = $1', [req.userId]);
    const isFirstAddress = parseInt(countRes.rows[0].count) === 0;
    const finalIsDefault = is_default || isFirstAddress;

    const result = await db.query(`
      INSERT INTO addresses (user_id, name, phone, pincode, locality, address_line, city, state, landmark, alternate_phone, address_type, is_default)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [req.userId, name, phone, pincode, locality, address_line, city, state, landmark, alternate_phone, address_type, finalIsDefault]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding address:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/user/addresses/:id - Delete a specific shipping address
router.delete('/addresses/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleteRes = await db.query('DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING is_default', [id, req.userId]);
    
    if (deleteRes.rowCount === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // If we deleted the default address, set another address as default if available
    if (deleteRes.rows[0].is_default) {
      const anotherRes = await db.query('SELECT id FROM addresses WHERE user_id = $1 LIMIT 1', [req.userId]);
      if (anotherRes.rowCount > 0) {
        await db.query('UPDATE addresses SET is_default = true WHERE id = $1', [anotherRes.rows[0].id]);
      }
    }

    res.json({ message: 'Address deleted successfully', id });
  } catch (err) {
    console.error('Error deleting address:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/user/wishlist - Fetch user's wishlist items
router.get('/wishlist', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT w.id as wishlist_entry_id, w.product_id, 
             p.title, p.brand, p.price, p.original_price, p.rating, p.rating_count,
             pi.image_url as primary_image
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC
    `, [req.userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/user/wishlist/toggle - Add or remove product from wishlist (toggle)
router.post('/wishlist/toggle', async (req, res) => {
  const { product_id } = req.body;

  if (!product_id) {
    return res.status(400).json({ error: 'product_id is required' });
  }

  try {
    // Check if item is in wishlist
    const wishRes = await db.query('SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2', [req.userId, product_id]);
    
    if (wishRes.rowCount > 0) {
      // Remove from wishlist
      await db.query('DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2', [req.userId, product_id]);
      res.json({ added: false, message: 'Product removed from wishlist' });
    } else {
      // Add to wishlist
      await db.query('INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)', [req.userId, product_id]);
      res.json({ added: true, message: 'Product added to wishlist' });
    }
  } catch (err) {
    console.error('Error toggling wishlist:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
