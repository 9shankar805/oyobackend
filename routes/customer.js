const express = require('express');
const { pool } = require('../database');
const router = express.Router();

// Hotel search with filters
router.get('/hotels/search', async (req, res) => {
  try {
    const { city, checkIn, checkOut, guests, minPrice, maxPrice } = req.query;
    
    let query = `
      SELECT h.*, 
             MIN(r.price_per_night) as min_price,
             AVG(rv.rating) as avg_rating,
             COUNT(rv.id) as review_count
      FROM hotels h
      LEFT JOIN rooms r ON h.id = r.hotel_id
      LEFT JOIN reviews rv ON h.id = rv.hotel_id
      WHERE h.status = 'active'
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (city) {
      query += ` AND LOWER(h.city) LIKE LOWER($${++paramCount})`;
      params.push(`%${city}%`);
    }
    
    if (minPrice) {
      query += ` AND r.price_per_night >= $${++paramCount}`;
      params.push(minPrice);
    }
    
    if (maxPrice) {
      query += ` AND r.price_per_night <= $${++paramCount}`;
      params.push(maxPrice);
    }
    
    query += ` GROUP BY h.id ORDER BY avg_rating DESC NULLS LAST`;
    
    const result = await pool.query(query, params);
    res.json({ success: true, hotels: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get room types for a hotel
router.get('/hotels/:id/rooms', async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut } = req.query;
    
    const query = `
      SELECT r.*, 
             CASE WHEN b.id IS NULL THEN true ELSE false END as available
      FROM rooms r
      LEFT JOIN bookings b ON r.id = b.room_id 
        AND b.status IN ('confirmed', 'checked_in')
        AND (
          (b.check_in_date <= $2 AND b.check_out_date > $2) OR
          (b.check_in_date < $3 AND b.check_out_date >= $3) OR
          (b.check_in_date >= $2 AND b.check_out_date <= $3)
        )
      WHERE r.hotel_id = $1 AND r.status = 'active'
      GROUP BY r.id, b.id
    `;
    
    const result = await pool.query(query, [id, checkIn, checkOut]);
    res.json({ success: true, rooms: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get hotel amenities
router.get('/hotels/:id/amenities', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT amenities FROM hotels WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Hotel not found' });
    }
    
    res.json({ success: true, amenities: result.rows[0].amenities || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get hotel gallery
router.get('/hotels/:id/gallery', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT images FROM hotels WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Hotel not found' });
    }
    
    res.json({ success: true, images: result.rows[0].images || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get hotel reviews
router.get('/hotels/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT r.*, u.name as user_name, u.avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.hotel_id = $1
      ORDER BY r.created_at DESC
    `;
    
    const result = await pool.query(query, [id]);
    res.json({ success: true, reviews: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create booking
router.post('/bookings', async (req, res) => {
  try {
    const { user_id, hotel_id, room_id, check_in_date, check_out_date, guests, total_amount, fcm_token } = req.body;
    
    const query = `
      INSERT INTO bookings (user_id, hotel_id, room_id, check_in_date, check_out_date, guests, total_amount, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      RETURNING *
    `;
    
    const result = await pool.query(query, [user_id, hotel_id, room_id, check_in_date, check_out_date, guests, total_amount]);
    
    // Send FCM notification
    if (fcm_token) {
      const fcmService = require('../fcm-service');
      await fcmService.sendBookingNotification({
        userToken: fcm_token,
        hotelName: 'Hotel Name',
        checkIn: check_in_date,
        bookingId: result.rows[0].id,
        hotelId: hotel_id
      });
    }
    
    res.json({ success: true, booking: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user bookings
router.get('/bookings/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT b.*, h.name as hotel_name, h.address, r.room_type
      FROM bookings b
      JOIN hotels h ON b.hotel_id = h.id
      JOIN rooms r ON b.room_id = r.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `;
    
    const result = await pool.query(query, [id]);
    res.json({ success: true, bookings: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update booking
router.put('/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, check_in_date, check_out_date, guests } = req.body;
    
    const query = `
      UPDATE bookings 
      SET status = COALESCE($2, status),
          check_in_date = COALESCE($3, check_in_date),
          check_out_date = COALESCE($4, check_out_date),
          guests = COALESCE($5, guests),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, status, check_in_date, check_out_date, guests]);
    res.json({ success: true, booking: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cancel booking
router.delete('/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE bookings SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );
    
    res.json({ success: true, booking: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Process payment
router.post('/payments/process', async (req, res) => {
  try {
    const { booking_id, amount, payment_method, payment_details, fcm_token } = req.body;
    
    const query = `
      INSERT INTO payments (booking_id, amount, payment_method, payment_details, status)
      VALUES ($1, $2, $3, $4, 'completed')
      RETURNING *
    `;
    
    const result = await pool.query(query, [booking_id, amount, payment_method, payment_details]);
    
    // Update booking status
    await pool.query("UPDATE bookings SET status = 'confirmed' WHERE id = $1", [booking_id]);
    
    // Send FCM notification
    if (fcm_token) {
      const fcmService = require('../fcm-service');
      await fcmService.sendPaymentNotification({
        userToken: fcm_token,
        amount: amount,
        paymentId: result.rows[0].id
      });
    }
    
    res.json({ success: true, payment: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get payment methods
router.get('/payments/methods', async (req, res) => {
  try {
    const methods = [
      { id: 'card', name: 'Credit/Debit Card', icon: 'credit-card' },
      { id: 'upi', name: 'UPI', icon: 'smartphone' },
      { id: 'wallet', name: 'Wallet', icon: 'wallet' },
      { id: 'netbanking', name: 'Net Banking', icon: 'bank' }
    ];
    
    res.json({ success: true, methods });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add to wallet
router.post('/payments/wallet/add', async (req, res) => {
  try {
    const { user_id, amount } = req.body;
    
    await pool.query(
      "UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2",
      [amount, user_id]
    );
    
    const result = await pool.query("SELECT wallet_balance FROM users WHERE id = $1", [user_id]);
    res.json({ success: true, balance: result.rows[0].wallet_balance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get wallet balance
router.get('/payments/wallet/balance/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query("SELECT wallet_balance FROM users WHERE id = $1", [userId]);
    
    res.json({ success: true, balance: result.rows[0]?.wallet_balance || 0 });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get coupons
router.get('/coupons', async (req, res) => {
  try {
    const coupons = [
      { code: 'FIRST50', discount: 50, type: 'flat', description: 'Flat ₹50 off on first booking' },
      { code: 'SAVE20', discount: 20, type: 'percentage', description: '20% off up to ₹500' },
      { code: 'WEEKEND25', discount: 25, type: 'percentage', description: '25% off on weekend bookings' }
    ];
    
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Apply coupon
router.post('/coupons/apply', async (req, res) => {
  try {
    const { code, amount } = req.body;
    
    const coupons = {
      'FIRST50': { discount: 50, type: 'flat' },
      'SAVE20': { discount: 20, type: 'percentage', maxDiscount: 500 },
      'WEEKEND25': { discount: 25, type: 'percentage' }
    };
    
    const coupon = coupons[code];
    if (!coupon) {
      return res.status(400).json({ success: false, error: 'Invalid coupon code' });
    }
    
    let discountAmount = 0;
    if (coupon.type === 'flat') {
      discountAmount = coupon.discount;
    } else {
      discountAmount = (amount * coupon.discount) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    }
    
    res.json({ success: true, discount: discountAmount, finalAmount: amount - discountAmount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get notifications
router.get('/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
      [userId]
    );
    
    res.json({ success: true, notifications: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create support ticket
router.post('/support/tickets', async (req, res) => {
  try {
    const { user_id, subject, message, priority } = req.body;
    
    const ticketId = 'TKT' + Date.now();
    const ticket = {
      id: ticketId,
      user_id,
      subject,
      message,
      priority: priority || 'medium',
      status: 'open',
      created_at: new Date()
    };
    
    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get chat messages
router.get('/chat/messages/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const result = await pool.query(
      "SELECT * FROM messages WHERE booking_id = $1 ORDER BY created_at ASC",
      [bookingId]
    );
    
    res.json({ success: true, messages: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send message
router.post('/chat/send', async (req, res) => {
  try {
    const { booking_id, sender_id, sender_type, message } = req.body;
    
    const query = `
      INSERT INTO messages (booking_id, sender_id, sender_type, message)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(query, [booking_id, sender_id, sender_type, message]);
    res.json({ success: true, message: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get recommendations
router.get('/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const query = `
      SELECT h.*, AVG(r.rating) as avg_rating
      FROM hotels h
      LEFT JOIN reviews r ON h.id = r.hotel_id
      WHERE h.status = 'active'
      GROUP BY h.id
      ORDER BY avg_rating DESC NULLS LAST
      LIMIT 10
    `;
    
    const result = await pool.query(query);
    res.json({ success: true, recommendations: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit feedback
router.post('/feedback', async (req, res) => {
  try {
    const { user_id, hotel_id, booking_id, rating, comment } = req.body;
    
    const query = `
      INSERT INTO reviews (user_id, hotel_id, booking_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await pool.query(query, [user_id, hotel_id, booking_id, rating, comment]);
    res.json({ success: true, review: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get nearby cities
router.get('/cities/nearby', async (req, res) => {
  try {
    const cities = [
      { name: 'Mumbai', distance: '0 km', hotels: 150 },
      { name: 'Pune', distance: '150 km', hotels: 80 },
      { name: 'Nashik', distance: '180 km', hotels: 45 },
      { name: 'Aurangabad', distance: '350 km', hotels: 30 }
    ];
    
    res.json({ success: true, cities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update profile
router.put('/users/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, avatar } = req.body;
    
    const query = `
      UPDATE users 
      SET name = COALESCE($2, name),
          email = COALESCE($3, email),
          phone = COALESCE($4, phone),
          avatar = COALESCE($5, avatar),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, name, email, phone, avatar]);
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get profile
router.get('/users/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload avatar
router.post('/users/upload-avatar', async (req, res) => {
  try {
    const { user_id, avatar_url } = req.body;
    
    await pool.query("UPDATE users SET avatar = $1 WHERE id = $2", [avatar_url, user_id]);
    res.json({ success: true, avatar_url });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get wallet history
router.get('/wallet/history/:userId', async (req, res) => {
  try {
    const history = [
      { id: 1, type: 'credit', amount: 500, description: 'Added to wallet', date: new Date() },
      { id: 2, type: 'debit', amount: 200, description: 'Booking payment', date: new Date() }
    ];
    
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get trip history
router.get('/trips/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const query = `
      SELECT b.*, h.name as hotel_name, h.address, h.images[1] as hotel_image
      FROM bookings b
      JOIN hotels h ON b.hotel_id = h.id
      WHERE b.user_id = $1 AND b.status IN ('completed', 'checked_out')
      ORDER BY b.check_out_date DESC
    `;
    
    const result = await pool.query(query, [userId]);
    res.json({ success: true, trips: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;