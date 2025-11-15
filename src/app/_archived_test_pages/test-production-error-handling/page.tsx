'use client';

import React, { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import useApiErrorHandler, { useErrorMessage } from '@/hooks/use-api-error-handler';
import ProductionErrorBoundary from '@/components/ProductionErrorBoundary';

function ErrorHandlingTestComponent() {
  const { error, isLoading, retryCount, handleApiCall, clearError, retry } = useApiErrorHandler();
  const errorMessage = useErrorMessage(error);
  const [testResult, setTestResult] = useState<any>(null);

  const testConnectivity = async () => {
    const result = await handleApiCall(() => apiClient.testConnectivity());
    if (result) {
      setTestResult(result);
    }
  };

  const testHealthCheck = async () => {
    const result = await handleApiCall(() => apiClient.healthCheck());
    if (result) {
      setTestResult(result);
    }
  };

  const testInvalidEndpoint = async () => {
    const result = await handleApiCall(() => 
      fetch(`${apiClient.getBaseUrl()}/invalid-endpoint`).then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
    );
    if (result) {
      setTestResult(result);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Production Error Handling Test
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Base URL:</strong> {apiClient.getBaseUrl()}</p>
          <p><strong>Is Production:</strong> {apiClient.isProduction() ? 'Yes' : 'No'}</p>
          <p><strong>Retry Config:</strong> {JSON.stringify(apiClient.getRetryConfig(), null, 2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test API Calls</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={testConnectivity}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Testing...' : 'Test Connectivity'}
          </button>

          <button
            onClick={testHealthCheck}
            disabled={isLoading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Testing...' : 'Test Health Check'}
          </button>

          <button
            onClick={testInvalidEndpoint}
            disabled={isLoading}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Testing...' : 'Test Invalid Endpoint'}
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading...</span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Occurred</h3>
          <p className="text-red-700 mb-4">{errorMessage}</p>
          
          <div className="space-y-2 text-sm text-red-600 mb-4">
            <p><strong>Error Code:</strong> {error.code || 'Unknown'}</p>
            <p><strong>Status:</strong> {error.status || 'N/A'}</p>
            <p><strong>Retryable:</strong> {error.retryable ? 'Yes' : 'No'}</p>
            <p><strong>Retry Count:</strong> {retryCount}</p>
          </div>

          <div className="flex space-x-4">
            {error.retryable && (
              <button
                onClick={retry}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Retry
              </button>
            )}
            
            <button
              onClick={clearError}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Clear Error
            </button>
          </div>
        </div>
      )}

      {testResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Test Result</h3>
          <pre className="text-sm text-green-700 bg-green-100 p-4 rounded overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function TestProductionErrorHandling() {
  return (
    <ProductionErrorBoundary>
      <ErrorHandlingTestComponent />
    </ProductionErrorBoundary>
  );
}