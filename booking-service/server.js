const express = require('express');
const { Pool } = require('pg');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/oyo_bookings'
});

// Create booking
app.post('/', [
  body('hotel_id').isUUID(),
  body('room_id').isUUID(),
  body('check_in_date').isISO8601(),
  body('check_out_date').isISO8601(),
  body('guests_count').isInt({ min: 1, max: 10 }),
  body('guest_details.first_name').isLength({ min: 1 }),
  body('guest_details.last_name').isLength({ min: 1 }),
  body('guest_details.email').isEmail(),
  body('guest_details.phone').isMobilePhone()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    hotel_id,
    room_id,
    check_in_date,
    check_out_date,
    guests_count,
    guest_details,
    special_requests
  } = req.body;

  // TODO: Extract user ID from JWT token
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check room availability
    const availabilityCheck = await client.query(`
      SELECT r.base_price, r.capacity
      FROM rooms r
      WHERE r.id = $1 AND r.hotel_id = $2 AND r.status = 'available'
      AND NOT EXISTS (
        SELECT 1 FROM bookings b 
        WHERE b.room_id = $1 
        AND b.status IN ('confirmed', 'checked_in')
        AND (
          (b.check_in_date <= $3 AND b.check_out_date > $3) OR
          (b.check_in_date < $4 AND b.check_out_date >= $4) OR
          (b.check_in_date >= $3 AND b.check_out_date <= $4)
        )
      )
    `, [room_id, hotel_id, check_in_date, check_out_date]);

    if (availabilityCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Room not available for selected dates' });
    }

    const room = availabilityCheck.rows[0];

    if (guests_count > room.capacity) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Guest count exceeds room capacity' });
    }

    // Calculate total amount
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const baseAmount = room.base_price * nights;
    const taxAmount = baseAmount * 0.18; // 18% tax
    const totalAmount = baseAmount + taxAmount;

    // Generate confirmation number
    const confirmationNumber = 'OYO' + Date.now().toString().slice(-6);

    // Create booking
    const bookingResult = await client.query(`
      INSERT INTO bookings (
        id, user_id, hotel_id, room_id, check_in_date, check_out_date,
        guests_count, guest_details, special_requests, base_amount,
        tax_amount, total_amount, confirmation_number, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'confirmed', NOW())
      RETURNING *
    `, [
      uuidv4(), userId, hotel_id, room_id, check_in_date, check_out_date,
      guests_count, JSON.stringify(guest_details), special_requests,
      baseAmount, taxAmount, totalAmount, confirmationNumber
    ]);

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: {
        booking_id: bookingResult.rows[0].id,
        confirmation_number: confirmationNumber,
        total_amount: totalAmount,
        status: 'confirmed'
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  } finally {
    client.release();
  }
});

// Get user bookings
app.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const { status, page = 1, limit = 10 } = req.query;

  try {
    let query = `
      SELECT b.*, h.name as hotel_name, h.address, h.city,
             r.room_type, r.capacity
      FROM bookings b
      JOIN hotels h ON b.hotel_id = h.id
      JOIN rooms r ON b.room_id = r.id
      WHERE b.user_id = $1
    `;
    
    const queryParams = [userId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND b.status = $${paramCount}`;
      queryParams.push(status);
    }

    query += ' ORDER BY b.created_at DESC';

    // Add pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM bookings WHERE user_id = $1';
    const countParams = [userId];
    
    if (status) {
      countQuery += ' AND status = $2';
      countParams.push(status);
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: {
        bookings: result.rows,
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
});

// Get booking details
app.get('/:bookingId', async (req, res) => {
  const { bookingId } = req.params;

  try {
    const result = await pool.query(`
      SELECT b.*, h.name as hotel_name, h.address, h.city, h.phone as hotel_phone,
             r.room_type, r.capacity, r.amenities as room_amenities
      FROM bookings b
      JOIN hotels h ON b.hotel_id = h.id
      JOIN rooms r ON b.room_id = r.id
      WHERE b.id = $1
    `, [bookingId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get booking details error:', error);
    res.status(500).json({ error: 'Failed to get booking details' });
  }
});

// Cancel booking
app.put('/:bookingId/cancel', async (req, res) => {
  const { bookingId } = req.params;
  const { cancellation_reason } = req.body;

  try {
    // Check if booking exists and can be cancelled
    const bookingCheck = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND status IN (\'confirmed\', \'pending\')',
      [bookingId]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found or cannot be cancelled' });
    }

    const booking = bookingCheck.rows[0];
    const checkInDate = new Date(booking.check_in_date);
    const now = new Date();
    const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);

    // Calculate refund amount based on cancellation policy
    let refundAmount = 0;
    if (hoursUntilCheckIn > 24) {
      refundAmount = booking.total_amount * 0.9; // 90% refund
    } else if (hoursUntilCheckIn > 6) {
      refundAmount = booking.total_amount * 0.5; // 50% refund
    }
    // No refund if less than 6 hours

    const result = await pool.query(`
      UPDATE bookings 
      SET status = 'cancelled', 
          cancellation_reason = $2,
          refund_amount = $3,
          cancelled_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [bookingId, cancellation_reason, refundAmount]);

    res.json({
      success: true,
      data: {
        booking_id: bookingId,
        status: 'cancelled',
        refund_amount: refundAmount
      }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Modify booking
app.put('/:bookingId/modify', [
  body('check_in_date').optional().isISO8601(),
  body('check_out_date').optional().isISO8601(),
  body('guests_count').optional().isInt({ min: 1, max: 10 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { bookingId } = req.params;
  const { check_in_date, check_out_date, guests_count } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get current booking
    const bookingResult = await client.query(
      'SELECT * FROM bookings WHERE id = $1 AND status = \'confirmed\'',
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Booking not found or cannot be modified' });
    }

    const booking = bookingResult.rows[0];
    const newCheckIn = check_in_date || booking.check_in_date;
    const newCheckOut = check_out_date || booking.check_out_date;
    const newGuestsCount = guests_count || booking.guests_count;

    // Check availability for new dates
    if (check_in_date || check_out_date) {
      const availabilityCheck = await client.query(`
        SELECT COUNT(*) FROM bookings 
        WHERE room_id = $1 AND id != $2 AND status IN ('confirmed', 'checked_in')
        AND (
          (check_in_date <= $3 AND check_out_date > $3) OR
          (check_in_date < $4 AND check_out_date >= $4) OR
          (check_in_date >= $3 AND check_out_date <= $4)
        )
      `, [booking.room_id, bookingId, newCheckIn, newCheckOut]);

      if (parseInt(availabilityCheck.rows[0].count) > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Room not available for new dates' });
      }
    }

    // Recalculate amount if dates changed
    let newTotalAmount = booking.total_amount;
    if (check_in_date || check_out_date) {
      const roomResult = await client.query(
        'SELECT base_price FROM rooms WHERE id = $1',
        [booking.room_id]
      );
      
      const checkIn = new Date(newCheckIn);
      const checkOut = new Date(newCheckOut);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const baseAmount = roomResult.rows[0].base_price * nights;
      const taxAmount = baseAmount * 0.18;
      newTotalAmount = baseAmount + taxAmount;
    }

    // Update booking
    const updateResult = await client.query(`
      UPDATE bookings 
      SET check_in_date = $2, check_out_date = $3, guests_count = $4,
          total_amount = $5, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [bookingId, newCheckIn, newCheckOut, newGuestsCount, newTotalAmount]);

    await client.query('COMMIT');

    res.json({
      success: true,
      data: updateResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Modify booking error:', error);
    res.status(500).json({ error: 'Failed to modify booking' });
  } finally {
    client.release();
  }
});

app.listen(PORT, () => {
  console.log(`Booking Service running on port ${PORT}`);
});