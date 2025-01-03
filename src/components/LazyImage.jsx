// src/components/LazyImage.jsx
import React, { useState } from 'react';

const LazyImage = ({ src, alt, className, defaultHeight = "h-48", showPlaceholder = true }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = (e) => {
    setError(true);
    setIsLoading(false);
    if (!e.target.dataset.retried && src?.startsWith('/uploads/')) {
      e.target.src = `${import.meta.env.VITE_API_URL}${src}`;
      e.target.dataset.retried = 'true';
    }
  };

  // 如果没有源图片且不显示占位符，返回 null
  if (!src && !showPlaceholder) {
    return null;
  }

  return (
    <div className={`relative ${defaultHeight} rounded-lg overflow-hidden bg-gray-100 ${className}`}>
      {/* 实际图片 */}
      {src && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-all duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      
      {/* 加载动画 */}
      {isLoading && src && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      )}
      
      {/* 显示占位图（仅在 Home 页面） */}
      {(!src || error) && showPlaceholder && (
        <img
          src="capoo0.webp"
          alt="placeholder"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

export default LazyImage;