// src/components/NotificationsPopover.jsx
import { useState } from 'react';
import { Bell } from 'lucide-react';

function NotificationsPopover() {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute top-0 right-0 h-4 w-4 text-xs text-white bg-red-500 rounded-full flex items-center justify-center">
          3
        </span>
      </button>

      {showNotifications && (
        <div 
          className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50"
          onMouseLeave={() => setShowNotifications(false)}
        >
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium">通知</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {/* 可以添加通知列表 */}
            <div className="p-4 text-sm text-gray-500">
              暂无通知
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationsPopover;