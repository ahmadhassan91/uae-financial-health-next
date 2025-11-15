'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

export default function TestAuthErrorPage() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAuthenticationFlow = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      addResult('Starting authentication test...');
      
      // Check initial auth status
      addResult(`Initial auth status: ${apiClient.isAuthenticated()}`);
      
      // Set a fake token to simulate invalid credentials
      localStorage.setItem('auth_token', 'fake-invalid-token');
      addResult('Set fake token in localStorage');
      addResult(`Auth status after fake token: ${apiClient.isAuthenticated()}`);
      
      // Try to make an authenticated request that should fail
      try {
        addResult('Attempting to load survey history with fake token...');
        await apiClient.getSurveyHistory();
        addResult('❌ ERROR: Request should have failed but succeeded');
      } catch (error) {
        addResult(`✅ Request failed as expected: ${error instanceof Error ? error.message : 'Unknown error'}`);
        addResult(`Auth status after failed request: ${apiClient.isAuthenticated()}`);
      }
      
      // Test token validation
      addResult('Testing token validation...');
      const isValid = await apiClient.validateToken();
      addResult(`Token validation result: ${isValid}`);
      addResult(`Auth status after validation: ${apiClient.isAuthenticated()}`);
      
      // Test clearing auth
      addResult('Testing clearAuth...');
      apiClient.clearAuth();
      addResult(`Auth status after clearAuth: ${apiClient.isAuthenticated()}`);
      
      addResult('✅ Authentication error handling test completed');
      
    } catch (error) {
      addResult(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  const clearTokens = () => {
    apiClient.clearAuth();
    addResult('Cleared all authentication tokens');
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Test Authentication Error Handling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={testAuthenticationFlow}
              disabled={loading}
            >
              {loading ? 'Testing...' : 'Test Auth Flow'}
            </Button>
            <Button variant="outline" onClick={clearResults}>
              Clear Results
            </Button>
            <Button variant="outline" onClick={clearTokens}>
              Clear Tokens
            </Button>
          </div>

          <div>
            <strong>Current Auth Status:</strong> {apiClient.isAuthenticated() ? '✅ Authenticated' : '❌ Not Authenticated'}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {results.length === 0 ? (
                  <div className="text-muted-foreground">No test results yet. Click "Test Auth Flow" to start.</div>
                ) : (
                  results.map((result, index) => (
                    <div key={index} className="text-sm font-mono">
                      {result}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground">
            <p><strong>This test verifies:</strong></p>
            <ul className="list-disc list-inside ml-4">
              <li>Authentication status detection</li>
              <li>Handling of invalid/expired tokens</li>
              <li>Automatic token clearing on 401 errors</li>
              <li>Graceful fallback to guest mode</li>
              <li>Token validation functionality</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}