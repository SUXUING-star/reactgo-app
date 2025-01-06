import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import anime from 'animejs';

function Profile() {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 添加状态来管理用户数据
  const [profile, setProfile] = useState({
    avatar: '',
    username: '',
    email: '',
    bio: '',
  });

  useEffect(() => {
    if (!user || !token) {
      setLoading(false);
      setPosts([]);
      setComments([]);
      return;
    }

    const fetchUserContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const postsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/${user.id}/posts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const postsData = await postsResponse.json();
        setPosts(Array.isArray(postsData) ? postsData : []);

        const commentsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/${user.id}/comments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const commentsData = await commentsResponse.json();
        setComments(Array.isArray(commentsData) ? commentsData : []);
      } catch (error) {
        console.error('Error fetching user content:', error);
        setError(error.message);
        setPosts([]);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserContent();
  }, [user, token]);
  // 添加 useEffect 来处理用户数据的初始化
  useEffect(() => {
    if (user) {
      setProfile({
        avatar: user.avatar || '',
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
      });
    }
  }, [user]);
  useEffect(() => {
    if (!loading) {
      // 个人资料容器动画
      anime({
        targets: '.profile-container',
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutExpo',
      });

      // 表单字段依次动画
      anime({
        targets: '.profile-field',
        translateX: [-30, 0],
        opacity: [0, 1],
        delay: anime.stagger(80),
        duration: 600,
        easing: 'easeOutCubic',
      });

      // 帖子和评论列表标题
      anime({
        targets: '.list-title',
        translateY: [20, 0],
        opacity: [0, 1],
        delay: 300,
        duration: 600,
        easing: 'easeOutCubic',
      });
      // 帖子和评论列表项动画
      anime({
        targets: '.list-item',
        translateY: [10, 0],
        opacity: [0, 1],
        delay: anime.stagger(50, { start: 400 }),
        duration: 400,
        easing: 'easeOutQuad',
      });
    }
  }, [loading]);

  if (!user || !token) {
    return (
      <Link
        to="/login"
        className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg block text-center"
      >
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">请先登录</h2>
            <p className="text-gray-600">登录后即可查看个人资料</p>
          </div>
        </div>
      </Link>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center text-red-600">
          <p>加载失败: {error}</p>
        </div>
      </div>
    );
  }

  // 过滤掉已删除帖子的评论
  const validComments = comments.filter(comment => comment.post?.title);


  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6 mb-6 profile-container opacity-0">
        <h1 className="text-2xl font-bold mb-4">个人资料</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="profile-field opacity-0">
            <label className="block text-sm font-medium text-gray-700">用户名</label>
            <p className="mt-1 text-gray-900">{user.username}</p>
            <img
              src={user?.avatar || '/default-avatar.png'} // 使用 user?.avatar 而不是 profile.avatar
              alt={user?.username}
              className="w-24 h-24 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-avatar.svg';
              }}
            />
          </div>
          <div className="profile-field opacity-0">
            <label className="block text-sm font-medium text-gray-700">邮箱</label>
            <p className="mt-1 text-gray-900 flex items-center">
              {user.email}
              {user.isVerified && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  已验证
                </span>
              )}
            </p>
          </div>
          <div className="profile-field opacity-0">
            <label className="block text-sm font-medium text-gray-700">注册时间</label>
            <p className="mt-1 text-gray-900">
              {user.createdAt
                ? new Date(user.createdAt).toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '未知'}
            </p>
          </div>
          <div className="profile-field opacity-0">
            <label className="block text-sm font-medium text-gray-700">账号状态</label>
            <p className="mt-1 text-gray-900">{user.isVerified ? '已验证' : '未验证'}</p>
          </div>
        </div>

        <div className="mt-6 border-t pt-6">
          <h2 className="text-lg font-medium mb-4">账号统计</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg profile-field opacity-0">
              <p className="text-sm text-gray-600">发帖总数</p>
              <p className="text-2xl font-bold text-blue-600">{posts.length}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg profile-field opacity-0">
              <p className="text-sm text-gray-600">评论总数</p>
              <p className="text-2xl font-bold text-purple-600">{validComments.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg profile-field opacity-0">
              <p className="text-sm text-gray-600">获赞总数</p>
              <p className="text-2xl font-bold text-green-600">
                {validComments.reduce((sum, comment) => sum + (comment.likes?.length || 0), 0)}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg profile-field opacity-0">
              <p className="text-sm text-gray-600">活跃天数</p>
              <p className="text-2xl font-bold text-orange-600">
                {new Set([
                  ...posts.map(post => new Date(post.created_at).toDateString()),
                  ...validComments.map(comment => new Date(comment.created_at).toDateString())
                ]).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 帖子列表 */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 list-title opacity-0">我的帖子 ({posts.length})</h2>
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post._id} className="border-b pb-4 last:border-b-0 list-item opacity-0">
              <Link
                to={`/post/${post._id}`}
                className="block hover:bg-gray-50 transition duration-150 ease-in-out rounded-lg p-3"
              >
                <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800">
                  {post.title}
                </h3>
                <p className="text-gray-600 mt-2">{post.content.slice(0, 200)}...</p>
                <div className="text-sm text-gray-500 mt-2 flex items-center">
                  <span>发布于 {new Date(post.created_at).toLocaleString('zh-CN')}</span>
                  <span className="mx-2">•</span>
                  <span>{post.comments_count || 0} 条评论</span>
                </div>
              </Link>
            </div>
          ))}
          {posts.length === 0 && (
            <p className="text-gray-500 text-center py-4">暂无帖子</p>
          )}
        </div>
      </div>

      {/* 评论列表 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 list-title opacity-0">我的评论 ({validComments.length})</h2>
        <div className="space-y-4">
          {validComments.map((comment) => (
            <div key={comment._id} className="border-b pb-4 last:border-b-0 list-item opacity-0">
              <Link
                to={`/post/${comment.post_id}`}
                className="block hover:bg-gray-50 transition duration-150 ease-in-out rounded-lg p-3"
              >
                <div className="flex flex-col">
                  <span className="text-sm text-blue-600 mb-2">
                    评论于：{comment.post?.title}
                  </span>
                  <p className="text-gray-600">{comment.content}</p>
                  <div className="text-sm text-gray-500 mt-2">
                    发布于 {new Date(comment.created_at).toLocaleString('zh-CN')}
                  </div>
                </div>
              </Link>
            </div>
          ))}
          {validComments.length === 0 && (
            <p className="text-gray-500 text-center py-4">暂无评论</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;