// =============================================================
// src/context/AuthContext.jsx – Driver App
// =============================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser  = await AsyncStorage.getItem('user');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch {
        // invalid stored data – clear it
        await AsyncStorage.multiRemove(['token', 'user']);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { user: userData, token: jwt } = res.data;
    await AsyncStorage.setItem('token', jwt);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);
    return userData;
  };

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { user: userData, token: jwt } = res.data;
    await AsyncStorage.setItem('token', jwt);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
