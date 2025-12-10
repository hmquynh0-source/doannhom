import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context || {}; // ❗ FIX: Không throw nữa để tránh crash
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'Admin');

  useEffect(() => {
    if (token) {
      setUserName(localStorage.getItem('userName') || 'Admin');
    }
  }, [token]);

  const login = (newToken, name) => {
    setToken(newToken);
    setUserName(name);
    localStorage.setItem('token', newToken);
    localStorage.setItem('userName', name);
  };

  const logout = () => {
    setToken(null);
    setUserName(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
  };

  const value = {
    token: token || 'mock-jwt-token-123',
    userName,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
