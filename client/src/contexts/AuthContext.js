'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import { usePathname } from 'next/navigation';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathname !== '/login' && pathname !== '/register') {
      checkAuth();
    } else {
      setLoading(false);
    }
    
    // Check if we're returning from Google OAuth
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('auth') === 'success') {
        // Remove the auth parameter from URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        // Force check auth even if we're on login/register page
        checkAuth();
      }
    }
  }, [pathname]);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      // Try to get a new access token using refresh token
      try {
        const refreshData = await api('/auth/refresh', { method: 'POST' });
        if (refreshData.accessToken) {
          localStorage.setItem('accessToken', refreshData.accessToken);
          // Now get user data with the new token
          const userData = await api('/auth/me');
          if (userData?.user) {
            setUser(userData.user);
            setLoading(false);
            return;
          }
        }
      } catch (refreshError) {
        // Refresh failed, user is not authenticated
      }
      
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api('/auth/me');
      if (!data?.user) {
        throw new Error('Invalid session');
      }
      setUser(data.user);
    } catch (error) {
      localStorage.removeItem('accessToken');
      setUser(null);
      if (pathname !== '/login' && pathname !== '/register') {
        window.location.replace('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
    }
    await checkAuth();
    return data;
  };

  const logout = async () => {
    try {
      // Make the logout call first while we still have the token
      await api('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
      // Continue with logout even if API call fails
    }
    
    // Clear local state and redirect
    localStorage.removeItem('accessToken'); 
    setUser(null);
    setLoading(false);
    window.location.replace('/login'); 
  };

  const register = async (userData) => {
    return await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
