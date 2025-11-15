'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  emailVerified: boolean;
}

interface AuthSession {
  email: string;
  userId: number;
  createdAt: string;
  accessToken: string;
  tokenType: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  session: AuthSession | null;
  login: (sessionData: AuthSession, userData: User) => void;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);

  // Check authentication status on mount and when localStorage changes
  const checkAuth = () => {
    try {
      const sessionStr = localStorage.getItem('simpleAuthSession');
      
      if (sessionStr) {
        const sessionData: AuthSession = JSON.parse(sessionStr);
        
        // Validate session has required fields
        if (sessionData.accessToken && sessionData.email && sessionData.userId) {
          setSession(sessionData);
          setUser({
            id: sessionData.userId,
            email: sessionData.email,
            emailVerified: true, // OTP users are always verified
          });
          setIsAuthenticated(true);
        } else {
          // Invalid session data, clear it
          localStorage.removeItem('simpleAuthSession');
          setIsAuthenticated(false);
          setUser(null);
          setSession(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      localStorage.removeItem('simpleAuthSession');
      setIsAuthenticated(false);
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Login function
  const login = (sessionData: AuthSession, userData: User) => {
    localStorage.setItem('simpleAuthSession', JSON.stringify(sessionData));
    setSession(sessionData);
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('simpleAuthSession');
    setSession(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    session,
    login,
    logout,
    checkAuth,
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
