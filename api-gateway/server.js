const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Service URLs
const services = {
  user: process.env.USER_SERVICE_URL || 'http://localhost:3001',
  hotel: process.env.HOTEL_SERVICE_URL || 'http://localhost:3002',
  booking: process.env.BOOKING_SERVICE_URL || 'http://localhost:3003',
  payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
  search: process.env.SEARCH_SERVICE_URL || 'http://localhost:3006',
  analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3007'
};

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Proxy function
const proxyRequest = async (req, res, serviceUrl) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${serviceUrl}${req.path}`,
      data: req.body,
      params: req.query,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization
      }
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data || { error: 'Service unavailable' };
    res.status(status).json(message);
  }
};

// Routes
app.use('/api/auth', (req, res) => proxyRequest(req, res, services.user));
app.use('/api/users', authenticateToken, (req, res) => proxyRequest(req, res, services.user));
app.use('/api/hotels', (req, res) => proxyRequest(req, res, services.hotel));
app.use('/api/search', (req, res) => proxyRequest(req, res, services.search));
app.use('/api/bookings', authenticateToken, (req, res) => proxyRequest(req, res, services.booking));
app.use('/api/payments', authenticateToken, (req, res) => proxyRequest(req, res, services.payment));
app.use('/api/notifications', authenticateToken, (req, res) => proxyRequest(req, res, services.notification));
app.use('/api/analytics', authenticateToken, (req, res) => proxyRequest(req, res, services.analytics));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});