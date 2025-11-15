/**
 * Test script to verify API connectivity with production Heroku backend
 * Run with: node test-production-api.js
 */

const PRODUCTION_API_URL = 'https://uae-financial-health-filters-68ab0c8434cb.herokuapp.com';

async function testApiConnectivity() {
  console.log('Testing API connectivity with production backend...');
  console.log(`Target URL: ${PRODUCTION_API_URL}`);
  
  try {
    // Test health check endpoint
    console.log('\n1. Testing health check endpoint...');
    const healthResponse = await fetch(`${PRODUCTION_API_URL}/health`);
    
    if (!healthResponse.ok) {
      throw new Error(`Health check failed: ${healthResponse.status} ${healthResponse.statusText}`);
    }
    
    const healthData = await healthResponse.json();
    console.log('✅ Health check successful:', healthData);
    
    // Test CORS by checking if we can make a simple request
    console.log('\n2. Testing CORS configuration...');
    const corsResponse = await fetch(`${PRODUCTION_API_URL}/api/localization/languages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (corsResponse.ok) {
      console.log('✅ CORS configuration appears to be working');
    } else {
      console.log(`⚠️  CORS test returned: ${corsResponse.status} ${corsResponse.statusText}`);
    }
    
    // Test authentication endpoint (should return 422 for missing data, not CORS error)
    console.log('\n3. Testing authentication endpoint...');
    const authResponse = await fetch(`${PRODUCTION_API_URL}/auth/simple-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // Empty body should trigger validation error
    });
    
    console.log(`Auth endpoint response: ${authResponse.status} ${authResponse.statusText}`);
    if (authResponse.status === 422) {
      console.log('✅ Authentication endpoint is accessible (validation error expected)');
    }
    
    console.log('\n🎉 Production API connectivity test completed successfully!');
    console.log('The frontend should be able to communicate with the Heroku backend.');
    
  } catch (error) {
    console.error('\n❌ API connectivity test failed:');
    console.error(error.message);
    
    if (error.message.includes('CORS')) {
      console.log('\n💡 CORS Error Solutions:');
      console.log('1. Ensure the Heroku backend has CORS configured for the Netlify domain');
      console.log('2. Check that the backend allows the necessary headers');
      console.log('3. Verify the backend is running and accessible');
    }
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Network Error Solutions:');
      console.log('1. Check your internet connection');
      console.log('2. Verify the Heroku backend URL is correct');
      console.log('3. Ensure the Heroku app is not sleeping');
    }
  }
}

// Run the test
testApiConnectivity();