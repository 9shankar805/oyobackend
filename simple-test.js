const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

console.log('🧪 SIMPLE API TESTING');
console.log('====================\n');

async function testAPIs() {
  const tests = [
    { name: 'Hotel Search', url: '/customer/hotels/search?city=Mumbai' },
    { name: 'Payment Methods', url: '/customer/payments/methods' },
    { name: 'User Analytics', url: '/admin/users/analytics' },
    { name: 'Booking Analytics', url: '/admin/bookings/analytics' },
    { name: 'Revenue Data', url: '/admin/revenue' }
  ];

  let passed = 0;
  
  for (const test of tests) {
    try {
      const response = await axios.get(BASE_URL + test.url);
      if (response.data.success) {
        console.log(`✅ ${test.name}: WORKING`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FAILED`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
    }
  }
  
  console.log(`\n📊 RESULTS: ${passed}/${tests.length} tests passed`);
  return passed === tests.length;
}

// Test booking creation
async function testBooking() {
  console.log('\n🔸 Testing Booking Creation');
  try {
    const bookingData = {
      user_id: 1,
      hotel_id: 1,
      room_id: 1,
      check_in_date: '2024-12-25',
      check_out_date: '2024-12-27',
      guests: 2,
      total_amount: 5000
    };
    
    const response = await axios.post(`${BASE_URL}/customer/bookings`, bookingData);
    console.log('✅ Booking Creation: WORKING');
    return true;
  } catch (error) {
    console.log('❌ Booking Creation: FAILED');
    return false;
  }
}

// Test payment processing
async function testPayment() {
  console.log('\n🔸 Testing Payment Processing');
  try {
    const paymentData = {
      booking_id: 1,
      amount: 5000,
      payment_method: 'card',
      payment_details: { card_number: '**** 1234' }
    };
    
    const response = await axios.post(`${BASE_URL}/customer/payments/process`, paymentData);
    console.log('✅ Payment Processing: WORKING');
    return true;
  } catch (error) {
    console.log('❌ Payment Processing: FAILED');
    return false;
  }
}

async function runTests() {
  const apiTest = await testAPIs();
  const bookingTest = await testBooking();
  const paymentTest = await testPayment();
  
  const totalPassed = [apiTest, bookingTest, paymentTest].filter(t => t).length;
  
  console.log('\n🎯 FINAL RESULTS:');
  console.log(`API Tests: ${apiTest ? '✅' : '❌'}`);
  console.log(`Booking Test: ${bookingTest ? '✅' : '❌'}`);
  console.log(`Payment Test: ${paymentTest ? '✅' : '❌'}`);
  console.log(`\nOVERALL: ${totalPassed}/3 tests passed`);
  
  if (totalPassed === 3) {
    console.log('\n🎉 ALL CORE TESTS PASSED! SYSTEM IS WORKING!');
  } else {
    console.log('\n⚠️ Some tests failed. Check server status.');
  }
}

runTests();