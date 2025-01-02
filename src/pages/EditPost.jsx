// src/pages/EditPost.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function EditPost() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, user } = useAuth()
  
  const [post, setPost] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageURL, setImageURL] = useState('')
  const [newImage, setNewImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 获取原帖子内容
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || '获取帖子失败')
        }

        // 检查是否是帖子作者
        if (data.post.author_id !== user?.id) {
          navigate(`/post/${id}`)
          return
        }

        setPost(data.post)
        setTitle(data.post.title)
        setContent(data.post.content)
        setImageURL(data.post.imageURL || '')
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id, token, user?.id, navigate])

  // 处理图片上传
  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewImage(file)
      // 创建本地预览URL
      const previewURL = URL.createObjectURL(file)
      setImageURL(previewURL)
    }
  }

  // 处理图片删除
  const handleDeleteImage = () => {
    setImageURL('')
    setNewImage(null)
  }

  // 提交更新
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const updateData = {
            title,
            content,
            imageURL: imageURL // Include imageURL in update
        };

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            throw new Error('Failed to update post');
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
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">编辑帖子</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              图片
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
              >
                选择新图片
              </label>
              {imageURL && (
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  className="px-4 py-2 text-red-600 hover:text-red-700"
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
                onClick={handleDeleteImage} // Now this matches the function name
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
          </div>

          <div>
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

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/post/${id}`)}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              保存修改
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditPost