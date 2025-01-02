// src/pages/Home.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatDistance } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import AnimatedHeader from '../components/AnimatedHeader'
import { Coffee, Plus } from 'lucide-react'
// 加载骨架屏组件
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
}

const Home = () => {
  const [posts, setPosts] = useState([]) // 确保初始值为空数组而不是 null
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { isAuthenticated, token } = useAuth()
  const navigate = useNavigate()
  // 渲染帖子列表项
  const renderPostItem = (post, index) => (
    <Link
      key={post?._id || `post-${index}`}
      to={`/post/${post?._id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all transform hover:translate-y-[-2px]"
    >
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {post?.category || '未分类'}
          </span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>
        
        <h2 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-blue-600">
          {post?.title || '无标题'}
        </h2>
        {/*图片*/}
        {post?.imageURL && (
          <div className="mb-4">
            <img 
              src={post.imageURL}  // 直接使用URL
              alt={post.title}
              className="rounded-lg w-full h-48 object-cover"
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
        
        <p 
          className="text-gray-600 mb-4 whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ 
            __html: post?.content || '暂无内容'
          }}
        />
        
        <div className="flex items-center">
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${post?.author || 'anonymous'}`}
            alt=""
            className="w-8 h-8 rounded-full"
          />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {post?.author || '匿名用户'}
            </p>
            <p className="text-sm text-gray-500">
              {post?.created_at ? 
                formatDistance(new Date(post.created_at), new Date(), {
                  addSuffix: true,
                  locale: zhCN,
                })
                : '未知时间'
              }
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (!token) {
          navigate('/login')
          return
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.status === 403) {
          localStorage.removeItem('token')
          navigate('/login')
          return
        }

        const data = await response.json()
        setPosts(data || []) // 确保设置空数组而不是 null
      } catch (err) {
        setError(err.message)
        console.error('Error fetching posts:', err)
        setPosts([]) // 发生错误时设置为空数组
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [token, navigate])
return (
  <div className="container mx-auto px-4 py-8">
    <AnimatedHeader />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="space-y-6">
            {posts?.length > 0 ? (
              posts.map(renderPostItem)
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  {/* 使用 Coffee 图标表示空状态 */}
                  <div className="w-16 h-16 text-gray-300 mb-4">
                    <Coffee className="w-full h-full animate-bounce-slow" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900">
                    暂无帖子
                  </h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    来发布第一篇帖子，分享你的想法和经验吧！
                  </p>
                  {isAuthenticated && (
                    <Link
                      to="/create-post"
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      发布新帖子
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="hidden md:block">
        <Sidebar totalPosts={posts?.length || 0} latestComments={comments} />
      </div>
    </div>
  </div>
)
}

export default Home

