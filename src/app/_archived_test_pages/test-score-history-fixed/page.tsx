'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreHistory } from '@/components/ScoreHistory';
import { ScoreCalculation } from '@/lib/types';

export default function TestScoreHistoryFixedPage() {
  const [testCase, setTestCase] = useState<string>('working');

  // Test cases with different data scenarios
  const testCases = {
    working: [
      {
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
        totalScore: 68,
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
            pillar: 'monthly_expenses' as const,
            score: 10,
            maxScore: 15,
            percentage: 67,
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
          'Consider increasing your emergency fund',
          'Review your investment portfolio'
        ],
        createdAt: new Date(),
        modelVersion: 'v2' as const,
        surveyResponseId: 123
      }
    ],
    emptyPillars: [
      {
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
        totalScore: 45,
        maxPossibleScore: 75,
        pillarScores: [], // Empty pillar scores - should not crash
        subScores: [],
        advice: ['Basic advice'],
        createdAt: new Date(),
        modelVersion: 'v2' as const,
        surveyResponseId: 124
      }
    ],
    invalidData: [
      {
        id: 'test-3',
        userId: 'user-3',
        profile: {
          name: 'Test User 3',
          age: 40,
          gender: 'Male' as const,
          nationality: 'UAE National',
          children: 'Yes' as const,
          employmentStatus: 'Self-employed',
          employmentSector: 'Business',
          incomeRange: '30000+',
          emailAddress: 'test3@example.com',
          residence: 'Sharjah'
        },
        responses: [],
        totalScore: 0, // Zero score
        maxPossibleScore: 75,
        pillarScores: [
          {
            pillar: 'income_stream' as const,
            score: 0, // Zero scores
            maxScore: 15,
            percentage: 0,
            interpretation: 'At Risk' as const
          }
        ],
        subScores: [],
        advice: [], // Empty advice
        createdAt: new Date(),
        modelVersion: 'v2' as const,
        surveyResponseId: 125
      }
    ]
  };

  const handleBack = () => {
    console.log('Back button clicked');
  };

  const currentTestData = testCases[testCase as keyof typeof testCases] as ScoreCalculation[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="container mx-auto max-w-6xl py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Score History Fixed - Chart Error Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Current Test Case:</strong> {testCase}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={testCase === 'working' ? 'default' : 'outline'}
                onClick={() => setTestCase('working')}
              >
                Working Data
              </Button>
              <Button 
                variant={testCase === 'emptyPillars' ? 'default' : 'outline'}
                onClick={() => setTestCase('emptyPillars')}
              >
                Empty Pillars
              </Button>
              <Button 
                variant={testCase === 'invalidData' ? 'default' : 'outline'}
                onClick={() => setTestCase('invalidData')}
              >
                Invalid/Zero Data
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              <p><strong>This test verifies the chart error fixes:</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>Histogram (BarChart) renders safely with empty/invalid data</li>
                <li>LineChart handles missing data gracefully</li>
                <li>No SVG path errors in console</li>
                <li>Proper fallback messages when no data available</li>
                <li>Score calculation with zero values works</li>
              </ul>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Test Data Summary:</strong>
              </p>
              <ul className="text-xs mt-2">
                <li>Total Scores: {currentTestData.map(d => d.totalScore).join(', ')}</li>
                <li>Pillar Count: {currentTestData.map(d => d.pillarScores?.length || 0).join(', ')}</li>
                <li>Advice Count: {currentTestData.map(d => d.advice?.length || 0).join(', ')}</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Score History Component */}
        <ScoreHistory 
          scoreHistory={currentTestData}
          onBack={handleBack}
          userEmail="test@example.com"
        />
      </div>
    </div>
  );
}