// src/components/SearchBar.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, User, Hash, FileText } from 'lucide-react';
import PostPreview from '../components/PostPreview';

// 自定义 debounce 函数
function useDebounce(callback, delay) {
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = (...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };

  return debouncedCallback;
}

function SearchBar({ variant = 'navbar' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // 使用自定义的 debounce hook
  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/search?q=${encodeURIComponent(searchQuery)}&type=${selectedType}`
      );

      if (!response.ok) {
        throw new Error('搜索请求失败');
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('搜索错误:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useDebounce(handleSearch, 300);

  // 处理输入变化
  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedSearch(newQuery);
  };

  // 处理手动搜索按钮点击
  const handleManualSearch = () => {
    handleSearch(query);
  };

  // 根据变体返回不同的样式
  const getContainerStyles = () => {
    switch (variant) {
      case 'navbar':
        return 'w-full max-w-xl';
      case 'sidebar':
        return 'w-full';
      case 'mobile':
          return 'w-full';
      default:
        return 'w-full';
    }
  };

  // 处理点击外部关闭结果
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setResults(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 清除搜索
  const handleClearSearch = () => {
    setQuery('');
    setResults(null);
  };

  // 处理类型选择
  const handleTypeSelect = (type) => {
    setSelectedType(type);
    if (query.trim()) {
      handleSearch(query);
    }
  };

  return (
    <div className={`relative ${getContainerStyles()}`} ref={searchRef}>
      {/* 移动端不显示类型选择器 */}
      {variant === 'sidebar' && (
        // 侧边栏的搜索类型选择器
        <div className="flex mb-2 space-x-2">
          <button
            onClick={() => handleTypeSelect('all')}
            className={`text-xs px-2 py-1 rounded ${
              selectedType === 'all' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => handleTypeSelect('posts')}
            className={`text-xs px-2 py-1 rounded flex items-center ${
              selectedType === 'posts' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
            }`}
          >
            <FileText className="w-3 h-3 mr-1" />
            帖子
          </button>
          <button
            onClick={() => handleTypeSelect('topics')}
            className={`text-xs px-2 py-1 rounded flex items-center ${
              selectedType === 'topics' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
            }`}
          >
            <Hash className="w-3 h-3 mr-1" />
            话题
          </button>
          <button
            onClick={() => handleTypeSelect('users')}
            className={`text-xs px-2 py-1 rounded flex items-center ${
              selectedType === 'users' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
            }`}
          >
            <User className="w-3 h-3 mr-1" />
            用户
          </button>
        </div>
      )}

      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
            placeholder={`搜索${
              variant === 'mobile' ? '' :
              selectedType === 'posts' ? '帖子' :
              selectedType === 'topics' ? '话题' :
              selectedType === 'users' ? '用户' : '内容'
            }...`}
          className={`w-full px-4 py-2 pl-10 pr-24 text-sm border border-gray-300 rounded-full 
            focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
            ${variant === 'mobile' ? 'bg-gray-50' : ''}`}
        />
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
        />

        <div className="absolute right-2 flex items-center space-x-1">
          {query && (
            <button
              onClick={handleClearSearch}
              className="p-1.5 hover:bg-gray-100 rounded-full"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}

          <button
            onClick={handleManualSearch}
            disabled={!query.trim() || loading}
            className="px-4 py-1.5 rounded-full text-sm font-medium bg-blue-500 text-white hover:bg-blue-600
              disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              '搜索'
            )}
          </button>
        </div>
      </div>

      {results && (
        <div className={`absolute z-50 w-full bg-white rounded-lg shadow-lg overflow-y-auto
          ${variant === 'mobile' ? 'max-h-[60vh]' : 'max-h-[70vh] top-full mt-2'}`}>
          {/* 用户结果 */}
          {results.users?.length > 0 && (
            <div className="p-2">
              <div className="text-xs text-gray-500 px-2 mb-1">用户</div>
              {results.users.map(user => (
                <div
                  key={user._id}
                  onClick={() => {
                    navigate(`/user/${user._id}`);
                    setResults(null);
                    setQuery('');
                  }}
                  className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer rounded"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                    alt=""
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <div>
                    <div className="font-medium">{user.username}</div>
                    {user.bio && (
                      <div className="text-sm text-gray-500 truncate">{user.bio}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 在搜索结果的帖子部分 */}
          {results.posts?.length > 0 && (
            <div className="p-2 border-t">
              <div className="text-xs text-gray-500 px-2 mb-1">帖子</div>
              {results.posts.map(post => (
                <div key={post._id} className="relative">
                  <PostPreview
                    post={post}
                    variant="search"
                  >
                    <div
                      onClick={() => {
                        navigate(`/post/${post._id}`);
                        setResults(null);
                        setQuery('');
                      }}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer rounded group flex items-center"
                    >

                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{post.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {post.author} · {post.comments_count || 0} 评论
                        </div>
                      </div>
                    </div>
                  </PostPreview>
                </div>
              ))}
            </div>
          )}
          {/* 话题结果 */}
          {results.topics?.length > 0 && (
            <div className="p-2 border-t">
              <div className="text-xs text-gray-500 px-2 mb-1">话题</div>
              {results.topics.map(topic => (
                <div
                  key={topic._id}
                  onClick={() => {
                    navigate(`/topic/${topic._id}`);
                    setResults(null);
                    setQuery('');
                  }}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer rounded"
                >
                  {topic.title}
                </div>
              ))}
            </div>
          )}

          {/* 无结果提示 */}
          {(!results.posts?.length && !results.topics?.length && !results.users?.length) && (
            <div className="p-4 text-center text-gray-500">
              未找到相关{
                selectedType === 'posts' ? '帖子' :
                selectedType === 'topics' ? '话题' :
                selectedType === 'users' ? '用户' : '内容'
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;