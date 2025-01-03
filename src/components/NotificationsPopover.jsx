// src/components/NotificationsPopover.jsx
import { useState, useEffect } from 'react';
import { Bell, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { zhCN } from 'date-fns/locale';

function NotificationsPopover() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]); // 初始化为空数组
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  // 获取通知列表
  const fetchNotifications = async () => {
    if (!token) return; // 如果没有token，直接返回

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      setNotifications(data || []); // 确保设置为数组
      setUnreadCount((data || []).filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error.message);
      setNotifications([]); // 出错时设置为空数组
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // 标记通知为已读
  const markAsRead = async () => {
    if (!token || unreadCount === 0) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to mark notifications as read');
      }
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // 清空通知
  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
      // 设置定期刷新
      const interval = setInterval(fetchNotifications, 30000); // 每30秒刷新一次
      return () => clearInterval(interval);
    }
  }, [token]);

  // 当显示通知面板时，标记为已读
  useEffect(() => {
    if (showNotifications && unreadCount > 0) {
      markAsRead();
    }
  }, [showNotifications]);

  return (
    <div className="relative">
      <button 
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 text-xs text-white bg-red-500 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div 
          className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50"
          onMouseLeave={() => setShowNotifications(false)}
        >
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-sm font-medium">通知</h3>
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                清空通知
              </button>
            )}
          </div>
          <div className="max-h-[480px] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-sm text-red-500 text-center">
                {error}
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <Link
                    key={notification._id}
                    to={`/post/${notification.post_id}`}
                    className={`block p-4 hover:bg-gray-50 transition-colors ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <MessageSquare className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{notification.content}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatDistance(new Date(notification.created_at), new Date(), {
                            addSuffix: true,
                            locale: zhCN,
                          })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-4 text-sm text-gray-500 text-center">
                暂无通知
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationsPopover;