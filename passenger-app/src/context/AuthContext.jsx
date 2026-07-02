// =============================================================
// src/context/AuthContext.jsx – Passenger App
// =============================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const [storedToken, storedUser] = await AsyncStorage.multiGet(['token', 'user']);
        if (storedToken[1] && storedUser[1]) {
          setToken(storedToken[1]);
          setUser(JSON.parse(storedUser[1]));
        }
      } catch {
        await AsyncStorage.multiRemove(['token', 'user']);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const register = async (name, email, password, phone) => {
    const res = await authAPI.register({ name, email, password, phone });
    const { user: u, token: jwt } = res.data;
    await AsyncStorage.setItem('token', jwt);
    await AsyncStorage.setItem('user', JSON.stringify(u));
    setToken(jwt);
    setUser(u);
    return u;
  };

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { user: u, token: jwt } = res.data;
    await AsyncStorage.setItem('token', jwt);
    await AsyncStorage.setItem('user', JSON.stringify(u));
    setToken(jwt);
    setUser(u);
    return u;
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
  if (!ctx) throw new Error('useAuth must be inside <AuthProvider>');
  return ctx;
};
