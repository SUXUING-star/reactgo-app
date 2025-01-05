import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hash } from 'lucide-react';
import anime from 'animejs';

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [post, setPost] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [newTopic, setNewTopic] = useState({ title: '', description: '' });
  const [category, setCategory] = useState('');
  const categories = ["技术","生活","闲聊","分享","其他"];

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || '获取帖子失败');
        }
        if (data.post.author_id !== user?.id) {
          navigate(`/post/${id}`);
          return;
        }
        setPost(data.post);
        setTitle(data.post.title);
        setContent(data.post.content);
        setImageURL(data.post.imageURL || '');
        setSelectedTopic(data.post.topic_id);
        setCategory(data.post.category || '');
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

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
        setTopics([]);
      }
    };

    fetchPostData();
    fetchTopics();
  }, [id, token, user?.id, navigate]);

  useEffect(() => {
    if (!loading) {
      anime({
        targets: '.edit-form-container',
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutExpo'
      });

      anime({
        targets: '.form-field',
        translateX: [-30, 0],
        opacity: [0, 1],
        delay: anime.stagger(80),
        duration: 600,
        easing: 'easeOutCubic'
      });

      anime({
        targets: '.form-buttons button',
        scale: [0.8, 1],
        opacity: [0, 1],
        delay: anime.stagger(100, {start: 400}),
        duration: 600,
        easing: 'easeOutElastic(1, .8)'
      });
    }
  }, [loading]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('图片上传失败');
        }

        const data = await response.json();
        setImageURL(data.url);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('图片上传失败，请重试');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleDeleteImage = () => {
    setImageURL('');
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTopic),
      });
      if (!response.ok) {
        throw new Error('Failed to create topic');
      }
      const data = await response.json();
      setTopics((prev) => [...prev, data]);
      setNewTopic({ title: '', description: '' });
    } catch (error) {
      console.error('Error creating topic:', error);
      alert('创建话题失败，请重试');
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        title,
        content,
        imageURL,
        topic_id: selectedTopic === 'null' ? null : selectedTopic,
        category,
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update post');
      }

      navigate(`/post/${id}`);
    } catch (error) {
      console.error('Error updating post:', error);
      setError(error.message);
    }
  };
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto edit-form-container opacity-0">
        <h1 className="text-3xl font-bold mb-8">编辑帖子</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title field */}
          <div className="form-field opacity-0">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              标题
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Image upload field */}
          <div className="form-field opacity-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">图片</label>
            <div className="mt-1 flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
                disabled={uploadingImage}
              />
              <label
                htmlFor="image-upload"
                className={`px-4 py-2 ${
                  uploadingImage ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 cursor-pointer'
                } text-gray-700 rounded-lg`}
              >
                {uploadingImage ? '上传中...' : '选择新图片'}
              </label>
              {imageURL && (
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  className="px-4 py-2 text-red-600 hover:text-red-700"
                  disabled={uploadingImage}
                >
                  删除图片
                </button>
              )}
            </div>
            {imageURL && (
              <div className="mt-2 relative">
                <img
                  src={imageURL}
                  alt="预览"
                  className="max-h-64 object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Category field */}
          <div className="form-field opacity-0">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              分类
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">请选择分类</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Topic field */}
          <div className="form-field opacity-0">
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
              话题
            </label>
            <div className="flex items-center space-x-3 mb-2">
              <select
                id="topic"
                value={selectedTopic || 'null'}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="null">无话题</option>
                {topics?.map((topic) => (
                  <option key={topic?._id} value={topic?._id}>
                    {topic?.title}
                  </option>
                ))}
              </select>
              <Link
                to="/topics"
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Hash className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Content field */}
          <div className="form-field opacity-0">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              内容
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Buttons */}
          <div className="form-buttons flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/post/${id}`)}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 opacity-0"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 opacity-0"
              disabled={uploadingImage}
            >
              保存修改
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPost;