// src/components/MessagesPopover.jsx
import { useState } from 'react'
import { MessageCircle } from 'lucide-react'

function MessagesPopover() {
  const [messages] = useState([
    {
      id: 1,
      sender: '张三',
      content: '你好,请问...',
      time: '5分钟前',
      isRead: false,
    },
    {
      id: 2,
      sender: '李四',
      content: '谢谢你的回复',
      time: '30分钟前',
      isRead: true,
    },
  ])

  return (
    <div className="relative">
      <button className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full">
        <MessageCircle className="h-5 w-5" />
        {messages.some(m => !m.isRead) && (
          <span className="absolute top-0 right-0 h-4 w-4 text-xs text-white bg-red-500 rounded-full flex items-center justify-center">
            {messages.filter(m => !m.isRead).length}
          </span>
        )}
      </button>

      {/* 弹出内容 */}
      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
        <div className="py-1">
          <div className="px-4 py-2 border-b">
            <h3 className="text-sm font-medium">消息</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`px-4 py-3 hover:bg-gray-50 ${
                  !message.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${message.sender}`}
                    alt=""
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{message.sender}</p>
                    <p className="text-sm text-gray-600">{message.content}</p>
                    <p className="text-xs text-gray-500 mt-1">{message.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 border-t">
            <button className="text-sm text-blue-600 hover:text-blue-700">
              查看所有消息
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessagesPopover