import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, AlertCircle, ShoppingCart, Package, TrendingUp, Settings } from 'lucide-react';

const NotificationIcon = ({ type }) => {
  const icons = {
    new_order: ShoppingCart,
    quote_response: Package,
    order_status_change: TrendingUp,
    supplier_verification: Check,
    system_maintenance: Settings,
    low_stock: AlertCircle,
    default: Bell
  };
  
  const Icon = icons[type] || icons.default;
  return <Icon size={20} className="text-blue-600" />;
};

const NotificationItem = ({ notification, onMarkAsRead, onClose }) => {
  const timeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  return (
    <div className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <div className="flex items-start space-x-3">
        <NotificationIcon type={notification.type} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
          <p className="text-xs text-gray-500 mt-2">{timeAgo(notification.timestamp)}</p>
        </div>
        <button
          onClick={() => onClose(notification.id)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

const NotificationDropdown = ({ notifications, isOpen, onClose, onMarkAllAsRead }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
          {notifications.length > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Marcar todas como lidas
            </button>
          )}
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500">Nenhuma notificação</p>
          </div>
        ) : (
          notifications.map(notification => (
            <NotificationItem
              key={notification.id || notification.timestamp}
              notification={notification}
              onMarkAsRead={() => {}}
              onClose={() => {}}
            />
          ))
        )}
      </div>
    </div>
  );
};

const NotificationSystem = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [wsConnection, setWsConnection] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    if (user) {
      connectWebSocket();
      loadNotifications();
      loadUnreadCount();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user]);

  const connectWebSocket = () => {
    if (!user) return;

    try {
      // Use the correct WebSocket URL based on your environment
      const wsUrl = process.env.NODE_ENV === 'production' 
        ? `wss://${window.location.host}/ws`
        : `ws://localhost:3001/ws`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setWsConnection(ws);
        
        // Send authentication
        ws.send(JSON.stringify({
          type: 'auth',
          token: localStorage.getItem('token')
        }));
      };

      ws.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          handleNewNotification(notification);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setWsConnection(null);
        
        // Reconnect after 5 seconds
        setTimeout(() => {
          if (user) {
            connectWebSocket();
          }
        }, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      // This would be implemented when the backend API is ready
      // const response = await apiService.get('/notifications');
      // setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      // This would be implemented when the backend API is ready
      // const response = await apiService.get('/notifications/unread-count');
      // setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 19)]); // Keep last 20
    setUnreadCount(prev => prev + 1);
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico'
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      // This would be implemented when the backend API is ready
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown
        notifications={notifications}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onMarkAllAsRead={markAllAsRead}
      />

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationSystem;