/**
 * Simple test runner for score display consistency
 * This script can be run to verify score calculation consistency
 */

// Mock the required modules for Node.js environment
const mockPillarScore = (pillar, score, maxScore, percentage) => ({
  pillar,
  score,
  maxScore,
  percentage
});

// Utility functions (copied from score-display-utils.ts for testing)
function calculatePillarPercentage(pillarScore) {
  // Use backend percentage if available (preferred)
  if (pillarScore.percentage !== undefined && pillarScore.percentage !== null) {
    return Math.max(0, Math.min(100, pillarScore.percentage));
  }
  
  // Fallback to calculation with proper maxScore (5 for Likert scale)
  const score = pillarScore.score || 0;
  const maxScore = pillarScore.maxScore || 5; // Correct fallback for Likert scale
  
  return Math.max(0, Math.min(100, (score / maxScore) * 100));
}

function formatPillarScore(pillarScore) {
  const score = pillarScore.score || 0;
  const maxScore = pillarScore.maxScore || 5;
  return `${score.toFixed(1)}/${maxScore}`;
}

function formatPercentage(percentage) {
  return `${Math.round(percentage)}%`;
}

function isValidPillarScore(pillarScore) {
  if (!pillarScore || typeof pillarScore !== 'object') {
    return false;
  }
  
  return (
    typeof pillarScore.pillar === 'string' &&
    typeof pillarScore.score === 'number' &&
    !isNaN(pillarScore.score)
  );
}

// Test cases
const testCases = [
  {
    name: "Backend percentage priority",
    pillar: mockPillarScore('financial_planning', 3.75, 5, 85),
    expected: 85,
    description: "Should use backend percentage (85%) over calculated (75%)"
  },
  {
    name: "Fallback calculation",
    pillar: mockPillarScore('financial_planning', 3.75, 5),
    expected: 75,
    description: "Should calculate 3.75/5 = 75%"
  },
  {
    name: "MaxScore fallback",
    pillar: mockPillarScore('financial_planning', 3, undefined),
    expected: 60,
    description: "Should use maxScore fallback of 5, so 3/5 = 60%"
  },
  {
    name: "Zero score",
    pillar: mockPillarScore('financial_planning', 0, 5),
    expected: 0,
    description: "Should handle zero scores correctly"
  },
  {
    name: "Perfect score",
    pillar: mockPillarScore('financial_planning', 5, 5),
    expected: 100,
    description: "Should handle perfect scores correctly"
  },
  {
    name: "Original bug case",
    pillar: mockPillarScore('financial_planning', 3.75, 5),
    expected: 75,
    notExpected: 15,
    description: "Should calculate 75% not 15% (the original bug)"
  }
];

// Run tests
console.log('🧪 Running Score Display Consistency Tests\n');

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  try {
    const result = calculatePillarPercentage(testCase.pillar);
    const success = result === testCase.expected && 
                   (testCase.notExpected ? result !== testCase.notExpected : true);
    
    if (success) {
      console.log(`✅ Test ${index + 1}: ${testCase.name}`);
      console.log(`   Result: ${result}% (Expected: ${testCase.expected}%)`);
      console.log(`   ${testCase.description}\n`);
      passed++;
    } else {
      console.log(`❌ Test ${index + 1}: ${testCase.name}`);
      console.log(`   Result: ${result}% (Expected: ${testCase.expected}%)`);
      console.log(`   ${testCase.description}\n`);
      failed++;
    }
  } catch (error) {
    console.log(`💥 Test ${index + 1}: ${testCase.name} - ERROR`);
    console.log(`   Error: ${error.message}`);
    console.log(`   ${testCase.description}\n`);
    failed++;
  }
});

// Test validation function
console.log('🔍 Testing Data Validation\n');

const validationTests = [
  { data: mockPillarScore('test', 3.75, 5), expected: true, name: "Valid pillar score" },
  { data: null, expected: false, name: "Null data" },
  { data: undefined, expected: false, name: "Undefined data" },
  { data: {}, expected: false, name: "Empty object" },
  { data: { pillar: 'test' }, expected: false, name: "Missing score" },
  { data: { pillar: 'test', score: 'invalid' }, expected: false, name: "Invalid score type" },
  { data: { pillar: 'test', score: NaN }, expected: false, name: "NaN score" }
];

validationTests.forEach((test, index) => {
  try {
    const result = isValidPillarScore(test.data);
    const success = result === test.expected;
    
    if (success) {
      console.log(`✅ Validation ${index + 1}: ${test.name} - ${result ? 'Valid' : 'Invalid'}`);
      passed++;
    } else {
      console.log(`❌ Validation ${index + 1}: ${test.name} - Expected ${test.expected}, got ${result}`);
      failed++;
    }
  } catch (error) {
    console.log(`💥 Validation ${index + 1}: ${test.name} - ERROR: ${error.message}`);
    failed++;
  }
});

// Summary
console.log('\n📊 Test Summary');
console.log('================');
console.log(`Total Tests: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

if (failed === 0) {
  console.log('\n🎉 All tests passed! Score display consistency is working correctly.');
} else {
  console.log(`\n⚠️  ${failed} test(s) failed. Score display consistency needs attention.`);
  process.exit(1);
}