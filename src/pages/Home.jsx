// src/pages/Home.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`);
        if (!postsResponse.ok) {
          throw new Error(`Failed to fetch posts: ${postsResponse.status}`);
        }
        const postsData = await postsResponse.json();
        setPosts(postsData || []); // 确保设置空数组
      
        if (postsData && postsData.length > 0) {
          const commentsPromises = postsData.slice(0, 3).map(post => 
            fetch(`${import.meta.env.VITE_API_URL}/api/posts/${post._id}/comments`)
            .then(res => res.json())
            .catch(() => [])
          );
          
          const commentsData = await Promise.all(commentsPromises);
          const flattenedComments = commentsData
            .flat()
            .filter(comment => comment)
            .sort((a, b) => {
              const dateA = new Date(a?.CreatedAt || a?.created_at);
              const dateB = new Date(b?.CreatedAt || b?.created_at);
              return dateB - dateA;
            });
      
          setComments(flattenedComments || []);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
        setPosts([]);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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