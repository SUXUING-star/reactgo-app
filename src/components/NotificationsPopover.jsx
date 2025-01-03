import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, ThumbsUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const NOTIFICATION_TYPES = {
  interaction: { icon: MessageSquare, color: 'text-blue-500', label: '互动' }, // 包含评论和回复
  like: { icon: ThumbsUp, color: 'text-pink-500', label: '点赞' },
};

function NotificationsPopover() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const { token } = useAuth();

  const fetchNotifications = async () => {
      if (!token) return;

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
           setNotifications(data || []);
            const total = (data || []).filter(n => !n.is_read).length;
             setUnreadCount(total);
         } catch (error) {
           console.error('Error fetching notifications:', error);
          setError(error.message);
            setNotifications([]);
            setUnreadCount(0);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async () => {
      if (!token || unreadCount === 0) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/read`, {
              method: 'PUT',
             headers: {
                 Authorization: `Bearer ${token}`,
               },
         });
           if (response.ok) {
               setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
             setUnreadCount(0);
            }
        } catch (error) {
           console.error('Error marking notifications as read:', error);
      }
    };

    useEffect(() => {
      if (token) {
          fetchNotifications();
            const interval = setInterval(fetchNotifications, 15000);
           return () => clearInterval(interval);
        }
    }, [token]);
 
    useEffect(() => {
       if (showNotifications && unreadCount > 0) {
            markAsRead();
        }
    }, [showNotifications]);
   const filteredNotifications = notifications.filter(notification => {
        if (filter === 'all') return true;
         if (filter === 'interaction') {
            return notification.type === 'comment' || notification.type === 'reply';
        }
        return notification.type === filter;
   });


    const renderNotification = (notification) => {
        const NotificationIcon = NOTIFICATION_TYPES[notification.type]?.icon || MessageSquare;
        const iconColor = NOTIFICATION_TYPES[notification.type]?.color || 'text-gray-500';
    
        return (
          <Link
            key={notification._id}
            to={`/post/${notification.post_id}${notification.comment_id ? `#comment-${notification.comment_id}` : ''}`}
            className={`block p-4 hover:bg-gray-50 transition-colors ${
              !notification.is_read ? 'bg-blue-50' : ''
            }`}
            onClick={() => setShowNotifications(false)}
          >
            <div className="flex items-start space-x-3">
                <NotificationIcon className={`w-5 h-5 ${iconColor} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{notification.content}</p>
                      <p className="mt-1 text-xs text-gray-500">
                       {formatDistance(new Date(notification.created_at), new Date(), {
                           addSuffix: true,
                            locale: zhCN,
                           })}
                   </p>
                       <p className="mt-2 text-xs text-blue-600 hover:text-blue-800">
                           点击查看详情 →
                        </p>
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <div className="relative">
             <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
             >
                <Bell className="h-5 w-5" />
                 {unreadCount > 0 && (
                   <span className="absolute -top-1 -right-1 h-5 w-5 text-xs text-white bg-red-500 rounded-full flex items-center justify-center">
                     {unreadCount}
                  </span>
                )}
            </button>

        {showNotifications && (
          <div 
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50"
              onMouseLeave={() => setShowNotifications(false)}
           >
                <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="text-sm font-medium">通知</h3>
                      <div className="flex gap-2">
                        <div className="flex gap-1">
                            <button
                               onClick={() => setFilter('all')}
                                 className={`px-3 py-1.5 text-xs rounded-full ${
                                    filter === 'all' 
                                     ? 'bg-gray-100 text-gray-800 font-medium' 
                                       : 'text-gray-600 hover:bg-gray-50'
                                 }`}
                             >
                                全部
                           </button>
                             <button
                                  onClick={() => setFilter('interaction')}
                                   className={`px-3 py-1.5 text-xs rounded-full flex items-center gap-1 ${
                                    filter === 'interaction'
                                      ? 'bg-blue-100 text-blue-800 font-medium'
                                        : 'text-gray-600 hover:bg-gray-50'
                                  }`}
                                  >
                                  <MessageSquare className="w-3 h-3" />
                                    互动
                                </button>
                             <button
                                onClick={() => setFilter('like')}
                                className={`px-3 py-1.5 text-xs rounded-full flex items-center gap-1 ${
                                  filter === 'like'
                                      ? 'bg-pink-100 text-pink-800 font-medium'
                                       : 'text-gray-600 hover:bg-gray-50'
                                  }`}
                               >
                                <ThumbsUp className="w-3 h-3" />
                               点赞
                             </button>
                           </div>
                     </div>
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
                 ) : filteredNotifications.length > 0 ? (
                 <div className="divide-y divide-gray-100">
                   {filteredNotifications.map(renderNotification)}
                   </div>
                ) : (
                  <div className="p-8 text-sm text-gray-500 text-center">
                      暂无{filter === 'all' ? '' : NOTIFICATION_TYPES[filter]?.label || ''}消息
                   </div>
                )}
            </div>
          </div>
        )}
    </div>
  );
}

export default NotificationsPopover;