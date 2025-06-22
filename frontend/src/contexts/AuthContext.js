import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { secureAuthService } from '../services/authService';
import { apiService } from '../services/api';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      apiService.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        const decodedToken = jwtDecode(token);
        // Ensure token is not expired
        if (decodedToken.exp * 1000 > Date.now()) {
          setUser({
            id: decodedToken.id,
            role: decodedToken.role,
            email: decodedToken.email
          });
        } else {
          // Token is expired
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } catch (e) {
        console.error("Invalid token:", e);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    }
    setLoading(false);
  }, [token]);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.login(credentials.email, credentials.password);
      const { token: newToken, user: userData } = response;
      secureAuthService.setAuthData(newToken, userData);
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const errorMessage = err.userMessage || err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    secureAuthService.clearAuthData();
    setToken(null);
    setUser(null);
    delete apiService.api.defaults.headers.common['Authorization'];
  }, []);
  
  const value = useMemo(() => ({
    user,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!token && !!user
  }), [user, token, loading, error, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined || context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};