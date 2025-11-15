#!/usr/bin/env node
/**
 * Simple Frontend-Backend Integration Test
 * Tests basic integration without external dependencies
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Simple Frontend-Backend Integration Test');
console.log('=' * 50);

// Test 1: Check if translations file exists and has correct structure
console.log('\n📄 Testing Frontend Translations...');
try {
  const translationsPath = './src/lib/simple-translations.ts';
  if (fs.existsSync(translationsPath)) {
    const content = fs.readFileSync(translationsPath, 'utf8');
    
    // Check structure
    const hasExport = content.includes('export const translations');
    const hasEnglish = content.includes('en:');
    const hasArabic = content.includes('ar:');
    const hasAccessKey = content.includes('access_previous_results');
    
    console.log(`✓ Translations file exists`);
    console.log(`${hasExport ? '✓' : '✗'} Has export structure`);
    console.log(`${hasEnglish ? '✓' : '✗'} Has English translations`);
    console.log(`${hasArabic ? '✓' : '✗'} Has Arabic translations`);
    console.log(`${hasAccessKey ? '✓' : '✗'} Has access_previous_results key`);
    
    if (hasExport && hasEnglish && hasArabic && hasAccessKey) {
      console.log('✅ Frontend translations: PASS');
    } else {
      console.log('❌ Frontend translations: FAIL');
    }
  } else {
    console.log('❌ Translations file not found');
  }
} catch (error) {
  console.log(`❌ Error testing translations: ${error.message}`);
}

// Test 2: Check LocalizationContext
console.log('\n🌐 Testing LocalizationContext...');
try {
  const contextPath = './src/contexts/LocalizationContext.tsx';
  if (fs.existsSync(contextPath)) {
    const content = fs.readFileSync(contextPath, 'utf8');
    
    const hasImport = content.includes('import { translations as simpleTranslations }');
    const hasTFunction = content.includes('const t = (key: string');
    const hasErrorHandling = content.includes('try {') && content.includes('catch (error)');
    const hasFallback = content.includes('DEFAULT_TRANSLATIONS[key]');
    
    console.log(`${hasImport ? '✓' : '✗'} Has correct import`);
    console.log(`${hasTFunction ? '✓' : '✗'} Has translation function`);
    console.log(`${hasErrorHandling ? '✓' : '✗'} Has error handling`);
    console.log(`${hasFallback ? '✓' : '✗'} Has fallback mechanism`);
    
    if (hasImport && hasTFunction && hasErrorHandling && hasFallback) {
      console.log('✅ LocalizationContext: PASS');
    } else {
      console.log('❌ LocalizationContext: FAIL');
    }
  } else {
    console.log('❌ LocalizationContext file not found');
  }
} catch (error) {
  console.log(`❌ Error testing LocalizationContext: ${error.message}`);
}

// Test 3: Check RTL support
console.log('\n🔄 Testing RTL Support...');
try {
  const rtlPaths = ['./src/styles/rtl.css', './src/app/globals.css'];
  let rtlFound = false;
  
  for (const rtlPath of rtlPaths) {
    if (fs.existsSync(rtlPath)) {
      const content = fs.readFileSync(rtlPath, 'utf8');
      if (content.includes('direction: rtl') || content.includes('[dir="rtl"]')) {
        console.log(`✓ RTL styles found in ${rtlPath}`);
        rtlFound = true;
      }
    }
  }
  
  if (rtlFound) {
    console.log('✅ RTL Support: PASS');
  } else {
    console.log('⚠️  RTL Support: Not detected');
  }
} catch (error) {
  console.log(`❌ Error testing RTL: ${error.message}`);
}

// Test 4: Check backend files exist
console.log('\n🔧 Testing Backend Files...');
try {
  const backendFiles = [
    '../backend/app/localization/service.py',
    '../backend/app/localization/routes.py',
    '../backend/app/reports/arabic_pdf_service.py',
    '../backend/LOCALIZATION_BACKEND_TEST_SUMMARY.md'
  ];
  
  let backendFilesFound = 0;
  for (const file of backendFiles) {
    if (fs.existsSync(file)) {
      console.log(`✓ ${path.basename(file)} exists`);
      backendFilesFound++;
    } else {
      console.log(`✗ ${path.basename(file)} missing`);
    }
  }
  
  if (backendFilesFound === backendFiles.length) {
    console.log('✅ Backend Files: PASS');
  } else {
    console.log(`⚠️  Backend Files: ${backendFilesFound}/${backendFiles.length} found`);
  }
} catch (error) {
  console.log(`❌ Error testing backend files: ${error.message}`);
}

console.log('\n' + '='.repeat(50));
console.log('📊 INTEGRATION TEST SUMMARY');
console.log('='.repeat(50));

console.log('\n💡 NEXT STEPS:');
console.log('1. Start the frontend: npm run dev');
console.log('2. Start the backend: uvicorn app.main:app --reload');
console.log('3. Test the application in browser');
console.log('4. Verify language switching works');
console.log('5. Test Arabic PDF generation');

console.log('\n🔧 TROUBLESHOOTING:');
console.log('- If frontend crashes, check browser console for errors');
console.log('- If translations missing, verify simple-translations.ts structure');
console.log('- If backend errors, check backend logs');
console.log('- Admin credentials: admin@nationalbonds.ae / admin123');

console.log('\n✅ Integration test completed!');