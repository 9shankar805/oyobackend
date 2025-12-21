const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://oyo_database_user:W7nTLEDfTihKcZCTLarqOrulzFF3pEAX@dpg-d542n47gi27c73cfovig-a.oregon-postgres.render.com/oyo_database',
  ssl: { rejectUnauthorized: false }
});

async function addRoleColumn() {
  try {
    console.log('🔄 Adding role column to users...');
    
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer';
    `);

    console.log('✅ Role column added successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addRoleColumn();