import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { user } = useAuth();

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Add notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Remove notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (user && !hasInitialized) {
      const savedNotifications = localStorage.getItem(`notifications_${user._id}`);
      if (savedNotifications) {
        try {
          const parsed = JSON.parse(savedNotifications);
          setNotifications(parsed.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp)
          })));
        } catch (error) {
          console.error('Error loading notifications:', error);
        }
      } else {
        // Add sample notifications only if no saved notifications exist
        const sampleNotifications: Notification[] = [];
        
        if (user.role === 'tutor') {
          sampleNotifications.push({
            id: 'welcome-tutor',
            type: 'success',
            title: 'Welcome to VerifiedTutors!',
            message: 'Your tutor account has been created successfully. Complete your profile to start accepting students.',
            timestamp: new Date(),
            read: false,
            action: {
              label: 'Complete Profile',
              url: '/tutor/profile'
            }
          });

          sampleNotifications.push({
            id: 'verification-tutor',
            type: 'info',
            title: 'Profile Verification',
            message: 'Your profile is under review. You\'ll receive an email once verified.',
            timestamp: new Date(),
            read: false,
          });
        } else if (user.role === 'student') {
          sampleNotifications.push({
            id: 'welcome-student',
            type: 'success',
            title: 'Welcome to VerifiedTutors!',
            message: 'Your student account is ready. Start browsing tutors and booking sessions.',
            timestamp: new Date(),
            read: false,
            action: {
              label: 'Find Tutors',
              url: '/tutors'
            }
          });
        }

        sampleNotifications.push({
          id: 'getting-started',
          type: 'info',
          title: 'Getting Started',
          message: 'Check out our tutorial to learn how to use the platform effectively.',
          timestamp: new Date(),
          read: false,
          action: {
            label: 'View Tutorial',
            url: '/tutorial'
          }
        });

        setNotifications(sampleNotifications);
      }
      setHasInitialized(true);
    }
  }, [user, hasInitialized]);

  // Save notifications to localStorage when they change
  useEffect(() => {
    if (user && hasInitialized) {
      localStorage.setItem(`notifications_${user._id}`, JSON.stringify(notifications));
    }
  }, [notifications, user, hasInitialized]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 