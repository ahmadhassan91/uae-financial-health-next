/**
 * Debug script to test the exact API call that's failing
 */

// Simulate the same environment as the frontend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

console.log('🔍 Debugging API Call');
console.log(`API_BASE_URL: ${API_BASE_URL}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

// Test the exact same request that the frontend makes
async function debugApiCall() {
  const url = `${API_BASE_URL}/surveys/submit-guest`;
  
  console.log(`\n📡 Making request to: ${url}`);
  
  const surveyData = {
    responses: {
      q1: 3,
      q2: 4,
      q3: 2,
      q4: 5,
      q5: 3,
      q6: 4,
      q7: 2,
      q8: 3,
      q9: 4,
      q10: 3,
      q11: 2,
      q12: 4,
      q13: 3,
      q14: 2,
      q15: 4
    },
    completion_time: undefined
  };
  
  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(surveyData)
  };
  
  console.log('Request config:', {
    method: config.method,
    headers: config.headers,
    bodyLength: config.body.length
  });
  
  try {
    console.log('\n⏳ Sending request...');
    const response = await fetch(url, config);
    
    console.log(`✅ Response received:`);
    console.log(`  Status: ${response.status} ${response.statusText}`);
    console.log(`  Headers:`);
    
    for (const [key, value] of response.headers.entries()) {
      console.log(`    ${key}: ${value}`);
    }
    
    if (response.ok) {
      const data = await response.json();
      console.log(`  Response data keys: ${Object.keys(data)}`);
      
      if (data.score_breakdown) {
        console.log(`  Total score: ${data.score_breakdown.overall_score}`);
      }
    } else {
      const errorText = await response.text();
      console.log(`  Error response: ${errorText}`);
    }
    
  } catch (error) {
    console.log(`❌ Request failed:`);
    console.log(`  Error type: ${error.constructor.name}`);
    console.log(`  Error message: ${error.message}`);
    console.log(`  Error stack: ${error.stack}`);
    
    // Additional debugging for network errors
    if (error.message.includes('fetch')) {
      console.log('\n🔍 Network debugging:');
      console.log(`  - Check if backend is running on ${API_BASE_URL}`);
      console.log(`  - Check if frontend port is allowed in CORS`);
      console.log(`  - Check network connectivity`);
    }
  }
}

// Check if we're in a browser or Node.js environment
if (typeof window !== 'undefined') {
  // Browser environment
  console.log('🌐 Running in browser environment');
  debugApiCall();
} else {
  // Node.js environment - need to use node-fetch
  console.log('🖥️  Running in Node.js environment');
  
  // Try to use node-fetch if available
  try {
    const fetch = require('node-fetch');
    debugApiCall();
  } catch (e) {
    console.log('❌ node-fetch not available. Install with: npm install node-fetch');
    console.log('Or run this script in a browser environment.');
  }
}