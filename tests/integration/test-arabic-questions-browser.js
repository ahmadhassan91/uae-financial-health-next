// Test script to run in browser console to verify Arabic questions loading
// Open browser console and paste this script

async function testArabicQuestions() {
  console.log('🧪 Testing Arabic Questions Loading...');
  
  try {
    // Test API endpoint directly
    console.log('📡 Testing API endpoint...');
    const response = await fetch('/api/localization/questions/ar');
    
    if (!response.ok) {
      throw new Error(`API failed: ${response.status} ${response.statusText}`);
    }
    
    const questions = await response.json();
    console.log(`✅ API returned ${questions.length} questions`);
    
    // Check first few questions
    console.log('📋 First 3 questions:');
    questions.slice(0, 3).forEach((q, i) => {
      console.log(`${i + 1}. ${q.id}: ${q.text}`);
      console.log(`   Options: ${q.options?.length || 0} available`);
      if (q.options && q.options.length > 0) {
        console.log(`   First option: ${q.options[0].label}`);
      }
    });
    
    // Check for Q16 (children planning)
    const q16 = questions.find(q => q.id === 'q16_children_planning');
    if (q16) {
      console.log('✅ Q16 (children planning) found:', q16.text);
    } else {
      console.log('❌ Q16 (children planning) not found');
    }
    
    // Test question structure
    const sampleQuestion = questions[0];
    console.log('🔍 Sample question structure:', {
      id: sampleQuestion.id,
      text: sampleQuestion.text?.substring(0, 50) + '...',
      optionsCount: sampleQuestion.options?.length,
      factor: sampleQuestion.factor,
      weight: sampleQuestion.weight,
      type: sampleQuestion.type,
      required: sampleQuestion.required
    });
    
    return questions;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return null;
  }
}

// Run the test
testArabicQuestions().then(questions => {
  if (questions) {
    console.log('🎉 Arabic questions test completed successfully!');
    console.log('💡 You can access the questions data via: window.testQuestions');
    window.testQuestions = questions;
  } else {
    console.log('💥 Arabic questions test failed!');
  }
});

console.log('🚀 Arabic questions test started...');