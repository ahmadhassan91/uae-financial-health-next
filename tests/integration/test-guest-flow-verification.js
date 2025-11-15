/**
 * Test to verify guest results access is working correctly
 * Run this in browser console on the results page
 */

console.log('=== Guest Results Access Verification ===');

// Test 1: Check if we're on the results page
console.log('\n1. Page Location Check:');
console.log(`Current URL: ${window.location.href}`);
console.log(`Path: ${window.location.pathname}`);

if (window.location.pathname === '/results') {
  console.log('✅ On results page');
} else {
  console.log('❌ Not on results page - navigate to /results first');
}

// Test 2: Check localStorage for score data
console.log('\n2. Score Data Check:');
const storedScore = localStorage.getItem('currentScore');
if (storedScore) {
  try {
    const scoreData = JSON.parse(storedScore);
    console.log('✅ Score data found in localStorage');
    console.log(`Total Score: ${scoreData.totalScore}`);
    console.log(`Pillar Count: ${scoreData.pillarScores?.length || 0}`);
    
    if (scoreData.totalScore && scoreData.pillarScores?.length > 0) {
      console.log('✅ Score data is complete');
    } else {
      console.log('⚠️  Score data may be incomplete');
    }
  } catch (error) {
    console.log('❌ Score data parsing error:', error.message);
  }
} else {
  console.log('❌ No score data found - complete survey first');
  console.log('To test: Complete survey at /consent → /profile → /survey');
}

// Test 3: Check for authentication state
console.log('\n3. Authentication State:');
const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
const userSession = localStorage.getItem('simple_auth_session');

if (!authToken && !userSession) {
  console.log('✅ User is in guest mode (not authenticated)');
} else {
  console.log('ℹ️  User appears to be authenticated');
}

// Test 4: Check page content
console.log('\n4. Page Content Check:');
const hasScoreDisplay = document.querySelector('h1') && 
  document.querySelector('h1').textContent.includes('Financial Health Score');
const hasLoginForm = document.querySelector('input[type="email"]') || 
  document.querySelector('form');
const hasErrorMessage = document.querySelector('h1') && 
  document.querySelector('h1').textContent.includes('No Results Available');

if (hasScoreDisplay) {
  console.log('✅ Score results are displayed');
} else if (hasErrorMessage) {
  console.log('ℹ️  "No Results Available" message shown (expected if no score data)');
} else if (hasLoginForm) {
  console.log('⚠️  Login form detected - this may indicate wrong page or missing data');
} else {
  console.log('❓ Page content unclear - check manually');
}

// Test 5: Button functionality check
console.log('\n5. Available Actions:');
const buttons = Array.from(document.querySelectorAll('button'));
const buttonTexts = buttons.map(btn => btn.textContent?.trim()).filter(Boolean);

console.log('Available buttons:', buttonTexts);

const hasViewHistory = buttonTexts.some(text => text.includes('View Score History') || text.includes('History'));
const hasCreateAccount = buttonTexts.some(text => text.includes('Create Account') || text.includes('Register'));
const hasRetake = buttonTexts.some(text => text.includes('Retake') || text.includes('Start Assessment'));

if (hasViewHistory) {
  console.log('✅ "View Score History" button available (should prompt for login)');
}
if (hasCreateAccount) {
  console.log('✅ "Create Account" button available (for guest registration)');
}
if (hasRetake) {
  console.log('✅ "Retake Assessment" button available');
}

// Summary and recommendations
console.log('\n=== Summary ===');
if (storedScore && hasScoreDisplay) {
  console.log('✅ Guest results access is working correctly!');
  console.log('User can see their results without authentication.');
} else if (!storedScore) {
  console.log('ℹ️  No score data - user needs to complete survey first');
  console.log('Expected flow: Home → Start Assessment → Complete Survey → See Results');
} else {
  console.log('⚠️  Issue detected - score data exists but results not showing');
}

console.log('\n=== Common User Confusion ===');
console.log('If user sees login prompt, they likely:');
console.log('1. Clicked "Access Previous Results" instead of "Start Assessment"');
console.log('2. Went to /history instead of /results');
console.log('3. Tried to access features that require authentication');
console.log('4. Don\'t have score data from completing a survey');

return {
  hasScoreData: !!storedScore,
  isOnResultsPage: window.location.pathname === '/results',
  isGuestUser: !authToken && !userSession,
  canSeeResults: hasScoreDisplay,
  needsToCompleteSurvey: !storedScore
};