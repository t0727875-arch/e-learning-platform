import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, storage } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const refreshUser = async () => {
    try {
      const userData = await authApi.getUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedGuest = await storage.getItem('isGuest');
        if (savedGuest === 'true') {
          setIsGuest(true);
          setUser({
            id: 'guest',
            username: 'Guest',
            email: '',
            firstName: 'Guest',
            lastName: 'User',
            role: 'student',
          } as User);
        } else {
          await refreshUser();
        }
      } catch (error) {
        console.log('Not authenticated');
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login(username, password);
      if (response.token) {
        await storage.setItem('authToken', response.token);
      }
      setIsGuest(false);
      await refreshUser();
    } catch (error) {
      throw error;
    }
  };

  const loginAsGuest = async () => {
    setIsGuest(true);
    await storage.setItem('isGuest', 'true');
    setUser({
      id: 'guest',
      username: 'Guest',
      email: '',
      firstName: 'Guest',
      lastName: 'User',
      role: 'student',
    } as User);
  };

  const logout = async () => {
    try {
      if (!isGuest) {
        await authApi.logout();
      }
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      await storage.deleteItem('authToken');
      await storage.deleteItem('isGuest');
      setUser(null);
      setIsGuest(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isGuest,
        login,
        loginAsGuest,
        logout,
        refreshUser,
      }}
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
