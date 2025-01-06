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
  useEffect(() => {
    const validateStoredData = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('Initialization: Stored user data:', parsedUser);
          
          // 验证头像URL
          if (!parsedUser.avatar) {
            parsedUser.avatar = '/default-avatar.svg';
            localStorage.setItem('user', JSON.stringify(parsedUser));
          }
          
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error validating stored data:', error);
        logout();
      }
    };
  
    validateStoredData();
  }, []);

  const login = async (newToken, userData) => {
    try {
      if (!userData || !newToken) {
        throw new Error('Invalid login data');
      }
  
      // 规范化用户数据
      const userWithDetails = {
        id: userData.id,
        username: userData.username,
        email: userData.email || '',
        bio: userData.bio || '',
        avatar: userData.avatar || '/default-avatar.svg',
        isVerified: !!userData.is_verified,
        isAdmin: userData.username === 'admin',
        createdAt: userData.created_at || new Date().toISOString(),
        tokenExpiredAt: userData.token_expired_at
      };
  
      console.log('Login: Processed user data:', userWithDetails);
      
      // 更新状态和本地存储
      setToken(newToken);
      setUser(userWithDetails);
      
      // 确保异步操作按顺序执行
      await Promise.all([
        localStorage.setItem('token', newToken),
        localStorage.setItem('user', JSON.stringify(userWithDetails))
      ]);
  
      // 验证token
      await verifyToken(newToken);
  
      return userWithDetails;
    } catch (error) {
      console.error('Error in login process:', error);
      // 清理可能的部分状态
      logout();
      throw error;
    }
  };
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
      if (!updateData) return;
  
      // 确保更新数据的有效性
      const validatedUpdateData = {
        id: updateData.id || user?.id,
        username: updateData.username || user?.username,
        email: updateData.email || user?.email,
        bio: updateData.bio || user?.bio,
        isVerified: updateData.isVerified ?? user?.isVerified,
        createdAt: updateData.createdAt || user?.createdAt,
      };
  
      // 特殊处理头像更新
      const newAvatar = updateData.avatar !== undefined ? updateData.avatar : user?.avatar;
      validatedUpdateData.avatar = newAvatar || '/default-avatar.svg';
  
      // 合并用户数据
      const updatedUser = {
        ...user,
        ...validatedUpdateData,
        // 保留管理员状态
        isAdmin: user?.isAdmin || validatedUpdateData.username === 'admin'
      };
  
      // 在更新之前打印日志
      console.log('Previous user state:', user);
      console.log('Update data received:', updateData);
      console.log('New user state:', updatedUser);
  
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
  
      // 验证更新是否成功
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        console.log('Saved user data:', parsedUser);
        
        // 验证头像URL是否正确保存
        if (parsedUser.avatar !== updatedUser.avatar) {
          console.warn('Avatar mismatch between memory and storage');
        }
      }
  
    } catch (error) {
      console.error('Error updating user data:', error);
      console.error('Update payload:', updateData);
      throw error; // 重新抛出错误以便调用者处理
    }
  };

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