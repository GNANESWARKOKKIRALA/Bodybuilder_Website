import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('gfp_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      localStorage.removeItem('gfp_token');
      localStorage.removeItem('gfp_refresh_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      const data = response.data.data;
      const token = data.token || data.access_token;
      const refresh_token = data.refresh_token;
      const userData = data.user;
      localStorage.setItem('gfp_token', token);
      localStorage.setItem('gfp_refresh_token', refresh_token);
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true, user: userData };
    }
    return { success: false, message: response.data.message };
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.success) {
      const data = response.data.data;
      const token = data.token || data.access_token;
      const refresh_token = data.refresh_token;
      const newUser = data.user;
      localStorage.setItem('gfp_token', token);
      localStorage.setItem('gfp_refresh_token', refresh_token);
      setUser(newUser);
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, message: response.data.message };
  };

  const logout = async () => {
    try {
      // Notify backend to invalidate refresh token (best effort)
      await api.post('/auth/logout').catch(() => {});
    } finally {
      localStorage.removeItem('gfp_token');
      localStorage.removeItem('gfp_refresh_token');
      setUser(null);
      setIsAuthenticated(false);
      // Hard redirect to home so page fully resets — avoids interceptor 401 loop
      window.location.href = '/';
    }
  };

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  const isAdmin = user?.role === 'admin';
  const isClient = user?.role === 'client';

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    isClient,
    login,
    register,
    logout,
    updateUser,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
