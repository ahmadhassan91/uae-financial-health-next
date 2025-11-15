'use client';

import React, { Component, ReactNode } from 'react';
import { ApiError } from '@/lib/api-client';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  retryCount: number;
}

/**
 * Production-ready error boundary that handles API errors gracefully
 * Provides retry functionality for retryable errors
 */
export class ProductionErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error in production for monitoring
    if (process.env.NODE_ENV === 'production') {
      console.error('Production Error Boundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    const { error, retryCount } = this.state;
    
    // Check if error is retryable
    const apiError = error as ApiError;
    if (apiError.retryable && retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1,
      });
    } else {
      // Reset error state for manual retry
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: 0,
      });
    }
  };

  render() {
    const { hasError, error, retryCount } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, this.handleRetry);
      }

      // Default error UI
      const apiError = error as ApiError;
      const isRetryable = apiError.retryable && retryCount < this.maxRetries;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>

            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {apiError.code === 'NETWORK_ERROR' && 'Connection Problem'}
              {apiError.code === 'SERVER_ERROR' && 'Server Error'}
              {apiError.code === 'CORS_ERROR' && 'Service Unavailable'}
              {apiError.code === 'TIMEOUT_ERROR' && 'Request Timeout'}
              {apiError.code === 'RATE_LIMIT_ERROR' && 'Too Many Requests'}
              {!apiError.code && 'Something Went Wrong'}
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              {apiError.detail || error.message}
            </p>

            <div className="space-y-3">
              {isRetryable && (
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Try Again ({this.maxRetries - retryCount} attempts left)
                </button>
              )}

              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Reload Page
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="w-full text-gray-600 px-4 py-2 rounded-md hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Go to Home
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}

// Higher-order component for easier usage
export function withProductionErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: (error: Error, retry: () => void) => ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ProductionErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ProductionErrorBoundary>
    );
  };
}

export default ProductionErrorBoundary;