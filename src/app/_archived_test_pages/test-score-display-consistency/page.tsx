'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Warning } from '@phosphor-icons/react';
import { ScoreCalculation, PillarScore } from '@/lib/types';
import { PILLAR_DEFINITIONS } from '@/lib/survey-data';
import { 
  calculatePillarPercentage, 
  formatPillarScore, 
  formatPercentage, 
  getPillarDisplayData,
  isValidPillarScore 
} from '@/lib/score-display-utils';
import { ScoreResult } from '@/components/ScoreResult';
import { ScoreHistory } from '@/components/ScoreHistory';
import { PillarHistogram } from '@/components/admin/PillarHistogram';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: string;
}

interface TestScenario {
  name: string;
  description: string;
  pillarScores: PillarScore[];
  expectedPercentages: number[];
}

export default function ScoreDisplayConsistencyTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Test scenarios with various score conditions
  const testScenarios: TestScenario[] = [
    {
      name: "Perfect Scores",
      description: "All pillars at maximum score (5/5)",
      pillarScores: Object.keys(PILLAR_DEFINITIONS).map(pillar => ({
        pillar,
        score: 5,
        maxScore: 5,
        percentage: 100
      })),
      expectedPercentages: Array(7).fill(100)
    },
    {
      name: "Zero Scores",
      description: "All pillars at minimum score (0/5)",
      pillarScores: Object.keys(PILLAR_DEFINITIONS).map(pillar => ({
        pillar,
        score: 0,
        maxScore: 5,
        percentage: 0
      })),
      expectedPercentages: Array(7).fill(0)
    },
    {
      name: "Mixed Scores",
      description: "Various pillar scores (1-5 range)",
      pillarScores: Object.keys(PILLAR_DEFINITIONS).map((pillar, index) => ({
        pillar,
        score: (index % 5) + 1, // Scores from 1-5
        maxScore: 5,
        percentage: ((index % 5) + 1) * 20 // 20%, 40%, 60%, 80%, 100%
      })),
      expectedPercentages: [20, 40, 60, 80, 100, 20, 40]
    },
    {
      name: "Backend Percentage Priority",
      description: "Backend percentage should override calculated percentage",
      pillarScores: Object.keys(PILLAR_DEFINITIONS).map(pillar => ({
        pillar,
        score: 3.75, // Would calculate to 75%
        maxScore: 5,
        percentage: 85 // Backend says 85%, should use this
      })),
      expectedPercentages: Array(7).fill(85)
    },
    {
      name: "Missing Backend Percentage",
      description: "Should calculate from score/maxScore when percentage is missing",
      pillarScores: Object.keys(PILLAR_DEFINITIONS).map(pillar => ({
        pillar,
        score: 3.75,
        maxScore: 5
        // No percentage property - should calculate 75%
      })),
      expectedPercentages: Array(7).fill(75)
    },
    {
      name: "Invalid MaxScore Fallback",
      description: "Should use fallback maxScore of 5 when undefined",
      pillarScores: Object.keys(PILLAR_DEFINITIONS).map(pillar => ({
        pillar,
        score: 3,
        maxScore: undefined as any // Should fallback to 5
      })),
      expectedPercentages: Array(7).fill(60) // 3/5 = 60%
    }
  ];

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: Utility Function Consistency
    results.push(testUtilityFunctions());

    // Test 2: Score Calculation Edge Cases
    results.push(...testScoreCalculationEdgeCases());

    // Test 3: Cross-Component Consistency
    results.push(...testCrossComponentConsistency());

    // Test 4: Data Validation
    results.push(...testDataValidation());

    // Test 5: Scenario-based Testing
    for (const scenario of testScenarios) {
      results.push(testScenario(scenario));
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const testUtilityFunctions = (): TestResult => {
    try {
      // Test calculatePillarPercentage
      const testPillar: PillarScore = {
        pillar: 'financial_planning',
        score: 3.75,
        maxScore: 5,
        percentage: 85
      };

      const calculatedPercentage = calculatePillarPercentage(testPillar);
      if (calculatedPercentage !== 85) {
        return {
          name: "Utility Functions - Backend Percentage Priority",
          passed: false,
          message: `Expected 85%, got ${calculatedPercentage}%`,
          details: "calculatePillarPercentage should prioritize backend percentage"
        };
      }

      // Test fallback calculation
      const testPillarNoPercentage: PillarScore = {
        pillar: 'financial_planning',
        score: 3.75,
        maxScore: 5
      };

      const fallbackPercentage = calculatePillarPercentage(testPillarNoPercentage);
      if (fallbackPercentage !== 75) {
        return {
          name: "Utility Functions - Fallback Calculation",
          passed: false,
          message: `Expected 75%, got ${fallbackPercentage}%`,
          details: "Should calculate percentage from score/maxScore when backend percentage is missing"
        };
      }

      return {
        name: "Utility Functions",
        passed: true,
        message: "All utility functions working correctly"
      };
    } catch (error) {
      return {
        name: "Utility Functions",
        passed: false,
        message: `Error: ${error}`,
        details: "Utility functions threw an error"
      };
    }
  };

  const testScoreCalculationEdgeCases = (): TestResult[] => {
    const results: TestResult[] = [];

    // Test edge cases
    const edgeCases = [
      { score: 0, maxScore: 5, expected: 0, name: "Zero Score" },
      { score: 5, maxScore: 5, expected: 100, name: "Perfect Score" },
      { score: 2.5, maxScore: 5, expected: 50, name: "Half Score" },
      { score: 3.75, maxScore: 5, expected: 75, name: "Decimal Score" },
      { score: 1, maxScore: undefined, expected: 20, name: "Undefined MaxScore" }
    ];

    edgeCases.forEach(testCase => {
      const pillar: PillarScore = {
        pillar: 'test_pillar',
        score: testCase.score,
        maxScore: testCase.maxScore as number
      };

      const percentage = calculatePillarPercentage(pillar);
      const passed = Math.abs(percentage - testCase.expected) < 0.1; // Allow small floating point differences

      results.push({
        name: `Edge Case - ${testCase.name}`,
        passed,
        message: passed 
          ? `Correctly calculated ${testCase.expected}%`
          : `Expected ${testCase.expected}%, got ${percentage}%`,
        details: `Score: ${testCase.score}/${testCase.maxScore || 'undefined'}`
      });
    });

    return results;
  };

  const testCrossComponentConsistency = (): TestResult[] => {
    const results: TestResult[] = [];

    // Create test data
    const testPillarScores: PillarScore[] = Object.keys(PILLAR_DEFINITIONS).map(pillar => ({
      pillar,
      score: 3.75,
      maxScore: 5,
      percentage: 75
    }));

    // Test that all components would display the same percentage
    testPillarScores.forEach(pillarScore => {
      const utilityPercentage = calculatePillarPercentage(pillarScore);
      const displayData = getPillarDisplayData(pillarScore);
      
      const passed = utilityPercentage === displayData.score;
      
      results.push({
        name: `Cross-Component Consistency - ${pillarScore.pillar}`,
        passed,
        message: passed 
          ? "Consistent across utility functions"
          : `Inconsistent: utility=${utilityPercentage}%, display=${displayData.score}%`,
        details: `Testing ${PILLAR_DEFINITIONS[pillarScore.pillar]?.name || pillarScore.pillar}`
      });
    });

    return results;
  };

  const testDataValidation = (): TestResult[] => {
    const results: TestResult[] = [];

    // Test valid pillar score
    const validPillar: PillarScore = {
      pillar: 'financial_planning',
      score: 3.75,
      maxScore: 5
    };

    results.push({
      name: "Data Validation - Valid Pillar",
      passed: isValidPillarScore(validPillar),
      message: isValidPillarScore(validPillar) ? "Valid pillar score detected" : "Failed to validate valid pillar score"
    });

    // Test invalid pillar scores
    const invalidCases = [
      { data: null, name: "Null Data" },
      { data: undefined, name: "Undefined Data" },
      { data: {}, name: "Empty Object" },
      { data: { pillar: 'test' }, name: "Missing Score" },
      { data: { pillar: 'test', score: 'invalid' }, name: "Invalid Score Type" },
      { data: { pillar: 'test', score: NaN }, name: "NaN Score" }
    ];

    invalidCases.forEach(testCase => {
      const isValid = isValidPillarScore(testCase.data);
      results.push({
        name: `Data Validation - ${testCase.name}`,
        passed: !isValid, // Should be invalid
        message: !isValid ? "Correctly rejected invalid data" : "Failed to reject invalid data",
        details: `Testing: ${JSON.stringify(testCase.data)}`
      });
    });

    return results;
  };

  const testScenario = (scenario: TestScenario): TestResult => {
    try {
      const results = scenario.pillarScores.map((pillarScore, index) => {
        const calculatedPercentage = calculatePillarPercentage(pillarScore);
        const expectedPercentage = scenario.expectedPercentages[index];
        return Math.abs(calculatedPercentage - expectedPercentage) < 0.1;
      });

      const allPassed = results.every(result => result);

      return {
        name: `Scenario - ${scenario.name}`,
        passed: allPassed,
        message: allPassed 
          ? "All pillar percentages calculated correctly"
          : "Some pillar percentages were incorrect",
        details: scenario.description
      };
    } catch (error) {
      return {
        name: `Scenario - ${scenario.name}`,
        passed: false,
        message: `Error: ${error}`,
        details: scenario.description
      };
    }
  };

  const getTestIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  const passedTests = testResults.filter(result => result.passed).length;
  const totalTests = testResults.length;
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="container mx-auto max-w-6xl py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Score Display Consistency Test</h1>
          <p className="text-muted-foreground">
            Comprehensive testing of score calculation and display consistency across all components
          </p>
        </div>

        {/* Test Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test Suite</CardTitle>
            <CardDescription>
              Run comprehensive tests to verify score display consistency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  onClick={runTests} 
                  disabled={isRunning}
                  className="flex items-center gap-2"
                >
                  {isRunning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Running Tests...
                    </>
                  ) : (
                    'Run All Tests'
                  )}
                </Button>
                
                {testResults.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant={passRate === 100 ? "default" : passRate >= 80 ? "secondary" : "destructive"}>
                      {passedTests}/{totalTests} Passed ({passRate}%)
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Detailed results of score display consistency tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                    {getTestIcon(result.passed)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{result.name}</h4>
                        <Badge variant={result.passed ? "default" : "destructive"}>
                          {result.passed ? "PASS" : "FAIL"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.message}
                      </p>
                      {result.details && (
                        <p className="text-xs text-muted-foreground mt-2 font-mono">
                          {result.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Summary */}
        {testResults.length > 0 && (
          <Alert className={passRate === 100 ? "border-green-200 bg-green-50" : passRate >= 80 ? "border-yellow-200 bg-yellow-50" : "border-red-200 bg-red-50"}>
            {passRate === 100 ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Warning className="h-4 w-4 text-yellow-600" />
            )}
            <AlertDescription>
              <strong>Test Summary:</strong> {passedTests} out of {totalTests} tests passed ({passRate}% success rate).
              {passRate === 100 ? (
                " All score display components are consistent!"
              ) : passRate >= 80 ? (
                " Most tests passed, but some issues need attention."
              ) : (
                " Multiple issues detected. Score display consistency needs improvement."
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Test Scenarios Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>Test Scenarios</CardTitle>
            <CardDescription>
              Overview of test scenarios covered by this test suite
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {testScenarios.map((scenario, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">{scenario.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {scenario.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}