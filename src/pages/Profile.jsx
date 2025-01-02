// src/pages/Profile.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
function Profile() {
  const { user, token } = useAuth()
  const [posts, setPosts] = useState([])  // 初始化为空数组
  const [comments, setComments] = useState([])  // 初始化为空数组
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // 如果没有用户信息，直接返回
    if (!user || !token) {
      setLoading(false)
      setPosts([])
      setComments([])
      return
    }

    const fetchUserContent = async () => {
      try {
        setLoading(true)
        setError(null)

        // 获取用户的帖子
        const postsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/${user.id}/posts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        const postsData = await postsResponse.json()
        setPosts(Array.isArray(postsData) ? postsData : [])

        // 获取用户的评论
        const commentsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/${user.id}/comments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        const commentsData = await commentsResponse.json()
        setComments(Array.isArray(commentsData) ? commentsData : [])
      } catch (error) {
        console.error('Error fetching user content:', error)
        setError(error.message)
        setPosts([])
        setComments([])
      } finally {
        setLoading(false)
      }
    }

    fetchUserContent()
  }, [user, token])

  // 如果用户未登录，显示登录提示
  if (!user || !token) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">请先登录</h2>
          <p className="text-gray-600">登录后即可查看个人资料</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center text-red-600">
          <p>加载失败: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">个人资料</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">用户名</label>
            <p className="mt-1 text-gray-900">{user.username}</p>
          </div>
          <div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700">注册时间</label>
            <p className="mt-1 text-gray-900">
              {user.createdAt ? new Date(user.createdAt).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              }) : '未知'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">账号状态</label>
            <p className="mt-1 text-gray-900">{user.isVerified ? '已验证' : '未验证'}</p>
          </div>
        </div>

        <div className="mt-6 border-t pt-6">
          <h2 className="text-lg font-medium mb-4">账号统计</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">发帖总数</p>
              <p className="text-2xl font-bold text-blue-600">{posts.length}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">评论总数</p>
              <p className="text-2xl font-bold text-purple-600">{comments.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">获赞总数</p>
              <p className="text-2xl font-bold text-green-600">0</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">活跃天数</p>
              <p className="text-2xl font-bold text-orange-600">1</p>
            </div>
          </div>
        </div>
      </div>

      {/* 帖子列表 */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">我的帖子 ({posts.length})</h2>
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post._id} className="border-b pb-4 last:border-b-0">
              <Link 
                to={`/post/${post._id}`}
                className="block hover:bg-gray-50 transition duration-150 ease-in-out rounded-lg p-3"
              >
                <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800">
                  {post.title}
                </h3>
                <p className="text-gray-600 mt-2">{post.content.slice(0, 200)}...</p>
                <div className="text-sm text-gray-500 mt-2 flex items-center">
                  <span>发布于 {new Date(post.created_at).toLocaleString()}</span>
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
        <h2 className="text-xl font-bold mb-4">我的评论 ({comments.length})</h2>
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="border-b pb-4 last:border-b-0">
              <Link 
                to={`/post/${comment.post_id}`}
                className="block hover:bg-gray-50 transition duration-150 ease-in-out rounded-lg p-3"
              >
                <div className="flex flex-col">
                  <span className="text-sm text-blue-600 mb-2">
                    评论于：{comment.post?.title || '已删除的帖子'}
                  </span>
                  <p className="text-gray-600">{comment.content}</p>
                  <div className="text-sm text-gray-500 mt-2">
                    发布于 {new Date(comment.created_at).toLocaleString()}
                  </div>
                </div>
              </Link>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-gray-500 text-center py-4">暂无评论</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile

