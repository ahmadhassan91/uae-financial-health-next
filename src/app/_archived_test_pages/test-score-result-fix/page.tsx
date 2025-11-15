'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreResult } from '@/components/ScoreResult';
import { ScoreCalculation } from '@/lib/types';

export default function TestScoreResultFixPage() {
  const [testCase, setTestCase] = useState<string>('normal');

  // Test cases
  const testCases = {
    normal: {
      id: 'test-1',
      userId: 'user-1',
      profile: {
        name: 'Test User',
        age: 30,
        gender: 'Male' as const,
        nationality: 'UAE National',
        children: 'Yes' as const,
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
          pillar: 'income_stream' as const,
          score: 12,
          maxScore: 15,
          percentage: 80,
          interpretation: 'Good' as const
        },
        {
          pillar: 'savings_habit' as const,
          score: 14,
          maxScore: 15,
          percentage: 93,
          interpretation: 'Excellent' as const
        }
      ],
      subScores: [],
      advice: [
        'Consider increasing your emergency fund to cover 6 months of expenses',
        'Review your investment portfolio for better diversification',
        'Look into additional income streams to improve financial stability'
      ],
      createdAt: new Date(),
      modelVersion: 'v2' as const,
      surveyResponseId: 123
    },
    emptyPillars: {
      id: 'test-2',
      userId: 'user-2',
      profile: {
        name: 'Test User 2',
        age: 25,
        gender: 'Female' as const,
        nationality: 'Expat',
        children: 'No' as const,
        employmentStatus: 'Employed Full-time',
        employmentSector: 'Technology',
        incomeRange: '15000-20000',
        emailAddress: 'test2@example.com',
        residence: 'Abu Dhabi'
      },
      responses: [],
      totalScore: 65,
      maxPossibleScore: 75,
      pillarScores: [],
      subScores: [],
      advice: [],
      createdAt: new Date(),
      modelVersion: 'v2' as const,
      surveyResponseId: 124
    },
    nullData: null
  };

  const handleRetake = () => {
    console.log('Retake clicked');
  };

  const handleViewHistory = () => {
    console.log('View history clicked');
  };

  const currentTestData = testCases[testCase as keyof typeof testCases] as ScoreCalculation | null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="container mx-auto max-w-6xl py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Score Result Component Fix Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Current Test Case:</strong> {testCase}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={testCase === 'normal' ? 'default' : 'outline'}
                onClick={() => setTestCase('normal')}
              >
                Normal Data
              </Button>
              <Button 
                variant={testCase === 'emptyPillars' ? 'default' : 'outline'}
                onClick={() => setTestCase('emptyPillars')}
              >
                Empty Pillars
              </Button>
              <Button 
                variant={testCase === 'nullData' ? 'default' : 'outline'}
                onClick={() => setTestCase('nullData')}
              >
                Null Data
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              <p><strong>This test verifies:</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>ScoreResult component handles normal data correctly</li>
                <li>Component gracefully handles empty pillarScores array</li>
                <li>Component handles null/undefined scoreCalculation</li>
                <li>No runtime errors or crashes</li>
                <li>Proper fallback messages for missing data</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Score Result Component */}
        <ScoreResult 
          scoreCalculation={currentTestData}
          onRetake={handleRetake}
          onViewHistory={handleViewHistory}
        />
      </div>
    </div>
  );
}