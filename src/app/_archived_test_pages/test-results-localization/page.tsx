'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocalization } from '@/contexts/LocalizationContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { apiClient } from '@/lib/api-client';

export default function TestResultsLocalization() {
  const { t, language, isRTL } = useLocalization();
  const [apiTranslations, setApiTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Results page translation keys to test
  const resultsKeys = [
    'your_results',
    'financial_health_score',
    'overall_score',
    'pillar_breakdown',
    'detailed_recommendations',
    'personalized_recommendations',
    'educational_guidance',
    'financial_pillar_scores',
    'performance_across_areas',
    'understanding_your_score',
    'generate_report',
    'view_score_history',
    'retake_assessment',
    'save_your_results',
    'create_account',
    'excellent',
    'good',
    'fair',
    'needs_improvement',
    'budgeting',
    'savings',
    'debt_management',
    'investment_knowledge',
    'retirement_planning'
  ];

  // Load API translations
  useEffect(() => {
    const loadApiTranslations = async () => {
      setLoading(true);
      try {
        const data = await apiClient.getUITranslations(language);
        setApiTranslations(data);
      } catch (error) {
        console.error('Error loading API translations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadApiTranslations();
  }, [language]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="container mx-auto max-w-6xl py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Results Page Localization Test</h1>
            <p className="text-muted-foreground">
              Testing translation coverage for the results page
            </p>
          </div>
          <LanguageSelector />
        </div>

        {/* Language Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Language Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm font-medium">Language</div>
                <Badge variant="outline">{language.toUpperCase()}</Badge>
              </div>
              <div>
                <div className="text-sm font-medium">Direction</div>
                <Badge variant="outline">{isRTL ? 'RTL' : 'LTR'}</Badge>
              </div>
              <div>
                <div className="text-sm font-medium">API Translations</div>
                <Badge variant="outline">{Object.keys(apiTranslations).length} keys</Badge>
              </div>
              <div>
                <div className="text-sm font-medium">Status</div>
                <Badge variant={loading ? "secondary" : "default"}>
                  {loading ? 'Loading...' : 'Ready'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Translation Test Results */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Context Translations */}
          <Card>
            <CardHeader>
              <CardTitle>Context Translations (t() function)</CardTitle>
              <CardDescription>
                Testing translations through the localization context
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {resultsKeys.map(key => {
                  const translation = t(key);
                  const isTranslated = translation !== key;
                  const hasArabic = /[\u0600-\u06FF]/.test(translation);
                  
                  return (
                    <div key={key} className="border rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">{key}</code>
                        <div className="flex gap-1">
                          <Badge variant={isTranslated ? "default" : "destructive"} className="text-xs">
                            {isTranslated ? "✓" : "✗"}
                          </Badge>
                          {language === 'ar' && (
                            <Badge variant={hasArabic ? "default" : "secondary"} className="text-xs">
                              {hasArabic ? "AR" : "EN"}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                        {translation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* API Translations */}
          <Card>
            <CardHeader>
              <CardTitle>API Translations</CardTitle>
              <CardDescription>
                Direct translations from the API endpoint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {resultsKeys.map(key => {
                  const apiTranslation = apiTranslations[key];
                  const hasApiTranslation = !!apiTranslation;
                  const hasArabic = apiTranslation && /[\u0600-\u06FF]/.test(apiTranslation);
                  
                  return (
                    <div key={key} className="border rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">{key}</code>
                        <div className="flex gap-1">
                          <Badge variant={hasApiTranslation ? "default" : "destructive"} className="text-xs">
                            {hasApiTranslation ? "✓" : "✗"}
                          </Badge>
                          {language === 'ar' && hasApiTranslation && (
                            <Badge variant={hasArabic ? "default" : "secondary"} className="text-xs">
                              {hasArabic ? "AR" : "EN"}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                        {apiTranslation || <span className="text-muted-foreground italic">Not available</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sample Results Page Content */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{t('your_results')}</CardTitle>
            <CardDescription>
              {t('performance_across_areas')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('financial_pillar_scores')}</h3>
                <div className="space-y-3">
                  {['budgeting', 'savings', 'debt_management', 'investment_knowledge', 'retirement_planning'].map(pillar => (
                    <div key={pillar} className="flex justify-between items-center p-3 bg-muted rounded">
                      <span>{t(pillar)}</span>
                      <Badge variant="outline">85%</Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('personalized_recommendations')}</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded">
                    <div className="font-medium">{t('excellent')}</div>
                    <div className="text-sm text-muted-foreground">{t('outstanding_financial_wellness')}</div>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <div className="font-medium">{t('good')}</div>
                    <div className="text-sm text-muted-foreground">{t('strong_financial_health')}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <Button>{t('generate_report')}</Button>
              <Button variant="outline">{t('view_score_history')}</Button>
              <Button variant="outline">{t('retake_assessment')}</Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Translation Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {resultsKeys.filter(key => t(key) !== key).length}
                </div>
                <div className="text-sm text-muted-foreground">Context Translations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {resultsKeys.filter(key => apiTranslations[key]).length}
                </div>
                <div className="text-sm text-muted-foreground">API Translations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {language === 'ar' ? resultsKeys.filter(key => {
                    const translation = t(key);
                    return /[\u0600-\u06FF]/.test(translation);
                  }).length : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Arabic Content</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Math.round((resultsKeys.filter(key => t(key) !== key).length / resultsKeys.length) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Coverage</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}