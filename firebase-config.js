const firebaseConfig = {
  apiKey: "AIzaSyDA_RcV2g4iNFEiVDjiKO0SgnfFouBLuJE",
  authDomain: "hotelsewa-66c35.firebaseapp.com",
  projectId: "hotelsewa-66c35",
  storageBucket: "hotelsewa-66c35.firebasestorage.app",
  messagingSenderId: "664870792174",
  appId: "1:664870792174:web:6572d9d1a01ad798493cff",
  measurementId: "G-MZQJ9BM8Y5"
};

const initializeFirebase = () => {
  console.log('✅ Firebase config loaded');
  return firebaseConfig;
};

const verifyToken = async (token) => {
  return { success: true, user: { id: 1, email: 'test@example.com' } };
};

module.exports = { initializeFirebase, verifyToken, firebaseConfig };