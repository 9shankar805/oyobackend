const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://oyo_database_user:W7nTLEDfTihKcZCTLarqOrulzFF3pEAX@dpg-d542n47gi27c73cfovig-a.oregon-postgres.render.com/oyo_database',
  ssl: { rejectUnauthorized: false }
});

async function createAllTables() {
  try {
    console.log('🔄 Creating all database tables...');
    
    // Users table
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

    // Hotels table
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

    // Rooms table
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

    // Reviews table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        hotel_id INTEGER REFERENCES hotels(id),
        booking_id INTEGER,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Bookings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        hotel_id INTEGER REFERENCES hotels(id),
        room_id INTEGER REFERENCES rooms(id),
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        guests INTEGER DEFAULT 1,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Payments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id),
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50),
        payment_details JSONB,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id),
        sender_id INTEGER,
        sender_type VARCHAR(20),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title VARCHAR(255),
        message TEXT,
        type VARCHAR(50),
        read_status BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ All tables created successfully');

    // Insert sample data
    console.log('🔄 Inserting sample data...');

    await pool.query(`
      INSERT INTO users (name, email, phone) VALUES 
      ('John Doe', 'john@example.com', '+919876543210'),
      ('Jane Smith', 'jane@example.com', '+919876543211')
      ON CONFLICT (email) DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO hotels (name, city, address, amenities, images) VALUES 
      ('OYO Premium Hotel', 'Mumbai', 'Andheri West, Mumbai', '["WiFi", "AC", "TV", "Parking"]', '["https://via.placeholder.com/300x200"]'),
      ('OYO Business Hotel', 'Delhi', 'Connaught Place, Delhi', '["WiFi", "AC", "TV", "Gym"]', '["https://via.placeholder.com/300x200"]'),
      ('OYO Flagship Hotel', 'Bangalore', 'MG Road, Bangalore', '["WiFi", "AC", "TV", "Pool"]', '["https://via.placeholder.com/300x200"]')
      ON CONFLICT DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO rooms (hotel_id, room_type, price_per_night) VALUES 
      (1, 'Deluxe Room', 1500),
      (1, 'Premium Room', 2000),
      (2, 'Executive Room', 2500),
      (2, 'Standard Room', 1800),
      (3, 'Standard Room', 1200),
      (3, 'Deluxe Room', 1600)
      ON CONFLICT DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO reviews (user_id, hotel_id, rating, comment) VALUES 
      (1, 1, 4, 'Great hotel with excellent service'),
      (2, 1, 5, 'Amazing experience, will book again'),
      (1, 2, 4, 'Good location and clean rooms'),
      (2, 3, 3, 'Average hotel, decent for the price')
      ON CONFLICT DO NOTHING;
    `);

    console.log('✅ Sample data inserted successfully');
    console.log('🎉 Database setup complete!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

createAllTables();