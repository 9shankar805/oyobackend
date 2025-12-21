const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3007;

app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/oyo_analytics'
});

// Get dashboard analytics
app.get('/dashboard', async (req, res) => {
  const { period = '30d' } = req.query;
  
  try {
    const periodCondition = getPeriodCondition(period);
    
    // Get key metrics
    const metricsQuery = `
      SELECT 
        COUNT(DISTINCT b.id) as total_bookings,
        COUNT(DISTINCT b.user_id) as unique_users,
        COUNT(DISTINCT b.hotel_id) as active_hotels,
        SUM(b.total_amount) as total_revenue,
        AVG(b.total_amount) as avg_booking_value,
        COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) as cancelled_bookings
      FROM bookings b
      WHERE b.created_at >= ${periodCondition}
    `;
    
    const metricsResult = await pool.query(metricsQuery);
    const metrics = metricsResult.rows[0];

    // Get revenue trend
    const trendQuery = `
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        COUNT(*) as bookings,
        SUM(total_amount) as revenue
      FROM bookings
      WHERE created_at >= ${periodCondition}
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date
    `;
    
    const trendResult = await pool.query(trendQuery);

    // Get top performing hotels
    const topHotelsQuery = `
      SELECT 
        h.name,
        h.city,
        COUNT(b.id) as booking_count,
        SUM(b.total_amount) as revenue,
        AVG(r.rating) as avg_rating
      FROM hotels h
      JOIN bookings b ON h.id = b.hotel_id
      LEFT JOIN reviews r ON h.id = r.hotel_id
      WHERE b.created_at >= ${periodCondition}
      GROUP BY h.id, h.name, h.city
      ORDER BY revenue DESC
      LIMIT 10
    `;
    
    const topHotelsResult = await pool.query(topHotelsQuery);

    // Get city performance
    const cityQuery = `
      SELECT 
        h.city,
        COUNT(b.id) as bookings,
        SUM(b.total_amount) as revenue,
        COUNT(DISTINCT h.id) as hotel_count
      FROM hotels h
      JOIN bookings b ON h.id = b.hotel_id
      WHERE b.created_at >= ${periodCondition}
      GROUP BY h.city
      ORDER BY revenue DESC
      LIMIT 10
    `;
    
    const cityResult = await pool.query(cityQuery);

    res.json({
      success: true,
      data: {
        metrics: {
          total_bookings: parseInt(metrics.total_bookings),
          unique_users: parseInt(metrics.unique_users),
          active_hotels: parseInt(metrics.active_hotels),
          total_revenue: parseFloat(metrics.total_revenue) || 0,
          avg_booking_value: parseFloat(metrics.avg_booking_value) || 0,
          conversion_rate: metrics.total_bookings > 0 ? 
            (parseInt(metrics.confirmed_bookings) / parseInt(metrics.total_bookings) * 100).toFixed(2) : 0,
          cancellation_rate: metrics.total_bookings > 0 ? 
            (parseInt(metrics.cancelled_bookings) / parseInt(metrics.total_bookings) * 100).toFixed(2) : 0
        },
        trends: {
          revenue: trendResult.rows,
          bookings: trendResult.rows
        },
        top_hotels: topHotelsResult.rows,
        city_performance: cityResult.rows
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: 'Failed to get dashboard analytics' });
  }
});

// Get user analytics
app.get('/users', async (req, res) => {
  const { period = '30d' } = req.query;
  
  try {
    const periodCondition = getPeriodCondition(period);
    
    // User registration trends
    const registrationQuery = `
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        COUNT(*) as new_users
      FROM users
      WHERE created_at >= ${periodCondition}
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date
    `;
    
    const registrationResult = await pool.query(registrationQuery);

    // User engagement metrics
    const engagementQuery = `
      SELECT 
        COUNT(DISTINCT user_id) as active_users,
        COUNT(DISTINCT CASE WHEN booking_count >= 2 THEN user_id END) as repeat_users,
        AVG(booking_count) as avg_bookings_per_user
      FROM (
        SELECT 
          user_id,
          COUNT(*) as booking_count
        FROM bookings
        WHERE created_at >= ${periodCondition}
        GROUP BY user_id
      ) user_bookings
    `;
    
    const engagementResult = await pool.query(engagementQuery);

    res.json({
      success: true,
      data: {
        registration_trend: registrationResult.rows,
        engagement: engagementResult.rows[0]
      }
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ error: 'Failed to get user analytics' });
  }
});

// Get hotel performance analytics
app.get('/hotels/:hotelId', async (req, res) => {
  const { hotelId } = req.params;
  const { period = '30d' } = req.query;
  
  try {
    const periodCondition = getPeriodCondition(period);
    
    // Hotel performance metrics
    const performanceQuery = `
      SELECT 
        COUNT(b.id) as total_bookings,
        SUM(b.total_amount) as total_revenue,
        AVG(b.total_amount) as avg_booking_value,
        COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) as cancelled_bookings,
        AVG(r.rating) as avg_rating,
        COUNT(r.id) as review_count
      FROM bookings b
      LEFT JOIN reviews r ON b.hotel_id = r.hotel_id
      WHERE b.hotel_id = $1 AND b.created_at >= ${periodCondition}
    `;
    
    const performanceResult = await pool.query(performanceQuery, [hotelId]);

    // Daily performance trend
    const trendQuery = `
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        COUNT(*) as bookings,
        SUM(total_amount) as revenue
      FROM bookings
      WHERE hotel_id = $1 AND created_at >= ${periodCondition}
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date
    `;
    
    const trendResult = await pool.query(trendQuery, [hotelId]);

    // Room type performance
    const roomQuery = `
      SELECT 
        r.room_type,
        COUNT(b.id) as bookings,
        SUM(b.total_amount) as revenue,
        AVG(b.total_amount) as avg_price
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.hotel_id = $1 AND b.created_at >= ${periodCondition}
      GROUP BY r.room_type
      ORDER BY revenue DESC
    `;
    
    const roomResult = await pool.query(roomQuery, [hotelId]);

    res.json({
      success: true,
      data: {
        performance: performanceResult.rows[0],
        trends: trendResult.rows,
        room_performance: roomResult.rows
      }
    });
  } catch (error) {
    console.error('Hotel analytics error:', error);
    res.status(500).json({ error: 'Failed to get hotel analytics' });
  }
});

// Get revenue analytics
app.get('/revenue', async (req, res) => {
  const { period = '30d', group_by = 'day' } = req.query;
  
  try {
    const periodCondition = getPeriodCondition(period);
    const groupBy = getGroupByClause(group_by);
    
    // Revenue breakdown
    const revenueQuery = `
      SELECT 
        ${groupBy} as period,
        SUM(total_amount) as total_revenue,
        SUM(base_amount) as base_revenue,
        SUM(tax_amount) as tax_revenue,
        COUNT(*) as booking_count,
        AVG(total_amount) as avg_booking_value
      FROM bookings
      WHERE created_at >= ${periodCondition} AND status = 'confirmed'
      GROUP BY ${groupBy}
      ORDER BY period
    `;
    
    const revenueResult = await pool.query(revenueQuery);

    // Revenue by city
    const cityRevenueQuery = `
      SELECT 
        h.city,
        SUM(b.total_amount) as revenue,
        COUNT(b.id) as bookings
      FROM bookings b
      JOIN hotels h ON b.hotel_id = h.id
      WHERE b.created_at >= ${periodCondition} AND b.status = 'confirmed'
      GROUP BY h.city
      ORDER BY revenue DESC
      LIMIT 10
    `;
    
    const cityRevenueResult = await pool.query(cityRevenueQuery);

    res.json({
      success: true,
      data: {
        revenue_trend: revenueResult.rows,
        city_revenue: cityRevenueResult.rows
      }
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ error: 'Failed to get revenue analytics' });
  }
});

// Track custom event
app.post('/events', async (req, res) => {
  const {
    user_id,
    event_type,
    event_data = {},
    session_id
  } = req.body;

  try {
    await pool.query(`
      INSERT INTO analytics_events (user_id, event_type, event_data, session_id, created_at)
      VALUES ($1, $2, $3, $4, NOW())
    `, [user_id, event_type, JSON.stringify(event_data), session_id]);

    res.json({
      success: true,
      message: 'Event tracked successfully'
    });
  } catch (error) {
    console.error('Track event error:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

// Helper functions
function getPeriodCondition(period) {
  switch (period) {
    case '7d':
      return "NOW() - INTERVAL '7 days'";
    case '30d':
      return "NOW() - INTERVAL '30 days'";
    case '90d':
      return "NOW() - INTERVAL '90 days'";
    case '1y':
      return "NOW() - INTERVAL '1 year'";
    default:
      return "NOW() - INTERVAL '30 days'";
  }
}

function getGroupByClause(groupBy) {
  switch (groupBy) {
    case 'hour':
      return "DATE_TRUNC('hour', created_at)";
    case 'day':
      return "DATE_TRUNC('day', created_at)";
    case 'week':
      return "DATE_TRUNC('week', created_at)";
    case 'month':
      return "DATE_TRUNC('month', created_at)";
    default:
      return "DATE_TRUNC('day', created_at)";
  }
}

app.listen(PORT, () => {
  console.log(`Analytics Service running on port ${PORT}`);
});