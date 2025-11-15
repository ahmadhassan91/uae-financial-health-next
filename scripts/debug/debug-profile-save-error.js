/**
 * Debug script to identify the profile save error
 * Run this in browser console to diagnose the issue
 */

console.log('=== Profile Save Error Debug ===');

// Check authentication state
console.log('\n1. Authentication State:');
const adminToken = localStorage.getItem('admin_access_token');
const authToken = localStorage.getItem('auth_token');
const simpleAuthSession = localStorage.getItem('simple_auth_session');

console.log('Admin Token:', adminToken ? 'Present' : 'None');
console.log('Auth Token:', authToken ? 'Present' : 'None');
console.log('Simple Auth Session:', simpleAuthSession ? 'Present' : 'None');

// Check if API client thinks user is authenticated
console.log('\n2. API Client State:');
console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');

// Test backend connectivity
console.log('\n3. Backend Connectivity Test:');
const testBackendConnection = async () => {
  try {
    const response = await fetch('http://localhost:8000/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      console.log('✅ Backend is reachable');
      const data = await response.json();
      console.log('Health check response:', data);
    } else {
      console.log('❌ Backend returned error:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Backend connection failed:', error.message);
    console.log('This explains the API error - backend is not running or not accessible');
  }
};

testBackendConnection();

// Check profile data
console.log('\n4. Profile Data:');
const profileData = localStorage.getItem('customer-profile');
if (profileData) {
  try {
    const profile = JSON.parse(profileData);
    console.log('✅ Profile data in localStorage:', profile);
  } catch (error) {
    console.log('❌ Profile data parsing error:', error.message);
  }
} else {
  console.log('ℹ️  No profile data in localStorage');
}

// Recommendations
console.log('\n=== Recommendations ===');
console.log('1. If backend is not running: Start backend server');
console.log('2. If tokens are present for guest user: Clear localStorage');
console.log('3. If profile save fails: Check network tab for actual error');
console.log('4. Guest users should save to localStorage only');

// Clear authentication tokens for guest users
console.log('\n5. Clear Auth Tokens (for guest users):');
if (adminToken || authToken) {
  console.log('⚠️  Found authentication tokens for guest user');
  console.log('Run this to clear them:');
  console.log('localStorage.removeItem("admin_access_token");');
  console.log('localStorage.removeItem("auth_token");');
  console.log('localStorage.removeItem("simple_auth_session");');
} else {
  console.log('✅ No authentication tokens found (correct for guest users)');
}