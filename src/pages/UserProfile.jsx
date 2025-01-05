import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDistance } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import anime from 'animejs';

function UserProfile() {
  const { id } = useParams();
  const { token } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
      const fetchUserProfile = async () => {
          try {
            setLoading(true);
            setError(null);
              const userResponse = await fetch(
                `${import.meta.env.VITE_API_URL}/api/users/${id}`,
                 {
                    headers: {
                       Authorization: token ? `Bearer ${token}` : '',
                   },
                }
           );
             const userData = await userResponse.json();
           setUserInfo(userData);
           const postsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}/posts`,
               {
                   headers: {
                      Authorization: token ? `Bearer ${token}` : '',
                     },
                 }
            );
              const postsData = await postsResponse.json();
           setPosts(Array.isArray(postsData) ? postsData : []);
            const commentsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}/comments`, {
               headers: {
                 Authorization: token ? `Bearer ${token}` : '',
                 },
              }
          );
              const commentsData = await commentsResponse.json();
             setComments(Array.isArray(commentsData) ? commentsData : []);
           } catch (error) {
             console.error('Error fetching user profile:', error);
            setError(error.message);
         } finally {
             setLoading(false);
           }
       };

    if (id) {
        fetchUserProfile();
     }
   }, [id, token]);

    useEffect(() => {
       if(!loading){
           // 用户资料容器动画
         anime({
           targets: '.user-profile-container',
             translateY: [20, 0],
           opacity: [0, 1],
            duration: 800,
             easing: 'easeOutExpo'
          });

           // 表单字段依次动画
           anime({
              targets: '.profile-field',
            translateX: [-30, 0],
            opacity: [0, 1],
              delay: anime.stagger(80),
            duration: 600,
            easing: 'easeOutCubic'
          });

          // 帖子和评论列表标题
          anime({
              targets: '.list-title',
              translateY: [20, 0],
             opacity: [0, 1],
              delay: 300,
            duration: 600,
             easing: 'easeOutCubic'
            });
          // 帖子和评论列表项动画
        anime({
          targets: '.list-item',
            translateY: [10, 0],
            opacity: [0, 1],
            delay: anime.stagger(50, {start: 400}),
             duration: 400,
            easing: 'easeOutQuad'
          });
        }
  }, [loading]);

    if (loading) {
      return (
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        </div>
     );
    }
    if (error || !userInfo) {
        return (
          <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
              <div className="text-center text-red-600">
                 <p>加载失败: {error || '用户不存在'}</p>
             </div>
           </div>
        );
     }

   const validComments = comments.filter(comment => comment.post?.title);
   const validPosts = posts;
  return (
       <div className="max-w-4xl mx-auto">
           {/* 用户信息卡片 */}
            <div className="bg-white shadow rounded-lg p-6 mb-6 user-profile-container opacity-0">
                 <div className="flex items-center mb-6 profile-field opacity-0">
                     <img
                        src={userInfo.avatar || '/default-avatar.png'}
                         alt={userInfo.username}
                         className="w-20 h-20 rounded-full object-cover mr-6"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-avatar.svg';
                          }}
                    />
                      <div>
                         <h1 className="text-2xl font-bold">{userInfo.username}</h1>
                          {userInfo.bio && (
                              <p className="text-gray-600 mt-2">{userInfo.bio}</p>
                           )}
                             <p className="text-sm text-gray-500 mt-1">
                              加入时间：
                                {new Date(userInfo.createdAt).toLocaleDateString('zh-CN')}
                            </p>
                       </div>
                   </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 profile-field opacity-0">
                      <div className="bg-blue-50 p-4 rounded-lg">
                         <p className="text-sm text-gray-600">发帖总数</p>
                            <p className="text-2xl font-bold text-blue-600">{posts.length}</p>
                        </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                         <p className="text-sm text-gray-600">评论总数</p>
                           <p className="text-2xl font-bold text-purple-600">{validComments.length}</p>
                      </div>
                     <div className="bg-green-50 p-4 rounded-lg">
                         <p className="text-sm text-gray-600">获赞总数</p>
                            <p className="text-2xl font-bold text-green-600">
                                {validComments.reduce((sum, comment) => sum + (comment.likes?.length || 0), 0)}
                             </p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">活跃天数</p>
                           <p className="text-2xl font-bold text-orange-600">
                                 {new Set([
                                   ...posts.map(post => new Date(post.created_at).toDateString()),
                                     ...validComments.map(comment => new Date(comment.created_at).toDateString())
                               ]).size}
                             </p>
                       </div>
                   </div>
        </div>


        {/* 帖子列表 */}
       <div className="bg-white shadow rounded-lg p-6 mb-6">
           <h2 className="text-xl font-bold mb-4 list-title opacity-0">发表的帖子 ({posts.length})</h2>
                <div className="space-y-4">
                    {posts.map((post) => (
                     <div key={post._id} className="border-b pb-4 last:border-b-0 list-item opacity-0">
                          <Link
                              to={`/post/${post._id}`}
                             className="block hover:bg-gray-50 transition duration-150 ease-in-out rounded-lg p-3"
                         >
                              <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800">
                                   {post.title}
                              </h3>
                            <p className="text-gray-600 mt-2">{post.content.slice(0, 200)}...</p>
                            <div className="text-sm text-gray-500 mt-2 flex items-center">
                             <span>
                                 发布于 {new Date(post.created_at).toLocaleString('zh-CN')}
                              </span>
                                <span className="mx-2">•</span>
                                 <span>{post.comments_count || 0} 条评论</span>
                            </div>
                       </Link>
                     </div>
                   ))}
                    {posts.length === 0 && (
                          <p className="text-gray-500 text-center py-4">暂无帖子</p>
                     )}
               </div>
         </div>

      {/* 评论列表 */}
         <div className="bg-white shadow rounded-lg p-6">
           <h2 className="text-xl font-bold mb-4 list-title opacity-0">发表的评论 ({validComments.length})</h2>
                 <div className="space-y-4">
                       {validComments.map((comment) => (
                         <div key={comment._id} className="border-b pb-4 last:border-b-0 list-item opacity-0">
                            <Link
                              to={`/post/${comment.post_id}`}
                               className="block hover:bg-gray-50 transition duration-150 ease-in-out rounded-lg p-3"
                           >
                               <div className="flex flex-col">
                                  <span className="text-sm text-blue-600 mb-2">
                                       评论于：{comment.post?.title}
                                   </span>
                                 <p className="text-gray-600">{comment.content}</p>
                                   <div className="text-sm text-gray-500 mt-2 flex items-center">
                                        <span>
                                            发布于 {new Date(comment.created_at).toLocaleString('zh-CN')}
                                      </span>
                                      <span className="mx-2">•</span>
                                      <span>{comment.likes?.length || 0} 个赞</span>
                                   </div>
                              </div>
                           </Link>
                         </div>
                     ))}
                  {validComments.length === 0 && (
                      <p className="text-gray-500 text-center py-4">暂无评论</p>
                   )}
               </div>
         </div>
    </div>
  );
}

export default UserProfile;