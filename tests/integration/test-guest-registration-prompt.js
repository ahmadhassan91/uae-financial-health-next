/**
 * Test script to verify guest registration prompt functionality
 */

const puppeteer = require('puppeteer');

async function testGuestRegistrationPrompt() {
    console.log('🧪 Testing Guest Registration Prompt Functionality...\n');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    try {
        const page = await browser.newPage();
        
        // Clear any existing auth data
        await page.evaluateOnNewDocument(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        
        console.log('1. Navigating to survey...');
        await page.goto('http://localhost:3000/survey', { waitUntil: 'networkidle0' });
        
        // Complete a quick survey as guest
        console.log('2. Completing survey as guest...');
        
        // Wait for survey questions and answer them quickly
        await page.waitForSelector('[data-testid="survey-question"], .survey-question, button[type="submit"]', { timeout: 10000 });
        
        // Try to find and click through survey questions
        let questionCount = 0;
        while (questionCount < 20) { // Limit to prevent infinite loop
            try {
                // Look for radio buttons or survey inputs
                const radioButtons = await page.$$('input[type="radio"]');
                const submitButton = await page.$('button[type="submit"]');
                
                if (radioButtons.length > 0) {
                    // Answer the first option for each question
                    await radioButtons[0].click();
                    await page.waitForTimeout(500);
                    
                    // Look for next button
                    const nextButton = await page.$('button:has-text("Next"), button[type="submit"]');
                    if (nextButton) {
                        await nextButton.click();
                        await page.waitForTimeout(1000);
                    }
                } else if (submitButton) {
                    await submitButton.click();
                    await page.waitForTimeout(1000);
                    break;
                } else {
                    // Try to find any clickable survey elements
                    const surveyElements = await page.$$('button, input, select');
                    if (surveyElements.length > 0) {
                        await surveyElements[0].click();
                        await page.waitForTimeout(500);
                    } else {
                        break;
                    }
                }
                
                questionCount++;
            } catch (error) {
                console.log(`Question ${questionCount + 1}: ${error.message}`);
                break;
            }
        }
        
        console.log('3. Checking if we reached results page...');
        
        // Wait for results page or check current URL
        await page.waitForTimeout(3000);
        const currentUrl = page.url();
        console.log(`Current URL: ${currentUrl}`);
        
        if (currentUrl.includes('/results')) {
            console.log('✅ Reached results page');
            
            // Check for guest registration prompt
            console.log('4. Looking for guest registration prompt...');
            
            const registrationPrompt = await page.$('[data-testid="guest-registration-prompt"], .registration-prompt, button:has-text("Create Account"), button:has-text("Save Your Results")');
            
            if (registrationPrompt) {
                console.log('✅ Found registration prompt for guest user');
                
                // Check if prompt shows benefits
                const benefitsText = await page.evaluate(() => {
                    const text = document.body.innerText.toLowerCase();
                    return text.includes('track') || text.includes('history') || text.includes('progress') || text.includes('report');
                });
                
                if (benefitsText) {
                    console.log('✅ Registration prompt shows benefits');
                } else {
                    console.log('❌ Registration prompt does not show clear benefits');
                }
                
                // Check for skip option
                const skipOption = await page.$('button:has-text("Skip"), button:has-text("Continue as Guest"), button:has-text("Later")');
                if (skipOption) {
                    console.log('✅ Skip option is available');
                } else {
                    console.log('❌ No skip option found');
                }
                
            } else {
                console.log('❌ No registration prompt found for guest user');
                
                // Check if user is somehow authenticated
                const authStatus = await page.evaluate(() => {
                    return {
                        localStorage: localStorage.getItem('simple_auth_session'),
                        hasUser: !!window.user
                    };
                });
                console.log('Auth status:', authStatus);
            }
            
        } else {
            console.log('❌ Did not reach results page');
            
            // Try to navigate directly to results with mock data
            console.log('5. Testing with mock results data...');
            
            await page.evaluate(() => {
                const mockScore = {
                    totalScore: 65,
                    pillarScores: [
                        { pillar: 'budgeting', score: 8, maxScore: 10, percentage: 80 },
                        { pillar: 'saving', score: 7, maxScore: 10, percentage: 70 }
                    ],
                    advice: ['Great job on budgeting!']
                };
                localStorage.setItem('currentScore', JSON.stringify(mockScore));
            });
            
            await page.goto('http://localhost:3000/results', { waitUntil: 'networkidle0' });
            await page.waitForTimeout(2000);
            
            const registrationPrompt = await page.$('[data-testid="guest-registration-prompt"], .registration-prompt, button:has-text("Create Account"), button:has-text("Save Your Results")');
            
            if (registrationPrompt) {
                console.log('✅ Found registration prompt with mock data');
            } else {
                console.log('❌ No registration prompt found even with mock data');
            }
        }
        
        console.log('\n6. Testing history page access...');
        
        // Test history page access for guests
        await page.goto('http://localhost:3000/history', { waitUntil: 'networkidle0' });
        await page.waitForTimeout(2000);
        
        const authForm = await page.$('form, input[type="email"], .auth-form, .login-form');
        if (authForm) {
            console.log('✅ History page shows authentication form for guests');
        } else {
            console.log('❌ History page does not require authentication for guests');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the test
testGuestRegistrationPrompt().catch(console.error);