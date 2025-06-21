// components/common/NotificationContainer.js
import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useLegacyAppContext } from '../../contexts/AppProvider';
import { NOTIFICATION_TYPES } from '../../utils/constants';

const NotificationItem = ({ notification, onRemove }) => {
  const getIcon = () => {
    switch (notification.type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return <CheckCircle className="text-green-500" size={20} />;
      case NOTIFICATION_TYPES.ERROR:
        return <AlertCircle className="text-red-500" size={20} />;
      case NOTIFICATION_TYPES.WARNING:
        return <AlertTriangle className="text-yellow-500" size={20} />;
      default:
        return <Info className="text-blue-500" size={20} />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return 'bg-green-50 border-green-200';
      case NOTIFICATION_TYPES.ERROR:
        return 'bg-red-50 border-red-200';
      case NOTIFICATION_TYPES.WARNING:
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div 
      className={`${getBackgroundColor()} border rounded-lg p-4 shadow-sm transition-all duration-300 ease-in-out`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            {notification.message}
          </p>
          {notification.description && (
            <p className="text-xs text-gray-600 mt-1">
              {notification.description}
            </p>
          )}
        </div>
        <button
          onClick={() => onRemove(notification.id)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded"
          aria-label={`Fechar notificação: ${notification.message}`}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

const NotificationContainer = () => {
  const { uiState, removeNotification } = useLegacyAppContext();

  if (uiState.notifications.length === 0) return null;

  return (
    <div 
      className="fixed top-20 right-4 z-50 space-y-2 max-w-sm w-full"
      aria-label="Notificações"
    >
      {uiState.notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;