import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for tokens in localStorage on initial load
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    if (accessToken && refreshToken) {
      // Set the token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      // Fetch user data
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/user/me');
      setUser(response.data);
    } catch (error) {
      // If access token is expired, try to refresh it
      if (error.response?.status === 401) {
        await refreshToken();
      } else {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      const response = await api.post('/auth/refresh', { refreshToken });
      
      const { access_token, refresh_token } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      await fetchUserData();
    } catch (error) {
      logout();
    }
  };

  const handleLogin = (accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    fetchUserData();
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, handleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);