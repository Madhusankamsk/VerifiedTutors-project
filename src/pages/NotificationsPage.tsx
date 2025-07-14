import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationItem from '../components/common/NotificationItem';
import { Bell, Inbox, Bug, Trash2 } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  const {
    allNotifications,
    notifications,
    databaseNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    clearLocalStorageNotifications,
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
            disabled={allNotifications.length === 0}
          >
            Mark all as read
          </button>
          <button
            className="px-3 py-1 rounded-md border border-red-200 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50"
            onClick={clearAllNotifications}
            disabled={allNotifications.length === 0}
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Debug Section */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-2 mb-3">
            <Bug className="h-4 w-4 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-700">Debug Info</h3>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <p>Total notifications: {allNotifications.length}</p>
            <p>Local notifications: {notifications.length}</p>
            <p>Database notifications: {databaseNotifications.length}</p>
            <p>Unread count: {unreadCount}</p>
          </div>
          <div className="mt-3 flex space-x-2">
            <button
              className="px-2 py-1 rounded text-xs border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              onClick={clearLocalStorageNotifications}
            >
              Clear localStorage
            </button>
            <button
              className="px-2 py-1 rounded text-xs border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {allNotifications.length > 0 ? (
          allNotifications.map((notification) => (
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