const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Disable helmet CSP for development
// app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

console.log('🚀 Starting HOTELSEWA API Server...');

// Mock data
const hotels = [
  {
    id: '1',
    name: 'Hotel Paradise',
    location: 'Kathmandu, Nepal',
    price: 2500,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    amenities: ['WiFi', 'AC', 'Parking', 'Restaurant'],
    available: true
  },
  {
    id: '2',
    name: 'City Center Hotel',
    location: 'Pokhara, Nepal',
    price: 3200,
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
    amenities: ['WiFi', 'Pool', 'Gym', 'Spa'],
    available: true
  },
  {
    id: '3',
    name: 'Mountain View Resort',
    location: 'Lalitpur, Nepal',
    price: 4500,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
    amenities: ['WiFi', 'Mountain View', 'Restaurant', 'Bar'],
    available: true
  }
];

const users = [];
const bookings = [];

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Hotels API
app.get('/api/hotels', (req, res) => {
  const { location, minPrice, maxPrice } = req.query;
  let filteredHotels = hotels;
  
  if (location) {
    filteredHotels = filteredHotels.filter(hotel => 
      hotel.location.toLowerCase().includes(location.toLowerCase())
    );
  }
  
  if (minPrice) {
    filteredHotels = filteredHotels.filter(hotel => hotel.price >= parseInt(minPrice));
  }
  
  if (maxPrice) {
    filteredHotels = filteredHotels.filter(hotel => hotel.price <= parseInt(maxPrice));
  }
  
  res.json({ success: true, data: filteredHotels });
});

app.get('/api/hotels/:id', (req, res) => {
  const hotel = hotels.find(h => h.id === req.params.id);
  if (!hotel) {
    return res.status(404).json({ success: false, message: 'Hotel not found' });
  }
  res.json({ success: true, data: hotel });
});

// Users API
app.post('/api/users/register', (req, res) => {
  const { name, email, phone } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required' });
  }
  
  const user = {
    id: Date.now().toString(),
    name,
    email,
    phone,
    createdAt: new Date().toISOString()
  };
  
  users.push(user);
  res.json({ success: true, data: user });
});

app.get('/api/users', (req, res) => {
  res.json({ success: true, data: users });
});

// Bookings API
app.post('/api/bookings', (req, res) => {
  const { hotelId, userId, checkIn, checkOut, guests } = req.body;
  
  if (!hotelId || !userId || !checkIn || !checkOut) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  
  const hotel = hotels.find(h => h.id === hotelId);
  if (!hotel) {
    return res.status(404).json({ success: false, message: 'Hotel not found' });
  }
  
  const booking = {
    id: Date.now().toString(),
    hotelId,
    userId,
    hotelName: hotel.name,
    checkIn,
    checkOut,
    guests: guests || 1,
    totalPrice: hotel.price,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
  
  bookings.push(booking);
  res.json({ success: true, data: booking });
});

app.get('/api/bookings', (req, res) => {
  res.json({ success: true, data: bookings });
});

app.get('/api/bookings/user/:userId', (req, res) => {
  const userBookings = bookings.filter(b => b.userId === req.params.userId);
  res.json({ success: true, data: userBookings });
});

// Search API
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.json({ success: true, data: [] });
  }
  
  const results = hotels.filter(hotel => 
    hotel.name.toLowerCase().includes(q.toLowerCase()) ||
    hotel.location.toLowerCase().includes(q.toLowerCase())
  );
  
  res.json({ success: true, data: results });
});

// Analytics API
app.get('/api/analytics', (req, res) => {
  res.json({
    success: true,
    data: {
      totalHotels: hotels.length,
      totalUsers: users.length,
      totalBookings: bookings.length,
      revenue: bookings.reduce((sum, booking) => sum + booking.totalPrice, 0)
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌐 Main Dashboard: http://localhost:${PORT}`);
  console.log(`🧪 Simple Test: http://localhost:${PORT}/test.html`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app;