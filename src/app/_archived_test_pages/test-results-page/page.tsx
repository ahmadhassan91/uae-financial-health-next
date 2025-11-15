'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreCalculation } from '@/lib/types';

export default function TestResultsPage() {
  const [currentScoreData, setCurrentScoreData] = useState<string>('Loading...');

  useEffect(() => {
    // Only access localStorage on client side
    const scoreData = localStorage.getItem('currentScore') || 'No score data';
    setCurrentScoreData(scoreData);
  }, []);
  const createMockScore = () => {
    const mockScore: ScoreCalculation = {
      id: 'test-result-1',
      userId: 'test-user',
      profile: {
        name: 'Test User',
        age: 30,
        gender: 'Male',
        nationality: 'UAE National',
        children: 'Yes',
        employmentStatus: 'Employed Full-time',
        employmentSector: 'Banking & Finance',
        incomeRange: '20000-30000',
        emailAddress: 'test@example.com',
        residence: 'Dubai'
      },
      responses: [],
      totalScore: 72,
      maxPossibleScore: 75,
      pillarScores: [
        {
          pillar: 'income_stream',
          score: 12,
          maxScore: 15,
          percentage: 80,
          interpretation: 'Good'
        },
        {
          pillar: 'monthly_expenses',
          score: 10,
          maxScore: 15,
          percentage: 67,
          interpretation: 'Good'
        },
        {
          pillar: 'savings_habit',
          score: 14,
          maxScore: 15,
          percentage: 93,
          interpretation: 'Excellent'
        },
        {
          pillar: 'debt_management',
          score: 11,
          maxScore: 15,
          percentage: 73,
          interpretation: 'Good'
        },
        {
          pillar: 'retirement_planning',
          score: 13,
          maxScore: 15,
          percentage: 87,
          interpretation: 'Excellent'
        },
        {
          pillar: 'protection',
          score: 12,
          maxScore: 15,
          percentage: 80,
          interpretation: 'Good'
        }
      ],
      subScores: [],
      advice: [
        'Consider increasing your emergency fund to cover 6 months of expenses',
        'Review your investment portfolio for better diversification',
        'Look into additional income streams to improve financial stability'
      ],
      createdAt: new Date(),
      modelVersion: 'v2',
      surveyResponseId: 123
    };

    localStorage.setItem('currentScore', JSON.stringify(mockScore));
    setCurrentScoreData(JSON.stringify(mockScore));
  };

  const createEmptyPillarScore = () => {
    const mockScore: ScoreCalculation = {
      id: 'test-result-2',
      userId: 'test-user',
      profile: {
        name: 'Test User 2',
        age: 25,
        gender: 'Female',
        nationality: 'Expat',
        children: 'No',
        employmentStatus: 'Employed Full-time',
        employmentSector: 'Technology',
        incomeRange: '15000-20000',
        emailAddress: 'test2@example.com',
        residence: 'Abu Dhabi'
      },
      responses: [],
      totalScore: 65,
      maxPossibleScore: 75,
      pillarScores: [], // Empty pillar scores
      subScores: [],
      advice: ['Basic financial advice'],
      createdAt: new Date(),
      modelVersion: 'v2',
      surveyResponseId: 124
    };

    localStorage.setItem('currentScore', JSON.stringify(mockScore));
    setCurrentScoreData(JSON.stringify(mockScore));
  };

  const clearScore = () => {
    localStorage.removeItem('currentScore');
    setCurrentScoreData('No score data');
  };

  const goToResults = () => {
    window.location.href = '/results';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Test Results Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p><strong>This test helps debug the results page:</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>Create mock score data in localStorage</li>
                <li>Test different data scenarios</li>
                <li>Navigate to results page to see if it works</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Button onClick={createMockScore} className="w-full">
                Create Mock Score (With Pillar Scores)
              </Button>
              <Button onClick={createEmptyPillarScore} variant="outline" className="w-full">
                Create Mock Score (Empty Pillar Scores)
              </Button>
              <Button onClick={clearScore} variant="destructive" className="w-full">
                Clear Score Data
              </Button>
              <Button onClick={goToResults} variant="secondary" className="w-full">
                Go to Results Page
              </Button>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Current localStorage data:</strong>
              </p>
              <pre className="text-xs mt-2 overflow-auto">
                {currentScoreData}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}