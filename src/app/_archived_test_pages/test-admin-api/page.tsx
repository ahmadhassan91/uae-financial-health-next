'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TestAdminAPIPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAdminAPI = async () => {
    setLoading(true);
    setResults(null);

    const testResults: any = {
      steps: [],
      success: false
    };

    try {
      // Step 1: Check admin token
      const adminToken = localStorage.getItem('admin_access_token');
      testResults.steps.push({
        step: 'Check Admin Token',
        success: !!adminToken,
        details: adminToken ? `Token exists: ${adminToken.substring(0, 20)}...` : 'No admin token found'
      });

      if (!adminToken) {
        testResults.steps.push({
          step: 'Admin Login Required',
          success: false,
          details: 'Please login to admin panel first'
        });
        setResults(testResults);
        setLoading(false);
        return;
      }

      // Step 2: Test backend connection
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      testResults.backendUrl = backendUrl;

      try {
        const response = await fetch(`${backendUrl}/api/admin/simple/survey-submissions?limit=5`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        });

        testResults.steps.push({
          step: 'Backend API Call',
          success: response.ok,
          details: `Status: ${response.status} ${response.statusText}`
        });

        if (response.ok) {
          const data = await response.json();
          testResults.steps.push({
            step: 'Parse Response',
            success: true,
            details: `Found ${data.total} total submissions, retrieved ${data.submissions.length}`
          });

          testResults.submissionsData = data;
          testResults.success = true;
        } else {
          const errorText = await response.text();
          testResults.steps.push({
            step: 'Response Error',
            success: false,
            details: errorText
          });
        }
      } catch (fetchError: any) {
        testResults.steps.push({
          step: 'Network Error',
          success: false,
          details: fetchError.message
        });
      }

      // Step 3: Test analytics endpoint
      if (testResults.success) {
        try {
          const analyticsResponse = await fetch(`${backendUrl}/api/admin/simple/survey-analytics`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${adminToken}`,
              'Content-Type': 'application/json',
            },
          });

          testResults.steps.push({
            step: 'Analytics API Call',
            success: analyticsResponse.ok,
            details: `Status: ${analyticsResponse.status} ${analyticsResponse.statusText}`
          });

          if (analyticsResponse.ok) {
            const analyticsData = await analyticsResponse.json();
            testResults.analyticsData = analyticsData;
          }
        } catch (analyticsError: any) {
          testResults.steps.push({
            step: 'Analytics Error',
            success: false,
            details: analyticsError.message
          });
        }
      }

    } catch (error: any) {
      testResults.steps.push({
        step: 'General Error',
        success: false,
        details: error.message
      });
    }

    setResults(testResults);
    setLoading(false);
  };

  const loginAsAdmin = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('admin_access_token', data.access_token);
        alert('Admin login successful! Token saved to localStorage.');
      } else {
        const errorText = await response.text();
        alert(`Admin login failed: ${errorText}`);
      }
    } catch (error: any) {
      alert(`Login error: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Admin API Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={loginAsAdmin}>
              Login as Admin
            </Button>
            <Button onClick={testAdminAPI} disabled={loading}>
              {loading ? 'Testing...' : 'Test Admin API'}
            </Button>
          </div>

          {results && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={results.success ? 'default' : 'destructive'}>
                  {results.success ? 'SUCCESS' : 'FAILED'}
                </Badge>
                {results.backendUrl && (
                  <span className="text-sm text-muted-foreground">
                    Backend: {results.backendUrl}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Test Steps:</h3>
                {results.steps.map((step: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <Badge variant={step.success ? 'default' : 'destructive'} className="text-xs">
                      {step.success ? '✓' : '✗'}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-medium">{step.step}</div>
                      <div className="text-sm text-muted-foreground">{step.details}</div>
                    </div>
                  </div>
                ))}
              </div>

              {results.submissionsData && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Submissions Data:</h3>
                  <div className="p-3 bg-muted rounded text-sm">
                    <div>Total: {results.submissionsData.total}</div>
                    <div>Retrieved: {results.submissionsData.submissions.length}</div>
                    {results.submissionsData.submissions.length > 0 && (
                      <div className="mt-2">
                        <div className="font-medium">Sample submission:</div>
                        <div>ID: {results.submissionsData.submissions[0].id}</div>
                        <div>User Type: {results.submissionsData.submissions[0].user_type}</div>
                        <div>Score: {results.submissionsData.submissions[0].overall_score}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {results.analyticsData && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Analytics Data:</h3>
                  <div className="p-3 bg-muted rounded text-sm">
                    <div>Total Submissions: {results.analyticsData.total_submissions}</div>
                    <div>Guest: {results.analyticsData.guest_submissions}</div>
                    <div>Authenticated: {results.analyticsData.authenticated_submissions}</div>
                    <div>Average Score: {results.analyticsData.average_scores.overall.toFixed(1)}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}