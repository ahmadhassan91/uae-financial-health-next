'use client';

import { useState, useEffect } from 'react';
import { ScoreResult } from '@/components/ScoreResult';
import { useSimpleAuth } from '@/hooks/use-simple-auth';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestGuestRegistrationPage() {
  const { user, logout } = useSimpleAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [mockScore] = useState({
    totalScore: 65,
    pillarScores: [
      { pillar: 'budgeting', score: 8, maxScore: 10, percentage: 80 },
      { pillar: 'saving', score: 7, maxScore: 10, percentage: 70 },
      { pillar: 'investing', score: 6, maxScore: 10, percentage: 60 },
      { pillar: 'protection', score: 9, maxScore: 10, percentage: 90 },
      { pillar: 'planning', score: 7, maxScore: 10, percentage: 70 },
      { pillar: 'knowledge', score: 8, maxScore: 10, percentage: 80 },
      { pillar: 'behavior', score: 6, maxScore: 10, percentage: 60 }
    ],
    advice: [
      'Great job on budgeting! Keep tracking your expenses.',
      'Consider increasing your emergency fund to 6 months of expenses.',
      'Look into diversifying your investment portfolio.'
    ],
    surveyResponseId: 'test-123'
  });

  const isGuestUser = !user && !apiClient.isAuthenticated();

  const handleRetake = () => {
    console.log('Retake survey clicked');
  };

  const handleViewHistory = () => {
    console.log('View history clicked');
  };

  const handleClearAuth = () => {
    logout();
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Guest Registration Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Authentication Status:</strong>
                <ul className="mt-2 space-y-1">
                  <li>User from useSimpleAuth: {user ? '✅ Authenticated' : '❌ Not authenticated'}</li>
                  <li>API Client authenticated: {apiClient.isAuthenticated() ? '✅ Yes' : '❌ No'}</li>
                  <li>Is Guest User: {isGuestUser ? '✅ Yes (should show prompt)' : '❌ No'}</li>
                </ul>
              </div>
              <div>
                <strong>Local Storage:</strong>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>simple_auth_session: {mounted && typeof window !== 'undefined' ? (localStorage.getItem('simple_auth_session') ? '✅ Present' : '❌ None') : 'Loading...'}</li>
                  <li>currentScore: {mounted && typeof window !== 'undefined' ? (localStorage.getItem('currentScore') ? '✅ Present' : '❌ None') : 'Loading...'}</li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleClearAuth} variant="outline">
                Clear All Auth & Reload
              </Button>
            </div>
          </CardContent>
        </Card>

        <ScoreResult
          scoreCalculation={mockScore}
          onRetake={handleRetake}
          onViewHistory={handleViewHistory}
        />
      </div>
    </div>
  );
}