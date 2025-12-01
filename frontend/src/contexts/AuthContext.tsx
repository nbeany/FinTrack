import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, userApi } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role?: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const { data } = await userApi.getProfile();
          setUser(data);
        } catch {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    const profileRes = await userApi.getProfile();
    setUser(profileRes.data);
  };

  const register = async (name: string, email: string, password: string) => {
    await authApi.register({ name, email, password });
    await login(email, password);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: { name?: string }) => {
    const { data: updatedUser } = await userApi.updateProfile(data);
    setUser(updatedUser);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, isAdmin, login, register, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
