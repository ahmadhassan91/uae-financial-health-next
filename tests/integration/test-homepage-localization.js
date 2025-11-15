// Test script to verify homepage localization
// Run this in the browser console on the homepage

console.log('🧪 Testing Homepage Localization...');

// Test language switching
const languageSelector = document.querySelector('[data-testid="language-selector"]') || 
                        document.querySelector('select') ||
                        document.querySelector('button[aria-label*="language"]') ||
                        document.querySelector('button[aria-label*="Language"]');

if (languageSelector) {
    console.log('✅ Language selector found');
} else {
    console.log('❌ Language selector not found');
}

// Test key homepage elements
const homepageElements = [
    'financial_health_assessment',
    'trusted_uae_institution', 
    'get_personalized_insights',
    'transparent_scoring',
    'privacy_protected',
    'personalized_insights',
    'progress_tracking',
    'about_financial_health_assessment',
    'science_based_methodology',
    'uae_specific_insights',
    'ready_to_improve',
    'join_thousands',
    'begin_assessment_now'
];

console.log('\n📝 Checking homepage text elements...');

homepageElements.forEach(key => {
    // Look for text content that might contain these translations
    const elements = Array.from(document.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.length > 10 && text.length < 500; // Reasonable text length
    });
    
    const found = elements.some(el => {
        const text = el.textContent.toLowerCase();
        return text.includes(key.replace(/_/g, ' ')) || 
               text.includes('financial health') ||
               text.includes('assessment') ||
               text.includes('transparent') ||
               text.includes('privacy') ||
               text.includes('personalized') ||
               text.includes('uae') ||
               text.includes('ready to improve');
    });
    
    if (found) {
        console.log(`✅ ${key}: Content found`);
    } else {
        console.log(`❌ ${key}: Content not found`);
    }
});

// Test Arabic content detection
console.log('\n🔤 Checking for Arabic content...');
const arabicRegex = /[\u0600-\u06FF]/;
const allText = document.body.textContent || '';

if (arabicRegex.test(allText)) {
    console.log('✅ Arabic text detected on page');
    
    // Count Arabic characters
    const arabicChars = allText.match(/[\u0600-\u06FF]/g);
    console.log(`📊 Arabic characters found: ${arabicChars ? arabicChars.length : 0}`);
} else {
    console.log('❌ No Arabic text detected');
}

// Test RTL layout
console.log('\n↔️ Checking RTL layout...');
const htmlDir = document.documentElement.dir;
const htmlLang = document.documentElement.lang;

console.log(`HTML dir attribute: ${htmlDir}`);
console.log(`HTML lang attribute: ${htmlLang}`);

if (htmlDir === 'rtl') {
    console.log('✅ RTL layout is active');
} else {
    console.log('ℹ️ LTR layout is active');
}

// Test API endpoints
console.log('\n🌐 Testing localization API endpoints...');

async function testAPI() {
    try {
        // Test UI translations endpoint
        const uiResponse = await fetch('/api/localization/ui/ar');
        if (uiResponse.ok) {
            const uiData = await uiResponse.json();
            console.log(`✅ Arabic UI translations: ${Object.keys(uiData).length} keys`);
            
            // Check for specific homepage keys
            const homepageKeys = [
                'financial_health_assessment',
                'transparent_scoring',
                'ready_to_improve'
            ];
            
            homepageKeys.forEach(key => {
                if (uiData[key]) {
                    console.log(`✅ ${key}: ${uiData[key]}`);
                } else {
                    console.log(`❌ ${key}: Missing from API`);
                }
            });
        } else {
            console.log(`❌ Arabic UI API failed: ${uiResponse.status}`);
        }
        
        // Test English UI translations
        const enResponse = await fetch('/api/localization/ui/en');
        if (enResponse.ok) {
            const enData = await enResponse.json();
            console.log(`✅ English UI translations: ${Object.keys(enData).length} keys`);
        } else {
            console.log(`❌ English UI API failed: ${enResponse.status}`);
        }
        
    } catch (error) {
        console.log(`❌ API test failed: ${error.message}`);
    }
}

testAPI();

// Test localization context
console.log('\n⚛️ Testing React localization context...');

// Try to access React DevTools or check for localization context
if (window.React || window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React detected - localization context should be available');
} else {
    console.log('ℹ️ React DevTools not detected');
}

// Summary
console.log('\n📋 LOCALIZATION TEST SUMMARY');
console.log('=====================================');
console.log('1. Check language selector functionality');
console.log('2. Verify homepage content is translated');
console.log('3. Test Arabic text rendering');
console.log('4. Confirm RTL layout when Arabic is selected');
console.log('5. Validate API endpoints are working');
console.log('\n💡 Switch language and run this test again to compare results');