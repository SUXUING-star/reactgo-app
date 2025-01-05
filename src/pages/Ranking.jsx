// src/pages/Ranking.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
        // 检查并打印用户数据，方便调试
        console.log('Users ranking data:', users);
        setUserRanking(users);
        setPostRanking(posts);
      })
      .catch(error => {
        console.error('Error fetching rankings:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

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

  const getPositionStyle = (index) => {
    const styles = {
      base: "w-6 h-6 rounded-full flex items-center justify-center font-medium",
      0: "bg-yellow-100 text-yellow-800 ring-2 ring-yellow-400",
      1: "bg-gray-100 text-gray-800 ring-2 ring-gray-300",
      2: "bg-orange-100 text-orange-800 ring-2 ring-orange-400",
      default: "bg-gray-100 text-gray-600"
    };
    return `${styles.base} ${index < 3 ? styles[index] : styles.default}`;
  };

  const RankBadge = ({ position }) => (
    <div className={getPositionStyle(position)}>
      {position + 1}
    </div>
  );

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
              <Link
                to={`/user/${user._id}`}
                key={user._id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <RankBadge position={index} />
                  <div className="relative">
                    <img
                      src={user.avatar || '/default-avatar.svg'}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover border-2 border-transparent group-hover:border-blue-500 transition-colors"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-avatar.svg';
                      }}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium group-hover:text-blue-600 transition-colors">
                      {user.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user.bio?.slice(0, 20) || '这个用户很懒，什么都没写~'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end text-sm">
                  <span className="text-gray-900 font-medium">{user.post_count} 篇帖子</span>
                  <span className="text-gray-500">{user.comment_count || 0} 条评论</span>
                </div>
              </Link>
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
              <Link
                to={`/post/${post._id}`}
                key={post._id}
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <RankBadge position={index} />
                    <h3 className="font-medium line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500 space-x-4 ml-9">
                  <Link 
                    to={`/user/${post.author_id}`} 
                    className="hover:text-blue-600 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center space-x-2">
                      <img
                        src={post.author_avatar || '/default-avatar.svg'}
                        alt={post.author}
                        className="w-5 h-5 rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/default-avatar.svg';
                        }}
                        referrerPolicy="no-referrer"
                      />
                      <span>{post.author}</span>
                    </div>
                  </Link>
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    <span>{post.comments_count || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    <span>{post.like_count || 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ranking;