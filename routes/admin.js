const express = require('express');
const { pool } = require('../database');
const router = express.Router();

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 50, role, status } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM users WHERE 1=1';
    const params = [];
    let paramCount = 0;
    
    if (role) {
      query += ` AND role = $${++paramCount}`;
      params.push(role);
    }
    
    if (status) {
      query += ` AND status = $${++paramCount}`;
      params.push(status);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    const countResult = await pool.query('SELECT COUNT(*) FROM users');
    
    res.json({ 
      success: true, 
      users: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update user status
router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    const query = `
      UPDATE users 
      SET status = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, status]);
    
    // Create notification for user
    if (result.rows.length > 0) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type) 
         VALUES ($1, $2, $3, $4)`,
        [id, 'Account Status Updated', `Your account status has been changed to ${status}. ${reason || ''}`, 'account']
      );
    }
    
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// User analytics
router.get('/users/analytics', async (req, res) => {
  try {
    const queries = [
      'SELECT COUNT(*) as total_users FROM users',
      'SELECT COUNT(*) as active_users FROM users WHERE status = \'active\'',
      'SELECT COUNT(*) as customers FROM users WHERE role = \'customer\'',
      'SELECT COUNT(*) as owners FROM users WHERE role = \'owner\'',
      'SELECT COUNT(*) as new_users_today FROM users WHERE DATE(created_at) = CURRENT_DATE',
      'SELECT COUNT(*) as new_users_week FROM users WHERE created_at >= CURRENT_DATE - INTERVAL \'7 days\''
    ];
    
    const results = await Promise.all(queries.map(query => pool.query(query)));
    
    const analytics = {
      total_users: parseInt(results[0].rows[0].total_users),
      active_users: parseInt(results[1].rows[0].active_users),
      customers: parseInt(results[2].rows[0].customers),
      owners: parseInt(results[3].rows[0].owners),
      new_users_today: parseInt(results[4].rows[0].new_users_today),
      new_users_week: parseInt(results[5].rows[0].new_users_week)
    };
    
    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get pending hotels
router.get('/hotels/pending', async (req, res) => {
  try {
    const query = `
      SELECT h.*, u.name as owner_name, u.email as owner_email, u.phone as owner_phone
      FROM hotels h
      JOIN users u ON h.owner_id = u.id
      WHERE h.status = 'pending'
      ORDER BY h.created_at ASC
    `;
    
    const result = await pool.query(query);
    res.json({ success: true, hotels: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Approve hotel
router.put('/hotels/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;
    
    const query = `
      UPDATE hotels 
      SET status = $2, admin_notes = $3, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, status, admin_notes]);
    
    if (result.rows.length > 0) {
      const hotel = result.rows[0];
      
      // Notify hotel owner
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type) 
         VALUES ($1, $2, $3, $4)`,
        [
          hotel.owner_id, 
          'Hotel Status Updated', 
          `Your hotel "${hotel.name}" has been ${status}. ${admin_notes || ''}`, 
          'hotel'
        ]
      );
    }
    
    res.json({ success: true, hotel: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete hotel
router.delete('/hotels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Get hotel details first
    const hotelResult = await pool.query('SELECT * FROM hotels WHERE id = $1', [id]);
    
    if (hotelResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Hotel not found' });
    }
    
    const hotel = hotelResult.rows[0];
    
    // Soft delete - update status instead of actual deletion
    await pool.query(
      "UPDATE hotels SET status = 'deleted', admin_notes = $2, updated_at = NOW() WHERE id = $1",
      [id, reason]
    );
    
    // Notify owner
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type) 
       VALUES ($1, $2, $3, $4)`,
      [hotel.owner_id, 'Hotel Removed', `Your hotel "${hotel.name}" has been removed. ${reason || ''}`, 'hotel']
    );
    
    res.json({ success: true, message: 'Hotel deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Booking analytics
router.get('/bookings/analytics', async (req, res) => {
  try {
    const queries = [
      'SELECT COUNT(*) as total_bookings FROM bookings',
      'SELECT COUNT(*) as confirmed_bookings FROM bookings WHERE status = \'confirmed\'',
      'SELECT COUNT(*) as pending_bookings FROM bookings WHERE status = \'pending\'',
      'SELECT COUNT(*) as cancelled_bookings FROM bookings WHERE status = \'cancelled\'',
      'SELECT COUNT(*) as todays_bookings FROM bookings WHERE DATE(created_at) = CURRENT_DATE',
      'SELECT AVG(total_amount) as avg_booking_value FROM bookings WHERE status = \'confirmed\'',
      'SELECT SUM(total_amount) as total_revenue FROM bookings b JOIN payments p ON b.id = p.booking_id WHERE p.status = \'completed\''
    ];
    
    const results = await Promise.all(queries.map(query => pool.query(query)));
    
    const analytics = {
      total_bookings: parseInt(results[0].rows[0].total_bookings),
      confirmed_bookings: parseInt(results[1].rows[0].confirmed_bookings),
      pending_bookings: parseInt(results[2].rows[0].pending_bookings),
      cancelled_bookings: parseInt(results[3].rows[0].cancelled_bookings),
      todays_bookings: parseInt(results[4].rows[0].todays_bookings),
      avg_booking_value: parseFloat(results[5].rows[0].avg_booking_value) || 0,
      total_revenue: parseFloat(results[6].rows[0].total_revenue) || 0
    };
    
    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Resolve booking
router.put('/bookings/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes, refund_amount } = req.body;
    
    const query = `
      UPDATE bookings 
      SET status = $2, admin_notes = $3, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, status, admin_notes]);
    
    if (result.rows.length > 0 && refund_amount) {
      // Process refund if specified
      const booking = result.rows[0];
      await pool.query(
        "UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2",
        [refund_amount, booking.user_id]
      );
    }
    
    res.json({ success: true, booking: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Revenue data
router.get('/revenue', async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    
    let dateFormat = 'YYYY-MM';
    if (period === 'daily') dateFormat = 'YYYY-MM-DD';
    if (period === 'yearly') dateFormat = 'YYYY';
    
    const query = `
      SELECT 
        TO_CHAR(p.created_at, '${dateFormat}') as period,
        SUM(p.amount) as revenue,
        COUNT(p.id) as transactions
      FROM payments p
      WHERE p.status = 'completed'
        AND p.created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY TO_CHAR(p.created_at, '${dateFormat}')
      ORDER BY period
    `;
    
    const result = await pool.query(query);
    
    const totalRevenue = result.rows.reduce((sum, row) => sum + parseFloat(row.revenue), 0);
    const totalTransactions = result.rows.reduce((sum, row) => sum + parseInt(row.transactions), 0);
    
    res.json({ 
      success: true, 
      revenue_data: result.rows,
      summary: {
        total_revenue: totalRevenue,
        total_transactions: totalTransactions,
        average_transaction: totalTransactions > 0 ? totalRevenue / totalTransactions : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// System logs
router.get('/system-logs', async (req, res) => {
  try {
    const { page = 1, limit = 100, level } = req.query;
    const offset = (page - 1) * limit;
    
    // Mock system logs - in real implementation, this would come from a logging system
    const logs = [
      { id: 1, timestamp: new Date(), level: 'INFO', message: 'User login successful', module: 'AUTH' },
      { id: 2, timestamp: new Date(), level: 'ERROR', message: 'Database connection timeout', module: 'DB' },
      { id: 3, timestamp: new Date(), level: 'WARN', message: 'High memory usage detected', module: 'SYSTEM' }
    ];
    
    res.json({ 
      success: true, 
      logs: logs.slice(offset, offset + limit),
      total: logs.length,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update support ticket
router.put('/support-tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_response, priority } = req.body;
    
    // Mock ticket update - in real implementation, this would update a tickets table
    const ticket = {
      id,
      status: status || 'in_progress',
      admin_response,
      priority: priority || 'medium',
      updated_at: new Date()
    };
    
    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Pricing algorithm data
router.get('/pricing-algorithm', async (req, res) => {
  try {
    const query = `
      SELECT 
        h.city,
        AVG(r.price_per_night) as avg_price,
        COUNT(b.id) as booking_count,
        AVG(rv.rating) as avg_rating
      FROM hotels h
      JOIN rooms r ON h.id = r.hotel_id
      LEFT JOIN bookings b ON r.id = b.room_id
      LEFT JOIN reviews rv ON h.id = rv.hotel_id
      WHERE h.status = 'active'
      GROUP BY h.city
      ORDER BY booking_count DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({ 
      success: true, 
      pricing_data: result.rows,
      algorithm_status: 'active',
      last_updated: new Date()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;