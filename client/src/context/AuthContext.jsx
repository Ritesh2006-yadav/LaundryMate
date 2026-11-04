import React, { createContext, useContext, useState, useEffect } from 'react';
import staffApi from '../api/staffApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('staff_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('staff_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('staff_token');
      if (savedToken) {
        try {
          const res = await staffApi.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('staff_user', JSON.stringify(res.data));
          }
        } catch {
          // Token invalid
          localStorage.removeItem('staff_token');
          localStorage.removeItem('staff_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await staffApi.login({ email, password });
    if (res.success && res.data) {
      const { token: newToken, user: staffUser } = res.data;
      setToken(newToken);
      setUser(staffUser);
      localStorage.setItem('staff_token', newToken);
      localStorage.setItem('staff_user', JSON.stringify(staffUser));
      return staffUser;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = () => {
    localStorage.removeItem('staff_token');
    localStorage.removeItem('staff_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
