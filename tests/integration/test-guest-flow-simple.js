/**
 * Simple test to check guest flow implementation
 */

const fs = require('fs');
const path = require('path');

function analyzeGuestFlowImplementation() {
    console.log('🔍 Analyzing Guest Registration Prompt Implementation...\n');
    
    // Check ScoreResult component
    const scoreResultPath = path.join(__dirname, 'src/components/ScoreResult.tsx');
    const scoreResultContent = fs.readFileSync(scoreResultPath, 'utf8');
    
    console.log('1. Checking ScoreResult component for guest detection...');
    
    // Check for guest detection logic
    const hasGuestDetection = scoreResultContent.includes('isGuestUser') || 
                             scoreResultContent.includes('!user') || 
                             scoreResultContent.includes('!apiClient.isAuthenticated()');
    
    console.log(`   Guest detection logic: ${hasGuestDetection ? '✅ Found' : '❌ Missing'}`);
    
    // Check for registration prompt
    const hasRegistrationPrompt = scoreResultContent.includes('registration') && 
                                 (scoreResultContent.includes('Create Account') || 
                                  scoreResultContent.includes('Save Your Results'));
    
    console.log(`   Registration prompt: ${hasRegistrationPrompt ? '✅ Found' : '❌ Missing'}`);
    
    // Check for benefits display
    const hasBenefits = scoreResultContent.includes('track') || 
                       scoreResultContent.includes('history') || 
                       scoreResultContent.includes('progress') ||
                       scoreResultContent.includes('report');
    
    console.log(`   Benefits display: ${hasBenefits ? '✅ Found' : '❌ Missing'}`);
    
    // Check for skip option
    const hasSkipOption = scoreResultContent.includes('skip') || 
                         scoreResultContent.includes('Skip') ||
                         scoreResultContent.includes('Continue as Guest');
    
    console.log(`   Skip option: ${hasSkipOption ? '✅ Found' : '❌ Missing'}`);
    
    console.log('\n2. Checking history page authentication...');
    
    // Check history page
    const historyPath = path.join(__dirname, 'src/app/history/page.tsx');
    const historyContent = fs.readFileSync(historyPath, 'utf8');
    
    const hasAuthCheck = historyContent.includes('isAuthenticated') || 
                        historyContent.includes('showAuthForm');
    
    console.log(`   Authentication check: ${hasAuthCheck ? '✅ Found' : '❌ Missing'}`);
    
    const hasAuthForm = historyContent.includes('SimpleAuthForm') || 
                       historyContent.includes('AuthForm');
    
    console.log(`   Authentication form: ${hasAuthForm ? '✅ Found' : '❌ Missing'}`);
    
    console.log('\n3. Analyzing guest registration card in ScoreResult...');
    
    // Look for the specific registration card implementation
    const registrationCardRegex = /isGuestUser.*?<Card.*?registration.*?<\/Card>/s;
    const hasRegistrationCard = registrationCardRegex.test(scoreResultContent);
    
    console.log(`   Registration card for guests: ${hasRegistrationCard ? '✅ Found' : '❌ Missing'}`);
    
    // Check if the registration card is properly positioned
    const cardPosition = scoreResultContent.indexOf('isGuestUser && (');
    const actionButtonsPosition = scoreResultContent.indexOf('Action Buttons');
    
    if (cardPosition > 0 && actionButtonsPosition > 0) {
        const isBeforeButtons = cardPosition < actionButtonsPosition;
        console.log(`   Card positioned before action buttons: ${isBeforeButtons ? '✅ Yes' : '❌ No'}`);
    }
    
    console.log('\n4. Summary of Issues Found:');
    
    const issues = [];
    
    if (!hasGuestDetection) issues.push('- Missing guest user detection logic');
    if (!hasRegistrationPrompt) issues.push('- Missing registration prompt for guests');
    if (!hasBenefits) issues.push('- Missing benefits display in registration prompt');
    if (!hasSkipOption) issues.push('- Missing skip/continue as guest option');
    if (!hasRegistrationCard) issues.push('- Missing registration card in results view');
    
    if (issues.length === 0) {
        console.log('✅ All guest registration prompt features appear to be implemented');
    } else {
        console.log('❌ Issues found:');
        issues.forEach(issue => console.log(issue));
    }
    
    console.log('\n5. Checking actual guest detection logic...');
    
    // Extract the guest detection logic
    const guestDetectionMatch = scoreResultContent.match(/const isGuestUser = ([^;]+);/);
    if (guestDetectionMatch) {
        console.log(`   Guest detection logic: ${guestDetectionMatch[1]}`);
        
        // Check if it's comprehensive
        const logic = guestDetectionMatch[1];
        const checksUser = logic.includes('!user');
        const checksApiAuth = logic.includes('!apiClient.isAuthenticated()');
        
        console.log(`   Checks user state: ${checksUser ? '✅' : '❌'}`);
        console.log(`   Checks API authentication: ${checksApiAuth ? '✅' : '❌'}`);
    } else {
        console.log('   ❌ No guest detection logic found');
    }
}

analyzeGuestFlowImplementation();