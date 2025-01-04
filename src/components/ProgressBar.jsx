// src/components/ProgressBar.jsx
import React, { useEffect } from 'react';

const ProgressBar = ({ 
  progress = 0,           // 当前进度 (0-100)
  height = 2,            // 进度条高度
  color = '#3B82F6',     // 进度条颜色
  duration = 300,        // 动画持续时间(ms)
  isLoading = false,     // 是否显示加载动画
  variant = 'default',   // 'default' | 'navigation'
  className = '',        // 额外的样式类
}) => {
  // 当 isLoading 改变时，自动滚动到顶部
  useEffect(() => {
    if (isLoading && variant === 'navigation') {
      window.scrollTo(0, 0);
    }
  }, [isLoading, variant]);

  if (!isLoading && progress === 0) return null;

  const renderDefaultProgress = () => (
    <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${className}`} 
      style={{ height: `${height}px` }}
    >
      <div
        className="h-full transition-all duration-300 ease-out rounded-full"
        style={{
          width: `${progress}%`,
          backgroundColor: color,
          transition: `width ${duration}ms ease-out`,
        }}
      />
      
      {/* 百分比文字 */}
      <div className="text-xs text-gray-500 mt-1 text-center">
        {progress}%
      </div>
    </div>
  );

  const renderNavigationProgress = () => (
    <div 
      className={`fixed top-0 left-0 w-full z-50 ${className}`}
      style={{ height: `${height}px` }}
    >
      {/* 背景 */}
      <div className="absolute inset-0 bg-gray-200" />
      
      {/* 进度条 */}
      <div
        className="absolute inset-y-0 left-0 transition-all duration-300 ease-out"
        style={{
          width: isLoading ? '90%' : '100%',
          backgroundColor: color,
          transition: `width ${duration}ms ease-out`,
        }}
      />

      {/* 加载动画 */}
      {isLoading && (
        <div
          className="absolute inset-y-0 right-0 w-20 bg-gradient-to-r from-transparent"
          style={{ backgroundColor: color }}
        >
          <div className="animate-shimmer absolute inset-0" />
        </div>
      )}
    </div>
  );

  return variant === 'navigation' ? renderNavigationProgress() : renderDefaultProgress();
};

export default ProgressBar;