'use client';

/**
 * Simplified authentication hook for email + date of birth authentication
 * Provides session-based authentication for accessing survey history
 */
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { apiClient } from '../lib/api-client';

interface SimpleUser {
  id: number;
  email: string;
  dateOfBirth: string;
  sessionId: string;
  financialClinicHistory: any[];
  is_admin?: boolean;
}

interface SimpleAuthContextType {
  user: SimpleUser | null;
  loading: boolean;
  authenticate: (email: string, dateOfBirth: string) => Promise<void>;
  registerFromGuest: (email: string, dateOfBirth: string, guestSurveyData: any, subscribeToUpdates?: boolean) => Promise<SimpleUser>;
  logout: () => void;
  isAuthenticated: boolean;
  error: string | null;
  clearError: () => void;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = () => {
    try {
      const sessionData = localStorage.getItem('simple_auth_session');
      if (sessionData) {
        const parsedSession = JSON.parse(sessionData);
        // Check if session is still valid (24 hours)
        const sessionAge = Date.now() - parsedSession.timestamp;
        if (sessionAge < 24 * 60 * 60 * 1000) {
          setUser(parsedSession.user);
        } else {
          localStorage.removeItem('simple_auth_session');
        }
      }
    } catch (error) {
      console.error('Error checking existing session:', error);
      localStorage.removeItem('simple_auth_session');
    }
  };

  const authenticate = async (email: string, dateOfBirth: string) => {
    try {
      setLoading(true);
      setError(null);

      // Call the new simple auth endpoint
      const response = await apiClient.simpleAuth({ email, dateOfBirth });
      
      const userData: SimpleUser = {
        id: response.user_id,
        email: response.email,
        dateOfBirth,
        sessionId: response.session_id,
        financialClinicHistory: response.survey_history || [], // <-- ensure correct mapping
      };

      setUser(userData);

      // Store session data locally (expires in 24 hours)
      const sessionData = {
        user: userData,
        timestamp: Date.now()
      };
      localStorage.setItem('simple_auth_session', JSON.stringify(sessionData));

    } catch (error) {
      console.error('Simple authentication failed:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerFromGuest = async (
    email: string, 
    dateOfBirth: string, 
    guestSurveyData: any, 
    subscribeToUpdates: boolean = false
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Call the post-registration endpoint
      const response = await apiClient.postRegister({
        email,
        dateOfBirth,
        guestSurveyData,
        subscribeToUpdates
      });
      
      const userData: SimpleUser = {
        id: response.user_id,
        email: response.email,
        dateOfBirth,
        sessionId: response.session_id,
        financialClinicHistory: response.survey_history || [], // <-- ensure correct mapping
      };

      setUser(userData);

      // Store session data locally (expires in 24 hours)
      const sessionData = {
        user: userData,
        timestamp: Date.now()
      };
      localStorage.setItem('simple_auth_session', JSON.stringify(sessionData));

      return userData;

    } catch (error) {
      console.error('Post-registration failed:', error);
      setError(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('simple_auth_session');
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    authenticate,
    registerFromGuest,
    logout,
    isAuthenticated,
    error,
    clearError,
  };

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
}

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
}