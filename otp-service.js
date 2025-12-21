const twilio = require('twilio');
const { initializeFirebase } = require('./firebase-config');

// Initialize Twilio only if credentials are provided
let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && 
    process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}
const admin = initializeFirebase();

// Firebase Phone Auth (alternative to Twilio)
const sendFirebaseOTP = async (phoneNumber) => {
  try {
    // This would be handled on client side with Firebase Auth
    return { success: true, message: 'OTP sent via Firebase' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const sendOTP = async (phoneNumber) => {
  try {
    if (!client) {
      return { success: false, error: 'Twilio not configured' };
    }
    
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications
      .create({ to: phoneNumber, channel: 'sms' });
    
    return { success: true, sid: verification.sid };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const verifyOTP = async (phoneNumber, code) => {
  try {
    if (!client) {
      return { success: false, error: 'Twilio not configured' };
    }
    
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks
      .create({ to: phoneNumber, code });
    
    if (verification.status === 'approved') {
      // Create Firebase custom token
      const customToken = await admin.auth().createCustomToken(phoneNumber);
      return { success: true, token: customToken };
    }
    
    return { success: false, error: 'Invalid OTP' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = { sendOTP, verifyOTP, sendFirebaseOTP };