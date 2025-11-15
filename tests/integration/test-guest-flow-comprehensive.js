/**
 * Comprehensive test of guest registration flow
 */

const fs = require('fs');
const path = require('path');

function testGuestFlow() {
    console.log('🧪 Comprehensive Guest Flow Test\n');
    
    // 1. Verify ScoreResult component implementation
    console.log('1. 📋 Checking ScoreResult Implementation...');
    
    const scoreResultPath = path.join(__dirname, 'src/components/ScoreResult.tsx');
    const scoreResultContent = fs.readFileSync(scoreResultPath, 'utf8');
    
    // Check guest detection
    const guestDetectionMatch = scoreResultContent.match(/const isGuestUser = ([^;]+);/);
    if (guestDetectionMatch) {
        console.log(`   ✅ Guest detection: ${guestDetectionMatch[1]}`);
    } else {
        console.log('   ❌ No guest detection found');
        return;
    }
    
    // Check registration card
    const registrationCardMatch = scoreResultContent.match(/\{isGuestUser && \(([\s\S]*?)<\/Card>\s*\)\}/);
    if (registrationCardMatch) {
        console.log('   ✅ Registration card found');
        
        const cardContent = registrationCardMatch[1];
        
        // Check for required elements
        const hasTitle = cardContent.includes('Save Your Results') || cardContent.includes('Create Account');
        const hasBenefits = cardContent.includes('track your progress') || cardContent.includes('assessment history');
        const hasButton = cardContent.includes('setShowRegistration(true)') || cardContent.includes('Create Account');
        
        console.log(`   ${hasTitle ? '✅' : '❌'} Has title/heading`);
        console.log(`   ${hasBenefits ? '✅' : '❌'} Shows benefits`);
        console.log(`   ${hasButton ? '✅' : '❌'} Has create account button`);
        
    } else {
        console.log('   ❌ Registration card not found');
    }
    
    // 2. Check PostSurveyRegistration component
    console.log('\n2. 🎯 Checking PostSurveyRegistration Component...');
    
    const postRegPath = path.join(__dirname, 'src/components/PostSurveyRegistration.tsx');
    if (fs.existsSync(postRegPath)) {
        const postRegContent = fs.readFileSync(postRegPath, 'utf8');
        
        const hasSkipButton = postRegContent.includes('onSkipRegistration') || 
                             postRegContent.includes('Skip for Now') ||
                             postRegContent.includes('Continue as Guest');
        
        const hasBenefitsSection = postRegContent.includes('Benefits of Creating an Account') ||
                                  postRegContent.includes('Track Progress') ||
                                  postRegContent.includes('Download Reports');
        
        const hasOptionalText = postRegContent.includes('optional') || 
                               postRegContent.includes('Optional');
        
        console.log(`   ${hasSkipButton ? '✅' : '❌'} Has skip/continue as guest option`);
        console.log(`   ${hasBenefitsSection ? '✅' : '❌'} Shows clear benefits`);
        console.log(`   ${hasOptionalText ? '✅' : '❌'} Indicates registration is optional`);
        
    } else {
        console.log('   ❌ PostSurveyRegistration component not found');
    }
    
    // 3. Check history page authentication
    console.log('\n3. 🔐 Checking History Page Authentication...');
    
    const historyPath = path.join(__dirname, 'src/app/history/page.tsx');
    if (fs.existsSync(historyPath)) {
        const historyContent = fs.readFileSync(historyPath, 'utf8');
        
        const hasAuthCheck = historyContent.includes('isAuthenticated') && 
                            historyContent.includes('showAuthForm');
        
        const hasAuthForm = historyContent.includes('SimpleAuthForm');
        
        const hasPromptText = historyContent.includes('Access Your Assessment History') ||
                             historyContent.includes('view your previous') ||
                             historyContent.includes('Enter your email');
        
        console.log(`   ${hasAuthCheck ? '✅' : '❌'} Checks authentication status`);
        console.log(`   ${hasAuthForm ? '✅' : '❌'} Shows authentication form for guests`);
        console.log(`   ${hasPromptText ? '✅' : '❌'} Has descriptive prompt text`);
        
    } else {
        console.log('   ❌ History page not found');
    }
    
    // 4. Check guest migration functionality
    console.log('\n4. 🔄 Checking Guest Data Migration...');
    
    const migrationPath = path.join(__dirname, 'src/hooks/use-guest-migration.tsx');
    if (fs.existsSync(migrationPath)) {
        const migrationContent = fs.readFileSync(migrationPath, 'utf8');
        
        const hasMigrationLogic = migrationContent.includes('migrateGuestData') &&
                                 migrationContent.includes('localStorage.getItem');
        
        const hasDataCleanup = migrationContent.includes('localStorage.removeItem');
        
        console.log(`   ${hasMigrationLogic ? '✅' : '❌'} Has guest data migration logic`);
        console.log(`   ${hasDataCleanup ? '✅' : '❌'} Cleans up guest data after migration`);
        
    } else {
        console.log('   ❌ Guest migration hook not found');
    }
    
    // 5. Create test instructions
    console.log('\n5. 🧪 Manual Testing Instructions:');
    console.log('   To test the guest registration prompt:');
    console.log('   1. Open browser in incognito/private mode');
    console.log('   2. Navigate to http://localhost:3000/test-guest-registration');
    console.log('   3. Verify "Is Guest User" shows "✅ Yes (should show prompt)"');
    console.log('   4. Look for registration card with "Save Your Results" title');
    console.log('   5. Click "Create Account" button to test registration flow');
    console.log('   6. Verify skip option is available in registration modal');
    console.log('   7. Test history page at http://localhost:3000/history');
    console.log('   8. Verify authentication form appears for guests');
    
    // 6. Check for potential issues
    console.log('\n6. 🐛 Potential Issues to Check:');
    
    // Check if there are any automatic authentication mechanisms
    const authFiles = [
        'src/hooks/use-simple-auth.tsx',
        'src/lib/api-client.ts',
        'src/app/layout.tsx'
    ];
    
    let hasAutoAuth = false;
    authFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('auto') && content.includes('auth')) {
                hasAutoAuth = true;
            }
        }
    });
    
    console.log(`   ${hasAutoAuth ? '⚠️' : '✅'} ${hasAutoAuth ? 'Potential auto-authentication found' : 'No auto-authentication detected'}`);
    
    // Check if localStorage might have persistent auth data
    console.log('   ⚠️  Clear localStorage before testing:');
    console.log('      - simple_auth_session');
    console.log('      - auth_token');
    console.log('      - admin_access_token');
    
    console.log('\n✅ Guest flow analysis complete!');
    console.log('   If registration prompt is not showing, check:');
    console.log('   - Browser localStorage is clear');
    console.log('   - No existing authentication sessions');
    console.log('   - useSimpleAuth hook is returning null user');
    console.log('   - apiClient.isAuthenticated() returns false');
}

testGuestFlow();