// src/pages/PostDetail.jsx
import { useState, useEffect } from 'react'
import { useParams , useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatDistance } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import Sidebar from '../components/Sidebar'  // 导入侧边栏组件
import { ThumbsUp, MessageCircle, MessageSquare, Trash2 } from 'lucide-react' // 导入图标
function PostDetail() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [commentsList, setCommentsList] = useState([])
  const [commentInput, setCommentInput] = useState('')
  const [loading, setLoading] = useState(true)
  const { token, isAuthenticated , user} = useAuth()
  const navigate = useNavigate(); // 添加导航

  const [replyTo, setReplyTo] = useState(null)
  const [replyContent, setReplyContent] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)

  useEffect(() => {
    fetchPost()
    //console.log('Current User:', user);
  }, [id])

  const fetchPost = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch post');
      }
      
      console.log('Comments data structure:', data.comments); // 添加这行来检查评论数据结构
      setPost(data.post);
      setCommentsList(Array.isArray(data.comments) ? data.comments : []);
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
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              }
          });
  
          const data = await response.json();
  
          if (response.ok) {
              // 重新获取帖子和评论
              await fetchPost();
          } else {
              throw new Error(data.error || '删除评论失败');
          }
      } catch (error) {
          console.error('Error deleting comment:', error);
          alert(error.message || '删除评论失败，请重试');
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
  // 处理点赞
  const handleLike = async (commentId) => {
    if (!isAuthenticated) {
      alert('请先登录')
      return
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/comments/${commentId}/like`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        await fetchPost() // 重新获取帖子数据以更新点赞状态
      }
    } catch (error) {
      console.error('Error liking comment:', error)
    }
  }
  // 处理取消点赞
  const handleUnlike = async (commentId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/comments/${commentId}/like`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        await fetchPost()
      }
    } catch (error) {
      console.error('Error unliking comment:', error)
    }
  }
   // 处理回复提交

  const handleReply = async (commentId) => {
    if (!isAuthenticated) {
      alert('请先登录');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/comments/${commentId}/reply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: replyContent }),
        }
      );

      if (response.ok) {
        setReplyContent('');
        setReplyingTo(null);
        await fetchPost(); // Refresh post data to update comments
      } else {
        console.error('Failed to reply:', await response.text());
      }
    } catch (error) {
      console.error('Error replying to comment:', error);
    }
  };

  
  // 渲染单个评论及其回复

  // 在 PostDetail.jsx 中修改 renderComment 函数
  const renderComment = (comment,  depth = 0) => {
    const isLiked = comment.likes?.includes(user?.id);
    
    const formatCommentDate = (dateString) => {
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return '未知时间';
        }
        return formatDistance(date, new Date(), {
          addSuffix: true,
          locale: zhCN,
        });
      } catch (error) {
        console.error('Error formatting date:', error);
        return '未知时间';
      }
    };
     // 修改缩进类名逻辑
     const getIndentClass = (depth) => {
      switch(depth) {
        case 1:
          return 'ml-8';
        case 2:
          return 'ml-16';
        default:
          return '';
      }
    };
    // 修改 renderComment 函数
    return (
      <div key={comment._id} className="mb-4">
        {/* 主评论 */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-sm text-gray-500">
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.author}`}
                alt=""
                className="w-6 h-6 rounded-full mr-2"
              />
              <span className="font-medium">{comment.author}</span>
              <span className="mx-2">•</span>
              <span>{formatCommentDate(comment.created_at)}</span>
            </div>
  
            <div className="flex items-center space-x-2">
              {isAuthenticated && (
                <button
                  onClick={() => isLiked ? handleUnlike(comment._id) : handleLike(comment._id)}
                  className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                    isLiked ? 'text-blue-500 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm">{comment.likes?.length || 0}</span>
                </button>
              )}
  
              {isAuthenticated && (
                <button
                  onClick={() => setReplyingTo(comment._id)}
                  className="text-gray-500 hover:text-blue-500 hover:bg-gray-50 p-1 rounded flex items-center space-x-1"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">回复</span>
                </button>
              )}
  
              {isAuthenticated && (user?.isAdmin || comment.author_id === user?.id) && (
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
  
          <div className="text-gray-700 whitespace-pre-wrap">
            {comment.content}
          </div>
  
          {/* 回复框 */}
          {replyingTo === comment._id && (
            <div className="mt-3 bg-white rounded-lg p-3 border border-gray-200">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full rounded-lg border-gray-200 shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows="2"
                placeholder={`回复 ${comment.author}:`}
              />
              <div className="mt-2 flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  取消
                </button>
                <button
                  onClick={() => handleReply(comment._id)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                  disabled={!replyContent.trim()}
                >
                  回复
                </button>
              </div>
            </div>
          )}
        </div>
  
        {/* 回复列表 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-8 mt-2 space-y-3 border-l-2 border-blue-100">
            {comment.replies.map((reply) => (
              <div key={reply._id} className="pl-4 pt-2">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${reply.author}`}
                        alt=""
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      <span className="font-medium">{reply.author}</span>
                      <span className="mx-2">•</span>
                      <span>{formatCommentDate(reply.created_at)}</span>
                    </div>
  
                    <div className="flex items-center space-x-2">
                      {isAuthenticated && (user?.isAdmin || reply.author_id === user?.id) && (
                        <button
                          onClick={() => handleDeleteComment(reply._id)}
                          className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
  
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {reply.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
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
                src={post.imageURL}  // 直接使用URL，因为现在所有图片都是完整的云存储URL
                alt={post.title}
                className="rounded-lg w-full max-h-[400px] object-contain mx-auto shadow-md hover:shadow-lg transition-shadow"
                onError={(e) => {
                  console.error('Image load error:', post.imageURL);
                  if (!e.target.dataset.retried) {
                    // 如果是本地路径，尝试添加API URL前缀（用于向后兼容）
                    if (post.imageURL.startsWith('/uploads/')) {
                      e.target.src = `${import.meta.env.VITE_API_URL}${post.imageURL}`;
                      e.target.dataset.retried = 'true';
                    } else {
                      e.target.style.display = 'none';
                    }
                  } else {
                    e.target.style.display = 'none';
                  }
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
                commentsList.map((comment) => renderComment(comment))
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
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