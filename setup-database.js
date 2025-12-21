const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function setupDatabase() {
  try {
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        avatar TEXT,
        wallet_balance DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS hotels (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        amenities JSONB DEFAULT '[]',
        images JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        hotel_id INTEGER REFERENCES hotels(id),
        room_type VARCHAR(100) NOT NULL,
        price_per_night DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Insert sample data
    await pool.query(`
      INSERT INTO hotels (name, city, address) VALUES 
      ('OYO Premium Hotel', 'Mumbai', 'Andheri West, Mumbai'),
      ('OYO Business Hotel', 'Delhi', 'Connaught Place, Delhi')
      ON CONFLICT DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO rooms (hotel_id, room_type, price_per_night) VALUES 
      (1, 'Deluxe Room', 1500),
      (2, 'Executive Room', 2000)
      ON CONFLICT DO NOTHING;
    `);

    console.log('✅ Database setup complete');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
  }
}

setupDatabase();