'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocalization } from '@/contexts/LocalizationContext';

export default function TestUnifiedLocalizationPage() {
  const { language, setLanguage, t, translations, isLoading } = useLocalization();
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  useEffect(() => {
    // Test various translation keys
    const testKeys = [
      // Keys that should come from database
      'welcome_message',
      'start_survey',
      'financial_health_assessment',
      
      // Keys that should come from simple-translations (profile form)
      'customer_profile',
      'personal_information',
      'employment_information',
      
      // Keys that might be in both
      'loading',
      'continue_to_assessment',
      'yes',
      'no'
    ];

    const results: Record<string, any> = {};
    testKeys.forEach(key => {
      results[key] = {
        translation: t(key),
        inApiTranslations: key in translations,
        isDefault: t(key) === key
      };
    });

    setTestResults(results);
  }, [language, t, translations]);

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Test Unified Localization System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Current Language:</strong> {language}
            {isLoading && <span className="ml-2 text-blue-600">(Loading...)</span>}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={language === 'en' ? 'default' : 'outline'}
              onClick={() => setLanguage('en')}
            >
              English
            </Button>
            <Button 
              variant={language === 'ar' ? 'default' : 'outline'}
              onClick={() => setLanguage('ar')}
            >
              العربية
            </Button>
          </div>

          <div>
            <strong>API Translations Loaded:</strong> {Object.keys(translations).length}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Translation Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(testResults).map(([key, result]) => (
                  <div key={key} className="border-b pb-2">
                    <div className="font-mono text-sm">{key}</div>
                    <div className="text-lg">{result.translation}</div>
                    <div className="text-xs text-muted-foreground">
                      API: {result.inApiTranslations ? '✅' : '❌'} | 
                      Default: {result.isDefault ? '❌' : '✅'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sample Profile Form Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div><strong>{t('name')}:</strong> (Should be translated)</div>
                <div><strong>{t('age')}:</strong> (Should be translated)</div>
                <div><strong>{t('gender')}:</strong> (Should be translated)</div>
                <div><strong>{t('employment_status')}:</strong> (Should be translated)</div>
                <div><strong>{t('continue_to_assessment')}:</strong> (Should be translated)</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sample Survey UI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div><strong>{t('welcome_message')}:</strong> (Should be from database)</div>
                <div><strong>{t('start_survey')}:</strong> (Should be from database)</div>
                <div><strong>{t('financial_health_assessment')}:</strong> (Should be from database)</div>
                <div><strong>{t('next_question')}:</strong> (Should be from database)</div>
              </div>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground">
            <p><strong>Expected behavior:</strong></p>
            <ul className="list-disc list-inside ml-4">
              <li>✅ API translations should take priority</li>
              <li>✅ Simple translations should be fallback</li>
              <li>✅ All text should be properly translated</li>
              <li>❌ No keys should show as untranslated (same as key)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}