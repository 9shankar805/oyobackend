const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { pool } = require('./database');

let io;

const initializeWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'oyo-secret');
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    } else {
      next(new Error('No token provided'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);
    
    // Join user to their personal room
    socket.join(`user_${socket.userId}`);
    
    // Join booking-specific rooms
    socket.on('join_booking', (bookingId) => {
      socket.join(`booking_${bookingId}`);
    });

    // Handle chat messages
    socket.on('send_message', async (data) => {
      try {
        const { booking_id, message, receiver_id } = data;
        
        // Save message to database
        const query = `
          INSERT INTO messages (booking_id, sender_id, sender_type, message, receiver_id)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `;
        
        const result = await pool.query(query, [
          booking_id, 
          socket.userId, 
          socket.userRole, 
          message, 
          receiver_id
        ]);
        
        const savedMessage = result.rows[0];
        
        // Send to booking room
        io.to(`booking_${booking_id}`).emit('new_message', savedMessage);
        
        // Send to receiver's personal room
        io.to(`user_${receiver_id}`).emit('new_message', savedMessage);
        
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      socket.to(`booking_${data.booking_id}`).emit('user_typing', {
        user_id: socket.userId,
        user_role: socket.userRole
      });
    });

    socket.on('typing_stop', (data) => {
      socket.to(`booking_${data.booking_id}`).emit('user_stopped_typing', {
        user_id: socket.userId
      });
    });

    // Handle booking updates
    socket.on('booking_update', async (data) => {
      try {
        const { booking_id, status, user_id, owner_id } = data;
        
        // Notify all parties
        io.to(`user_${user_id}`).emit('booking_status_changed', {
          booking_id,
          status,
          timestamp: new Date()
        });
        
        io.to(`user_${owner_id}`).emit('booking_status_changed', {
          booking_id,
          status,
          timestamp: new Date()
        });
        
      } catch (error) {
        socket.emit('error', { message: 'Failed to update booking' });
      }
    });

    // Handle room availability updates
    socket.on('room_availability_update', (data) => {
      const { hotel_id, room_id, available } = data;
      
      // Broadcast to all users viewing this hotel
      socket.broadcast.emit('room_availability_changed', {
        hotel_id,
        room_id,
        available,
        timestamp: new Date()
      });
    });

    // Handle price updates
    socket.on('price_update', (data) => {
      const { hotel_id, room_id, new_price } = data;
      
      // Broadcast to all users
      socket.broadcast.emit('price_changed', {
        hotel_id,
        room_id,
        new_price,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });

  return io;
};

// Helper functions to send notifications
const sendNotification = (userId, notification) => {
  if (io) {
    io.to(`user_${userId}`).emit('notification', notification);
  }
};

const sendBookingUpdate = (bookingId, update) => {
  if (io) {
    io.to(`booking_${bookingId}`).emit('booking_update', update);
  }
};

const broadcastRoomUpdate = (hotelId, roomData) => {
  if (io) {
    io.emit('room_update', { hotel_id: hotelId, ...roomData });
  }
};

module.exports = {
  initializeWebSocket,
  sendNotification,
  sendBookingUpdate,
  broadcastRoomUpdate
};