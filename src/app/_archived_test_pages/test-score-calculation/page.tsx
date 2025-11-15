'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestScoreCalculationPage() {
  const [testResult, setTestResult] = useState<any>(null);

  const testBackendResponse = () => {
    // Simulate what the backend returns
    const mockBackendResponse = {
      survey_response: {
        id: 123,
        user_id: 1,
        created_at: new Date().toISOString()
      },
      recommendations: [
        { description: 'Increase your emergency fund' },
        { description: 'Review your investment portfolio' },
        { description: 'Consider debt consolidation' }
      ],
      score_breakdown: {
        overall_score: 68,
        budgeting_score: 12,
        savings_score: 14,
        debt_management_score: 10,
        financial_planning_score: 13,
        investment_knowledge_score: 11,
        risk_tolerance: 'Moderate',
        financial_goals: ['Retirement', 'Emergency Fund']
      }
    };

    // Simulate the conversion logic from use-survey.ts
    const pillarScores = [
      {
        pillar: 'income_stream',
        score: (mockBackendResponse.score_breakdown.budgeting_score || 0) * 0.5,
        maxScore: 15,
        percentage: Math.round((((mockBackendResponse.score_breakdown.budgeting_score || 0) * 0.5) / 15) * 100),
        interpretation: ((mockBackendResponse.score_breakdown.budgeting_score || 0) * 0.5) > 12 ? 'Excellent' :
          ((mockBackendResponse.score_breakdown.budgeting_score || 0) * 0.5) > 9 ? 'Good' :
            ((mockBackendResponse.score_breakdown.budgeting_score || 0) * 0.5) > 6 ? 'Needs Improvement' : 'At Risk'
      },
      {
        pillar: 'monthly_expenses',
        score: mockBackendResponse.score_breakdown.budgeting_score || 0,
        maxScore: 15,
        percentage: Math.round(((mockBackendResponse.score_breakdown.budgeting_score || 0) / 15) * 100),
        interpretation: (mockBackendResponse.score_breakdown.budgeting_score || 0) > 12 ? 'Excellent' :
          (mockBackendResponse.score_breakdown.budgeting_score || 0) > 9 ? 'Good' :
            (mockBackendResponse.score_breakdown.budgeting_score || 0) > 6 ? 'Needs Improvement' : 'At Risk'
      },
      {
        pillar: 'savings_habit',
        score: mockBackendResponse.score_breakdown.savings_score || 0,
        maxScore: 15,
        percentage: Math.round(((mockBackendResponse.score_breakdown.savings_score || 0) / 15) * 100),
        interpretation: (mockBackendResponse.score_breakdown.savings_score || 0) > 12 ? 'Excellent' :
          (mockBackendResponse.score_breakdown.savings_score || 0) > 9 ? 'Good' :
            (mockBackendResponse.score_breakdown.savings_score || 0) > 6 ? 'Needs Improvement' : 'At Risk'
      },
      {
        pillar: 'debt_management',
        score: mockBackendResponse.score_breakdown.debt_management_score || 0,
        maxScore: 15,
        percentage: Math.round(((mockBackendResponse.score_breakdown.debt_management_score || 0) / 15) * 100),
        interpretation: (mockBackendResponse.score_breakdown.debt_management_score || 0) > 12 ? 'Excellent' :
          (mockBackendResponse.score_breakdown.debt_management_score || 0) > 9 ? 'Good' :
            (mockBackendResponse.score_breakdown.debt_management_score || 0) > 6 ? 'Needs Improvement' : 'At Risk'
      },
      {
        pillar: 'retirement_planning',
        score: mockBackendResponse.score_breakdown.financial_planning_score || 0,
        maxScore: 15,
        percentage: Math.round(((mockBackendResponse.score_breakdown.financial_planning_score || 0) / 15) * 100),
        interpretation: (mockBackendResponse.score_breakdown.financial_planning_score || 0) > 12 ? 'Excellent' :
          (mockBackendResponse.score_breakdown.financial_planning_score || 0) > 9 ? 'Good' :
            (mockBackendResponse.score_breakdown.financial_planning_score || 0) > 6 ? 'Needs Improvement' : 'At Risk'
      },
      {
        pillar: 'protection',
        score: (mockBackendResponse.score_breakdown.financial_planning_score || 0) * 0.7,
        maxScore: 15,
        percentage: Math.round((((mockBackendResponse.score_breakdown.financial_planning_score || 0) * 0.7) / 15) * 100),
        interpretation: ((mockBackendResponse.score_breakdown.financial_planning_score || 0) * 0.7) > 12 ? 'Excellent' :
          ((mockBackendResponse.score_breakdown.financial_planning_score || 0) * 0.7) > 9 ? 'Good' :
            ((mockBackendResponse.score_breakdown.financial_planning_score || 0) * 0.7) > 6 ? 'Needs Improvement' : 'At Risk'
      },
      {
        pillar: 'future_planning',
        score: mockBackendResponse.score_breakdown.investment_knowledge_score || 0,
        maxScore: 15,
        percentage: Math.round(((mockBackendResponse.score_breakdown.investment_knowledge_score || 0) / 15) * 100),
        interpretation: (mockBackendResponse.score_breakdown.investment_knowledge_score || 0) > 12 ? 'Excellent' :
          (mockBackendResponse.score_breakdown.investment_knowledge_score || 0) > 9 ? 'Good' :
            (mockBackendResponse.score_breakdown.investment_knowledge_score || 0) > 6 ? 'Needs Improvement' : 'At Risk'
      }
    ];

    const convertedResult = {
      id: mockBackendResponse.survey_response.id.toString(),
      userId: mockBackendResponse.survey_response.user_id.toString(),
      totalScore: mockBackendResponse.score_breakdown.overall_score || 0,
      maxPossibleScore: 75,
      pillarScores,
      advice: mockBackendResponse.recommendations ? mockBackendResponse.recommendations.map((rec: { description: string }) => rec.description) : [],
      createdAt: new Date(mockBackendResponse.survey_response.created_at),
      modelVersion: 'v2' as const,
      surveyResponseId: mockBackendResponse.survey_response.id
    };

    setTestResult({
      backend: mockBackendResponse,
      converted: convertedResult
    });
  };

  const saveToLocalStorage = () => {
    if (testResult?.converted) {
      localStorage.setItem('currentScore', JSON.stringify(testResult.converted));
      alert('Score saved to localStorage! You can now visit /results to see it.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="container mx-auto max-w-6xl py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Score Calculation Conversion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p><strong>This test simulates:</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>Backend API response structure</li>
                <li>Frontend conversion logic</li>
                <li>Pillar score mapping</li>
                <li>Data validation</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button onClick={testBackendResponse}>
                Test Backend Response Conversion
              </Button>
              {testResult && (
                <Button onClick={saveToLocalStorage} variant="outline">
                  Save to localStorage & Test Results Page
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {testResult && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Backend Response</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs overflow-auto bg-muted p-4 rounded">
                  {JSON.stringify(testResult.backend, null, 2)}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Converted Frontend Format</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs overflow-auto bg-muted p-4 rounded">
                  {JSON.stringify(testResult.converted, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}