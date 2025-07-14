import React, { useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../contexts/AuthContext';

interface WebSocketProviderProps {
  children: React.ReactNode;
}

const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { isConnected, connect, disconnect } = useSocket();

  useEffect(() => {
    // Connect when user is authenticated
    if (user) {
      connect();
    } else {
      disconnect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [user, connect, disconnect]);

  // Optional: Show connection status in development
  if (process.env.NODE_ENV === 'development') {
    console.log('WebSocket connection status:', isConnected ? 'Connected' : 'Disconnected');
  }

  return <>{children}</>;
};

export default WebSocketProvider; 