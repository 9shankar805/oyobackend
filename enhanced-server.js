const express = require('express');
const cors = require('cors');
const InfrastructureManager = require('./infrastructure-config');

const app = express();
const port = process.env.PORT || 3000;

// Initialize infrastructure enhancements
const infrastructure = new InfrastructureManager();

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Setup enhanced middleware
infrastructure.setupMiddleware(app);

// Setup AI endpoints
infrastructure.setupAIEndpoints(app);

// Setup monitoring endpoints
infrastructure.setupMonitoringEndpoints(app);

// Existing API routes would go here
app.use('/api/auth', require('./services/user-service/routes'));
app.use('/api/hotels', require('./services/hotel-service/routes'));
app.use('/api/bookings', require('./services/booking-service/routes'));
app.use('/api/payments', require('./services/payment-service/routes'));
app.use('/api/search', require('./services/search-service/routes'));
app.use('/api/analytics', require('./services/analytics-service/routes'));

// Enhanced error handling
app.use((error, req, res, next) => {
  console.error('Enhanced server error:', error);
  
  // Security incident logging
  if (error.type === 'security') {
    console.warn('Security incident:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      error: error.message,
    });
  }
  
  res.status(error.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    timestamp: new Date().toISOString(),
  });
});

// Start server with enhancements
app.listen(port, () => {
  console.log(`🚀 Enhanced OYO Server running on port ${port}`);
  console.log('✅ Security features: DDoS protection, penetration testing');
  console.log('🤖 AI features: Recommendations, chatbot');
  console.log('⚡ Performance: Caching, load balancing, DB optimization');
  
  // Start background processes
  infrastructure.startBackgroundProcesses();
});

module.exports = app;