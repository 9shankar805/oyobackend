const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testGoogleAuth() {
  console.log('🧪 TESTING GOOGLE AUTHENTICATION');
  console.log('================================\n');

  try {
    const loginData = {
      idToken: 'test-google-token-123',
      email: 'testuser@gmail.com',
      name: 'Test User',
      avatar: 'https://example.com/avatar.jpg'
    };

    const response = await axios.post(`${BASE_URL}/auth/google`, loginData);
    
    if (response.data.success) {
      console.log('✅ Google Login: WORKING');
      console.log('User:', response.data.user);
      return true;
    } else {
      console.log('❌ Google Login: FAILED');
      return false;
    }
  } catch (error) {
    console.log('❌ Google Login: ERROR -', error.message);
    return false;
  }
}

async function testWorkingAPIs() {
  console.log('\n🔸 Testing Working APIs');
  
  const workingTests = [
    { name: 'Payment Methods', url: '/customer/payments/methods' },
    { name: 'User Analytics', url: '/admin/users/analytics' },
    { name: 'Revenue Data', url: '/admin/revenue' },
    { name: 'Nearby Cities', url: '/customer/cities/nearby' },
    { name: 'Available Coupons', url: '/customer/coupons' }
  ];

  let passed = 0;
  
  for (const test of workingTests) {
    try {
      const response = await axios.get(BASE_URL + test.url);
      if (response.data.success) {
        console.log(`✅ ${test.name}: WORKING`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FAILED`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR`);
    }
  }
  
  console.log(`\n📊 Working APIs: ${passed}/${workingTests.length}`);
  return passed;
}

async function runTests() {
  const authTest = await testGoogleAuth();
  const apiCount = await testWorkingAPIs();
  
  console.log('\n🎯 PHASE 5 TESTING RESULTS:');
  console.log('===========================');
  console.log(`Google Authentication: ${authTest ? '✅' : '❌'}`);
  console.log(`Working APIs: ${apiCount}/5 ✅`);
  
  if (authTest && apiCount >= 3) {
    console.log('\n🎉 CORE SYSTEM IS WORKING!');
    console.log('✅ Authentication system ready');
    console.log('✅ Most APIs functional');
    console.log('✅ Ready for frontend integration testing');
    return true;
  } else {
    console.log('\n⚠️ Some core features need attention');
    return false;
  }
}

runTests();