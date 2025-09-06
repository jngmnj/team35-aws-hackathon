'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { apiClient, setToastCallback } from './api';
import { useToast } from '@/components/ui/toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setToastCallback(showToast);
    
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      if (token && userData) {
        try {
          // 토큰을 API 클라이언트에 설정
          apiClient.setToken(token);
          
          // 토큰 유효성 검증을 위해 간단한 API 호출
          await apiClient.getDocuments();
          
          // 토큰이 유효하면 사용자 데이터 설정
          setUser(JSON.parse(userData));
        } catch (error) {
          // 토큰이 무효하거나 만료된 경우 정리
          console.log('Token validation failed:', error);
          apiClient.clearToken();
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          setUser(null);
        }
      } else {
        // 토큰이 없으면 API 클라이언트도 정리
        apiClient.clearToken();
      }
      
      setIsLoading(false);
    };
    
    initializeAuth();
  }, [showToast]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.login(email, password);
      apiClient.setToken(response.token);
      setUser(response.user);
      localStorage.setItem('user_data', JSON.stringify(response.user));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.register(email, password, name);
      apiClient.setToken(response.token);
      setUser(response.user);
      localStorage.setItem('user_data', JSON.stringify(response.user));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiClient.clearToken();
    localStorage.removeItem('user_data');
    setUser(null);
    setError(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, error }}>
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