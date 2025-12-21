const { testConnection, setupDatabase } = require('./database');

async function initializeDatabase() {
  console.log('🚀 Starting database setup...');
  
  // Test connection
  const connected = await testConnection();
  if (!connected) {
    process.exit(1);
  }
  
  // Setup schema
  const schemaCreated = await setupDatabase();
  if (!schemaCreated) {
    process.exit(1);
  }
  
  console.log('✅ Database setup completed successfully!');
  console.log('📊 Tables created: users, hotels, rooms, bookings, payments, messages, notifications, reviews, analytics');
  console.log('🔍 Sample data inserted for testing');
  
  process.exit(0);
}

initializeDatabase();