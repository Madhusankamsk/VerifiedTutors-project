import api from './api';

export interface Notification {
  _id: string;
  user: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'booking' | 'verification' | 'payment' | 'review';
  title: string;
  message: string;
  category: 'system' | 'booking' | 'verification' | 'payment' | 'review' | 'general';
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
  metadata?: Record<string, any>;
  expiresAt?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  categories: Record<string, number>;
}

export interface NotificationResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    total: number;
    currentPage: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
}

export interface NotificationStatsResponse {
  success: boolean;
  data: NotificationStats;
}

class NotificationService {
  /**
   * Get user notifications with pagination
   */
  static async getNotifications(options: {
    page?: number;
    limit?: number;
    read?: boolean;
    category?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<NotificationResponse> {
    try {
      console.log('🔍 Fetching notifications with options:', options);
      const params = new URLSearchParams();
      
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.read !== undefined) params.append('read', options.read.toString());
      if (options.category) params.append('category', options.category);
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.sortOrder) params.append('sortOrder', options.sortOrder);

      const response = await api.get(`/notifications?${params.toString()}`);
      console.log('✅ Notifications fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      // Return empty response on error
      return {
        success: false,
        data: {
          notifications: [],
          total: 0,
          currentPage: 1,
          totalPages: 0,
          hasMore: false
        }
      };
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  }

  /**
   * Mark notifications as read
   */
  static async markAsRead(notificationIds?: string[]): Promise<{ success: boolean; message: string; data: { updatedCount: number } }> {
    try {
      console.log('📝 Marking notifications as read:', notificationIds);
      const response = await api.patch('/notifications/mark-read', {
        notificationIds
      });
      console.log('✅ Notifications marked as read successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error marking notifications as read:', error);
      return {
        success: false,
        message: 'Failed to mark notifications as read',
        data: { updatedCount: 0 }
      };
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<{ success: boolean; message: string; data: { updatedCount: number } }> {
    try {
      console.log('📝 Marking all notifications as read');
      const response = await api.patch('/notifications/mark-all-read');
      console.log('✅ All notifications marked as read successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      return {
        success: false,
        message: 'Failed to mark all notifications as read',
        data: { updatedCount: 0 }
      };
    }
  }

  /**
   * Delete specific notification
   */
  static async deleteNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  }

  /**
   * Delete all read notifications
   */
  static async deleteReadNotifications(): Promise<{ success: boolean; message: string; data: { deletedCount: number } }> {
    const response = await api.delete('/notifications/delete-read');
    return response.data;
  }

  /**
   * Get notification statistics
   */
  static async getNotificationStats(): Promise<NotificationStatsResponse> {
    const response = await api.get('/notifications/stats');
    return response.data;
  }

  /**
   * Create notification (for internal use)
   */
  static async createNotification(notificationData: {
    type: string;
    title: string;
    message: string;
    category?: string;
    action?: { label: string; url: string };
    metadata?: Record<string, any>;
    priority?: string;
    expiresAt?: string;
  }): Promise<{ success: boolean; message: string; data: Notification }> {
    const response = await api.post('/notifications', notificationData);
    return response.data;
  }
}

export default NotificationService; 