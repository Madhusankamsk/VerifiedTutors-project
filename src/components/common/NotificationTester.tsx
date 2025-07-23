import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Bell, Plus, Trash2, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

const NotificationTester: React.FC = () => {
  const { addNotification, clearAllNotifications } = useNotifications();

  const testNotifications = [
    {
      type: 'success' as const,
      title: 'Test Success Notification',
      message: 'This is a test success notification to verify the system is working.',
      action: { label: 'View Details', url: '/test' }
    },
    {
      type: 'warning' as const,
      title: 'Test Warning Notification',
      message: 'This is a test warning notification to verify the system is working.',
      action: { label: 'Take Action', url: '/test' }
    },
    {
      type: 'error' as const,
      title: 'Test Error Notification',
      message: 'This is a test error notification to verify the system is working.',
      action: { label: 'Report Issue', url: '/test' }
    },
    {
      type: 'info' as const,
      title: 'Test Info Notification',
      message: 'This is a test info notification to verify the system is working.',
      action: { label: 'Learn More', url: '/test' }
    }
  ];

  const handleAddTestNotification = (notification: typeof testNotifications[0]) => {
    addNotification(notification);
  };

  const handleAddAllTestNotifications = () => {
    testNotifications.forEach(notification => {
      setTimeout(() => {
        addNotification(notification);
      }, Math.random() * 1000); // Random delay to simulate real notifications
    });
  };

  const handleClearDummyNotifications = () => {
    // Clear any existing dummy notifications from localStorage
    const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!)._id : null;
    if (userId) {
      localStorage.removeItem(`notifications_${userId}`);
      window.location.reload(); // Reload to clear the state
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border p-4 w-80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">Notification Tester</h3>
          </div>
          <button
            onClick={clearAllNotifications}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Clear all notifications"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleAddAllTestNotifications}
            className="w-full px-3 py-2 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add All Test Notifications
          </button>
          
          <button
            onClick={handleClearDummyNotifications}
            className="w-full px-3 py-2 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Clear Dummy Notifications
          </button>

          <div className="grid grid-cols-2 gap-2">
            {testNotifications.map((notification, index) => (
              <button
                key={index}
                onClick={() => handleAddTestNotification(notification)}
                className={`px-2 py-1 text-xs rounded-md transition-colors flex items-center space-x-1 ${
                  notification.type === 'success' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                  notification.type === 'warning' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
                  notification.type === 'error' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                  'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {notification.type === 'success' && <CheckCircle className="h-3 w-3" />}
                {notification.type === 'warning' && <AlertTriangle className="h-3 w-3" />}
                {notification.type === 'error' && <XCircle className="h-3 w-3" />}
                {notification.type === 'info' && <Info className="h-3 w-3" />}
                <span>{notification.type}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t text-xs text-gray-500">
          <p>This component only appears in development mode.</p>
          <p>Use it to test notification functionality.</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationTester; 