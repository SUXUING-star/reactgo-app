// src/pages/Home.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatDistance } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import { MessageSquare, ArrowUpRight, Users, TrendingUp } from 'lucide-react'
import AnimatedHeader from '../components/AnimatedHeader'
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
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { isAuthenticated } = useAuth()
  const [comments, setComments] = useState([])
  const navigate = useNavigate();
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // 如果没有token，可以选择重定向到登录页面
          navigate('/login');
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 403) {
          // token可能过期，清除token并重定向到登录页
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }

        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
   }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let imageURL = '';
      
      // 如果有图片，先上传图片
      if (image) {
        const formData = new FormData();
        formData.append('image', image);
        
        const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageURL = uploadData.url;
        }
      }
      
      // 发送帖子数据，包含图片URL
      const postData = {
        title: title.trim(),
        content: content.trim(),
        category,
        imageURL
      };
      
      // 后续代码保持不变
    } catch (err) {
      // 错误处理
    }
  };

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
              {posts?.map((post, index) => (
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
                    {post?.imageURL && (
                      <div className="mb-4">
                          <img 
                              src={`${import.meta.env.VITE_API_URL}${post.imageURL}`}
                              alt={post.title}
                              className="rounded-lg w-full h-48 object-cover"
                              onError={(e) => {
                                  console.error('Image failed to load:', e);
                                  e.target.style.display = 'none';
                              }}
                          />
                        </div>
                      )}
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {post?.content || '暂无内容'}
                    </p>
                    
                    <div className="flex items-center">
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${post?.author || 'anonymous'}`}
                        alt=""
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{post?.author || '匿名用户'}</p>
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
              ))}
            </div>
          )}
        </div>

        <div className="hidden md:block">
          <Sidebar totalPosts={posts.length} latestComments={comments} />
        </div>
      </div>
    </div>
  )
}

export default Home