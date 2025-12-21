// Simplified OTP service for testing
const sendOTP = async (phoneNumber) => {
  console.log(`📱 Sending OTP to ${phoneNumber}`);
  return { 
    success: true, 
    message: 'OTP sent successfully',
    otp: '123456' // For testing only
  };
};

const verifyOTP = async (phoneNumber, code) => {
  console.log(`✅ Verifying OTP ${code} for ${phoneNumber}`);
  return { 
    success: true, 
    message: 'OTP verified successfully',
    user: { id: 1, phone: phoneNumber, name: 'Test User' }
  };
};

module.exports = { sendOTP, verifyOTP };