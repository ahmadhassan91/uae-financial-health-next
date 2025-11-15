#!/usr/bin/env node
/**
 * Test script for Financial Clinic API service functions
 * Tests the new API-based approach (no hardcoded questions)
 * 
 * Run this after starting the backend:
 * 1. cd backend && python3 -m uvicorn app.main:app --reload
 * 2. node frontend/test-financial-clinic-api.js
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:8000';

// Test 1: Fetch questions without children
async function testFetchQuestionsNoChildren() {
  console.log('\n🧪 Test 1: Fetch questions (no children)');
  try {
    const response = await fetch(`${API_BASE_URL}/financial-clinic/questions?has_children=false`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const questions = await response.json();
    console.log(`✅ Received ${questions.length} questions`);
    console.log(`   Expected: 15 questions (Q16 excluded)`);
    console.log(`   Has Q16: ${questions.some(q => q.id === 'fc_q16') ? 'YES ❌' : 'NO ✅'}`);
    
    return questions.length === 15 && !questions.some(q => q.id === 'fc_q16');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Test 2: Fetch questions with children
async function testFetchQuestionsWithChildren() {
  console.log('\n🧪 Test 2: Fetch questions (with children)');
  try {
    const response = await fetch(`${API_BASE_URL}/financial-clinic/questions?has_children=true`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const questions = await response.json();
    console.log(`✅ Received ${questions.length} questions`);
    console.log(`   Expected: 16 questions (Q16 included)`);
    console.log(`   Has Q16: ${questions.some(q => q.id === 'fc_q16') ? 'YES ✅' : 'NO ❌'}`);
    
    return questions.length === 16 && questions.some(q => q.id === 'fc_q16');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Test 3: Calculate score
async function testCalculateScore() {
  console.log('\n🧪 Test 3: Calculate score (all 4s)');
  try {
    const answers = {};
    for (let i = 1; i <= 15; i++) {
      answers[`fc_q${i}`] = 4; // All "Good" answers
    }
    
    const payload = {
      answers,
      profile: {
        nationality: 'UAE',
        gender: 'Female',
        children: 0
      }
    };
    
    const response = await fetch(`${API_BASE_URL}/financial-clinic/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP ${response.status}: ${errorData.detail || response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`✅ Score calculated: ${result.total_score}/100`);
    console.log(`   Status: ${result.status_band}`);
    console.log(`   Expected: 80/100 (Good status)`);
    console.log(`   Insights: ${result.insights?.length || 0} insights`);
    console.log(`   Products: ${result.products?.length || 0} products`);
    
    return result.total_score === 80 && result.status_band === 'Good';
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Test 4: Submit survey
async function testSubmitSurvey() {
  console.log('\n🧪 Test 4: Submit survey');
  try {
    const answers = {};
    for (let i = 1; i <= 16; i++) {
      answers[`fc_q${i}`] = 5; // All excellent answers
    }
    
    const payload = {
      answers,
      profile: {
        nationality: 'UAE',
        gender: 'Female',
        children: 2
      }
    };
    
    const response = await fetch(`${API_BASE_URL}/financial-clinic/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP ${response.status}: ${errorData.detail || response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`✅ Survey submitted successfully`);
    console.log(`   Survey ID: ${result.survey_response_id || 'null (TODO: save to DB)'}`);
    console.log(`   Score: ${result.total_score}/100`);
    console.log(`   Status: ${result.status_band}`);
    console.log(`   Expected: 100/100 (Excellent)`);
    
    // Pass test if score is correct (ID will be null until DB save is implemented)
    return result.total_score === 100 && result.status_band === 'Excellent';
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🚀 Financial Clinic API Service Tests');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Backend: ${API_BASE_URL}`);
  
  const results = [
    await testFetchQuestionsNoChildren(),
    await testFetchQuestionsWithChildren(),
    await testCalculateScore(),
    await testSubmitSurvey()
  ];
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`📊 Results: ${passed}/${total} tests passed`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (passed === total) {
    console.log('✅ All tests passed! Frontend API service is ready.\n');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Check backend connectivity.\n');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('\n💥 Fatal error:', error.message);
  process.exit(1);
});
