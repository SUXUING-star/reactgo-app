// src/pages/PostDetail.jsx
import { useState, useEffect } from 'react'
import { useParams , useNavigate} from 'react-router-dom'
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
  const { token, isAuthenticated , user} = useAuth()
  const navigate = useNavigate(); // 添加导航

  useEffect(() => {
    fetchPost()
    //console.log('Current User:', user);
  }, [id])

  const fetchPost = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}` // 添加认证头
        }
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch post');
      }
      
      // 直接使用 data.post，因为后端返回的是 {post: {...}, comments: [...]}
      setPost(data.post);
      setCommentsList(Array.isArray(data.comments) ? data.comments : []);
      
      // 调试用
      //console.log('Fetched post data:', data.post);
      
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };
  // 在 PostDetail 组件中添加删除评论的函数
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('确定要删除这条评论吗？')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // 重新获取帖子和评论
        await fetchPost();
      } else {
        throw new Error('删除评论失败');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('删除评论失败，请重试');
    }
  };
  // 添加删除功能
  const handleDelete = async () => {
    if (!window.confirm('确定要删除这个帖子吗？')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        navigate('/');
      } else {
        throw new Error('删除失败');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('删除失败，请重试');
    }
  };
  
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
          {/* 标题 */}
          <h1 className="text-3xl font-bold mb-4 text-gray-900">{post?.title}</h1>

          {/* 作者信息 */}
          <div className="flex items-center text-gray-500 text-sm mb-6">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${post?.author || 'anonymous'}`}
              alt=""
              className="w-6 h-6 rounded-full mr-2"
            />
            <span>{post?.author}</span>
            <span className="mx-2">•</span>
            {post?.created_at && (
              <span>
                {formatDistance(new Date(post.created_at), new Date(), {
                  addSuffix: true,
                  locale: zhCN,
                })}
              </span>
            )}
          </div>

          {/* 图片 */}
          {post?.imageURL && (
            <div className="mb-6">
              <img 
                src={`${import.meta.env.VITE_API_URL}${post.imageURL}`}
                alt={post.title}
                className="rounded-lg w-full max-h-[400px] object-contain mx-auto shadow-md hover:shadow-lg transition-shadow"
                onError={(e) => {
                  console.error('Image failed to load:', e);
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* 内容 */}
          <div 
            className="prose max-w-none mb-6 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ 
              __html: post?.content?.replace(/\n/g, '<br>') || ''
            }}
          />

          {/* 底部操作栏 */}
          <div className="border-t pt-4 mt-6">
            <div className="flex justify-end items-center">
              {isAuthenticated && (user?.isAdmin || post?.author_id?.toString() === user?.id) && (
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <svg 
                    className="w-4 h-4 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                    />
                  </svg>
                  {user?.isAdmin ? '管理员删除' : '删除帖子'}
                </button>
              )}
            </div>
          </div>
        </article>
        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* 评论标题 */}
          <h2 className="text-xl font-bold mb-6 text-gray-900">评论 ({commentsList.length})</h2>

          {/* 评论输入框 */}
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

          {/* 评论列表 */}
          <div className="space-y-6">
            {commentsList && commentsList.length > 0 ? (
              commentsList.map((comment) => (
                <div key={comment.ID} className="border-b pb-4 last:border-b-0">
                  {/* 评论作者信息 */}
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.Author}`}
                      alt=""
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    <span className="font-medium">{comment.Author}</span>
                    <span className="mx-2">•</span>
                    <span>
                      {formatDistance(new Date(comment.CreatedAt), new Date(), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </span>
                  </div>

                  {/* 评论内容和删除按钮 */}
                  <div className="relative group">
                    <p className="text-gray-700">{comment.Content}</p>
                    {/* 删除按钮 */}
                    {isAuthenticated && (user?.isAdmin || comment.AuthorID === user?.id) && (
                      <div className="absolute bottom-0 right-0">
                        <button
                          onClick={() => handleDeleteComment(comment.ID)}
                          className="text-sm text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center"
                        >
                          <svg 
                            className="w-4 h-4 mr-1" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                            />
                          </svg>
                          删除
                        </button>
                      </div>
                    )}
                  </div>
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