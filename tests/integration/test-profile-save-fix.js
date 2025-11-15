/**
 * Test to verify the profile save fix is working
 * Run this in browser console to test profile saving
 */

console.log('=== Profile Save Fix Test ===');

// Test authentication state
console.log('\n1. Authentication State Check:');
const adminToken = localStorage.getItem('admin_access_token');
const authToken = localStorage.getItem('auth_token');
const simpleAuthSession = localStorage.getItem('simple_auth_session');

console.log('Admin Token:', adminToken ? 'Present' : 'None');
console.log('Auth Token:', authToken ? 'Present' : 'None');
console.log('Simple Auth Session:', simpleAuthSession ? 'Present' : 'None');

// Clear any stale tokens for guest users
if (adminToken && !simpleAuthSession && !authToken) {
  console.log('\n2. Clearing stale admin token for guest user...');
  localStorage.removeItem('admin_access_token');
  console.log('✅ Admin token cleared');
} else {
  console.log('\n2. No stale tokens to clear');
}

// Test profile data
console.log('\n3. Profile Data Test:');
const testProfile = {
  firstName: 'Test',
  lastName: 'User',
  age: 30,
  gender: 'Male',
  nationality: 'UAE',
  emirate: 'Dubai',
  employmentStatus: 'Employed',
  monthlyIncome: '10000-15000',
  householdSize: 2,
  children: 'No',
  maritalStatus: 'Single'
};

// Save test profile to localStorage (guest mode)
try {
  localStorage.setItem('customer-profile', JSON.stringify(testProfile));
  console.log('✅ Test profile saved to localStorage');
  
  // Verify it can be loaded
  const savedProfile = JSON.parse(localStorage.getItem('customer-profile'));
  if (savedProfile && savedProfile.firstName === 'Test') {
    console.log('✅ Test profile loaded successfully');
  } else {
    console.log('❌ Test profile loading failed');
  }
} catch (error) {
  console.log('❌ Profile save/load error:', error.message);
}

// Test API client authentication check
console.log('\n4. API Client Authentication Check:');
console.log('API thinks user is authenticated:', !!localStorage.getItem('admin_access_token') || !!localStorage.getItem('auth_token'));

// Recommendations
console.log('\n=== Recommendations ===');
console.log('1. Guest users should only save to localStorage');
console.log('2. API calls should only happen for authenticated users');
console.log('3. Clear any stale admin tokens when using guest mode');
console.log('4. Profile saving should work without backend connectivity for guests');

// Test the fix
console.log('\n5. Testing the Fix:');
const isSimpleAuthAuthenticated = !!simpleAuthSession;
const hasApiToken = !!authToken;
const shouldUseApi = isSimpleAuthAuthenticated || hasApiToken;

console.log('Simple Auth Authenticated:', isSimpleAuthAuthenticated);
console.log('Has API Token:', hasApiToken);
console.log('Should Use API:', shouldUseApi);

if (!shouldUseApi) {
  console.log('✅ Guest user detected correctly - will use localStorage only');
} else {
  console.log('ℹ️  Authenticated user detected - will use API');
}

return {
  isGuestUser: !shouldUseApi,
  profileSaveMethod: shouldUseApi ? 'API' : 'localStorage',
  hasStaleTokens: !!adminToken && !simpleAuthSession && !authToken
};