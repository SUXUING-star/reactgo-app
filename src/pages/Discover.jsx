import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Compass, Flame, Clock, Tag, Hash } from 'lucide-react';

function Discover() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('popular');
  const [topics, setTopics] = useState({});

  const tabs = [
    { id: 'popular', name: '热门', icon: <Flame className="w-4 h-4" /> },
    { id: 'latest', name: '最新', icon: <Clock className="w-4 h-4" /> },
    { id: 'topics', name: '话题', icon: <Tag className="w-4 h-4" /> },
  ];

  useEffect(() => {
    fetchPosts();
  }, [activeTab, token]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/discover${
          activeTab === 'latest' ? '?sort=latest' : ''
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setPosts(data);
      const uniqueTopicIds = [...new Set(data.filter(post => post.topic_id).map(post => post.topic_id))];
      if (uniqueTopicIds.length > 0) {
        fetchTopics(uniqueTopicIds);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async (topicIds) => {
    try {
      const topicsData = {};
      for (const id of topicIds) {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/topics/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          topicsData[id] = data;
        } else {
          console.error('Failed to fetch topics', id);
        }
      }
      setTopics(topicsData);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-4 rounded-lg">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2 mb-6">
        <Compass className="w-6 h-6 text-blue-600" />
        <h1 className="text-3xl font-bold">发现</h1>
      </div>

      <div className="mb-6">
        <nav className="flex space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              <span className="ml-2">{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            key={post._id}
            to={`/post/${post._id}`}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col"
          >
              {post.imageURL ? (
                  <img
                  src={post.imageURL}
                  alt={post.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              ) : (
                 <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400">
                 <span>暂无图片</span>
               </div>
               )}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {post.category || '未分类'}
              </span>
              {post?.topic_id && (
                <Link
                  to={`/topics/${post.topic_id}`}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Hash className="w-3 h-3" />
                  {topics[post.topic_id]?.title || '无话题'}
                </Link>
              )}
            </div>
            <h2 className="text-lg font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {post.content}
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
              <div className="flex items-center">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${post.author}`}
                  alt=""
                  className="w-6 h-6 rounded-full mr-2"
                />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>{post.comments?.length || 0} 评论</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Discover;