import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera } from 'lucide-react';
import anime from 'animejs';

function Settings() {
  const { user, token, updateUser } = useAuth();
  // 修改初始状态设置
  const [profile, setProfile] = useState({
    nickname: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '/default-avatar.png', // 设置默认头像
  });
  const [uploading, setUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  useEffect(() => {
    if (user) {
      setProfile({
        nickname: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);


    useEffect(() => {
        // 主要内容区域动画
        anime({
            targets: '.settings-container',
             translateY: [20, 0],
              opacity: [0, 1],
             duration: 800,
            easing: 'easeOutExpo'
          });

        // 表单元素依次动画
          anime({
            targets: '.form-field',
            translateX: [-30, 0],
           opacity: [0, 1],
            delay: anime.stagger(80),
           duration: 600,
             easing: 'easeOutCubic'
          });

       // 按钮组动画
          anime({
             targets: '.form-buttons button',
             scale: [0.8, 1],
               opacity: [0, 1],
              delay: anime.stagger(100, {start: 400}),
            duration: 600,
            easing: 'easeOutElastic(1, .8)'
        });
    }, []);


  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('上传失败');

      const data = await response.json();
      setProfile(prev => ({ ...prev, avatar: data.url }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('头像上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveStatus('saving');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nickname: profile.nickname,
          email: profile.email,
          bio: profile.bio,
          avatar: profile.avatar,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '更新失败');
      }

       const data = await response.json();
       updateUser({
           username: profile.nickname,
            email: profile.email,
            bio: profile.bio,
            avatar: profile.avatar,
      });

      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto settings-container opacity-0">
        <h1 className="text-3xl font-bold mb-8">设置</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 头像上传区域 */}
          <div className="form-field opacity-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              头像
            </label>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={user?.avatar || profile.avatar || '/default-avatar.png'}
                  alt="用户头像"
                  className="w-24 h-24 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-avatar.svg';
                  }}
                />
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  <Camera className="w-4 h-4" />
                </label>
              </div>
              {uploading && (
                <span className="text-sm text-gray-500">上传中...</span>
              )}
            </div>
          </div>

          {/* 其他表单字段 */}
          <div className="form-field opacity-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              昵称
            </label>
            <input
              type="text"
              value={profile.nickname}
              onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="form-field opacity-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              邮箱
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
            <div className="form-field opacity-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              个人简介
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={4}
              placeholder="写点什么来介绍自己..."
              className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="form-buttons flex justify-end items-center space-x-4">
            {saveStatus === 'saving' && (
              <span className="text-gray-500">保存中...</span>
            )}
            {saveStatus === 'success' && (
              <span className="text-green-500">保存成功！</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-red-500">保存失败，请重试</span>
            )}
            <button
              type="submit"
              disabled={saveStatus === 'saving'}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                        ${saveStatus === 'saving' ? 'opacity-50 cursor-not-allowed' : ''} opacity-0`}
            >
              保存设置
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Settings;