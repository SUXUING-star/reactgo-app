// src/components/Navbar.jsx
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Search, Bell, MessageCircle, Menu, X } from 'lucide-react'
import NotificationsPopover from './NotificationsPopover'
import MessagesPopover from './MessagesPopover'
import SearchBar from './SearchBar'
function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate(); // 导航函数

  // 导航链接配置
  const navLinks = [
    { name: '首页', path: '/' },
    { name: '发现', path: '/discover' },
    { name: '话题', path: '/topics' },
    { name: '排行', path: '/ranking' },
  ]

  const isActivePath = (path) => {
    return location.pathname === path
  }

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* 左侧 Logo 和导航 */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/favicon.svg" alt="Logo" className="h-8 w-8" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                茶会2号
              </span>
            </Link>
            
            {/* 导航链接 */}
            <div className="hidden md:flex items-center ml-8 space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
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
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* 消息通知 */}
                <div className="hidden md:flex items-center space-x-4">
                  <NotificationsPopover /> {/* 使用独立的通知组件 */}
                  <button 
                    onClick={() => navigate('/messages')}
                    className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="absolute top-0 right-0 h-4 w-4 text-xs text-white bg-red-500 rounded-full flex items-center justify-center">
                      2
                    </span>
                  </button>
                </div>

                {/* 发布按钮 */}
                <Link
                  to="/create-post"
                  className="hidden md:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full
                  text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                  transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  发布帖子
                </Link>

                {/* 用户信息 */}
                <div className="relative">
                  <div 
                    className="flex items-center space-x-3 cursor-pointer p-2 rounded-full hover:bg-gray-100"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.username}`}
                      alt=""
                      className="w-8 h-8 rounded-full ring-2 ring-white"
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
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full
                  text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  注册
                </Link>
              </>
            )}
            
            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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

      {/* 移动端菜单 */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
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
        </div>
      )}
    </nav>
  )
}

export default Navbar