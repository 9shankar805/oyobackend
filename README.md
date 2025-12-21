# HOTELSEWA Backend API

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Access Testing Dashboard**
   Open your browser and go to: `http://localhost:3000`

## API Endpoints

### Hotels
- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/:id` - Get hotel by ID
- `GET /api/search?q=query` - Search hotels

### Users
- `POST /api/users/register` - Register new user
- `GET /api/users` - Get all users

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/user/:userId` - Get user bookings

### Analytics
- `GET /api/analytics` - Get system statistics

### Health Check
- `GET /api/health` - Server status

## Testing

Visit `http://localhost:3000` for interactive API testing dashboard.

## Environment Variables

Create `.env` file:
```
PORT=3000
NODE_ENV=development
```