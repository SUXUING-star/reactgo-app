import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Hash, Plus, Users, MessageSquare, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import anime from 'animejs';

function Topics() {
    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [topicPosts, setTopicPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { token, isAuthenticated, user } = useAuth();
    const [newTopic, setNewTopic] = useState({
        title: '',
        description: '',
    });

    // 添加 refs 用于动画
    const topicsContainerRef = useRef(null);
    const postsContainerRef = useRef(null);
    const modalRef = useRef(null);

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/topics`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch topics');
                }
                const data = await response.json();
                setTopics(Array.isArray(data) ? data : []);
                
                // 添加话题列表的动画
                if (topicsContainerRef.current) {
                    anime({
                        targets: topicsContainerRef.current.children,
                        opacity: [0, 1],
                        translateY: [20, 0],
                        delay: anime.stagger(100),
                        duration: 800,
                        easing: 'easeOutElastic(1, .8)'
                    });
                }
            } catch (error) {
                console.error('Error fetching topics:', error);
                setTopics([]);
            } finally {
                setLoading(false);
            }
        };
        fetchTopics();
    }, [token]);

    const fetchTopicPosts = async (topicId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/topics/${topicId}/posts`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setTopicPosts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching topic posts:', error);
            setTopicPosts([]);
        }
    };


    const handleTopicClick = (topic) => {
        setSelectedTopic(topic);
        fetchTopicPosts(topic._id);
        
        // 添加话题切换时的动画
        if (postsContainerRef.current) {
            anime({
                targets: postsContainerRef.current,
                opacity: [0, 1],
                translateX: [-20, 0],
                duration: 600,
                easing: 'easeOutQuad'
            });
        }
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
            setTopics(prev => [...prev, data]);
            
            // 添加新话题创建后的动画
            if (topicsContainerRef.current) {
                const newTopicElement = topicsContainerRef.current.lastChild;
                anime({
                    targets: newTopicElement,
                    opacity: [0, 1],
                    translateY: [20, 0],
                    scale: [0.9, 1],
                    duration: 800,
                    easing: 'easeOutElastic(1, .8)'
                });
            }
            
            setShowCreateModal(false);
            setNewTopic({ title: '', description: '' });
        } catch (error) {
            console.error('Error creating topic:', error);
            alert('创建话题失败，请重试');
        }
    };

    const handleDeleteTopic = async (topicId) => {
        if(!window.confirm('如果删掉此话题的话，相应帖子的话题就会被相应删去，你确定吗？')){
            return;
        }
        
        // 添加删除话题的动画
        const topicElement = topicsContainerRef.current.querySelector(`[data-topic-id="${topicId}"]`);
        if (topicElement) {
            await anime({
                targets: topicElement,
                opacity: 0,
                translateX: 20,
                duration: 400,
                easing: 'easeOutQuad'
            }).finished;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/topics/${topicId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                const message = await response.json();
                throw new Error(message.error || '删除话题失败');
            }
            setTopics(prev => prev.filter(topic => topic._id !== topicId));
            setSelectedTopic(null);
            setTopicPosts([]);
        } catch (error) {
            console.error('Error deleting topic:', error);
            alert(error.message || '删除话题失败，请重试');
        }
    };

    // 添加模态框动画效果
    useEffect(() => {
        if (showCreateModal && modalRef.current) {
            anime({
                targets: modalRef.current,
                scale: [0.9, 1],
                opacity: [0, 1],
                duration: 400,
                easing: 'spring(1, 80, 10, 0)'
            });
        }
    }, [showCreateModal]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-lg">
                            <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-2">
                    <Hash className="w-6 h-6 text-blue-600" />
                    <h1 className="text-3xl font-bold">话题</h1>
                </div>
                
                {isAuthenticated && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        创建话题
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 话题列表 */}
                <div className="md:col-span-1">
                    <div ref={topicsContainerRef} className="space-y-4">
                        {topics.map((topic) => (
                            <div
                                key={topic._id}
                                data-topic-id={topic._id}
                                onClick={() => handleTopicClick(topic)}
                                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer
                                ${selectedTopic?._id === topic._id ? 'ring-2 ring-blue-500' : ''}`}
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-semibold mb-2">{topic.title}</h3>
                                   {isAuthenticated && (user?.id === topic?.created_by?.toString()) && (
                                      <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                              handleDeleteTopic(topic._id)
                                          }}
                                          className="text-red-500 hover:text-red-600 p-1 rounded hover:bg-red-50"
                                      >
                                            <Trash2 className="w-4 h-4" />
                                      </button>
                                  )}
                                </div>

                                <p className="text-gray-600 mb-4">{topic.description}</p>
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <Users className="w-4 h-4 mr-1" />
                                        <span>{topic.posts?.length || 0} 个帖子</span>
                                    </div>
                                    <span>{new Date(topic.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* 帖子列表 */}
                <div ref={postsContainerRef} className="md:col-span-2">
                    {selectedTopic ? (
                        <div className="space-y-4">
                            <div className="bg-white rounded-lg p-4 mb-4">
                                <h2 className="text-xl font-bold mb-2">{selectedTopic.title}</h2>
                                <p className="text-gray-600">{selectedTopic.description}</p>
                            </div>

                            {topicPosts.length > 0 ? (
                                topicPosts.map((post) => (
                                  <Link
                                    key={post._id}
                                    to={`/post/${post._id}`}
                                    className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-4"
                                    >
                                      <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                                       <p className="text-gray-600 line-clamp-2 mb-3">{post.content}</p>
                                           <div className="flex items-center justify-between text-sm text-gray-500">
                                              <div className="flex items-center">
                                                <img
                                                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${post.author}`}
                                                  alt=""
                                                  className="w-6 h-6 rounded-full mr-2"
                                                />
                                                 <span>{post.author}</span>
                                               </div>
                                            <div className="flex items-center">
                                             <MessageSquare className="w-4 h-4 mr-1" />
                                              <span>{post.comments_count || 0}</span>
                                           </div>
                                        </div>
                                    </Link>
                                ))
                                ) : (
                                    <div className="text-center py-12 bg-white rounded-lg">
                                        <p className="text-gray-500">暂无帖子</p>
                                    </div>
                                )}
                        </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-lg">
                                <p className="text-gray-500">请选择一个话题查看相关帖子</p>
                            </div>
                         )}
                   </div>
              </div>

            {/* 创建话题的模态框 */}
            {showCreateModal && (
               <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                   <div ref={modalRef} className="bg-white rounded-lg p-6 max-w-md w-full" style={{ opacity: 0 }}>
                       <h2 className="text-xl font-semibold mb-4">创建新话题</h2>
                      <form onSubmit={handleCreateTopic} className="space-y-4">
                            <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">
                                     话题名称
                                 </label>
                                 <input
                                     type="text"
                                      value={newTopic.title}
                                      onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                                      className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                     required
                                 />
                           </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    话题描述
                                </label>
                                <textarea
                                      value={newTopic.description}
                                     onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                                    rows={4}
                                     className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    required
                               />
                            </div>

                           <div className="flex justify-end space-x-3">
                                 <button
                                    type="button"
                                     onClick={() => setShowCreateModal(false)}
                                     className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                 >
                                    取消
                                  </button>
                                <button
                                   type="submit"
                                     className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                 >
                                    创建
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Topics;