// src/utils/api.js

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// 通用请求函数
const fetchApi = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('token');
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || '请求失败');
    }

    return await response.json();
  } catch (error) {
    console.error('API 请求错误:', error);
    throw error;
  }
};

// 发帖
export const createPost = async (postData) => {
  return fetchApi('/api/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
};

// 获取帖子列表
export const getPosts = async () => {
  return fetchApi('/api/posts');
};

// 获取单个帖子
export const getPost = async (id) => {
  return fetchApi(`/api/posts/${id}`);
};

// 创建评论
export const createComment = async (postId, commentData) => {
  return fetchApi(`/api/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify(commentData),
  });
};