require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { pool } = require('./database');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Import routes
const customerRoutes = require('./routes/customer');
const ownerRoutes = require('./routes/owner');
const adminRoutes = require('./routes/admin');

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'OYO Test Server Running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/customer', customerRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/admin', adminRoutes);

// Testing dashboard
app.get('/test', (req, res) => {
  res.sendFile(__dirname + '/public/complete-api-test.html');
});

// API overview
app.get('/api/overview', (req, res) => {
  res.json({
    success: true,
    message: 'OYO Backend APIs - All 49 Endpoints Ready',
    endpoints: {
      customer: { count: 27, base_url: '/api/customer' },
      owner: { count: 10, base_url: '/api/owner' },
      admin: { count: 12, base_url: '/api/admin' }
    },
    test_dashboard: '/test'
  });
});

server.listen(PORT, () => {
  console.log(`🚀 OYO Test Server running on port ${PORT}`);
  console.log(`📱 Health: http://localhost:${PORT}/health`);
  console.log(`🧪 Testing: http://localhost:${PORT}/test`);
  console.log(`📊 Overview: http://localhost:${PORT}/api/overview`);
  console.log(`✅ Ready for testing!`);
});