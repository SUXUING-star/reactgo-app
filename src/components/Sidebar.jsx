import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowUpRight, MessageSquare, TrendingUp, Users, Bell } from 'lucide-react';

const Sidebar = ({ totalPosts = 0, latestComments = [] }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-6">
      {isAuthenticated && (
        <Link
          to="/create-post"
          className="block w-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white transform transition-all hover:scale-105 hover:shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium">发布新帖子</span>
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <p className="text-blue-100">分享你的想法和经验</p>
        </Link>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 transform transition-all hover:shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">社区数据</h3>
          <TrendingUp className="w-5 h-5 text-blue-500" />
        </div>
        
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-gray-600">总帖子数</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {totalPosts}
              </span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-gray-600">活跃用户</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {Math.floor(totalPosts * 0.7)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">最新评论</h3>
          <Bell className="w-5 h-5 text-blue-500" />
        </div>
        <div className="space-y-4">
          {latestComments && latestComments.length > 0 ? (
            latestComments.slice(0, 3).map(comment => (
              <div 
                key={comment?.ID || comment?.id} 
                className="group border-l-2 border-transparent hover:border-blue-500 pl-4 transition-all"
              >
                <p className="text-gray-600 text-sm line-clamp-2 group-hover:text-gray-900">
                  {comment?.Content || comment?.content}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {comment?.CreatedAt || comment?.created_at ? 
                    new Date(comment?.CreatedAt || comment?.created_at).toLocaleString() 
                    : '未知时间'
                  }
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">暂无评论</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">社区公告</h3>
          <Bell className="w-5 h-5" />
        </div>
        <div className="space-y-2 text-blue-100">
          <p>欢迎来到我们的社区！这里是一个开放、友善的交流平台。</p>
          <p>请遵守社区规则，保持友善的交流氛围。</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;