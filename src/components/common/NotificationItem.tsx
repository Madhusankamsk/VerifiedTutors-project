import React from 'react';
import { Bell, CheckCircle, Info, AlertTriangle, XCircle, X, ExternalLink } from 'lucide-react';
import { Notification } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onRemove
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  return (
    <div className={`relative border-l-4 ${getTypeColor()} p-4 hover:bg-gray-50 transition-colors duration-150`}>
      {/* Remove button */}
      <button
        onClick={() => onRemove(notification.id)}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-150"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Notification content */}
      <div className="flex items-start space-x-3 pr-6">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                {notification.message}
              </p>
              
              {/* Action button */}
              {notification.action && (
                <a
                  href={notification.action.url}
                  className="inline-flex items-center text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors duration-150"
                >
                  {notification.action.label}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              )}
            </div>
          </div>
          
          {/* Timestamp */}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
            </span>
            
            {/* Mark as read button */}
            {!notification.read && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors duration-150"
              >
                Mark as read
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem; 