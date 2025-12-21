const express = require('express');
const { pool } = require('../database');
const router = express.Router();

// Owner dashboard
router.get('/dashboard/:ownerId', async (req, res) => {
  try {
    const { ownerId } = req.params;
    
    // Get owner hotels
    const hotelsQuery = `
      SELECT h.*, COUNT(r.id) as room_count
      FROM hotels h
      LEFT JOIN rooms r ON h.id = r.hotel_id
      WHERE h.owner_id = $1
      GROUP BY h.id
    `;
    const hotels = await pool.query(hotelsQuery, [ownerId]);
    
    // Get recent bookings
    const bookingsQuery = `
      SELECT b.*, h.name as hotel_name, u.name as guest_name
      FROM bookings b
      JOIN hotels h ON b.hotel_id = h.id
      JOIN users u ON b.user_id = u.id
      WHERE h.owner_id = $1
      ORDER BY b.created_at DESC
      LIMIT 10
    `;
    const bookings = await pool.query(bookingsQuery, [ownerId]);
    
    // Get earnings summary
    const earningsQuery = `
      SELECT 
        SUM(p.amount) as total_earnings,
        COUNT(p.id) as total_bookings
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN hotels h ON b.hotel_id = h.id
      WHERE h.owner_id = $1 AND p.status = 'completed'
    `;
    const earnings = await pool.query(earningsQuery, [ownerId]);
    
    res.json({ 
      success: true, 
      dashboard: {
        hotels: hotels.rows,
        recent_bookings: bookings.rows,
        earnings: earnings.rows[0] || { total_earnings: 0, total_bookings: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get owner hotels
router.get('/hotels/:ownerId', async (req, res) => {
  try {
    const { ownerId } = req.params;
    const result = await pool.query('SELECT * FROM hotels WHERE owner_id = $1', [ownerId]);
    res.json({ success: true, hotels: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Register hotel
router.post('/hotels/register', async (req, res) => {
  try {
    const { owner_id, name, address, city, state, country, phone, email, description, amenities, images } = req.body;
    
    const query = `
      INSERT INTO hotels (owner_id, name, address, city, state, country, phone, email, description, amenities, images, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
      RETURNING *
    `;
    
    const result = await pool.query(query, [owner_id, name, address, city, state, country, phone, email, description, amenities, images]);
    res.json({ success: true, hotel: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update hotel
router.put('/hotels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, description, amenities, images, phone, email } = req.body;
    
    const query = `
      UPDATE hotels 
      SET name = COALESCE($2, name),
          address = COALESCE($3, address),
          description = COALESCE($4, description),
          amenities = COALESCE($5, amenities),
          images = COALESCE($6, images),
          phone = COALESCE($7, phone),
          email = COALESCE($8, email),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, name, address, description, amenities, images, phone, email]);
    res.json({ success: true, hotel: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add rooms
router.post('/rooms', async (req, res) => {
  try {
    const { hotel_id, room_type, description, price_per_night, max_occupancy, amenities, images } = req.body;
    
    const query = `
      INSERT INTO rooms (hotel_id, room_type, description, price_per_night, max_occupancy, amenities, images, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
      RETURNING *
    `;
    
    const result = await pool.query(query, [hotel_id, room_type, description, price_per_night, max_occupancy, amenities, images]);
    res.json({ success: true, room: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update room
router.put('/rooms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { room_type, description, price_per_night, max_occupancy, amenities, images, status } = req.body;
    
    const query = `
      UPDATE rooms 
      SET room_type = COALESCE($2, room_type),
          description = COALESCE($3, description),
          price_per_night = COALESCE($4, price_per_night),
          max_occupancy = COALESCE($5, max_occupancy),
          amenities = COALESCE($6, amenities),
          images = COALESCE($7, images),
          status = COALESCE($8, status),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, room_type, description, price_per_night, max_occupancy, amenities, images, status]);
    res.json({ success: true, room: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete room
router.delete('/rooms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE rooms SET status = 'inactive', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );
    
    res.json({ success: true, room: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload photos
router.post('/gallery/upload', async (req, res) => {
  try {
    const { hotel_id, room_id, image_urls, image_type } = req.body;
    
    if (hotel_id) {
      // Update hotel images
      const result = await pool.query(
        "UPDATE hotels SET images = array_cat(COALESCE(images, '{}'), $1) WHERE id = $2 RETURNING images",
        [image_urls, hotel_id]
      );
      res.json({ success: true, images: result.rows[0].images });
    } else if (room_id) {
      // Update room images
      const result = await pool.query(
        "UPDATE rooms SET images = array_cat(COALESCE(images, '{}'), $1) WHERE id = $2 RETURNING images",
        [image_urls, room_id]
      );
      res.json({ success: true, images: result.rows[0].images });
    } else {
      res.status(400).json({ success: false, error: 'Either hotel_id or room_id is required' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update pricing
router.put('/pricing/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { price_per_night, seasonal_pricing, weekend_pricing } = req.body;
    
    const query = `
      UPDATE rooms 
      SET price_per_night = COALESCE($2, price_per_night),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [roomId, price_per_night]);
    res.json({ success: true, room: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get calendar
router.get('/calendar/:hotelId', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { month, year } = req.query;
    
    const query = `
      SELECT 
        b.check_in_date,
        b.check_out_date,
        b.status,
        r.room_type,
        u.name as guest_name
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN users u ON b.user_id = u.id
      WHERE b.hotel_id = $1
        AND EXTRACT(MONTH FROM b.check_in_date) = $2
        AND EXTRACT(YEAR FROM b.check_in_date) = $3
      ORDER BY b.check_in_date
    `;
    
    const result = await pool.query(query, [hotelId, month, year]);
    res.json({ success: true, bookings: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Block dates
router.post('/bookings/block-dates', async (req, res) => {
  try {
    const { hotel_id, room_id, start_date, end_date, reason } = req.body;
    
    const query = `
      INSERT INTO bookings (hotel_id, room_id, check_in_date, check_out_date, status, guests, total_amount)
      VALUES ($1, $2, $3, $4, 'blocked', 0, 0)
      RETURNING *
    `;
    
    const result = await pool.query(query, [hotel_id, room_id, start_date, end_date]);
    res.json({ success: true, blocked_booking: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Monthly earnings
router.get('/earnings/monthly/:ownerId', async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { month, year } = req.query;
    
    const query = `
      SELECT 
        DATE_TRUNC('day', p.created_at) as date,
        SUM(p.amount) as daily_earnings,
        COUNT(p.id) as bookings_count
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN hotels h ON b.hotel_id = h.id
      WHERE h.owner_id = $1
        AND EXTRACT(MONTH FROM p.created_at) = $2
        AND EXTRACT(YEAR FROM p.created_at) = $3
        AND p.status = 'completed'
      GROUP BY DATE_TRUNC('day', p.created_at)
      ORDER BY date
    `;
    
    const result = await pool.query(query, [ownerId, month, year]);
    
    const totalEarnings = result.rows.reduce((sum, row) => sum + parseFloat(row.daily_earnings), 0);
    const totalBookings = result.rows.reduce((sum, row) => sum + parseInt(row.bookings_count), 0);
    
    res.json({ 
      success: true, 
      earnings: result.rows,
      summary: {
        total_earnings: totalEarnings,
        total_bookings: totalBookings,
        average_per_booking: totalBookings > 0 ? totalEarnings / totalBookings : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;