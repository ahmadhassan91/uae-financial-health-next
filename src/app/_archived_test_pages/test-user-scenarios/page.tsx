'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { useSurvey } from '@/hooks/use-survey';

export default function TestUserScenariosPage() {
  const [scenario, setScenario] = useState<'guest' | 'authenticated' | 'invalid-token'>('guest');
  const [testResults, setTestResults] = useState<string[]>([]);
  const { scoreHistory, loading, error } = useSurvey();

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const setupGuestScenario = () => {
    addResult('Setting up GUEST scenario...');
    apiClient.clearAuth();
    setScenario('guest');
    addResult('✅ Cleared all tokens - user is now in guest mode');
    addResult(`Auth status: ${apiClient.isAuthenticated()}`);
  };

  const setupInvalidTokenScenario = () => {
    addResult('Setting up INVALID TOKEN scenario...');
    localStorage.setItem('auth_token', 'fake-invalid-token-12345');
    setScenario('invalid-token');
    addResult('✅ Set fake invalid token in localStorage');
    addResult(`Auth status: ${apiClient.isAuthenticated()}`);
  };

  const setupAuthenticatedScenario = () => {
    addResult('Setting up AUTHENTICATED scenario...');
    // Note: This would require a real valid token
    addResult('❌ Cannot simulate real authentication without valid token');
    addResult('This scenario requires actual login through the system');
  };

  const testCurrentScenario = async () => {
    addResult(`Testing current scenario: ${scenario.toUpperCase()}`);
    
    try {
      // Test authentication status
      const hasToken = apiClient.isAuthenticated();
      addResult(`Has token: ${hasToken}`);
      
      if (hasToken) {
        try {
          const isValid = await apiClient.validateToken();
          addResult(`Token valid: ${isValid}`);
        } catch (validationError) {
          addResult(`Token validation failed: ${validationError}`);
        }
      }
      
      // Test survey history loading (this should trigger the hook)
      addResult('Survey history will be loaded by the hook...');
      addResult(`Current survey history count: ${scoreHistory.length}`);
      addResult(`Loading state: ${loading}`);
      addResult(`Error state: ${error || 'none'}`);
      
    } catch (testError) {
      addResult(`❌ Test error: ${testError}`);
    }
  };

  useEffect(() => {
    if (scoreHistory.length > 0) {
      addResult(`✅ Survey history loaded: ${scoreHistory.length} items`);
    }
  }, [scoreHistory]);

  useEffect(() => {
    if (error) {
      addResult(`❌ Survey hook error: ${error}`);
    }
  }, [error]);

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Test User Scenarios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <strong>Current Scenario:</strong>
            <Badge variant={scenario === 'guest' ? 'default' : scenario === 'invalid-token' ? 'destructive' : 'secondary'}>
              {scenario.toUpperCase()}
            </Badge>
            <strong>Auth Status:</strong>
            <Badge variant={apiClient.isAuthenticated() ? 'default' : 'secondary'}>
              {apiClient.isAuthenticated() ? 'Has Token' : 'No Token'}
            </Badge>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={setupGuestScenario} variant="outline">
              Setup Guest Scenario
            </Button>
            <Button onClick={setupInvalidTokenScenario} variant="outline">
              Setup Invalid Token Scenario
            </Button>
            <Button onClick={setupAuthenticatedScenario} variant="outline">
              Setup Authenticated Scenario
            </Button>
            <Button onClick={testCurrentScenario} variant="default">
              Test Current Scenario
            </Button>
            <Button onClick={clearResults} variant="ghost">
              Clear Results
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Survey Hook Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div><strong>Loading:</strong> {loading ? '🔄 Yes' : '✅ No'}</div>
                  <div><strong>Error:</strong> {error ? `❌ ${error}` : '✅ None'}</div>
                  <div><strong>Survey History:</strong> {scoreHistory.length} items</div>
                  <div><strong>Auth Status:</strong> {apiClient.isAuthenticated() ? '🔑 Has Token' : '👤 Guest'}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expected Behavior</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>Guest Scenario:</strong></div>
                  <ul className="list-disc list-inside ml-4">
                    <li>No API calls should be made</li>
                    <li>Should load from localStorage only</li>
                    <li>Should show sample data if no history</li>
                    <li>No authentication errors</li>
                  </ul>
                  
                  <div><strong>Invalid Token Scenario:</strong></div>
                  <ul className="list-disc list-inside ml-4">
                    <li>Should validate token first</li>
                    <li>Should clear invalid token automatically</li>
                    <li>Should fall back to guest mode</li>
                    <li>No credential errors shown to user</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {testResults.length === 0 ? (
                  <div className="text-muted-foreground">No test results yet. Set up a scenario and test it.</div>
                ) : (
                  testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono">
                      {result}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}