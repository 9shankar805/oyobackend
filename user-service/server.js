const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/oyo_users'
});

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP endpoint
app.post('/send-otp', [
  body('phone_number').isMobilePhone().withMessage('Valid phone number required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { phone_number } = req.body;
  const otp = generateOTP();
  
  try {
    // Store OTP in database with expiration
    await pool.query(
      'INSERT INTO otps (phone_number, otp, expires_at) VALUES ($1, $2, $3) ON CONFLICT (phone_number) DO UPDATE SET otp = $2, expires_at = $3',
      [phone_number, otp, new Date(Date.now() + 5 * 60 * 1000)] // 5 minutes expiry
    );

    // TODO: Send OTP via SMS service (Twilio)
    console.log(`OTP for ${phone_number}: ${otp}`);

    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      expires_in: 300 
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Login endpoint
app.post('/login', [
  body('phone_number').isMobilePhone(),
  body('otp').isLength({ min: 6, max: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { phone_number, otp } = req.body;

  try {
    // Verify OTP
    const otpResult = await pool.query(
      'SELECT * FROM otps WHERE phone_number = $1 AND otp = $2 AND expires_at > NOW()',
      [phone_number, otp]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Check if user exists
    let userResult = await pool.query(
      'SELECT * FROM users WHERE phone_number = $1',
      [phone_number]
    );

    let user;
    if (userResult.rows.length === 0) {
      // Create new user
      const newUser = await pool.query(
        'INSERT INTO users (phone_number, created_at) VALUES ($1, NOW()) RETURNING *',
        [phone_number]
      );
      user = newUser.rows[0];
    } else {
      user = userResult.rows[0];
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, phone: user.phone_number },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    // Delete used OTP
    await pool.query('DELETE FROM otps WHERE phone_number = $1', [phone_number]);

    res.json({
      success: true,
      data: {
        access_token: token,
        user: {
          id: user.id,
          phone_number: user.phone_number,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user profile
app.get('/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const userResult = await pool.query(
      'SELECT id, phone_number, first_name, last_name, email, profile_image FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, data: userResult.rows[0] });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
app.put('/profile', [
  body('first_name').optional().isLength({ min: 1 }),
  body('last_name').optional().isLength({ min: 1 }),
  body('email').optional().isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const { first_name, last_name, email } = req.body;

    const result = await pool.query(
      'UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), email = COALESCE($3, email), updated_at = NOW() WHERE id = $4 RETURNING *',
      [first_name, last_name, email, decoded.userId]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});