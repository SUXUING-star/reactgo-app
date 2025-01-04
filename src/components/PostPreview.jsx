// src/components/PostPreview.jsx
import React, { useState, useEffect } from 'react';
import { MessageSquare, Eye, ThumbsUp } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const PostPreview = ({ post, children, variant = 'default' }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  // 为通知预览添加特殊样式
  const getPreviewStyles = () => {
    switch(variant) {
      case 'notification':
        return 'left-full ml-2 top-0';
      case 'search':
        return 'bottom-0 right-0 translate-y-2';
      default:
        return 'bottom-0 right-0 translate-y-2';
    }
  };

  // 获取评论数据
  useEffect(() => {
    const fetchComments = async () => {
      if (!post._id || !showPreview) return;
      console.log('Fetching comments for post:', post);
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${post._id}/comments`);
        if (response.ok) {
          const data = await response.json();
          setComments(data || []);
        }
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (showPreview) {
      fetchComments();
    }
  }, [post._id, showPreview]);

  const handleMouseEnter = () => {
    setShowPreview(true);
  };

    const handleMouseLeave = () => {
        setShowPreview(false);
        setComments([]);
    };


  return (
    <div
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {showPreview && (
        <div 
        className={`absolute bottom-0 right-0 bg-white rounded-lg shadow-xl
          border border-gray-100 z-50 ${variant === 'search' ? 'w-56' : 'w-64'}
          animate-preview-popup`}
        >
          {variant === 'search' ? (
          <div className="p-3">
            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${post.author}`}
                alt=""
                className="w-4 h-4 rounded-full"
              />
              <span>{post.author}</span>
              <p className="text-xs text-gray-500">
                {formatDistance(new Date(post.created_at), new Date(), {addSuffix: true,locale: zhCN,})}
              </p>

            </div>
            {post.imageURL && (
              <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 mr-3">
                <img
                  src={post.imageURL}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <p className="text-xs text-gray-600 mb-2 line-clamp-3">
                {post.content?.replace(/<[^>]*>/g, '')}
              </p>
            
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-3 h-3" />
                <span>{post.comments_count || 0} 评论</span>
              </div>
            </div>
          </div>
          ) : (
            // 帖子预览 - 默认版本
            // 帖子预览 - 评论版本
            <div className="p-3">
              <h4 className="text-xs font-medium text-gray-600 flex items-center mb-2">
                <MessageSquare className="w-3 h-3 mr-1" />
                  评论 ({comments.length})
              </h4>
                {loading ? (
                  <div className="animate-pulse space-y-2">
                      {[1, 2].map(i => (
                          <div key={i} className="flex space-x-2">
                              <div className="w-5 h-5 bg-gray-200 rounded-full" />
                              <div className="flex-1">
                                  <div className="h-2 bg-gray-200 rounded w-1/3 mb-1" />
                                  <div className="h-2 bg-gray-200 rounded w-2/3" />
                              </div>
                          </div>
                      ))}
                  </div>
              ) : comments.length > 0 ? (
                <div className="space-y-2">
                  {comments.slice(0, 2).map((comment, index) => (
                    <div key={index} className="text-xs">
                      <div className="flex items-center space-x-1 mb-1">
                        <img
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.author}`}
                          alt=""
                          className="w-4 h-4 rounded-full"
                        />
                        <span className="font-medium">{comment.author}</span>
                        <span className="text-gray-500">·</span>
                        <span className="text-gray-500">
                          {formatDistance(new Date(comment.created_at), new Date(), {
                            addSuffix: true,
                            locale: zhCN,
                          })}
                        </span>
                      </div>
                      <p className="text-gray-600 line-clamp-2 pl-5">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2 text-xs text-gray-500">
                  暂无评论
                </div>
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostPreview;