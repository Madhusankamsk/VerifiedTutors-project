import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

interface SocketMessage {
  type: string;
  data: any;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  sendMessage: (event: string, data: any) => void;
}

export const useSocket = (): UseSocketReturn => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const socketRef = useRef<Socket | null>(null);
  const isConnectedRef = useRef(false);
  
  // Get token from localStorage since it's not in AuthContext
  const token = localStorage.getItem('token');

  // Initialize socket connection
  const connect = useCallback(() => {
    if (!user || !token || socketRef.current?.connected) {
      return;
    }

    try {
      // Create socket connection with authentication
      const socket = io(window.location.origin, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        forceNew: true // Force new connection to avoid stale connections
      });

      // Connection event handlers
      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        isConnectedRef.current = true;
      });

      socket.on('disconnect', (reason: string) => {
        console.log('Socket disconnected:', reason);
        isConnectedRef.current = false;
      });

      socket.on('connect_error', (error: Error) => {
        console.error('Socket connection error:', error);
        isConnectedRef.current = false;
        
        // Retry connection after delay
        setTimeout(() => {
          if (user && token && !socketRef.current?.connected) {
            console.log('Retrying socket connection...');
            connect();
          }
        }, 5000);
      });

      socket.on('reconnect', (attemptNumber: number) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
        isConnectedRef.current = true;
      });

      socket.on('reconnect_error', (error: Error) => {
        console.error('Socket reconnection error:', error);
      });

      // Notification event handlers
      socket.on('new_notification', (message: SocketMessage) => {
        console.log('New notification received:', message);
        if (message.type === 'notification' && message.data) {
          addNotification({
            type: message.data.type || 'info',
            title: message.data.title,
            message: message.data.message,
            action: message.data.action
          });
        }
      });

      // Booking update event handlers
      socket.on('booking_update', (message: SocketMessage) => {
        console.log('Booking update received:', message);
        if (message.type === 'booking_update' && message.data) {
          const { updateType, booking } = message.data;
          
          let title = 'Booking Update';
          let notificationMessage = 'Your booking has been updated.';
          
          switch (updateType) {
            case 'created':
              title = 'New Booking';
              notificationMessage = `Your booking for ${booking.subject} has been created.`;
              break;
            case 'updated':
              title = 'Booking Updated';
              notificationMessage = `Your booking for ${booking.subject} has been updated.`;
              break;
            case 'cancelled':
              title = 'Booking Cancelled';
              notificationMessage = `Your booking for ${booking.subject} has been cancelled.`;
              break;
            case 'confirmed':
              title = 'Booking Confirmed';
              notificationMessage = `Your booking for ${booking.subject} has been confirmed.`;
              break;
          }
          
          addNotification({
            type: 'info',
            title,
            message: notificationMessage,
            action: {
              label: 'View Booking',
              url: `/bookings/${booking.id}`
            }
          });
        }
      });

      // System message event handlers
      socket.on('system_message', (message: SocketMessage) => {
        console.log('System message received:', message);
        if (message.type === 'system_message' && message.data) {
          addNotification({
            type: message.data.type || 'info',
            title: message.data.title,
            message: message.data.message,
            action: message.data.action
          });
        }
      });

      // Broadcast event handlers
      socket.on('broadcast', (message: SocketMessage) => {
        console.log('Broadcast message received:', message);
        if (message.data) {
          addNotification({
            type: 'info',
            title: message.data.title || 'System Message',
            message: message.data.message,
            action: message.data.action
          });
        }
      });

      // Typing indicators
      socket.on('user_typing', (data: any) => {
        console.log('User typing:', data);
        // Handle typing indicators if needed
      });

      socket.on('user_stop_typing', (data: any) => {
        console.log('User stopped typing:', data);
        // Handle typing stop if needed
      });

      socketRef.current = socket;
    } catch (error) {
      console.error('Failed to initialize socket:', error);
    }
  }, [user, token, addNotification]);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      isConnectedRef.current = false;
      console.log('Socket disconnected');
    }
  }, []);

  // Join room
  const joinRoom = useCallback((room: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_room', room);
      console.log('Joined room:', room);
    }
  }, []);

  // Leave room
  const leaveRoom = useCallback((room: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_room', room);
      console.log('Left room:', room);
    }
  }, []);

  // Send message
  const sendMessage = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot send message');
    }
  }, []);

  // Auto-connect when user logs in
  useEffect(() => {
    if (user && token) {
      connect();
    } else {
      disconnect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [user, token, connect, disconnect]);

  // Auto-reconnect on token change
  useEffect(() => {
    if (token && socketRef.current) {
      // Reconnect with new token
      disconnect();
      setTimeout(() => connect(), 100);
    }
  }, [token, connect, disconnect]);

  return {
    socket: socketRef.current,
    isConnected: isConnectedRef.current,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendMessage
  };
}; 