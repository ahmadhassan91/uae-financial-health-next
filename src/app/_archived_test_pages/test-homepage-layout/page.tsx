'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalization } from '@/contexts/LocalizationContext';
import { LanguageSelector } from '@/components/LanguageSelector';

export default function TestHomepageLayout() {
  const { t, language, isRTL } = useLocalization();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Homepage Layout Test</h1>
            <p className="text-muted-foreground">Testing Arabic heading gradient and layout</p>
          </div>
          <LanguageSelector />
        </div>

        {/* Language Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium">Language</div>
                <div className="text-lg">{language.toUpperCase()}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Direction</div>
                <div className="text-lg">{isRTL ? 'RTL' : 'LTR'}</div>
              </div>
              <div>
                <div className="text-sm font-medium">HTML Dir</div>
                <div className="text-lg">{mounted ? (document.documentElement.dir || 'auto') : 'Loading...'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Hero Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Hero Section Test</CardTitle>
            <CardDescription>Testing the main heading with gradient</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-center ${isRTL ? 'rtl-content' : ''}`}>
              {/* Original Implementation */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Original (Fixed) Implementation</h3>
                <h1 className={`text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight ${
                  isRTL ? 'font-arabic rtl-gradient' : ''
                }`}>
                  {t('financial_health_assessment')}
                </h1>
                <p className={`text-xl text-muted-foreground max-w-2xl mx-auto ${
                  isRTL ? 'leading-relaxed' : ''
                }`}>
                  {t('trusted_uae_institution')}
                </p>
              </div>

              {/* Alternative Implementation */}
              <div className="mb-8 border-t pt-8">
                <h3 className="text-lg font-semibold mb-4">Alternative Implementation</h3>
                <h1 className={`text-4xl md:text-6xl font-bold mb-4 text-gradient-primary leading-tight ${
                  isRTL ? 'font-arabic' : ''
                }`}>
                  {t('financial_health_assessment')}
                </h1>
                <p className={`text-xl text-muted-foreground max-w-2xl mx-auto ${
                  isRTL ? 'leading-relaxed' : ''
                }`}>
                  {t('get_personalized_insights')}
                </p>
              </div>

              {/* CSS Class Test */}
              <div className="mb-8 border-t pt-8">
                <h3 className="text-lg font-semibold mb-4">CSS Class Test</h3>
                <h1 className={`arabic-heading bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent ${
                  isRTL ? 'font-arabic' : ''
                }`}>
                  {t('financial_health_assessment')}
                </h1>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CSS Debug Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>CSS Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium">Document Direction</div>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {mounted ? document.documentElement.dir : 'Loading...'}
                </code>
              </div>
              <div>
                <div className="text-sm font-medium">Document Language</div>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {mounted ? document.documentElement.lang : 'Loading...'}
                </code>
              </div>
              <div>
                <div className="text-sm font-medium">CSS Custom Properties</div>
                <div className="text-xs space-y-1">
                  <div>--text-align-start: {mounted ? getComputedStyle(document.documentElement).getPropertyValue('--text-align-start') : 'Loading...'}</div>
                  <div>--text-align-end: {mounted ? getComputedStyle(document.documentElement).getPropertyValue('--text-align-end') : 'Loading...'}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gradient Test Swatches */}
        <Card>
          <CardHeader>
            <CardTitle>Gradient Test Swatches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Primary to Accent</div>
                <div className="h-16 bg-gradient-to-r from-primary to-accent rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Text Gradient</div>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Test
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Button Gradient</div>
                <Button className="w-full button-gradient">Test Button</Button>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">CSS Utility</div>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gradient-primary">
                    Test
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}