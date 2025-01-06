import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, ThumbsUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import anime from 'animejs';

const NOTIFICATION_TYPES = {
  comment: { icon: MessageSquare, color: 'text-blue-500', label: '评论' },
  reply: { icon: MessageSquare, color: 'text-blue-500', label: '回复' },
  like: { icon: ThumbsUp, color: 'text-pink-500', label: '点赞' },
};

function NotificationsPopover({ variant = 'desktop' }) {
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
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error('获取通知失败');

      setNotifications(data || []);
      setUnreadCount((data || []).filter((n) => !n.is_read).length);
    } catch (error) {
      console.error('获取通知错误:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!token || unreadCount === 0) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('标记已读错误:', error);
    }
  };

   //  面板动画
    useEffect(() => {
      if (showNotifications) {
        anime({
          targets: '.notifications-panel',
          opacity: [0, 1],
          translateY: [-10, 0],
          duration: 300,
          easing: 'easeOutCubic'
         });
       }
    }, [showNotifications]);


  useEffect(() => {
    if (unreadCount > 0) {
      anime({
        targets: '.notification-bell',
        scale: [1, 1.2, 1],
        rotate: ['0deg', '-20deg', '20deg', '0deg'],
        duration: 1000,
        loop: true,
        easing: 'easeInOutQuad',
        direction: 'alternate',
      });
    }
  }, [unreadCount]);

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
  }, [showNotifications, unreadCount]);


 const filteredNotifications = notifications.filter(notification => {
    if (!notification) return false;
    
    if (filter === 'all') return true;
    if (filter === 'interaction') {
      return ['comment', 'reply'].includes(notification.type);
    }
    return notification.type === filter;
  });


    const renderContent = () => {
         if (loading) {
            return (
                 <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto" />
               </div>
          );
      }

    if (error) {
         return <div className="p-4 text-sm text-red-500 text-center">{error}</div>;
     }

     if (filteredNotifications.length === 0) {
          return (
              <div className="p-8 text-sm text-gray-500 text-center">
                暂无{filter === 'all' ? '' : filter === 'interaction' ? '互动' : '点赞'}消息
           </div>
        );
     }

    return (
      <div className="divide-y divide-gray-100">
         {filteredNotifications.map((notification) => (
           <Link
              key={notification._id}
               to={`/post/${notification.post_id}`}
                onClick={() => setShowNotifications(false)}
                 className="block p-4 hover:bg-gray-50"
           >
             <div className="flex items-start space-x-3">
               {notification.type === 'like' ? (
                  <ThumbsUp className="w-5 h-5 text-pink-500" />
               ) : (
                <MessageSquare className="w-5 h-5 text-blue-500" />
             )}
               <div>
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
  );
};

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className={`notification-bell relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full
          ${variant === 'mobile' ? 'flex items-center space-x-2 w-full' : ''}`}
      >
        <Bell className="h-5 w-5" />
        {variant === 'mobile' && <span className="text-sm font-medium">通知</span>}
        {unreadCount > 0 && (
          <span className={`absolute ${variant === 'mobile' ? 'right-2' : '-top-1 -right-1'} 
            h-5 w-5 text-xs text-white bg-red-500 rounded-full flex items-center justify-center animate-bounce`}>
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div
          className={`notifications-panel bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50 opacity-0
            ${variant === 'mobile' 
              ? 'fixed left-0 top-0 w-screen h-screen' // 修改这里，使其固定位置并占满整个屏幕
              : 'absolute right-0 mt-2 w-96 rounded-lg'}`}
        >
          {/* 标题栏 */}
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="text-xs font-medium">通知中心</h3>
            {variant === 'mobile' && (
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1.5 text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <div className="flex gap-1">
              {[
                { id: 'all', label: '全部' },
                { id: 'interaction', label: '互动', icon: MessageSquare },
                { id: 'like', label: '点赞', icon: ThumbsUp },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={`px-2 py-1 text-xs rounded-full flex items-center gap-1
                    ${filter === id
                      ? id === 'like'
                        ? 'bg-pink-100 text-pink-800 font-medium'
                        : id === 'interaction'
                          ? 'bg-blue-100 text-blue-800 font-medium'
                          : 'bg-gray-100 text-gray-800 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 内容区域 */}
          <div className="overflow-y-auto" style={{ height: variant === 'mobile' ? 'calc(100vh - 3rem)' : '480px' }}>
            {renderContent()}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationsPopover;