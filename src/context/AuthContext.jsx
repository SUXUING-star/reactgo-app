import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
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

  const login = async (newToken, userData) => {
    try {
      // 构建包含所有必要信息的用户对象
      const userWithDetails = {
        ...userData,
        isAdmin: userData.username === 'admin',
        id: userData.id,
        username: userData.username,
        email: userData.email,
        bio: userData.bio,
        avatar: userData.avatar || '/default-avatar.svg',
        isVerified: userData.is_verified,
        createdAt: userData.created_at,
        tokenExpiredAt: userData.token_expired_at
      }
      
      setToken(newToken)
      setUser(userWithDetails)
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userWithDetails))

      // 立即验证新token
      await verifyToken(newToken)
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

  const verifyToken = async (currentToken) => {
    const tokenToVerify = currentToken || token;
    if (!tokenToVerify) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/verify`, {
        headers: {
          Authorization: `Bearer ${tokenToVerify}`,
        },
      });

      if (!response.ok) {
        logout();
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
    </div>;
  }

  const value = {
    token,
    user,
    isAuthenticated: !!token,
    login,
    logout,
    updateUser,
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