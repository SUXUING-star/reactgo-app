import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, MessageCircle, Menu, X } from 'lucide-react';
import NotificationsPopover from './NotificationsPopover';
import MessagesPopover from './MessagesPopover';
import SearchBar from './SearchBar';
import anime from 'animejs';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: '首页', path: '/' },
    { name: '发现', path: '/discover' },
    { name: '话题', path: '/topics' },
    { name: '排行', path: '/ranking' },
  ];

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  useEffect(() => {
     // Logo 动画
      anime({
          targets: '.logo-container',
           translateX: [-50, 0],
           rotate: [-20, 0],
            opacity: [0, 1],
           duration: 800,
           easing: 'spring(1, 80, 10, 0)'
      });
      // 导航链接动画
       anime({
           targets: '.nav-link',
           translateY: [30, 0],
          scale: [0.9, 1],
          opacity: [0, 1],
           delay: anime.stagger(100),
           duration: 800,
         easing: 'cubicBezier(.5, .05, .1, .3)'
       });
      // 右侧元素动画
        anime({
            targets: '.nav-right-item',
              translateY: [-20, 0],
              rotateX: [90, 0],
            opacity: [0, 1],
            delay: anime.stagger(150, {start: 500}),
              duration: 800,
              easing: 'easeOutElastic(1, .6)'
        });
        anime({
          targets: '.create-post-btn',
          scale: [1, 1.05],
          translateY: [0, -2],
          boxShadow: [
            '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
          ],
          duration: 1500,
          direction: 'alternate',
          loop: true,
          easing: 'easeInOutQuad'
        });
  }, []);

  // 移动端菜单的用户信息组件
  const MobileUserInfo = () => (
    <div className="px-4 py-3 border-t border-gray-200">
      <div className="flex items-center space-x-3 mb-3">
        <img
          src={user?.avatar || '/default-avatar.svg'}
          alt={user?.username}
          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/default-avatar.svg';
          }}
        />
        <div>
          <div className="font-medium text-gray-900">{user?.username}</div>
          <div className="text-sm text-gray-500">{user?.email}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <div className="text-sm font-medium text-gray-500">帖子</div>
          <div className="text-lg font-semibold text-gray-900">0</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <div className="text-sm font-medium text-gray-500">评论</div>
          <div className="text-lg font-semibold text-gray-900">0</div>
        </div>
      </div>

      <div className="space-y-1">
        <Link
          to="/profile"
          className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
          onClick={() => setIsMenuOpen(false)}
        >
          个人主页
        </Link>
        <Link
          to="/messages"
          className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
          onClick={() => setIsMenuOpen(false)}
        >
          消息中心
        </Link>
        <Link
          to="/settings"
          className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
          onClick={() => setIsMenuOpen(false)}
        >
          设置
        </Link>
        <button
          onClick={() => {
            logout();
            setIsMenuOpen(false);
          }}
          className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
        >
          退出登录
        </button>
      </div>
    </div>
  );

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
           {/* 左侧 Logo 和导航 */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="logo-container flex items-center space-x-2 group opacity-0"
            >
              <div className="relative">
                <img
                  src="/favicon.svg"
                  alt="Logo"
                  className="h-9 w-9 transform group-hover:scale-110 transition-transform duration-200"
                />
              </div>
              
            </Link>

            {isAuthenticated && (
              // 修改发布帖子按钮的 JSX
              <Link
                to="/create-post"
                className="create-post-btn flex items-center px-3 py-1.5 rounded-full text-sm font-medium text-white 
                  bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 
                  transform transition-all duration-200 shadow-md hover:shadow-lg
                  relative overflow-hidden group"
              >
                {/* 添加光效果 */}
                <div className="absolute inset-0 w-full h-full">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent 
                    transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
                
                {/* 图标和文字 */}
                <div className="relative flex items-center">
                  <svg
                    className="w-4 h-4 mr-1.5 animate-bounce-gentle"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  发布帖子
                </div>
              </Link>
            )}

            {/* 导航链接 */}
            <div className="hidden md:flex items-center ml-8 space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 opacity-0
                    ${isActivePath(link.path)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* 中间搜索框 */}
          <div className="hidden md:flex flex-1 items-center justify-center px-6">
            <SearchBar />
          </div>

           {/* 右侧用户区域 */}
          <div className="user-area flex items-center space-x-4">
             {isAuthenticated ? (
              <>
                {/* 消息通知 */}
                <div className="hidden md:flex items-center space-x-4">
                   <NotificationsPopover />
                   <button
                       onClick={() => navigate('/messages')}
                       className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full nav-right-item opacity-0"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="absolute top-0 right-0 h-4 w-4 text-xs text-white bg-red-500 rounded-full flex items-center justify-center">
                      2
                    </span>
                 </button>
                </div>

                {/* 用户信息 */}
                <div className="relative nav-right-item opacity-0">
                    <div
                        className="flex items-center space-x-3 cursor-pointer p-2 rounded-full hover:bg-gray-100"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                        <img
                          src={user.avatar || '/default-avatar.svg'}
                          alt={user.author}
                          className="w-6 h-6 rounded-full object-cover"
                          onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/default-avatar.svg';
                          }}
                      />
                        <span className="hidden md:inline text-sm font-medium text-gray-700">
                          {user?.username}
                        </span>
                   </div>

                    {/* 下拉菜单 */}
                    {showUserMenu && (
                    <div
                      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5"
                       onMouseLeave={() => setShowUserMenu(false)}
                   >
                         <Link
                           to="/profile"
                             className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                             onClick={() => setShowUserMenu(false)}
                        >
                             个人主页
                       </Link>
                        <Link
                             to="/messages"
                             className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                           onClick={() => setShowUserMenu(false)}
                         >
                             消息中心
                       </Link>
                        <Link
                           to="/settings"
                             className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                           onClick={() => setShowUserMenu(false)}
                       >
                           设置
                        </Link>
                        <button
                            onClick={() => {
                               logout();
                                setShowUserMenu(false);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                           退出登录
                        </button>
                   </div>
                 )}
                </div>
             </>
              ) : (
                 <>
                   <Link
                         to="/login"
                         className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium nav-right-item opacity-0"
                     >
                       登录
                     </Link>
                   <Link
                         to="/register"
                           className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full
                           text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 nav-right-item opacity-0"
                         >
                           注册
                     </Link>
                 </>
               )}
          <div className="flex-1">
          < NotificationsPopover />
          </div>
            {/* 移动端菜单按钮 */}
             <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                   className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 nav-right-item opacity-0"
             >
               {isMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
            </button>
         </div>
        </div>
      </div>

      
      {/* 移动端展开菜单 - 修改这部分 */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          {/* 搜索框 */}
          <div className="px-4 py-3">
            <SearchBar variant="mobile" />
          </div>

          {/* 通知和消息中心 */}
          {isAuthenticated && (
            <div className="px-4 py-2 border-t border-gray-200">
              <div className="flex justify-between items-center">
                
                <div className="flex-1">
                  <MessagesPopover />
                </div>
              </div>
            </div>
          )}

          {/* 导航链接 */}
          <div className="px-4 pt-2 pb-3 space-y-1 border-t border-gray-200">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium
                  ${isActivePath(link.path)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* 发帖按钮 */}
          {isAuthenticated && (
            <div className="px-4 py-3 border-t border-gray-200">
              <Link
                to="/create-post"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600"
              >
                发布新帖子
              </Link>
            </div>
          )}

          {/* 用户信息区域 */}
          {isAuthenticated ? (
            <div className="px-4 py-3 border-t border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src={user?.avatar || '/default-avatar.svg'}
                  alt={user?.username}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-avatar.svg';
                  }}
                />
                <div>
                  <div className="font-medium text-gray-900">{user?.username}</div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                </div>

              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-sm font-medium text-gray-500">帖子</div>
                  <div className="text-lg font-semibold text-gray-900">0</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-sm font-medium text-gray-500">评论</div>
                  <div className="text-lg font-semibold text-gray-900">0</div>
                </div>
              </div>

              <div className="space-y-1">
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  个人主页
                </Link>
                <Link
                  to="/messages"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  消息中心
                </Link>
                <Link
                  to="/settings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  设置
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  退出登录
                </button>
              </div>
            </div>
          ) : (
            <div className="px-4 py-3 border-t border-gray-200 space-y-2">
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                登录
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600"
              >
                注册
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;