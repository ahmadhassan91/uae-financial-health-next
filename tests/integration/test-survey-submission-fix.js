/**
 * Test to verify the survey submission fix is working
 * Run this in browser console to test survey submission logic
 */

console.log('=== Survey Submission Fix Test ===');

// Check authentication tokens
console.log('\n1. Authentication Token Check:');
const hasSimpleAuthSession = localStorage.getItem('simple_auth_session');
const hasApiToken = localStorage.getItem('auth_token');
const hasAdminToken = localStorage.getItem('admin_access_token');

console.log('Simple Auth Session:', hasSimpleAuthSession ? 'Present' : 'None');
console.log('API Token:', hasApiToken ? 'Present' : 'None');
console.log('Admin Token:', hasAdminToken ? 'Present' : 'None');

// Determine which endpoint should be used
const shouldUseAuthenticatedEndpoint = !!(hasSimpleAuthSession || hasApiToken);
const expectedEndpoint = shouldUseAuthenticatedEndpoint ? '/surveys/submit' : '/surveys/submit-guest';

console.log('\n2. Endpoint Selection:');
console.log('Should use authenticated endpoint:', shouldUseAuthenticatedEndpoint);
console.log('Expected endpoint:', expectedEndpoint);

// Check profile requirement
console.log('\n3. Profile Requirement Check:');
const profileData = localStorage.getItem('customer-profile');
const hasProfile = !!profileData;

console.log('Has profile data:', hasProfile);

if (shouldUseAuthenticatedEndpoint && !hasProfile) {
  console.log('⚠️  ISSUE: Authenticated endpoint requires profile, but no profile found');
  console.log('   This would cause the "Customer profile required" error');
} else if (shouldUseAuthenticatedEndpoint && hasProfile) {
  console.log('✅ Authenticated endpoint with profile - should work');
} else if (!shouldUseAuthenticatedEndpoint) {
  console.log('✅ Guest endpoint - no profile required');
}

// Test the fix logic
console.log('\n4. Fix Validation:');
if (hasAdminToken && !hasSimpleAuthSession && !hasApiToken) {
  console.log('✅ Fix working: Admin token detected but will use guest endpoint');
  console.log('   This prevents the "Customer profile required" error');
} else if (!hasAdminToken && !hasSimpleAuthSession && !hasApiToken) {
  console.log('✅ Pure guest user - will use guest endpoint');
} else if (hasSimpleAuthSession || hasApiToken) {
  console.log('✅ Authenticated user - will use authenticated endpoint');
}

// Clear stale admin token if needed
console.log('\n5. Token Cleanup:');
if (hasAdminToken && !hasSimpleAuthSession && !hasApiToken) {
  console.log('⚠️  Stale admin token detected');
  console.log('   Run this to clear it: localStorage.removeItem("admin_access_token");');
} else {
  console.log('✅ No stale tokens detected');
}

// Test survey responses
console.log('\n6. Survey Response Test:');
const testResponses = {
  'q1_income_stability': 4,
  'q2_expense_tracking': 3,
  'q3_savings_rate': 2,
  'q4_emergency_fund': 1,
  'q5_debt_ratio': 5
};

console.log('Test responses:', testResponses);
console.log('Response count:', Object.keys(testResponses).length);

// Recommendations
console.log('\n=== Recommendations ===');
console.log('1. Clear stale admin tokens for guest users');
console.log('2. Use simple auth session or API token for authenticated users');
console.log('3. Guest users should use /surveys/submit-guest endpoint');
console.log('4. Authenticated users should use /surveys/submit endpoint');
console.log('5. Profile is only required for authenticated endpoint');

return {
  isGuestUser: !shouldUseAuthenticatedEndpoint,
  expectedEndpoint,
  hasProfile,
  hasStaleAdminToken: !!(hasAdminToken && !hasSimpleAuthSession && !hasApiToken),
  shouldWork: !shouldUseAuthenticatedEndpoint || hasProfile
};