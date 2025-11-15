/**
 * Test admin login with the fixed credentials
 */

const API_URL = 'https://uae-financial-health-filters-68ab0c8434cb.herokuapp.com';

async function testAdminLogin() {
  console.log('Testing admin login...');
  console.log(`API URL: ${API_URL}`);
  
  try {
    // Test login
    console.log('\n1. Testing admin login...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@nationalbonds.ae',
        password: 'admin123'
      }),
    });
    
    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      throw new Error(`Login failed: ${loginResponse.status} - ${errorData.detail}`);
    }
    
    const tokenData = await loginResponse.json();
    console.log('✅ Login successful!');
    console.log('Token received:', tokenData.access_token ? 'Yes' : 'No');
    
    // Test getting user info
    console.log('\n2. Testing user info retrieval...');
    const userResponse = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });
    
    if (!userResponse.ok) {
      throw new Error(`User info failed: ${userResponse.status}`);
    }
    
    const userData = await userResponse.json();
    console.log('✅ User info retrieved successfully!');
    console.log('User details:', {
      email: userData.email,
      is_admin: userData.is_admin,
      is_active: userData.is_active
    });
    
    if (userData.is_admin) {
      console.log('✅ Admin privileges confirmed!');
    } else {
      console.log('❌ Admin privileges not found!');
    }
    
    console.log('\n🎉 Admin login test completed successfully!');
    console.log('The admin credentials are working correctly.');
    
  } catch (error) {
    console.error('\n❌ Admin login test failed:');
    console.error(error.message);
  }
}

// Run the test
testAdminLogin();