'use client';

import { useState, useCallback } from 'react';
import { ApiError } from '@/lib/api-client';

interface ApiErrorState {
  error: ApiError | null;
  isLoading: boolean;
  retryCount: number;
}

interface UseApiErrorHandlerReturn {
  error: ApiError | null;
  isLoading: boolean;
  retryCount: number;
  handleApiCall: <T>(apiCall: () => Promise<T>) => Promise<T | null>;
  clearError: () => void;
  retry: () => Promise<void>;
}

/**
 * Hook for handling API errors with retry logic and loading states
 * Provides consistent error handling across components
 */
export function useApiErrorHandler(maxRetries: number = 3): UseApiErrorHandlerReturn {
  const [state, setState] = useState<ApiErrorState>({
    error: null,
    isLoading: false,
    retryCount: 0,
  });

  const [lastApiCall, setLastApiCall] = useState<(() => Promise<any>) | null>(null);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      retryCount: 0,
    }));
  }, []);

  const handleApiCall = useCallback(async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    setLastApiCall(() => apiCall);

    try {
      const result = await apiCall();
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
        retryCount: 0,
      }));

      return result;
    } catch (error) {
      const apiError = error as ApiError;
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: apiError,
      }));

      // Auto-retry for retryable errors
      if (apiError.retryable && state.retryCount < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, state.retryCount), 10000);
        
        setTimeout(async () => {
          setState(prev => ({
            ...prev,
            retryCount: prev.retryCount + 1,
          }));
          
          await handleApiCall(apiCall);
        }, delay);
      }

      return null;
    }
  }, [state.retryCount, maxRetries]);

  const retry = useCallback(async () => {
    if (lastApiCall) {
      setState(prev => ({
        ...prev,
        retryCount: 0,
      }));
      
      await handleApiCall(lastApiCall);
    }
  }, [lastApiCall, handleApiCall]);

  return {
    error: state.error,
    isLoading: state.isLoading,
    retryCount: state.retryCount,
    handleApiCall,
    clearError,
    retry,
  };
}

/**
 * Hook for displaying user-friendly error messages
 */
export function useErrorMessage(error: ApiError | null): string {
  if (!error) return '';

  switch (error.code) {
    case 'NETWORK_ERROR':
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    
    case 'CORS_ERROR':
      return 'Service temporarily unavailable. Please try again in a few moments.';
    
    case 'TIMEOUT_ERROR':
      return 'The request is taking longer than expected. Please try again.';
    
    case 'RATE_LIMIT_ERROR':
      return 'Too many requests. Please wait a moment before trying again.';
    
    case 'SERVER_ERROR':
      return 'Server error occurred. Our team has been notified. Please try again later.';
    
    case 'AUTH_ERROR':
      return 'Your session has expired. Please log in again.';
    
    case 'PERMISSION_ERROR':
      return 'You do not have permission to perform this action.';
    
    default:
      return error.detail || 'An unexpected error occurred. Please try again.';
  }
}

export default useApiErrorHandler;