'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('pulseguard_token') : null;
    if (savedToken) {
      setToken(savedToken);
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await authService.getMe();
      setUser(res.data.user);
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pulseguard_token');
      }
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (email, firebaseUid) => {
    const res = await authService.login({ email, firebaseUid });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('pulseguard_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authService.register(data);
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('pulseguard_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pulseguard_token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
