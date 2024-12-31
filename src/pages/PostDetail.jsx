// src/pages/PostDetail.jsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatDistance } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import Sidebar from '../components/Sidebar'  // 导入侧边栏组件

function PostDetail() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [commentsList, setCommentsList] = useState([])
  const [commentInput, setCommentInput] = useState('')
  const [loading, setLoading] = useState(true)
  const { token, isAuthenticated } = useAuth()

  useEffect(() => {
    fetchPost()
  }, [id])

  const fetchPost = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch post')
      }
      
      const comments = Array.isArray(data.comments) ? data.comments : [];
      
      setPost(data.post || null)
      setCommentsList(comments)
      
    } catch (error) {
      console.error('Error fetching post:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleComment = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: commentInput }),
      })
  
      if (response.ok) {
        setCommentInput('')
        await fetchPost()
      }
    } catch (error) {
      console.error('Error posting comment:', error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <article className="bg-white rounded-xl shadow-sm p-6 mb-6 hover:shadow-md transition-shadow">
            <h1 className="text-3xl font-bold mb-4 text-gray-900">{post.title}</h1>
            <div className="flex items-center text-gray-500 text-sm mb-6">
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${post?.author || 'anonymous'}`}
                alt=""
                className="w-6 h-6 rounded-full mr-2"
              />
              <span>{post.author}</span>
              <span className="mx-2">•</span>
              {post.created_at && (
                <span>
                  {formatDistance(new Date(post.created_at), new Date(), {
                    addSuffix: true,
                    locale: zhCN,
                  })}
                </span>
              )}
            </div>
            <div className="prose max-w-none">{post.content}</div>
          </article>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-900">评论 ({commentsList.length})</h2>
            {isAuthenticated && (
              <form onSubmit={handleComment} className="mb-8">
                <textarea
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="写下你的评论..."
                  required
                />
                <button
                  type="submit"
                  className="mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-6 rounded-lg font-medium hover:shadow-md transition-all transform hover:translate-y-[-2px]"
                >
                  发表评论
                </button>
              </form>
            )}

            <div className="space-y-6">
              {commentsList && commentsList.length > 0 ? (
                commentsList.map((comment) => (
                  <div 
                    key={comment.ID}
                    className="group border-l-2 border-transparent hover:border-blue-500 pl-4 transition-all"
                  >
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.Author}`}
                        alt=""
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      <span>{comment.Author}</span>
                      <span className="mx-2">•</span>
                      {comment.CreatedAt && (
                        <span>
                          {formatDistance(new Date(comment.CreatedAt), new Date(), {
                            addSuffix: true,
                            locale: zhCN,
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 group-hover:text-gray-900 transition-colors">
                      {comment.Content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-gray-500">暂无评论</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hidden md:block">
          <Sidebar totalPosts={1} latestComments={commentsList} />
        </div>
      </div>
    </div>
  )
}

export default PostDetail