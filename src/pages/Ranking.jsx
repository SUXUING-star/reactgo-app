// src/pages/Ranking.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy, UserCheck, MessageSquare, ArrowUp } from 'lucide-react';

function Ranking() {
  const [userRanking, setUserRanking] = useState([]);
  const [postRanking, setPostRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/ranking/users`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${import.meta.env.VITE_API_URL}/api/ranking/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(async ([usersRes, postsRes]) => {
        const users = await usersRes.json();
        const posts = await postsRes.json();
        setUserRanking(users);
        setPostRanking(posts);
      })
      .catch(error => {
        console.error('Error fetching rankings:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2 mb-8">
        <Trophy className="w-6 h-6 text-blue-600" />
        <h1 className="text-3xl font-bold">排行榜</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 用户排行 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-6">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">活跃用户</h2>
          </div>
          
          <div className="space-y-4">
            {userRanking.map((user, index) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center 
                    ${index < 3 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'}`}>
                    {index + 1}
                  </span>
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-medium">{user.username}</span>
                </div>
                <span className="text-gray-500">发帖 {user.post_count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 热门帖子排行 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-6">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">热门帖子</h2>
          </div>
          
          <div className="space-y-4">
            {postRanking.map((post, index) => (
              <div
                key={post._id}
                className="p-3 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center
                      ${index < 3 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'}`}>
                      {index + 1}
                    </span>
                    <h3 className="font-medium line-clamp-1">{post.title}</h3>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500 space-x-4 ml-9">
                  <span>by {post.author}</span>
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    <span>{post.comment_count}</span>
                  </div>
                  <div className="flex items-center">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    <span>{post.like_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ranking;