#!/usr/bin/env node
/**
 * Frontend-Backend Integration Test
 * 
 * This script tests the integration between the frontend localization system
 * and the backend localization API endpoints.
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const BACKEND_URL = 'http://localhost:8000';
const FRONTEND_TRANSLATIONS_PATH = './src/lib/simple-translations.ts';

class FrontendBackendIntegrationTester {
  constructor() {
    this.results = [];
  }

  log(test, status, details = '') {
    const result = { test, status, details, timestamp: new Date().toISOString() };
    this.results.push(result);
    console.log(`${status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⚠'} ${test}: ${status}`);
    if (details) console.log(`  ${details}`);
  }

  async testBackendHealth() {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      if (response.ok) {
        this.log('Backend Health Check', 'PASS', 'Backend is running');
        return true;
      } else {
        this.log('Backend Health Check', 'FAIL', `Status: ${response.status}`);
        return false;
      }
    } catch (error) {
      this.log('Backend Health Check', 'FAIL', `Error: ${error.message}`);
      return false;
    }
  }

  async testLocalizationEndpoints() {
    const endpoints = [
      '/api/localization/languages',
      '/api/localization/questions/en',
      '/api/localization/questions/ar',
      '/api/localization/ui/en',
      '/api/localization/ui/ar'
    ];

    let passCount = 0;
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${BACKEND_URL}${endpoint}`);
        if (response.ok) {
          const data = await response.json();
          this.log(`Endpoint ${endpoint}`, 'PASS', `Returned ${Array.isArray(data) ? data.length : Object.keys(data).length} items`);
          passCount++;
        } else {
          this.log(`Endpoint ${endpoint}`, 'FAIL', `Status: ${response.status}`);
        }
      } catch (error) {
        this.log(`Endpoint ${endpoint}`, 'FAIL', `Error: ${error.message}`);
      }
    }

    return passCount === endpoints.length;
  }

  testFrontendTranslations() {
    try {
      // Check if translations file exists
      if (!fs.existsSync(FRONTEND_TRANSLATIONS_PATH)) {
        this.log('Frontend Translations File', 'FAIL', 'File not found');
        return false;
      }

      // Read and parse translations
      const translationsContent = fs.readFileSync(FRONTEND_TRANSLATIONS_PATH, 'utf8');
      
      // Basic validation - check if it contains expected structure
      if (translationsContent.includes('export const translations') && 
          translationsContent.includes('en:') && 
          translationsContent.includes('ar:')) {
        
        // Count translation keys (rough estimate)
        const enMatches = translationsContent.match(/'[^']+'\s*:/g) || [];
        const keyCount = Math.floor(enMatches.length / 2); // Divide by 2 since we have en and ar
        
        this.log('Frontend Translations Structure', 'PASS', `~${keyCount} translation keys found`);
        
        // Check for critical keys
        const criticalKeys = [
          'access_previous_results',
          'welcome_message',
          'start_survey',
          'financial_health_assessment'
        ];
        
        let missingKeys = [];
        for (const key of criticalKeys) {
          if (!translationsContent.includes(`'${key}'`)) {
            missingKeys.push(key);
          }
        }
        
        if (missingKeys.length === 0) {
          this.log('Critical Translation Keys', 'PASS', 'All critical keys present');
        } else {
          this.log('Critical Translation Keys', 'FAIL', `Missing: ${missingKeys.join(', ')}`);
        }
        
        return missingKeys.length === 0;
      } else {
        this.log('Frontend Translations Structure', 'FAIL', 'Invalid structure');
        return false;
      }
    } catch (error) {
      this.log('Frontend Translations Test', 'FAIL', `Error: ${error.message}`);
      return false;
    }
  }

  async testLanguageConsistency() {
    try {
      // Get supported languages from backend
      const response = await fetch(`${BACKEND_URL}/api/localization/languages`);
      if (!response.ok) {
        this.log('Language Consistency', 'FAIL', 'Cannot fetch backend languages');
        return false;
      }

      const backendLanguages = await response.json();
      const backendLangCodes = backendLanguages.map(lang => lang.code);
      
      // Check frontend languages
      const translationsContent = fs.readFileSync(FRONTEND_TRANSLATIONS_PATH, 'utf8');
      const frontendLangCodes = [];
      
      if (translationsContent.includes('en:')) frontendLangCodes.push('en');
      if (translationsContent.includes('ar:')) frontendLangCodes.push('ar');
      
      // Compare
      const missingInFrontend = backendLangCodes.filter(code => !frontendLangCodes.includes(code));
      const missingInBackend = frontendLangCodes.filter(code => !backendLangCodes.includes(code));
      
      if (missingInFrontend.length === 0 && missingInBackend.length === 0) {
        this.log('Language Consistency', 'PASS', `Both support: ${frontendLangCodes.join(', ')}`);
        return true;
      } else {
        const details = [];
        if (missingInFrontend.length > 0) details.push(`Frontend missing: ${missingInFrontend.join(', ')}`);
        if (missingInBackend.length > 0) details.push(`Backend missing: ${missingInBackend.join(', ')}`);
        this.log('Language Consistency', 'FAIL', details.join('; '));
        return false;
      }
    } catch (error) {
      this.log('Language Consistency Test', 'FAIL', `Error: ${error.message}`);
      return false;
    }
  }

  async testRTLSupport() {
    try {
      // Check if RTL styles exist
      const rtlStylesPath = './src/styles/rtl.css';
      const globalsPath = './src/app/globals.css';
      
      let rtlSupport = false;
      
      if (fs.existsSync(rtlStylesPath)) {
        const rtlContent = fs.readFileSync(rtlStylesPath, 'utf8');
        if (rtlContent.includes('direction: rtl') || rtlContent.includes('[dir="rtl"]')) {
          rtlSupport = true;
        }
      }
      
      if (fs.existsSync(globalsPath)) {
        const globalsContent = fs.readFileSync(globalsPath, 'utf8');
        if (globalsContent.includes('direction: rtl') || globalsContent.includes('[dir="rtl"]')) {
          rtlSupport = true;
        }
      }
      
      if (rtlSupport) {
        this.log('RTL Support', 'PASS', 'RTL styles found');
        return true;
      } else {
        this.log('RTL Support', 'WARN', 'No RTL styles detected');
        return false;
      }
    } catch (error) {
      this.log('RTL Support Test', 'FAIL', `Error: ${error.message}`);
      return false;
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 FRONTEND-BACKEND INTEGRATION TEST SUMMARY');
    console.log('='.repeat(60));
    
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARN').length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`✓ Passed: ${passed}`);
    console.log(`✗ Failed: ${failed}`);
    console.log(`⚠ Warnings: ${warnings}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`  - ${r.test}: ${r.details}`);
      });
    }
    
    if (warnings > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.results.filter(r => r.status === 'WARN').forEach(r => {
        console.log(`  - ${r.test}: ${r.details}`);
      });
    }
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (failed === 0) {
      console.log('  ✅ Frontend-backend integration is working correctly!');
      console.log('  ✅ Localization system is properly aligned');
    } else {
      console.log('  🔧 Fix failed tests before deploying');
      console.log('  🔧 Ensure backend is running on http://localhost:8000');
    }
    
    // Save detailed report
    const reportFile = `integration-test-report-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportFile}`);
    
    return failed === 0;
  }

  async runAllTests() {
    console.log('🚀 Starting Frontend-Backend Integration Tests');
    console.log('=' * 60);
    
    // Test 1: Backend Health
    const backendHealthy = await this.testBackendHealth();
    
    // Test 2: Localization Endpoints (only if backend is healthy)
    if (backendHealthy) {
      await this.testLocalizationEndpoints();
      await this.testLanguageConsistency();
    }
    
    // Test 3: Frontend Translations
    this.testFrontendTranslations();
    
    // Test 4: RTL Support
    await this.testRTLSupport();
    
    // Generate final report
    return this.generateReport();
  }
}

// Run the tests
async function main() {
  const tester = new FrontendBackendIntegrationTester();
  const success = await tester.runAllTests();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { FrontendBackendIntegrationTester };