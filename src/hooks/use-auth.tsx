'use client';

/**
 * Authentication hook for managing user login/logout with FastAPI backend
 */
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { apiClient } from '../lib/api-client';

interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && apiClient.isAuthenticated();

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (apiClient.isAuthenticated()) {
        const userData = await apiClient.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid token
      apiClient.clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const authResponse = await apiClient.login({ email, password });
      
      // Get user data after successful login
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, username: string, password: string) => {
    try {
      setLoading(true);
      
      // Register the user
      await apiClient.register({ email, username, password });
      
      // Automatically log them in after registration
      await login(email, password);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails on server, clear local state
    } finally {
      apiClient.clearAuth();
      setUser(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Standalone hook for checking auth status without context
export function useAuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (apiClient.isAuthenticated()) {
          await apiClient.getCurrentUser();
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
        apiClient.clearAuth();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, loading };
}
