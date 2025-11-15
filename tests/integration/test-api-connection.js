/**
 * Simple test to verify API connection and CORS configuration
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function testApiConnection() {
  console.log('🔗 Testing API Connection');
  console.log(`API Base URL: ${API_BASE_URL}`);
  
  try {
    // Test 1: Health check endpoint (GET request, no CORS preflight)
    console.log('\n1. Testing health check endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check successful:', healthData);
    } else {
      console.log('❌ Health check failed:', healthResponse.status, healthResponse.statusText);
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
  }

  try {
    // Test 2: OPTIONS request to submit-guest endpoint
    console.log('\n2. Testing OPTIONS preflight request...');
    const optionsResponse = await fetch(`${API_BASE_URL}/surveys/submit-guest`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('OPTIONS Response Status:', optionsResponse.status);
    console.log('OPTIONS Response Headers:');
    for (const [key, value] of optionsResponse.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    if (optionsResponse.ok) {
      console.log('✅ OPTIONS preflight successful');
    } else {
      console.log('❌ OPTIONS preflight failed');
    }
  } catch (error) {
    console.log('❌ OPTIONS preflight error:', error.message);
  }

  try {
    // Test 3: Simple POST request to submit-guest endpoint
    console.log('\n3. Testing POST request to submit-guest...');
    
    const testSurveyData = {
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
      profile: {
        name: "Test User",
        age: 30,
        nationality: "UAE National",
        income_range: "10,000 - 20,000 AED",
        employment_status: "Employed",
        education_level: "Bachelor's Degree",
        marital_status: "Single",
        dependents: 0
      }
    };
    
    const postResponse = await fetch(`${API_BASE_URL}/surveys/submit-guest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify(testSurveyData)
    });
    
    console.log('POST Response Status:', postResponse.status);
    console.log('POST Response Headers:');
    for (const [key, value] of postResponse.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    if (postResponse.ok) {
      const responseData = await postResponse.json();
      console.log('✅ POST request successful');
      console.log('Response data keys:', Object.keys(responseData));
    } else {
      const errorText = await postResponse.text();
      console.log('❌ POST request failed');
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.log('❌ POST request error:', error.message);
  }
}

// Check if we're in Node.js environment
if (typeof window === 'undefined') {
  // Node.js environment - use node-fetch
  const fetch = require('node-fetch');
  testApiConnection().catch(console.error);
} else {
  // Browser environment
  testApiConnection().catch(console.error);
}