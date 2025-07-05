import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationItem from '../components/common/NotificationItem';
import { Bell, Inbox } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  } = useNotifications();

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Bell className="h-7 w-7 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
              {unreadCount} unread
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            onClick={markAllAsRead}
            disabled={notifications.length === 0}
          >
            Mark all as read
          </button>
          <button
            className="px-3 py-1 rounded-md border border-red-200 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50"
            onClick={clearAllNotifications}
            disabled={notifications.length === 0}
          >
            Clear all
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
              onRemove={removeNotification}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
            <Inbox className="h-12 w-12 mb-4 text-gray-300" />
            <p className="text-lg font-semibold mb-1">No notifications yet</p>
            <p className="text-sm">You'll see important updates and alerts here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage; 