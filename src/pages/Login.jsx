import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import anime from 'animejs';
import PasswordInput from '../components/PasswordInput';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // 表单容器动画
    anime({
      targets: '.auth-container',
      scale: [0.9, 1],
      opacity: [0, 1],
      duration: 800,
      easing: 'easeOutElastic(1, .8)',
    });

    // 表单项依次淡入
    anime({
      targets: '.form-item',
      translateY: [20, 0],
      opacity: [0, 1],
      delay: anime.stagger(100, { start: 300 }),
      duration: 600,
      easing: 'easeOutCubic',
    });

    // 背景动画
    anime({
      targets: '.auth-bg-pattern',
      opacity: [0, 0.1],
      delay: 500,
      duration: 1000,
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        navigate('/');
      } else {
        setError(data.error || '登录失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
          {/* 添加动态背景 */}
          <div className="auth-bg-pattern absolute inset-0 opacity-0">
            <div className="absolute w-96 h-96 bg-blue-200 rounded-full blur-3xl -top-20 -left-20 animate-float" />
             <div className="absolute w-96 h-96 bg-indigo-200 rounded-full blur-3xl -bottom-20 -right-20 animate-float-delayed" />
          </div>

        <div className="auth-container w-full max-w-md bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8 opacity-0 relative z-10">
        <h1 className="form-item opacity-0 text-3xl font-bold text-center text-gray-900 mb-8">
          登录
        </h1>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
            </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-item opacity-0">
            <label className="block text-sm font-medium text-gray-700">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
              required
            />
          </div>
          <div className="form-item opacity-0">
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="密码"
              required
            />
          </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <Link
                      to="/forgot-password"
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      忘记密码？
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    '登录'
                  )}
                </button>
        </form>
          <div className="form-item opacity-0 mt-6">
           <p className="text-center text-sm text-gray-600">
              还没有账号？
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                立即注册
              </Link>
           </p>
          </div>
      </div>
    </div>
  );
}

export default Login;