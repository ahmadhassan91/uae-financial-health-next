'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScoreHistory } from '@/components/ScoreHistory';
import { ScoreResult } from '@/components/ScoreResult';
import { useSurvey } from '@/hooks/use-survey';
import { useSimpleAuth } from '@/hooks/use-simple-auth';
import { ScoreCalculation } from '@/lib/types';

export default function TestBackendIntegrationPage() {
  const { scoreHistory, loadHistory } = useSurvey();
  const { user, isAuthenticated } = useSimpleAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testMode, setTestMode] = useState<'history' | 'result'>('history');
  const [mockResult, setMockResult] = useState<ScoreCalculation | null>(null);

  // Load history on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        await loadHistory();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [loadHistory]);

  // Create a mock result for testing ScoreResult component
  useEffect(() => {
    if (scoreHistory.length > 0) {
      setMockResult(scoreHistory[0]);
    }
  }, [scoreHistory]);

  const handleBack = () => {
    console.log('Back button clicked');
  };

  const handleRetake = () => {
    console.log('Retake button clicked');
  };

  const handleViewHistory = () => {
    setTestMode('history');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="container mx-auto max-w-4xl py-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Loading Backend Data...</h1>
          <p className="text-muted-foreground">Testing backend integration</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="container mx-auto max-w-6xl py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Backend Integration Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <strong>Authentication Status:</strong>{' '}
                <Badge variant={isAuthenticated ? 'default' : 'secondary'}>
                  {isAuthenticated ? 'Authenticated' : 'Guest'}
                </Badge>
              </div>
              <div>
                <strong>User Email:</strong> {user?.email || 'N/A'}
              </div>
              <div>
                <strong>Score History Count:</strong> {scoreHistory.length}
              </div>
              <div>
                <strong>Data Source:</strong>{' '}
                <Badge variant="outline">
                  {isAuthenticated ? 'Backend API' : 'LocalStorage'}
                </Badge>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <strong>Error:</strong> {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                variant={testMode === 'history' ? 'default' : 'outline'}
                onClick={() => setTestMode('history')}
                disabled={scoreHistory.length === 0}
              >
                Test Score History
              </Button>
              <Button 
                variant={testMode === 'result' ? 'default' : 'outline'}
                onClick={() => setTestMode('result')}
                disabled={!mockResult}
              >
                Test Score Result
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              <p><strong>This test verifies:</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>Backend API integration for score history</li>
                <li>Data conversion from API response to frontend format</li>
                <li>ScoreHistory component with real backend data</li>
                <li>ScoreResult component with backend-generated scores</li>
                <li>Authentication state handling</li>
                <li>Error handling for API failures</li>
                <li>LocalStorage fallback for guest users</li>
              </ul>
            </div>

            {scoreHistory.length > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <strong>✅ Backend Data Loaded Successfully</strong>
                <div className="mt-2 text-sm">
                  <p>Latest Score: {scoreHistory[0]?.totalScore}</p>
                  <p>Created: {scoreHistory[0]?.createdAt?.toLocaleString()}</p>
                  <p>Advice Count: {scoreHistory[0]?.advice?.length || 0}</p>
                  <p>Pillar Scores: {scoreHistory[0]?.pillarScores?.length || 0}</p>
                </div>
              </div>
            )}

            {scoreHistory.length === 0 && !loading && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <strong>⚠️ No Score History Found</strong>
                <p className="mt-2 text-sm">
                  {isAuthenticated 
                    ? 'No surveys found in backend database for this user'
                    : 'No surveys found in localStorage for guest user'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Component Tests */}
        {testMode === 'history' && scoreHistory.length > 0 && (
          <ScoreHistory 
            scoreHistory={scoreHistory}
            onBack={handleBack}
            userEmail={user?.email}
          />
        )}

        {testMode === 'result' && mockResult && (
          <ScoreResult 
            scoreCalculation={mockResult}
            onRetake={handleRetake}
            onViewHistory={handleViewHistory}
          />
        )}
      </div>
    </div>
  );
}