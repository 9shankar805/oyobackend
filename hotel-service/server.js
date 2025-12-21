const express = require('express');
const { Pool } = require('pg');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/oyo_hotels'
});

// Get hotel details
app.get('/:hotelId', async (req, res) => {
  const { hotelId } = req.params;

  try {
    const hotelResult = await pool.query(`
      SELECT h.*, 
             AVG(r.rating) as average_rating,
             COUNT(r.id) as review_count
      FROM hotels h
      LEFT JOIN reviews r ON h.id = r.hotel_id
      WHERE h.id = $1 AND h.status = 'active'
      GROUP BY h.id
    `, [hotelId]);

    if (hotelResult.rows.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const hotel = hotelResult.rows[0];

    // Get hotel amenities
    const amenitiesResult = await pool.query(
      'SELECT a.* FROM amenities a JOIN hotel_amenities ha ON a.id = ha.amenity_id WHERE ha.hotel_id = $1',
      [hotelId]
    );

    // Get hotel images
    const imagesResult = await pool.query(
      'SELECT * FROM images WHERE hotel_id = $1 ORDER BY is_primary DESC, created_at ASC',
      [hotelId]
    );

    // Get available room types
    const roomsResult = await pool.query(
      'SELECT * FROM rooms WHERE hotel_id = $1 AND status = \'available\' ORDER BY base_price ASC',
      [hotelId]
    );

    res.json({
      success: true,
      data: {
        ...hotel,
        amenities: amenitiesResult.rows,
        images: imagesResult.rows,
        rooms: roomsResult.rows
      }
    });
  } catch (error) {
    console.error('Get hotel error:', error);
    res.status(500).json({ error: 'Failed to get hotel details' });
  }
});

// Get hotels by location
app.get('/location/:city', async (req, res) => {
  const { city } = req.params;
  const { 
    min_price, 
    max_price, 
    amenities, 
    sort_by = 'rating',
    page = 1,
    limit = 10 
  } = req.query;

  try {
    let query = `
      SELECT h.*, 
             AVG(r.rating) as average_rating,
             COUNT(r.id) as review_count,
             MIN(rm.base_price) as starting_price
      FROM hotels h
      LEFT JOIN reviews r ON h.id = r.hotel_id
      LEFT JOIN rooms rm ON h.id = rm.hotel_id
      WHERE h.city ILIKE $1 AND h.status = 'active'
    `;
    
    const queryParams = [`%${city}%`];
    let paramCount = 1;

    // Add price filters
    if (min_price) {
      paramCount++;
      query += ` AND rm.base_price >= $${paramCount}`;
      queryParams.push(min_price);
    }
    
    if (max_price) {
      paramCount++;
      query += ` AND rm.base_price <= $${paramCount}`;
      queryParams.push(max_price);
    }

    query += ' GROUP BY h.id';

    // Add sorting
    switch (sort_by) {
      case 'price':
        query += ' ORDER BY starting_price ASC';
        break;
      case 'rating':
        query += ' ORDER BY average_rating DESC NULLS LAST';
        break;
      case 'distance':
        // TODO: Add distance calculation based on user location
        query += ' ORDER BY h.created_at DESC';
        break;
      default:
        query += ' ORDER BY average_rating DESC NULLS LAST';
    }

    // Add pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Get total count for pagination
    const countResult = await pool.query(
      'SELECT COUNT(DISTINCT h.id) FROM hotels h WHERE h.city ILIKE $1 AND h.status = \'active\'',
      [`%${city}%`]
    );

    res.json({
      success: true,
      data: {
        hotels: result.rows,
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get hotels by location error:', error);
    res.status(500).json({ error: 'Failed to get hotels' });
  }
});

// Get hotel reviews
app.get('/:hotelId/reviews', async (req, res) => {
  const { hotelId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const offset = (page - 1) * limit;
    
    const result = await pool.query(`
      SELECT r.*, u.first_name, u.last_name, u.profile_image
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.hotel_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `, [hotelId, limit, offset]);

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM reviews WHERE hotel_id = $1',
      [hotelId]
    );

    res.json({
      success: true,
      data: {
        reviews: result.rows,
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

// Add hotel review
app.post('/:hotelId/reviews', [
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').isLength({ min: 1, max: 1000 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { hotelId } = req.params;
  const { rating, comment } = req.body;
  
  // TODO: Extract user ID from JWT token
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // Check if user has stayed at this hotel
    const bookingCheck = await pool.query(
      'SELECT id FROM bookings WHERE user_id = $1 AND hotel_id = $2 AND status = \'completed\'',
      [userId, hotelId]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(400).json({ error: 'You can only review hotels you have stayed at' });
    }

    // Check if user already reviewed this hotel
    const existingReview = await pool.query(
      'SELECT id FROM reviews WHERE user_id = $1 AND hotel_id = $2',
      [userId, hotelId]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({ error: 'You have already reviewed this hotel' });
    }

    const result = await pool.query(
      'INSERT INTO reviews (user_id, hotel_id, rating, comment, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [userId, hotelId, rating, comment]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

// Get room availability
app.get('/:hotelId/availability', async (req, res) => {
  const { hotelId } = req.params;
  const { check_in, check_out } = req.query;

  if (!check_in || !check_out) {
    return res.status(400).json({ error: 'Check-in and check-out dates are required' });
  }

  try {
    const result = await pool.query(`
      SELECT r.*, 
             CASE 
               WHEN ra.date IS NULL THEN true 
               ELSE ra.available 
             END as available
      FROM rooms r
      LEFT JOIN room_availability ra ON r.id = ra.room_id 
        AND ra.date BETWEEN $2 AND $3
      WHERE r.hotel_id = $1 AND r.status = 'available'
      GROUP BY r.id, ra.date, ra.available
      HAVING COUNT(CASE WHEN ra.available = false THEN 1 END) = 0
    `, [hotelId, check_in, check_out]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ error: 'Failed to get availability' });
  }
});

app.listen(PORT, () => {
  console.log(`Hotel Service running on port ${PORT}`);
});