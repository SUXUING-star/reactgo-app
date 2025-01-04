//src/components/AnimatedHeader.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Coffee, Sparkles, Users, MessageSquare, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AnimatedHeader = () => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    hotTopics: 0,
    userCount: 0,
    activeDiscussions: 0,
    weeklyGrowth: 0
  });

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-xl shadow-lg p-6 mb-2">
      {/* 动态背景 */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute w-16 h-16 bg-white/10 rounded-full blur-xl animate-float top-8 left-1/4" />
        <div className="absolute w-20 h-20 bg-blue-400/10 rounded-full blur-xl animate-float-delayed -top-4 right-1/3" />
        <div className="absolute w-24 h-24 bg-indigo-400/10 rounded-full blur-xl animate-float-slow bottom-2 right-1/4" />
      </div>

      {/* 主要内容 */}
      <div className="relative z-10">
        <div className="flex items-center justify-start space-x-2 mb-4">
          <Coffee className="w-5 h-5 text-blue-200 animate-bounce-slow" />
          <Sparkles className="w-4 h-4 text-yellow-200 animate-pulse" />
        </div>
        
        <div className="max-w-3xl space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white animate-fade-in">
              欢迎来到星云茶会
              <span className="inline-block animate-wave ml-1">~</span>
            </h1>
            
            <p className="text-base text-blue-100 animate-fade-in-delayed leading-relaxed">
              在这里，每一个想法都值得分享，每一次对话都可能激发灵感。
            </p>
          </div>

          {!isAuthenticated && (
            <div className="space-x-2 animate-fade-in-up">
              <Link
                to="/login"
                className="inline-flex items-center bg-white/90 backdrop-blur-sm text-blue-600 px-4 py-2 rounded-lg font-medium 
                hover:bg-white hover:shadow-md hover:scale-105 transition-all duration-300"
              >
                登录账号
                <ArrowUpRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center bg-blue-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium 
                hover:bg-blue-500 hover:shadow-md hover:scale-105 transition-all duration-300"
              >
                立即注册
                <ArrowUpRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
          
        </div>
      </div>

      {/* 装饰性元素 */}
      <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4">
        <div className="w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl" />
      </div>
    </div>
  );
};

export default AnimatedHeader;