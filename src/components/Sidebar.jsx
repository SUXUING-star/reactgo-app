import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowUpRight, MessageSquare, TrendingUp, Users, Bell } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import SearchBar from './SearchBar';
const Sidebar = () => {
  const { isAuthenticated, token } = useAuth();
  const [latestComments, setLatestComments] = useState([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalComments: 0,
    activeUsers: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/community-stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
    const fetchLatestComments = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/latest-comments`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setLatestComments(data);
        }
      } catch (error) {
        console.error('Error fetching latest comments:', error);
      }
    };
  
    fetchLatestComments();
  
  }, []);
  
  return (
    <div className="space-y-6">
      {/* 搜索栏 */}
      <div className="mb-6">
        <SearchBar variant="sidebar" />
      </div>
      {/* 发布新帖子部分 */}
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

      {/* 社区数据部分 */}
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
                {stats.totalPosts}
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
                {stats.activeUsers}
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-gray-600">总评论数</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {stats.totalComments}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 最新评论部分 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">最新评论</h3>
          <Bell className="w-5 h-5 text-blue-500" />
        </div>
        <div className="space-y-4">
          {latestComments && latestComments.length > 0 ? (
            latestComments.map(comment => (
              <Link 
                key={comment._id} // 修改为 _id
                to={`/post/${comment.post_id}`} // 修改为 post_id
                className="block group border-l-2 border-transparent hover:border-blue-500 pl-4 transition-all"
              >
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.author}`} // 修改为 author
                    alt=""
                    className="w-4 h-4 rounded-full mr-1"
                  />
                  <span>{comment.author}</span> {/* 修改为 author */}
                </div>
                <p className="text-gray-600 text-sm line-clamp-2 group-hover:text-gray-900">
                  {comment.content} {/* 修改为 content */}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {comment.created_at ? // 修改为 created_at
                    formatDistance(new Date(comment.created_at), new Date(), {
                      addSuffix: true,
                      locale: zhCN,
                    })
                    : '未知时间'
                  }
                </p>
              </Link>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">暂无评论</p>
            </div>
          )}
        </div>
      </div>

      {/* 社区公告部分 */}
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