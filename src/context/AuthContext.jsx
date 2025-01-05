// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token') || null
    } catch {
      return null
    }
  })

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })

  const login = (newToken, userData) => {
    try {
      // 构建包含所有必要信息的用户对象
      const userWithDetails = {
        ...userData,
        isAdmin: userData.username === 'admin',
        id: userData.id,
        username: userData.username,
        email: userData.email,
        bio: userData.bio,
        avatar: userData.avatar || '/default-avatar.svg', // 确保有默认头像
        isVerified: userData.is_verified,
        createdAt: userData.created_at,
        tokenExpiredAt: userData.token_expired_at
      }
      
      setToken(newToken)
      setUser(userWithDetails)
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userWithDetails))
    } catch (error) {
      console.error('Error saving auth data:', error)
    }
  }

  const logout = () => {
    try {
      setToken(null)
      setUser(null)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } catch (error) {
      console.error('Error removing auth data:', error)
    }
  }

  // 添加更新用户信息的函数
  const updateUser = (updateData) => {
    try {
      const updatedUser = {
        ...user,
        ...updateData,
        avatar: updateData.avatar || user?.avatar || '/default-avatar.svg'
      }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    } catch (error) {
      console.error('Error updating user data:', error)
    }
  }

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          logout()
        }
      } catch (error) {
        console.error('Error verifying token:', error)
        logout()
      }
    }

    verifyToken()
  }, [token])

  const value = {
    token,
    user,
    isAuthenticated: !!token,
    login,
    logout,
    updateUser, // 导出 updateUser 函数
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}