/**
 * Test guest detection logic by examining the actual implementation
 */

const fs = require('fs');
const path = require('path');

function testGuestDetection() {
    console.log('🔍 Testing Guest Detection Logic...\n');
    
    // Read the ScoreResult component
    const scoreResultPath = path.join(__dirname, 'src/components/ScoreResult.tsx');
    const content = fs.readFileSync(scoreResultPath, 'utf8');
    
    // Extract the guest detection logic
    const guestDetectionMatch = content.match(/const isGuestUser = ([^;]+);/);
    
    if (guestDetectionMatch) {
        console.log('✅ Found guest detection logic:');
        console.log(`   ${guestDetectionMatch[0]}`);
        
        // Check what it depends on
        const logic = guestDetectionMatch[1];
        console.log('\n📋 Dependencies:');
        
        if (logic.includes('!user')) {
            console.log('   ✅ Checks user from useSimpleAuth hook');
        }
        
        if (logic.includes('!apiClient.isAuthenticated()')) {
            console.log('   ✅ Checks apiClient authentication');
        }
        
        // Check if the registration card is properly implemented
        console.log('\n🎯 Registration Card Implementation:');
        
        const cardMatch = content.match(/\{isGuestUser && \(([\s\S]*?)\)\}/);
        if (cardMatch) {
            console.log('   ✅ Registration card is conditionally rendered for guests');
            
            const cardContent = cardMatch[1];
            
            // Check for benefits
            if (cardContent.includes('track your progress') || 
                cardContent.includes('download reports') || 
                cardContent.includes('assessment history')) {
                console.log('   ✅ Shows benefits (progress tracking, reports, history)');
            } else {
                console.log('   ❌ Missing benefits description');
            }
            
            // Check for create account button
            if (cardContent.includes('Create Account') || cardContent.includes('setShowRegistration(true)')) {
                console.log('   ✅ Has create account button');
            } else {
                console.log('   ❌ Missing create account button');
            }
            
        } else {
            console.log('   ❌ Registration card not found or not properly conditional');
        }
        
        // Check for skip functionality in PostSurveyRegistration
        console.log('\n🚪 Skip Functionality:');
        
        const postRegPath = path.join(__dirname, 'src/components/PostSurveyRegistration.tsx');
        if (fs.existsSync(postRegPath)) {
            const postRegContent = fs.readFileSync(postRegPath, 'utf8');
            
            if (postRegContent.includes('onSkipRegistration') || 
                postRegContent.includes('Skip for Now') ||
                postRegContent.includes('Continue as Guest')) {
                console.log('   ✅ PostSurveyRegistration has skip functionality');
            } else {
                console.log('   ❌ PostSurveyRegistration missing skip functionality');
            }
        } else {
            console.log('   ❌ PostSurveyRegistration component not found');
        }
        
        // Check the actual problem - why might the card not show?
        console.log('\n🐛 Potential Issues:');
        
        // Check if useSimpleAuth is properly imported
        if (content.includes('import') && content.includes('useSimpleAuth')) {
            console.log('   ✅ useSimpleAuth is imported');
        } else {
            console.log('   ❌ useSimpleAuth not imported');
        }
        
        // Check if apiClient is imported
        if (content.includes('import') && content.includes('apiClient')) {
            console.log('   ✅ apiClient is imported');
        } else {
            console.log('   ❌ apiClient not imported');
        }
        
        // Check if user is destructured from useSimpleAuth
        const userDestructureMatch = content.match(/const \{[^}]*user[^}]*\} = useSimpleAuth\(\)/);
        if (userDestructureMatch) {
            console.log('   ✅ user is destructured from useSimpleAuth');
        } else {
            console.log('   ❌ user not properly destructured from useSimpleAuth');
        }
        
    } else {
        console.log('❌ Guest detection logic not found');
    }
    
    // Test the authentication flow
    console.log('\n🔐 Authentication Flow Check:');
    
    const historyPath = path.join(__dirname, 'src/app/history/page.tsx');
    if (fs.existsSync(historyPath)) {
        const historyContent = fs.readFileSync(historyPath, 'utf8');
        
        if (historyContent.includes('showAuthForm') && historyContent.includes('!isAuthenticated')) {
            console.log('   ✅ History page properly checks authentication');
        } else {
            console.log('   ❌ History page authentication check issues');
        }
        
        if (historyContent.includes('SimpleAuthForm')) {
            console.log('   ✅ History page shows authentication form for guests');
        } else {
            console.log('   ❌ History page missing authentication form');
        }
    }
}

testGuestDetection();