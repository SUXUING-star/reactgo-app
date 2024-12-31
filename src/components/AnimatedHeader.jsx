import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Coffee, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AnimatedHeader = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl shadow-lg p-12 mb-8">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute w-24 h-24 bg-white/10 rounded-full blur-xl animate-float top-12 left-1/4" />
        <div className="absolute w-32 h-32 bg-blue-400/10 rounded-full blur-xl animate-float-delayed -top-8 right-1/3" />
        <div className="absolute w-40 h-40 bg-indigo-400/10 rounded-full blur-xl animate-float-slow bottom-4 right-1/4" />
      </div>

      {/* Content */}
      <div className="relative">
        <div className="flex items-center justify-start space-x-3 mb-6">
          <Coffee className="w-8 h-8 text-blue-200 animate-bounce-slow" />
          <Sparkles className="w-6 h-6 text-yellow-200 animate-pulse" />
        </div>
        
        <div className="max-w-2xl space-y-6">
          <h1 className="text-5xl font-bold text-white animate-fade-in">
            欢迎来到茶会
            <span className="inline-block animate-wave ml-2">~</span>
          </h1>
          
          <p className="text-xl text-blue-100 animate-fade-in-delayed">
            在这里，每一个想法都值得分享，每一次对话都可能激发灵感
          </p>
          
          {!isAuthenticated && (
            <div className="space-x-4 animate-fade-in-up">
              <Link
                to="/login"
                className="inline-flex items-center bg-white/90 backdrop-blur-sm text-blue-600 px-6 py-3 rounded-xl font-medium 
                hover:bg-white hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                登录
                <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center bg-blue-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-medium 
                hover:bg-blue-500 hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                注册
                <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimatedHeader;