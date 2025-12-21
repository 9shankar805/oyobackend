const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://oyo_database_user:W7nTLEDfTihKcZCTLarqOrulzFF3pEAX@dpg-d542n47gi27c73cfovig-a.oregon-postgres.render.com/oyo_database',
  ssl: { rejectUnauthorized: false }
});

async function addOwnerColumn() {
  try {
    console.log('🔄 Adding owner_id column...');
    
    await pool.query(`
      ALTER TABLE hotels 
      ADD COLUMN IF NOT EXISTS owner_id INTEGER REFERENCES users(id);
    `);

    // Update existing hotels with owner_id = 1
    await pool.query(`
      UPDATE hotels SET owner_id = 1 WHERE owner_id IS NULL;
    `);

    console.log('✅ Owner column added successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addOwnerColumn();