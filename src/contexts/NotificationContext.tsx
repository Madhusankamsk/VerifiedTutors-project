import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import NotificationService, { Notification as DatabaseNotification } from '../services/notificationService';

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

// Unified notification interface for display
export interface UnifiedNotification {
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
  isDatabase?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  databaseNotifications: DatabaseNotification[];
  allNotifications: UnifiedNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  clearLocalStorageNotifications: () => void;
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
  const [databaseNotifications, setDatabaseNotifications] = useState<DatabaseNotification[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Combine all notifications for display
  const allNotifications: UnifiedNotification[] = [
    ...databaseNotifications.map(dbNotif => ({
      id: dbNotif._id,
      type: dbNotif.type as 'info' | 'success' | 'warning' | 'error',
      title: dbNotif.title,
      message: dbNotif.message,
      timestamp: new Date(dbNotif.createdAt),
      read: dbNotif.read,
      action: dbNotif.action,
      isDatabase: true
    })),
    ...notifications.map(localNotif => ({
      ...localNotif,
      isDatabase: false
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Calculate unread count from all notifications
  const unreadCount = allNotifications.filter(n => !n.read).length;

  // Check if notification already exists (by title)
  const notificationExists = (title: string): boolean => {
    return allNotifications.some(notification => notification.title === title);
  };

  // Add notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    console.log('➕ Adding notification:', notification.title);
    
    // Check if notification with same title already exists
    if (notificationExists(notification.title)) {
      console.log(`⚠️ Notification with title "${notification.title}" already exists, skipping.`);
      return;
    }

    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };

    console.log('✅ Notification added successfully:', newNotification.id);
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Mark notification as read
  const markAsRead = async (id: string) => {
    // Check if it's a database notification
    const dbNotification = databaseNotifications.find(n => n._id === id);
    if (dbNotification) {
      // Update database notifications
      setDatabaseNotifications(prev =>
        prev.map(notification =>
          notification._id === id ? { ...notification, read: true } : notification
        )
      );

      // Update in database
      try {
        await NotificationService.markAsRead([id]);
      } catch (error) {
        console.error('Failed to mark database notification as read:', error);
      }
    } else {
      // Update local notifications
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    // Update local notifications
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );

    // Update database notifications
    setDatabaseNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );

    // Update in database
    try {
      await NotificationService.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Remove notification
  const removeNotification = async (id: string) => {
    // Check if it's a database notification
    const dbNotification = databaseNotifications.find(n => n._id === id);
    if (dbNotification) {
      // Remove from database notifications
      setDatabaseNotifications(prev => prev.filter(notification => notification._id !== id));

      // Delete from database
      try {
        await NotificationService.deleteNotification(id);
      } catch (error) {
        console.error('Failed to delete database notification:', error);
      }
    } else {
      // Remove from local notifications
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    console.log('🗑️ Clearing all notifications');
    setNotifications([]);
    setDatabaseNotifications([]);
    
    // Clear localStorage
    if (user) {
      localStorage.removeItem(`notifications_${user._id}`);
      console.log('💾 Cleared localStorage notifications');
    }
  };

  // Clear localStorage notifications (for testing)
  const clearLocalStorageNotifications = () => {
    if (user) {
      localStorage.removeItem(`notifications_${user._id}`);
      console.log('💾 Cleared localStorage notifications');
    }
  };

  // Load notifications from database and localStorage on mount
  useEffect(() => {
    if (user && !hasInitialized) {
      const loadNotifications = async () => {
        setLoading(true);
        try {
          console.log('🔄 Loading notifications for user:', user._id);
          
          // Load database notifications first
          const dbResponse = await NotificationService.getNotifications({ limit: 50 });
          let hasDatabaseNotifications = false;
          
          if (dbResponse.success) {
            console.log('📊 Database notifications loaded:', dbResponse.data.notifications.length);
            setDatabaseNotifications(dbResponse.data.notifications);
            hasDatabaseNotifications = dbResponse.data.notifications.length > 0;
          } else {
            console.log('❌ Failed to load database notifications');
          }

          // Load local notifications from localStorage
          const savedNotifications = localStorage.getItem(`notifications_${user._id}`);
          if (savedNotifications) {
            try {
              const parsed = JSON.parse(savedNotifications);
              console.log('💾 Local notifications loaded from localStorage:', parsed.length);
              setNotifications(parsed.map((n: any) => ({
                ...n,
                timestamp: new Date(n.timestamp)
              })));
            } catch (error) {
              console.error('Error loading local notifications:', error);
            }
          } else if (!hasDatabaseNotifications) {
            console.log('📝 Creating sample notifications (no existing notifications found)');
            // Only add sample notifications if no database notifications exist
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
          } else {
            console.log('✅ No sample notifications needed (database notifications exist)');
          }
        } catch (error) {
          console.error('Error loading notifications:', error);
        } finally {
          setLoading(false);
          setHasInitialized(true);
        }
      };

      loadNotifications();
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
    databaseNotifications,
    allNotifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    clearLocalStorageNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 