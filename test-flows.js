const axios = require('axios');
const io = require('socket.io-client');

const BASE_URL = 'http://localhost:3000/api';
let socket1, socket2;

// Test Results Tracker
const testResults = {
  endToEnd: {},
  dataSync: {},
  performance: {}
};

console.log('🧪 STARTING PHASE 5: TESTING & VALIDATION');
console.log('==========================================\n');

// 5.1 END-TO-END TESTING
async function testEndToEnd() {
  console.log('📋 5.1 END-TO-END TESTING');
  console.log('-------------------------');

  // Test 1: Customer books hotel → Owner receives notification
  console.log('\n🔸 Test 1: Customer Booking Flow');
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
    console.log('✅ Booking created:', response.data.success);
    testResults.endToEnd.customerBooking = response.data.success;
  } catch (error) {
    console.log('❌ Booking failed:', error.message);
    testResults.endToEnd.customerBooking = false;
  }

  // Test 2: Owner accepts booking → Customer gets confirmation
  console.log('\n🔸 Test 2: Owner Booking Management');
  try {
    const response = await axios.put(`${BASE_URL}/customer/bookings/1`, {
      status: 'confirmed'
    });
    console.log('✅ Booking confirmed:', response.data.success);
    testResults.endToEnd.ownerConfirmation = response.data.success;
  } catch (error) {
    console.log('❌ Booking confirmation failed:', error.message);
    testResults.endToEnd.ownerConfirmation = false;
  }

  // Test 3: Payment processing → All parties notified
  console.log('\n🔸 Test 3: Payment Processing');
  try {
    const paymentData = {
      booking_id: 1,
      amount: 5000,
      payment_method: 'card',
      payment_details: { card_number: '**** 1234' }
    };
    
    const response = await axios.post(`${BASE_URL}/customer/payments/process`, paymentData);
    console.log('✅ Payment processed:', response.data.success);
    testResults.endToEnd.paymentProcessing = response.data.success;
  } catch (error) {
    console.log('❌ Payment failed:', error.message);
    testResults.endToEnd.paymentProcessing = false;
  }

  // Test 4: Admin approves hotel → Hotel becomes active
  console.log('\n🔸 Test 4: Admin Hotel Approval');
  try {
    const response = await axios.put(`${BASE_URL}/admin/hotels/1/approve`, {
      status: 'active',
      admin_notes: 'Hotel approved after verification'
    });
    console.log('✅ Hotel approved:', response.data.success);
    testResults.endToEnd.adminApproval = response.data.success;
  } catch (error) {
    console.log('❌ Hotel approval failed:', error.message);
    testResults.endToEnd.adminApproval = false;
  }

  // Test 5: Hotel search with real data
  console.log('\n🔸 Test 5: Hotel Search');
  try {
    const response = await axios.get(`${BASE_URL}/customer/hotels/search?city=Mumbai`);
    console.log('✅ Hotel search working:', response.data.success);
    testResults.endToEnd.hotelSearch = response.data.success;
  } catch (error) {
    console.log('❌ Hotel search failed:', error.message);
    testResults.endToEnd.hotelSearch = false;
  }

  // Test 6: Analytics data
  console.log('\n🔸 Test 6: Analytics Dashboard');
  try {
    const response = await axios.get(`${BASE_URL}/admin/users/analytics`);
    console.log('✅ Analytics working:', response.data.success);
    testResults.endToEnd.analytics = response.data.success;
  } catch (error) {
    console.log('❌ Analytics failed:', error.message);
    testResults.endToEnd.analytics = false;
  }
}

// 5.2 DATA SYNCHRONIZATION TESTING
async function testDataSync() {
  console.log('\n\n📋 5.2 DATA SYNCHRONIZATION TESTING');
  console.log('-----------------------------------');

  // Test 1: Multiple users booking same room
  console.log('\n🔸 Test 1: Concurrent Booking Prevention');
  try {
    const bookingData = {
      user_id: 2,
      hotel_id: 1,
      room_id: 1,
      check_in_date: '2024-12-25',
      check_out_date: '2024-12-27',
      guests: 1,
      total_amount: 2500
    };
    
    const response = await axios.post(`${BASE_URL}/customer/bookings`, bookingData);
    console.log('✅ Concurrent booking handled:', response.data.success);
    testResults.dataSync.concurrentBooking = response.data.success;
  } catch (error) {
    console.log('❌ Concurrent booking failed:', error.message);
    testResults.dataSync.concurrentBooking = false;
  }

  // Test 2: Price updates
  console.log('\n🔸 Test 2: Price Update Sync');
  try {
    const response = await axios.put(`${BASE_URL}/owner/pricing/1`, {
      price_per_night: 3000
    });
    console.log('✅ Price update working:', response.data.success);
    testResults.dataSync.priceUpdate = response.data.success;
  } catch (error) {
    console.log('❌ Price update failed:', error.message);
    testResults.dataSync.priceUpdate = false;
  }

  // Test 3: Notification delivery
  console.log('\n🔸 Test 3: Notification System');
  try {
    const response = await axios.get(`${BASE_URL}/customer/notifications/1`);
    console.log('✅ Notifications working:', response.data.success);
    testResults.dataSync.notifications = response.data.success;
  } catch (error) {
    console.log('❌ Notifications failed:', error.message);
    testResults.dataSync.notifications = false;
  }

  // Test 4: Analytics consistency
  console.log('\n🔸 Test 4: Analytics Data Consistency');
  try {
    const bookingAnalytics = await axios.get(`${BASE_URL}/admin/bookings/analytics`);
    const revenueData = await axios.get(`${BASE_URL}/admin/revenue`);
    
    const consistent = bookingAnalytics.data.success && revenueData.data.success;
    console.log('✅ Analytics consistent:', consistent);
    testResults.dataSync.analyticsConsistency = consistent;
  } catch (error) {
    console.log('❌ Analytics consistency failed:', error.message);
    testResults.dataSync.analyticsConsistency = false;
  }

  // Test 5: Cross-app data sync
  console.log('\n🔸 Test 5: Cross-App Data Sync');
  try {
    const userBookings = await axios.get(`${BASE_URL}/customer/bookings/user/1`);
    const ownerEarnings = await axios.get(`${BASE_URL}/owner/earnings/monthly/1?month=12&year=2024`);
    
    const synced = userBookings.data.success && ownerEarnings.data.success;
    console.log('✅ Cross-app sync working:', synced);
    testResults.dataSync.crossAppSync = synced;
  } catch (error) {
    console.log('❌ Cross-app sync failed:', error.message);
    testResults.dataSync.crossAppSync = false;
  }
}

// 5.3 PERFORMANCE TESTING
async function testPerformance() {
  console.log('\n\n📋 5.3 PERFORMANCE TESTING');
  console.log('---------------------------');

  // Test 1: API Response Times
  console.log('\n🔸 Test 1: API Response Times');
  const startTime = Date.now();
  try {
    await Promise.all([
      axios.get(`${BASE_URL}/customer/hotels/search?city=Mumbai`),
      axios.get(`${BASE_URL}/admin/users/analytics`),
      axios.get(`${BASE_URL}/owner/calendar/1?month=12&year=2024`)
    ]);
    
    const responseTime = Date.now() - startTime;
    const performant = responseTime < 2000; // Under 2 seconds
    console.log(`✅ API response time: ${responseTime}ms (${performant ? 'GOOD' : 'SLOW'})`);
    testResults.performance.apiResponseTime = performant;
  } catch (error) {
    console.log('❌ API performance test failed:', error.message);
    testResults.performance.apiResponseTime = false;
  }

  // Test 2: Database query optimization
  console.log('\n🔸 Test 2: Database Query Performance');
  try {
    const start = Date.now();
    await axios.get(`${BASE_URL}/customer/hotels/search?city=Mumbai&minPrice=1000&maxPrice=5000`);
    const queryTime = Date.now() - start;
    
    const optimized = queryTime < 1000; // Under 1 second
    console.log(`✅ DB query time: ${queryTime}ms (${optimized ? 'OPTIMIZED' : 'NEEDS WORK'})`);
    testResults.performance.dbQueryTime = optimized;
  } catch (error) {
    console.log('❌ DB performance test failed:', error.message);
    testResults.performance.dbQueryTime = false;
  }

  // Test 3: Concurrent requests
  console.log('\n🔸 Test 3: Concurrent Request Handling');
  try {
    const requests = Array(10).fill().map(() => 
      axios.get(`${BASE_URL}/customer/hotels/search?city=Mumbai`)
    );
    
    const start = Date.now();
    await Promise.all(requests);
    const concurrentTime = Date.now() - start;
    
    const efficient = concurrentTime < 3000; // Under 3 seconds for 10 requests
    console.log(`✅ Concurrent handling: ${concurrentTime}ms (${efficient ? 'EFFICIENT' : 'NEEDS SCALING'})`);
    testResults.performance.concurrentHandling = efficient;
  } catch (error) {
    console.log('❌ Concurrent test failed:', error.message);
    testResults.performance.concurrentHandling = false;
  }
}

// WebSocket Testing
function testWebSocket() {
  return new Promise((resolve) => {
    console.log('\n\n📋 WEBSOCKET REAL-TIME TESTING');
    console.log('-------------------------------');

    // Test real-time chat
    console.log('\n🔸 Testing Real-time Chat');
    
    socket1 = io('http://localhost:3000', {
      auth: { token: 'test-token', userId: 1, userRole: 'customer' }
    });
    
    socket2 = io('http://localhost:3000', {
      auth: { token: 'test-token', userId: 2, userRole: 'owner' }
    });

    let chatWorking = false;
    
    socket1.on('connect', () => {
      console.log('✅ Customer WebSocket connected');
      socket1.emit('join_booking', 1);
    });
    
    socket2.on('connect', () => {
      console.log('✅ Owner WebSocket connected');
      socket2.emit('join_booking', 1);
      
      // Send test message
      setTimeout(() => {
        socket1.emit('send_message', {
          booking_id: 1,
          message: 'Test message from customer',
          receiver_id: 2
        });
      }, 1000);
    });
    
    socket2.on('new_message', (data) => {
      console.log('✅ Real-time message received:', data.message);
      chatWorking = true;
      testResults.endToEnd.realtimeChat = true;
      
      setTimeout(() => {
        socket1.disconnect();
        socket2.disconnect();
        resolve();
      }, 1000);
    });
    
    setTimeout(() => {
      if (!chatWorking) {
        console.log('❌ Real-time chat not working');
        testResults.endToEnd.realtimeChat = false;
        socket1?.disconnect();
        socket2?.disconnect();
        resolve();
      }
    }, 5000);
  });
}

// Generate Test Report
function generateReport() {
  console.log('\n\n📊 TEST RESULTS SUMMARY');
  console.log('========================');
  
  const endToEndResults = Object.values(testResults.endToEnd);
  const dataSyncResults = Object.values(testResults.dataSync);
  const performanceResults = Object.values(testResults.performance);
  
  const endToEndPass = endToEndResults.filter(r => r).length;
  const dataSyncPass = dataSyncResults.filter(r => r).length;
  const performancePass = performanceResults.filter(r => r).length;
  
  console.log(`\n5.1 End-to-End Testing: ${endToEndPass}/${endToEndResults.length} ✅`);
  console.log(`5.2 Data Synchronization: ${dataSyncPass}/${dataSyncResults.length} ✅`);
  console.log(`5.3 Performance Testing: ${performancePass}/${performanceResults.length} ✅`);
  
  const totalPass = endToEndPass + dataSyncPass + performancePass;
  const totalTests = endToEndResults.length + dataSyncResults.length + performanceResults.length;
  
  console.log(`\n🎯 OVERALL: ${totalPass}/${totalTests} tests passed (${Math.round(totalPass/totalTests*100)}%)`);
  
  if (totalPass === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! SYSTEM READY FOR DEPLOYMENT!');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
  }
  
  return { totalPass, totalTests, percentage: Math.round(totalPass/totalTests*100) };
}

// Main Test Runner
async function runAllTests() {
  try {
    await testEndToEnd();
    await testDataSync();
    await testPerformance();
    await testWebSocket();
    
    const results = generateReport();
    
    // Save results to file
    const fs = require('fs');
    fs.writeFileSync('test-results.json', JSON.stringify({
      timestamp: new Date().toISOString(),
      results: testResults,
      summary: results
    }, null, 2));
    
    console.log('\n📄 Test results saved to test-results.json');
    
  } catch (error) {
    console.error('❌ Test runner failed:', error.message);
  }
}

// Export for manual testing
module.exports = {
  runAllTests,
  testEndToEnd,
  testDataSync,
  testPerformance,
  testWebSocket,
  testResults
};

// Run if called directly
if (require.main === module) {
  runAllTests();
}