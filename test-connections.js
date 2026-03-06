const axios = require('axios');

async function testConnections() {
  console.log('🔍 Testing service connections...\n');
  
  try {
    // Test API health
    const apiHealth = await axios.get('http://localhost:4000/health');
    console.log('✅ API Health:', apiHealth.data);
    
    // Test API ready (database)
    const apiReady = await axios.get('http://localhost:4000/ready');
    console.log('✅ API Database:', apiReady.data);
    
    // Test Frontend (if running)
    try {
      const frontend = await axios.get('http://localhost:5173');
      console.log('✅ Frontend: Connected');
    } catch (e) {
      console.log('⚠️  Frontend: Not running or not accessible');
    }
    
    console.log('\n🎉 All services are connected!');
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

if (require.main === module) {
  testConnections();
}

module.exports = { testConnections };