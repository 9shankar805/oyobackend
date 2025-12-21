const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3006;

app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/oyo_search'
});

// Search hotels
app.get('/hotels', async (req, res) => {
  const {
    location,
    check_in,
    check_out,
    guests = 1,
    rooms = 1,
    min_price,
    max_price,
    amenities,
    sort_by = 'rating',
    page = 1,
    limit = 20
  } = req.query;

  if (!location || !check_in || !check_out) {
    return res.status(400).json({ 
      error: 'Location, check-in, and check-out dates are required' 
    });
  }

  try {
    let query = `
      SELECT DISTINCT h.*, 
             AVG(r.rating) as average_rating,
             COUNT(r.id) as review_count,
             MIN(rm.base_price) as starting_price,
             array_agg(DISTINCT jsonb_build_object(
               'id', a.id, 'name', a.name, 'icon', a.icon
             )) FILTER (WHERE a.id IS NOT NULL) as amenities,
             array_agg(DISTINCT jsonb_build_object(
               'url', img.url, 'is_primary', img.is_primary
             )) FILTER (WHERE img.id IS NOT NULL) as images
      FROM hotels h
      LEFT JOIN reviews r ON h.id = r.hotel_id
      LEFT JOIN rooms rm ON h.id = rm.hotel_id
      LEFT JOIN hotel_amenities ha ON h.id = ha.hotel_id
      LEFT JOIN amenities a ON ha.amenity_id = a.id
      LEFT JOIN images img ON h.id = img.hotel_id
      WHERE h.status = 'active'
        AND (h.city ILIKE $1 OR h.state ILIKE $1 OR h.address ILIKE $1)
        AND rm.capacity >= $2
        AND NOT EXISTS (
          SELECT 1 FROM bookings b 
          WHERE b.room_id = rm.id 
          AND b.status IN ('confirmed', 'checked_in')
          AND (
            (b.check_in_date <= $3 AND b.check_out_date > $3) OR
            (b.check_in_date < $4 AND b.check_out_date >= $4) OR
            (b.check_in_date >= $3 AND b.check_out_date <= $4)
          )
        )
    `;

    const queryParams = [`%${location}%`, guests, check_in, check_out];
    let paramCount = 4;

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

    // Add amenity filters
    if (amenities) {
      const amenityList = amenities.split(',');
      paramCount++;
      query += ` AND h.id IN (
        SELECT ha2.hotel_id FROM hotel_amenities ha2 
        JOIN amenities a2 ON ha2.amenity_id = a2.id
        WHERE a2.id = ANY($${paramCount})
        GROUP BY ha2.hotel_id
        HAVING COUNT(DISTINCT a2.id) = ${amenityList.length}
      )`;
      queryParams.push(amenityList);
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
      case 'popularity':
        query += ' ORDER BY review_count DESC';
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
    let countQuery = `
      SELECT COUNT(DISTINCT h.id) 
      FROM hotels h
      LEFT JOIN rooms rm ON h.id = rm.hotel_id
      WHERE h.status = 'active'
        AND (h.city ILIKE $1 OR h.state ILIKE $1 OR h.address ILIKE $1)
        AND rm.capacity >= $2
    `;
    const countParams = [`%${location}%`, guests];

    if (min_price) {
      countQuery += ` AND rm.base_price >= ${min_price}`;
    }
    if (max_price) {
      countQuery += ` AND rm.base_price <= ${max_price}`;
    }

    const countResult = await pool.query(countQuery, countParams);

    // Get available filters
    const filtersQuery = `
      SELECT 
        MIN(rm.base_price) as min_price,
        MAX(rm.base_price) as max_price,
        array_agg(DISTINCT jsonb_build_object(
          'id', a.id, 'name', a.name, 'count', 
          (SELECT COUNT(*) FROM hotel_amenities ha2 WHERE ha2.amenity_id = a.id)
        )) FILTER (WHERE a.id IS NOT NULL) as available_amenities
      FROM hotels h
      LEFT JOIN rooms rm ON h.id = rm.hotel_id
      LEFT JOIN hotel_amenities ha ON h.id = ha.hotel_id
      LEFT JOIN amenities a ON ha.amenity_id = a.id
      WHERE h.status = 'active'
        AND (h.city ILIKE $1 OR h.state ILIKE $1 OR h.address ILIKE $1)
    `;

    const filtersResult = await pool.query(filtersQuery, [`%${location}%`]);

    res.json({
      success: true,
      data: {
        hotels: result.rows.map(hotel => ({
          ...hotel,
          amenities: hotel.amenities || [],
          images: hotel.images || []
        })),
        filters: {
          price_range: {
            min: filtersResult.rows[0]?.min_price || 0,
            max: filtersResult.rows[0]?.max_price || 10000
          },
          amenities: filtersResult.rows[0]?.available_amenities || []
        },
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: parseInt(countResult.rows[0].count),
          total_pages: Math.ceil(countResult.rows[0].count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Search hotels error:', error);
    res.status(500).json({ error: 'Failed to search hotels' });
  }
});

// Get search suggestions
app.get('/suggestions', async (req, res) => {
  const { query } = req.query;

  if (!query || query.length < 2) {
    return res.json({ success: true, data: [] });
  }

  try {
    const result = await pool.query(`
      SELECT DISTINCT city, state, country,
             COUNT(*) as hotel_count
      FROM hotels 
      WHERE status = 'active' 
        AND (city ILIKE $1 OR state ILIKE $1 OR address ILIKE $1)
      GROUP BY city, state, country
      ORDER BY hotel_count DESC
      LIMIT 10
    `, [`%${query}%`]);

    const suggestions = result.rows.map(row => ({
      location: `${row.city}, ${row.state}`,
      type: 'city',
      hotel_count: row.hotel_count
    }));

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// Get popular destinations
app.get('/popular-destinations', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT city, state, country,
             COUNT(*) as hotel_count,
             AVG(r.rating) as average_rating,
             MIN(rm.base_price) as starting_price
      FROM hotels h
      LEFT JOIN reviews r ON h.id = r.hotel_id
      LEFT JOIN rooms rm ON h.id = rm.hotel_id
      WHERE h.status = 'active'
      GROUP BY city, state, country
      HAVING COUNT(*) >= 5
      ORDER BY hotel_count DESC, average_rating DESC
      LIMIT 20
    `);

    const destinations = result.rows.map(row => ({
      location: `${row.city}, ${row.state}`,
      hotel_count: row.hotel_count,
      average_rating: parseFloat(row.average_rating) || 0,
      starting_price: parseFloat(row.starting_price) || 0
    }));

    res.json({
      success: true,
      data: destinations
    });
  } catch (error) {
    console.error('Get popular destinations error:', error);
    res.status(500).json({ error: 'Failed to get popular destinations' });
  }
});

// Advanced search with filters
app.post('/advanced', async (req, res) => {
  const {
    location,
    check_in,
    check_out,
    guests = 1,
    rooms = 1,
    filters = {}
  } = req.body;

  const {
    price_range,
    star_rating,
    amenities,
    property_type,
    guest_rating,
    distance_from_center
  } = filters;

  try {
    let query = `
      SELECT DISTINCT h.*, 
             AVG(r.rating) as average_rating,
             COUNT(r.id) as review_count,
             MIN(rm.base_price) as starting_price
      FROM hotels h
      LEFT JOIN reviews r ON h.id = r.hotel_id
      LEFT JOIN rooms rm ON h.id = rm.hotel_id
      WHERE h.status = 'active'
        AND (h.city ILIKE $1 OR h.state ILIKE $1)
        AND rm.capacity >= $2
    `;

    const queryParams = [`%${location}%`, guests];
    let paramCount = 2;

    // Add various filters
    if (price_range) {
      paramCount++;
      query += ` AND rm.base_price BETWEEN $${paramCount} AND $${paramCount + 1}`;
      queryParams.push(price_range.min, price_range.max);
      paramCount++;
    }

    if (star_rating && star_rating.length > 0) {
      paramCount++;
      query += ` AND h.star_rating = ANY($${paramCount})`;
      queryParams.push(star_rating);
    }

    query += ' GROUP BY h.id';

    if (guest_rating) {
      query += ` HAVING AVG(r.rating) >= ${guest_rating}`;
    }

    query += ' ORDER BY average_rating DESC NULLS LAST LIMIT 50';

    const result = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: {
        hotels: result.rows,
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ error: 'Advanced search failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Search Service running on port ${PORT}`);
});