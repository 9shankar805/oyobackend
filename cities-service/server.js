const express = require('express');
const app = express();

const majorCities = [
  { name: 'Kathmandu', lat: 27.7172, lng: 85.3240, country: 'Nepal' },
  { name: 'Pokhara', lat: 28.2096, lng: 83.9856, country: 'Nepal' },
  { name: 'Lalitpur', lat: 27.6667, lng: 85.3167, country: 'Nepal' },
  { name: 'Biratnagar', lat: 26.4525, lng: 87.2718, country: 'Nepal' },
  { name: 'Bharatpur', lat: 27.6782, lng: 84.4351, country: 'Nepal' },
  { name: 'Bhaktapur', lat: 27.6710, lng: 85.4298, country: 'Nepal' },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, country: 'India' },
  { name: 'Delhi', lat: 28.7041, lng: 77.1025, country: 'India' },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946, country: 'India' },
  { name: 'Pune', lat: 18.5204, lng: 73.8567, country: 'India' },
  { name: 'Goa', lat: 15.2993, lng: 74.1240, country: 'India' },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873, country: 'India' },
];

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

app.get('/api/cities/nearby', (req, res) => {
  const { lat, lng, limit = 6 } = req.query;
  
  const nearby = majorCities
    .map(city => ({
      ...city,
      distance: calculateDistance(parseFloat(lat), parseFloat(lng), city.lat, city.lng)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, parseInt(limit))
    .map((city, idx) => ({ id: String(idx + 1), name: city.name }));
  
  res.json({ cities: nearby });
});

const PORT = 5003;
app.listen(PORT, () => console.log(`Cities service on port ${PORT}`));
