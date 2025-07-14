import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // Map to store user connections
  }

  /**
   * Initialize Socket.IO server
   * @param {Object} server - HTTP server instance
   */
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: [
          'http://localhost:3000',
          'http://localhost:5173',
          'https://verifiedtutors-project.onrender.com',
          'https://verifiedtutors-project-frontend.onrender.com'
        ],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        // Remove 'Bearer ' prefix if present
        const cleanToken = token.replace('Bearer ', '');
        
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || 'your_jwt_secret');
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        
        next();
      } catch (error) {
        console.error('Socket authentication error:', error.message);
        next(new Error('Authentication error: Invalid token'));
      }
    });

    this.setupEventHandlers();
    console.log('Socket.IO server initialized');
  }

  /**
   * Setup Socket.IO event handlers
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.userId} (${socket.userRole})`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId, {
        socketId: socket.id,
        role: socket.userRole,
        connectedAt: new Date()
      });

      // Join user to their personal room
      socket.join(`user_${socket.userId}`);
      
      // Join admin room if user is admin
      if (socket.userRole === 'admin') {
        socket.join('admin_room');
      }

      // Handle user joining specific rooms
      socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`User ${socket.userId} joined room: ${room}`);
      });

      // Handle user leaving specific rooms
      socket.on('leave_room', (room) => {
        socket.leave(room);
        console.log(`User ${socket.userId} left room: ${room}`);
      });

      // Handle typing indicators
      socket.on('typing_start', (data) => {
        socket.to(data.room).emit('user_typing', {
          userId: socket.userId,
          userName: data.userName
        });
      });

      socket.on('typing_stop', (data) => {
        socket.to(data.room).emit('user_stop_typing', {
          userId: socket.userId
        });
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
        this.connectedUsers.delete(socket.userId);
      });

      // Handle error
      socket.on('error', (error) => {
        console.error(`Socket error for user ${socket.userId}:`, error);
      });
    });
  }

  /**
   * Send notification to specific user
   * @param {string} userId - User ID
   * @param {Object} notification - Notification object
   */
  sendNotificationToUser(userId, notification) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    this.io.to(`user_${userId}`).emit('new_notification', {
      type: 'notification',
      data: notification
    });

    console.log(`Notification sent to user ${userId}:`, notification.title);
  }

  /**
   * Send notification to multiple users
   * @param {Array} userIds - Array of user IDs
   * @param {Object} notification - Notification object
   */
  sendNotificationToUsers(userIds, notification) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    userIds.forEach(userId => {
      this.io.to(`user_${userId}`).emit('new_notification', {
        type: 'notification',
        data: notification
      });
    });

    console.log(`Notification sent to ${userIds.length} users:`, notification.title);
  }

  /**
   * Send notification to all users in a room
   * @param {string} room - Room name
   * @param {Object} notification - Notification object
   */
  sendNotificationToRoom(room, notification) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    this.io.to(room).emit('new_notification', {
      type: 'notification',
      data: notification
    });

    console.log(`Notification sent to room ${room}:`, notification.title);
  }

  /**
   * Send notification to all admins
   * @param {Object} notification - Notification object
   */
  sendNotificationToAdmins(notification) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    this.io.to('admin_room').emit('new_notification', {
      type: 'notification',
      data: notification
    });

    console.log('Notification sent to all admins:', notification.title);
  }

  /**
   * Send booking update to relevant users
   * @param {Object} booking - Booking object
   * @param {string} updateType - Type of update (created, updated, cancelled)
   */
  sendBookingUpdate(booking, updateType) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    const bookingUpdate = {
      type: 'booking_update',
      data: {
        bookingId: booking._id,
        updateType,
        booking: {
          id: booking._id,
          subject: booking.subject.name,
          date: booking.date,
          time: booking.time,
          status: booking.status
        }
      }
    };

    // Send to student
    this.io.to(`user_${booking.student._id}`).emit('booking_update', bookingUpdate);
    
    // Send to tutor
    this.io.to(`user_${booking.tutor.user._id}`).emit('booking_update', bookingUpdate);

    console.log(`Booking update sent for ${updateType}:`, booking._id);
  }

  /**
   * Send system message to user
   * @param {string} userId - User ID
   * @param {Object} message - Message object
   */
  sendSystemMessage(userId, message) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    this.io.to(`user_${userId}`).emit('system_message', {
      type: 'system_message',
      data: message
    });

    console.log(`System message sent to user ${userId}:`, message.title);
  }

  /**
   * Broadcast to all connected users
   * @param {Object} data - Data to broadcast
   */
  broadcastToAll(data) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    this.io.emit('broadcast', data);
    console.log('Broadcast sent to all users');
  }

  /**
   * Get connected users count
   * @returns {number} Number of connected users
   */
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  /**
   * Get connected users info
   * @returns {Array} Array of connected users info
   */
  getConnectedUsers() {
    return Array.from(this.connectedUsers.entries()).map(([userId, info]) => ({
      userId,
      ...info
    }));
  }

  /**
   * Check if user is connected
   * @param {string} userId - User ID
   * @returns {boolean} True if user is connected
   */
  isUserConnected(userId) {
    return this.connectedUsers.has(userId);
  }

  /**
   * Force disconnect user
   * @param {string} userId - User ID
   */
  disconnectUser(userId) {
    if (!this.io) {
      console.warn('Socket.IO not initialized');
      return;
    }

    const userInfo = this.connectedUsers.get(userId);
    if (userInfo) {
      this.io.sockets.sockets.get(userInfo.socketId)?.disconnect();
      this.connectedUsers.delete(userId);
      console.log(`User ${userId} forcefully disconnected`);
    }
  }

  /**
   * Get server statistics
   * @returns {Object} Server statistics
   */
  getServerStats() {
    if (!this.io) {
      return { error: 'Socket.IO not initialized' };
    }

    return {
      connectedUsers: this.getConnectedUsersCount(),
      totalSockets: this.io.engine.clientsCount,
      rooms: Object.keys(this.io.sockets.adapter.rooms).length,
      uptime: process.uptime()
    };
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService; 