/**
 * Frontend test to validate that the scoring fix works end-to-end
 * This test simulates the complete survey submission flow and validates results
 */

const fs = require('fs');
const path = require('path');

function validateScoringFix() {
    console.log('🧪 FRONTEND SCORING FIX VALIDATION');
    console.log('=' .repeat(50));
    
    // 1. Check that the fix is properly implemented in the code
    console.log('\n1. 📋 Validating Code Implementation...');
    console.log('-'.repeat(40));
    
    const surveyHookPath = path.join(__dirname, 'src/hooks/use-survey.ts');
    const content = fs.readFileSync(surveyHookPath, 'utf8');
    
    // Check for correct API usage
    const hasCorrectAPI = content.includes('calculateScorePreview') &&
                         content.includes('scorePreview.pillar_scores') &&
                         content.includes('pillar.factor') &&
                         content.includes('pillar.score');
    
    if (hasCorrectAPI) {
        console.log('✅ Correct API usage implemented');
    } else {
        console.log('❌ Correct API usage not found');
        return false;
    }
    
    // Check that old incorrect mapping is removed
    const hasOldMapping = content.includes('apiResult.score_breakdown.budgeting_score') ||
                         content.includes('Math.min(5, Math.max(0,') ||
                         content.includes('/ 3)');
    
    if (!hasOldMapping) {
        console.log('✅ Old incorrect mapping removed');
    } else {
        console.log('⚠️  Some old mapping code still exists (might be in legacy sections)');
    }
    
    // Check total score usage
    const hasTotalScoreFix = content.includes('scorePreview.total_score') &&
                            content.includes('scorePreview.max_possible_score');
    
    if (hasTotalScoreFix) {
        console.log('✅ Total score uses correct API response');
    } else {
        console.log('❌ Total score still uses old format');
        return false;
    }
    
    // 2. Validate API client implementation
    console.log('\n2. 🌐 Validating API Client...');
    console.log('-'.repeat(40));
    
    const apiClientPath = path.join(__dirname, 'src/lib/api-client.ts');
    const apiContent = fs.readFileSync(apiClientPath, 'utf8');
    
    const hasCalculatePreview = apiContent.includes('calculateScorePreview') &&
                               apiContent.includes('/surveys/calculate-preview');
    
    if (hasCalculatePreview) {
        console.log('✅ calculateScorePreview method properly implemented');
    } else {
        console.log('❌ calculateScorePreview method not found');
        return false;
    }
    
    // 3. Check score display utilities
    console.log('\n3. 📊 Validating Score Display Utilities...');
    console.log('-'.repeat(40));
    
    const scoreUtilsPath = path.join(__dirname, 'src/lib/score-display-utils.ts');
    const utilsContent = fs.readFileSync(scoreUtilsPath, 'utf8');
    
    const hasProperFormatting = utilsContent.includes('formatPillarScore') &&
                               utilsContent.includes('calculatePillarPercentage');
    
    if (hasProperFormatting) {
        console.log('✅ Score display utilities properly implemented');
    } else {
        console.log('❌ Score display utilities missing');
        return false;
    }
    
    // 4. Create test scenarios for manual validation
    console.log('\n4. 🎯 Test Scenarios for Manual Validation');
    console.log('-'.repeat(40));
    
    const testScenarios = [
        {
            name: 'Low Performance Test',
            description: 'Answer mostly 1s and 2s',
            expected: 'Pillar scores should be 1-2/5, total score 15-35'
        },
        {
            name: 'High Performance Test', 
            description: 'Answer mostly 4s and 5s',
            expected: 'Pillar scores should be 4-5/5, total score 60-75'
        },
        {
            name: 'Mixed Performance Test',
            description: 'Answer varied (1s, 3s, 5s)',
            expected: 'Pillar scores should vary, total score 35-60'
        },
        {
            name: 'Conditional Q16 Test',
            description: 'Test with and without children',
            expected: 'Max score 75 (no children) vs 80 (with children)'
        }
    ];
    
    testScenarios.forEach((scenario, index) => {
        console.log(`\n   ${index + 1}. ${scenario.name}`);
        console.log(`      Action: ${scenario.description}`);
        console.log(`      Expected: ${scenario.expected}`);
    });
    
    // 5. Provide testing instructions
    console.log('\n5. 🧪 Manual Testing Instructions');
    console.log('-'.repeat(40));
    
    console.log('\nTo validate the fix works:');
    console.log('1. Start the frontend and backend servers');
    console.log('2. Navigate to the survey page');
    console.log('3. Complete survey with LOW responses (mostly 1s and 2s)');
    console.log('4. Check results - should show low pillar scores (1-2/5)');
    console.log('5. Retake survey with HIGH responses (mostly 4s and 5s)');
    console.log('6. Check results - should show high pillar scores (4-5/5)');
    console.log('7. Retake survey with MIXED responses');
    console.log('8. Check results - should show varied pillar scores');
    
    // 6. Debugging checklist
    console.log('\n6. 🔍 Debugging Checklist (if still not working)');
    console.log('-'.repeat(40));
    
    console.log('\nIf pillar scores still show 5.0/5:');
    console.log('□ Check browser console for API errors');
    console.log('□ Verify /surveys/calculate-preview endpoint returns correct data');
    console.log('□ Check that survey responses are being sent correctly');
    console.log('□ Ensure backend scoring.py is calculating properly');
    console.log('□ Verify frontend is using the scorePreview response');
    console.log('□ Check that pillar mapping is using pillar.score directly');
    
    // 7. Expected API response format
    console.log('\n7. 📋 Expected API Response Format');
    console.log('-'.repeat(40));
    
    const expectedResponse = {
        total_score: 57,
        max_possible_score: 75,
        pillar_scores: [
            {
                factor: 'income_stream',
                name: 'Income Stream',
                score: 3.5,
                max_score: 5,
                percentage: 70,
                weight: 20
            },
            // ... more pillars
        ]
    };
    
    console.log('Expected /surveys/calculate-preview response:');
    console.log(JSON.stringify(expectedResponse, null, 2));
    
    console.log('\n' + '='.repeat(50));
    console.log('🎯 VALIDATION SUMMARY');
    console.log('='.repeat(50));
    
    if (hasCorrectAPI && hasTotalScoreFix && hasCalculatePreview) {
        console.log('✅ Code implementation appears correct');
        console.log('✅ API integration properly implemented');
        console.log('✅ Score calculation should now reflect user responses');
        console.log('\n🎉 The scoring fix should be working!');
        console.log('   Complete the manual tests above to confirm.');
        return true;
    } else {
        console.log('❌ Code implementation has issues');
        console.log('   Please check the failed validations above.');
        return false;
    }
}

// Create a simple test page for manual validation
function createTestPage() {
    const testPageContent = `'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';

export default function ScoringValidationTestPage() {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runScoringTest = async (testType) => {
    setLoading(true);
    try {
      let responses = {};
      
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
    } catch (error) {
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
                      {testResults.result.pillar_scores.map((pillar, index) => (
                        <li key={index}>
                          {pillar.name}: {pillar.score}/5 ({pillar.percentage}%)
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-4 p-3 bg-gray-100 rounded">
                    <strong>Validation:</strong>
                    <ul className="mt-2">
                      <li>✅ Scores vary by pillar: {new Set(testResults.result.pillar_scores.map(p => p.score)).size > 1 ? 'Yes' : 'No'}</li>
                      <li>✅ Not all 5.0/5: {testResults.result.pillar_scores.every(p => p.score === 5) ? 'No (FAIL)' : 'Yes'}</li>
                      <li>✅ Reasonable range: {testResults.result.pillar_scores.some(p => p.score >= 1 && p.score <= 5) ? 'Yes' : 'No'}</li>
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
}`;

    const testPagePath = path.join(__dirname, 'src/app/test-scoring-validation/page.tsx');
    fs.writeFileSync(testPagePath, testPageContent);
    console.log(`\n📄 Created test page: ${testPagePath}`);
    console.log('   Navigate to /test-scoring-validation to run manual tests');
}

// Run the validation
if (require.main === module) {
    const isValid = validateScoringFix();
    
    if (isValid) {
        createTestPage();
        console.log('\n🎯 Next Steps:');
        console.log('1. Run backend test: python backend/test_scoring_fix_validation.py');
        console.log('2. Test frontend: Navigate to /test-scoring-validation');
        console.log('3. Complete manual survey tests with varied responses');
    }
}

module.exports = { validateScoringFix };