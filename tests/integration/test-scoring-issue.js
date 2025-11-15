/**
 * Diagnostic script to investigate the scoring issue where all pillar scores show 5.0/5
 */

const fs = require('fs');
const path = require('path');

function investigateScoringIssue() {
    console.log('🔍 Investigating Real Scoring Issue - All Pillar Scores Showing 5.0/5\n');
    
    // 1. Check the scoring engine
    console.log('1. 📊 Checking Scoring Engine Implementation...');
    
    const scoringEnginePath = path.join(__dirname, 'src/lib/scoring-engine.ts');
    const scoringContent = fs.readFileSync(scoringEnginePath, 'utf8');
    
    // Check if scoring is done by backend or frontend
    if (scoringContent.includes('apiClient.calculateScorePreview')) {
        console.log('   ✅ Scoring is handled by backend API');
        console.log('   🎯 Issue likely in backend scoring calculation or API response');
    } else {
        console.log('   ⚠️  Scoring might be done on frontend');
    }
    
    // 2. Check the survey submission process
    console.log('\n2. 📝 Checking Survey Submission Process...');
    
    const surveyFlowPath = path.join(__dirname, 'src/components/SurveyFlow.tsx');
    if (fs.existsSync(surveyFlowPath)) {
        const surveyContent = fs.readFileSync(surveyFlowPath, 'utf8');
        
        // Look for how responses are collected and submitted
        if (surveyContent.includes('submitSurvey') || surveyContent.includes('calculateScore')) {
            console.log('   ✅ Found survey submission logic');
        } else {
            console.log('   ❌ Survey submission logic not found');
        }
        
        // Check if responses are being recorded correctly
        if (surveyContent.includes('responses') && surveyContent.includes('questionId')) {
            console.log('   ✅ Response collection structure found');
        } else {
            console.log('   ❌ Response collection structure unclear');
        }
    }
    
    // 3. Check the use-survey hook
    console.log('\n3. 🎣 Checking Survey Hook Implementation...');
    
    const surveyHookPath = path.join(__dirname, 'src/hooks/use-survey.ts');
    if (fs.existsSync(surveyHookPath)) {
        const hookContent = fs.readFileSync(surveyHookPath, 'utf8');
        
        // Check how responses are stored and processed
        if (hookContent.includes('setResponse') || hookContent.includes('updateResponse')) {
            console.log('   ✅ Response update mechanism found');
        } else {
            console.log('   ❌ Response update mechanism not clear');
        }
        
        // Check for any hardcoded values
        const hardcodedValues = hookContent.match(/value:\s*5/g);
        if (hardcodedValues) {
            console.log(`   ⚠️  Found ${hardcodedValues.length} instances of hardcoded value: 5`);
        } else {
            console.log('   ✅ No obvious hardcoded values found');
        }
    }
    
    // 4. Check backend scoring logic
    console.log('\n4. 🔧 Checking Backend Scoring Logic...');
    
    const backendScoringPath = path.join(__dirname, '../backend/app/surveys/scoring.py');
    if (fs.existsSync(backendScoringPath)) {
        const backendContent = fs.readFileSync(backendScoringPath, 'utf8');
        
        // Look for potential issues in backend scoring
        if (backendContent.includes('max_score') || backendContent.includes('5')) {
            console.log('   ✅ Backend scoring file found');
            
            // Check for hardcoded maximum values
            const maxScoreMatches = backendContent.match(/max_score.*=.*5/g);
            if (maxScoreMatches) {
                console.log(`   ⚠️  Found max_score assignments: ${maxScoreMatches.length}`);
            }
            
            // Check for scoring calculation logic
            if (backendContent.includes('calculate') && backendContent.includes('pillar')) {
                console.log('   ✅ Pillar calculation logic found');
            } else {
                console.log('   ❌ Pillar calculation logic unclear');
            }
        } else {
            console.log('   ❌ Backend scoring file not accessible or empty');
        }
    } else {
        console.log('   ❌ Backend scoring file not found');
    }
    
    // 5. Check API client for score calculation
    console.log('\n5. 🌐 Checking API Client Score Calculation...');
    
    const apiClientPath = path.join(__dirname, 'src/lib/api-client.ts');
    const apiContent = fs.readFileSync(apiClientPath, 'utf8');
    
    // Find the calculateScorePreview method
    const scorePreviewMatch = apiContent.match(/calculateScorePreview[\s\S]*?}/);
    if (scorePreviewMatch) {
        console.log('   ✅ calculateScorePreview method found');
        
        // Check the endpoint and payload
        if (scorePreviewMatch[0].includes('/score-preview') || scorePreviewMatch[0].includes('/calculate')) {
            console.log('   ✅ Score calculation endpoint identified');
        }
    } else {
        console.log('   ❌ calculateScorePreview method not found');
    }
    
    // 6. Provide debugging recommendations
    console.log('\n6. 🐛 Debugging Recommendations:');
    console.log('   To identify the root cause:');
    console.log('   1. Check browser console for API request/response during survey submission');
    console.log('   2. Verify actual survey responses are being sent to backend');
    console.log('   3. Check backend logs for score calculation process');
    console.log('   4. Inspect localStorage for survey responses after completing survey');
    console.log('   5. Test with different answer combinations to see if scores change');
    
    console.log('\n7. 🔍 Immediate Investigation Steps:');
    console.log('   Run these in browser console after completing survey:');
    console.log('   - localStorage.getItem("survey-responses")');
    console.log('   - localStorage.getItem("currentScore")');
    console.log('   - Check Network tab for /score-preview or /calculate API calls');
    
    console.log('\n8. 🎯 Most Likely Causes:');
    console.log('   - Backend scoring algorithm always returning maximum scores');
    console.log('   - Survey responses not being properly sent to backend');
    console.log('   - Hardcoded values in scoring calculation');
    console.log('   - Response mapping issue (all responses mapped to 5)');
    console.log('   - Caching issue with previous high scores');
}

investigateScoringIssue();