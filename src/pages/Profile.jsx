// src/pages/Profile.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

function Profile() {
  const { user, token } = useAuth()
  const [posts, setPosts] = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserContent()
  }, [])

  const fetchUserContent = async () => {
    try {
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
      setPosts(postsData)

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
      setComments(commentsData)
    } catch (error) {
      console.error('Error fetching user content:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">个人资料</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">用户名</label>
            <p className="mt-1 text-gray-900">{user.username}</p>
          </div>
          {/* 可以添加更多个人信息字段 */}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">我的帖子 ({posts.length})</h2>
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="border-b pb-4">
              <h3 className="text-lg font-semibold">{post.title}</h3>
              <p className="text-gray-600 mt-2">{post.content.slice(0, 200)}...</p>
              <div className="text-sm text-gray-500 mt-2">
                发布于 {new Date(post.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">我的评论 ({comments.length})</h2>
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b pb-4">
              <p className="text-gray-600">{comment.content}</p>
              <div className="text-sm text-gray-500 mt-2">
                发布于 {new Date(comment.CreatedAt || comment.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Profile