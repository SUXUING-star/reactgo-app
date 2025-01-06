import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import AnimatedHeader from '../components/AnimatedHeader';
import { Coffee, Plus, Hash, Filter, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import LoadingSkeleton from "../components/LoadingSkeleton";
import LazyImage from '../components/LazyImage';
import PostPreview from '../components/PostPreview';

// 分页控件组件
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <span className="px-4 py-2 text-sm text-gray-700">
        第 {currentPage} 页，共 {totalPages} 页
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

// 筛选器组件
const FilterPanel = ({ 
  categories, 
  topics, 
  activeCategory, 
  activeTopic,
  sortBy,
  onCategoryChange, 
  onTopicChange,
  onSortChange 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div className="flex items-center mb-4">
        <Filter className="w-5 h-5 text-gray-500 mr-2" />
        <h3 className="text-lg font-semibold">筛选</h3>
      </div>
      
      {/* 分类筛选 */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">分类</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onCategoryChange(null)}
            className={`px-3 py-1 rounded-full text-sm ${
              !activeCategory
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-3 py-1 rounded-full text-sm ${
                activeCategory === category
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* 话题筛选 */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">话题</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onTopicChange(null)}
            className={`px-3 py-1 rounded-full text-sm ${
              !activeTopic
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {topics.map(topic => (
            <button
              key={topic._id}
              onClick={() => onTopicChange(topic._id)}
              className={`px-3 py-1 rounded-full text-sm ${
                activeTopic === topic._id
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {topic.title}
            </button>
          ))}
        </div>
      </div>
      {/* 添加排序选项 */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">排序方式</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSortChange('edited_at')}
            className={`px-3 py-1 rounded-full text-sm ${
              sortBy === 'edited_at'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            最近更新
          </button>
          <button
            onClick={() => onSortChange('created_at')}
            className={`px-3 py-1 rounded-full text-sm ${
              sortBy === 'created_at'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            发布时间
          </button>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAuthenticated, token } = useAuth();
    const navigate = useNavigate();

    // 分页状态
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;
    
    // 筛选状态
    const [categories, setCategories] = useState([]);
    const [topics, setTopics] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [activeTopic, setActiveTopic] = useState(null);
    const [sortBy, setSortBy] = useState('created_at');

    // 获取所有话题
    useEffect(() => {
      const fetchTopics = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/topics`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setTopics(data);
          }
        } catch (error) {
          console.error('Error fetching topics:', error);
        }
      };
      fetchTopics();
    }, [token]);
    
    // 获取所有分类
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
            });
              if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
         } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, [token]);

    // 获取帖子列表
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const queryParams = new URLSearchParams({
                  page: currentPage,
                  pageSize,
                  sortBy,
                  ...(activeCategory && { category: activeCategory }),
                  ...(activeTopic && { topic_id: activeTopic }),
                 });

               const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/posts?${queryParams}`,
                    {
                       headers: {
                            Authorization: `Bearer ${token}`,
                          },
                    }
                );
               if (response.status === 403) {
                    localStorage.removeItem('token');
                   navigate('/login');
                   return;
                }
                const data = await response.json();
                setPosts(data.posts || []);
                setTotalPages(Math.ceil(data.total / pageSize));
            } catch (err) {
                setError(err.message);
                console.error('Error fetching posts:', err);
                 setPosts([]);
            } finally {
                setLoading(false);
           }
        };
         fetchPosts();
    }, [token, navigate, currentPage, activeCategory, activeTopic, sortBy]);

    // 处理分页改变
   const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
           setCurrentPage(newPage);
            setSearchParams({ page: newPage.toString() });
      }
    };

   // 处理筛选改变
   const handleCategoryChange = useCallback((category) => {
       setActiveCategory(category);
        setCurrentPage(1);
    }, []);
   const handleTopicChange = useCallback((topicId) => {
       setActiveTopic(topicId);
       setCurrentPage(1);
    }, []);
   const handleSortChange = useCallback((newSortBy) => {
        setSortBy(newSortBy);
        setCurrentPage(1);
  }, []);
    const renderPostItem = (post, index) => (
        <PostPreview key={post?._id || `post-${index}`} post={post}>
            <Link
                to={`/post/${post?._id}`}
                className="block bg-white rounded-xl shadow-md hover:shadow-lg transition-all transform hover:translate-y-[-2px] overflow-hidden group"
            >
                {/* 图片容器 */}
                <LazyImage
                    src={post?.imageURL}
                    alt={post.title}
                    className="aspect-[16/9] group-hover:scale-105"
                    defaultHeight="h-48"
                />

                <div className="p-4 flex-1 flex flex-col">
                    <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {post?.category || '未分类'}
                        </span>
                            {post?.topic_id && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
                                    <Hash className="w-3 h-3" />
                                    {post?.topic?.title || '话题'}
                                </span>
                            )}
                    </div>
                    
                    <h2 className="text-lg font-bold mb-2 text-gray-900 line-clamp-2 group-hover:text-blue-600">
                        {post.title}
                    </h2>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {post.content?.replace(/<[^>]*>/g, '')}
                    </p>
                <div className="flex items-center mt-auto pt-3 border-t border-gray-100">
                    <Link
                        to={`/user/${post.author_id}`}
                        className="flex items-center flex-1 hover:opacity-80 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                          src={post.author_avatar || '/default-avatar.svg'}
                          alt={post.author}
                          className="w-6 h-6 rounded-full object-cover"
                          onError={(e) => {
                              // 防止无限循环
                              e.target.onerror = null;  // 重要：移除错误处理器
                              e.target.src = '/default-avatar.svg';
                          }}
                      />
                        <div className="ml-2 flex-1">
                            <p className="text-sm font-medium text-gray-900">{post.author}</p>
                            <p className="text-xs text-gray-500">
                                {formatDistance(new Date(post.created_at), new Date(), {
                                    addSuffix: true,
                                    locale: zhCN,
                                })}
                            </p>
                        </div>
                    </Link>

                    <div className="flex items-center text-gray-500 text-sm">
                            <MessageSquare className="w-4 h-4 mr-1" />
                                <span>{post.comments_count || 0}</span>
                        </div>
                </div>
                </div>
            </Link>
        </PostPreview>
    );
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-blue-50 to-gray-100 opacity-70 z-0"></div>
          <div className="container mx-auto px-4 py-8 relative z-10">
                <AnimatedHeader />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2">
                    <FilterPanel
                        categories={categories}
                         topics={topics}
                        activeCategory={activeCategory}
                        activeTopic={activeTopic}
                        sortBy={sortBy}
                       onCategoryChange={handleCategoryChange}
                         onTopicChange={handleTopicChange}
                         onSortChange={handleSortChange}
                    />
                    {loading ? (
                         <LoadingSkeleton />
                      ) : error ? (
                          <div className="text-red-500">{error}</div>
                       ) : (
                          <>
                             <div className="space-y-6">
                                  {posts?.length > 0 ? (
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                       {posts.map(renderPostItem)}
                                    </div>
                                      ) : (
                                         <div className="bg-white rounded-xl shadow-sm p-8 text-center animate-fade-in">
                                               <div className="flex flex-col items-center justify-center space-y-4">
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
                                                      <div className="md:hidden fixed bottom-6 right-6 z-50">
                                                        <Link
                                                          to="/create-post"
                                                          className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
                                                          aria-label="发布新帖子"
                                                        >
                                                          <Plus className="w-6 h-6" />
                                                        </Link>
                                                      </div>
                                                    )}
                                              </div>
                                          </div>
                                      )}
                                 </div>
                                  {posts.length > 0 && (
                                     <Pagination
                                          currentPage={currentPage}
                                          totalPages={totalPages}
                                         onPageChange={handlePageChange}
                                    />
                                 )}
                             </>
                       )}
                   </div>
                    <div className="hidden md:block">
                      <Sidebar totalPosts={posts?.length || 0} latestComments={comments} />
                    </div>
                </div>
           </div>
        </div>
    );
};

export default Home