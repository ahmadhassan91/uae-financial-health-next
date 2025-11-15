'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreHistory } from '@/components/ScoreHistory';
import { ScoreCalculation } from '@/lib/types';

export default function TestScoreHistoryEdgeCasesPage() {
  const [testCase, setTestCase] = useState<string>('empty');

  // Different test cases
  const testCases = {
    empty: [],
    singleScore: [
      {
        totalScore: 72,
        pillarScores: [
          { pillar: 'income_stream', score: 4.2 },
          { pillar: 'monthly_expenses', score: 3.8 }
        ],
        advice: ['Test advice'],
        createdAt: new Date().toISOString(),
        surveyResponseId: 'test-1'
      }
    ],
    invalidData: [
      {
        totalScore: undefined,
        pillarScores: null,
        advice: [],
        createdAt: null,
        surveyResponseId: 'invalid-1'
      },
      {
        totalScore: 65,
        pillarScores: [],
        advice: ['Valid advice'],
        createdAt: new Date().toISOString(),
        surveyResponseId: 'valid-1'
      }
    ],
    legacyFormat: [
      {
        totalScore: 70,
        subScores: [
          { factor: 'income_stream', score: 85 },
          { factor: 'monthly_expenses', score: 75 }
        ],
        advice: ['Legacy format advice'],
        createdAt: new Date().toISOString(),
        surveyResponseId: 'legacy-1'
      }
    ],
    mixedFormat: [
      {
        totalScore: 72,
        pillarScores: [
          { pillar: 'income_stream', score: 4.2 }
        ],
        advice: ['New format'],
        createdAt: new Date().toISOString(),
        surveyResponseId: 'new-1'
      },
      {
        totalScore: 68,
        subScores: [
          { factor: 'savings_habit', score: 80 }
        ],
        advice: ['Old format'],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        surveyResponseId: 'old-1'
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
            <CardTitle>Score History Edge Cases Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Current Test Case:</strong> {testCase}
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant={testCase === 'empty' ? 'default' : 'outline'}
                onClick={() => setTestCase('empty')}
              >
                Empty History
              </Button>
              <Button 
                variant={testCase === 'singleScore' ? 'default' : 'outline'}
                onClick={() => setTestCase('singleScore')}
              >
                Single Score
              </Button>
              <Button 
                variant={testCase === 'invalidData' ? 'default' : 'outline'}
                onClick={() => setTestCase('invalidData')}
              >
                Invalid Data
              </Button>
              <Button 
                variant={testCase === 'legacyFormat' ? 'default' : 'outline'}
                onClick={() => setTestCase('legacyFormat')}
              >
                Legacy Format
              </Button>
              <Button 
                variant={testCase === 'mixedFormat' ? 'default' : 'outline'}
                onClick={() => setTestCase('mixedFormat')}
              >
                Mixed Format
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              <p><strong>This test verifies:</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>Empty score history handling</li>
                <li>Single score display</li>
                <li>Invalid/undefined data handling</li>
                <li>Legacy subScores format compatibility</li>
                <li>Mixed old and new format handling</li>
                <li>Histogram data generation safety</li>
                <li>Line chart data filtering</li>
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