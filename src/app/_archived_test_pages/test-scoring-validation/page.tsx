'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';

export default function ScoringValidationTestPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runScoringTest = async (testType: string) => {
    setLoading(true);
    try {
      let responses: Record<string, number> = {};
      
      switch (testType) {
        case 'low':
          // All low responses (1s and 2s)
          responses = {
            'q1_income_stability': 1,
            'q2_income_sources': 2,
            'q3_living_expenses': 1,
            'q4_budget_tracking': 2,
            'q5_spending_control': 1,
            'q6_expense_review': 2,
            'q7_savings_rate': 1,
            'q8_emergency_fund': 2,
            'q9_savings_optimization': 1,
            'q10_payment_history': 2,
            'q11_debt_ratio': 1,
            'q12_credit_score': 2,
            'q13_retirement_planning': 1,
            'q14_insurance_coverage': 2,
            'q15_financial_planning': 1
          };
          break;
        case 'high':
          // All high responses (4s and 5s)
          responses = {
            'q1_income_stability': 5,
            'q2_income_sources': 4,
            'q3_living_expenses': 5,
            'q4_budget_tracking': 4,
            'q5_spending_control': 5,
            'q6_expense_review': 4,
            'q7_savings_rate': 5,
            'q8_emergency_fund': 4,
            'q9_savings_optimization': 5,
            'q10_payment_history': 4,
            'q11_debt_ratio': 5,
            'q12_credit_score': 4,
            'q13_retirement_planning': 5,
            'q14_insurance_coverage': 4,
            'q15_financial_planning': 5
          };
          break;
        case 'mixed':
          // Mixed responses
          responses = {
            'q1_income_stability': 2,
            'q2_income_sources': 4,
            'q3_living_expenses': 3,
            'q4_budget_tracking': 1,
            'q5_spending_control': 5,
            'q6_expense_review': 2,
            'q7_savings_rate': 4,
            'q8_emergency_fund': 3,
            'q9_savings_optimization': 1,
            'q10_payment_history': 5,
            'q11_debt_ratio': 2,
            'q12_credit_score': 4,
            'q13_retirement_planning': 3,
            'q14_insurance_coverage': 1,
            'q15_financial_planning': 5
          };
          break;
      }

      const result = await apiClient.calculateScorePreview({
        responses,
        profile: null
      });

      setTestResults({ type: testType, result });
    } catch (error: any) {
      console.error('Test failed:', error);
      setTestResults({ type: testType, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Scoring Fix Validation Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Button onClick={() => runScoringTest('low')} disabled={loading}>
              Test Low Scores
            </Button>
            <Button onClick={() => runScoringTest('high')} disabled={loading}>
              Test High Scores
            </Button>
            <Button onClick={() => runScoringTest('mixed')} disabled={loading}>
              Test Mixed Scores
            </Button>
          </div>

          {loading && <p>Running test...</p>}

          {testResults && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">
                Test Results: {testResults.type.toUpperCase()}
              </h3>
              
              {testResults.error ? (
                <div className="text-red-600">Error: {testResults.error}</div>
              ) : (
                <div className="space-y-2">
                  <p><strong>Total Score:</strong> {testResults.result.total_score}</p>
                  <p><strong>Max Possible:</strong> {testResults.result.max_possible_score}</p>
                  
                  <div>
                    <strong>Pillar Scores:</strong>
                    <ul className="ml-4 mt-2">
                      {testResults.result.pillar_scores.map((pillar: any, index: number) => (
                        <li key={index}>
                          {pillar.name}: {pillar.score}/5 ({pillar.percentage}%)
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-4 p-3 bg-gray-100 rounded">
                    <strong>Validation:</strong>
                    <ul className="mt-2">
                      <li>✅ Scores vary by pillar: {new Set(testResults.result.pillar_scores.map((p: any) => p.score)).size > 1 ? 'Yes' : 'No'}</li>
                      <li>✅ Not all 5.0/5: {testResults.result.pillar_scores.every((p: any) => p.score === 5) ? 'No (FAIL)' : 'Yes'}</li>
                      <li>✅ Reasonable range: {testResults.result.pillar_scores.some((p: any) => p.score >= 1 && p.score <= 5) ? 'Yes' : 'No'}</li>
                    </ul>
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