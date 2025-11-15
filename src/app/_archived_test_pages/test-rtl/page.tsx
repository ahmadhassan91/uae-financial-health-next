'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLocalization } from '@/contexts/LocalizationContext';
import { ArrowLeft, ArrowRight, Globe, User, Envelope, Phone } from '@phosphor-icons/react';

export default function RTLTestPage() {
  const { t, isRTL, formatNumber, formatDate } = useLocalization();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        {/* Header with Language Selector */}
        <div className={`flex justify-between items-center mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h1 className={`text-3xl font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
            RTL Layout Test Page
          </h1>
          <LanguageSelector />
        </div>

        {/* Test Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Text Direction Test */}
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Globe className="h-5 w-5" />
                {t('language_selector')}
              </CardTitle>
              <CardDescription>
                Testing text direction and alignment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                <p>Current language: <strong>{isRTL ? 'العربية' : 'English'}</strong></p>
                <p>Direction: <strong>{isRTL ? 'RTL' : 'LTR'}</strong></p>
                <p>Sample number: <strong>{formatNumber(12345.67)}</strong></p>
                <p>Sample date: <strong>{formatDate(new Date())}</strong></p>
              </div>
            </CardContent>
          </Card>

          {/* Form Elements Test */}
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <User className="h-5 w-5" />
                {t('personal_information')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className={isRTL ? 'text-right' : 'text-left'}>
                  {t('first_name')}
                </Label>
                <Input
                  id="name"
                  placeholder={t('first_name')}
                  className={isRTL ? 'text-right' : 'text-left'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className={isRTL ? 'text-right' : 'text-left'}>
                  {t('email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('email')}
                  className={isRTL ? 'text-right' : 'text-left'}
                />
              </div>
            </CardContent>
          </Card>

          {/* Radio Group Test */}
          <Card>
            <CardHeader>
              <CardTitle>{t('gender')}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup className="space-y-2">
                <div className={`flex items-center p-3 rounded-lg border hover:bg-accent/30 ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male" className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('male')}
                  </Label>
                </div>
                <div className={`flex items-center p-3 rounded-lg border hover:bg-accent/30 ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female" className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('female')}
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Progress and Badges Test */}
          <Card>
            <CardHeader>
              <CardTitle>{t('progress_overview')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className={`flex justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-sm">{t('completed')}</span>
                  <span className="text-sm">75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Badge variant="default">{t('excellent')}</Badge>
                <Badge variant="secondary">{t('good')}</Badge>
                <Badge variant="outline">{t('fair')}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Buttons Test */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Button
                variant="outline"
                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <ArrowLeft className={`h-4 w-4 ${isRTL ? 'transform-rtl' : ''}`} />
                {t('previous_question')}
              </Button>
              
              <Button
                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                {t('next_question')}
                <ArrowRight className={`h-4 w-4 ${isRTL ? 'transform-rtl' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Icon Grid Test */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Icon Alignment Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`flex items-center gap-2 p-3 border rounded ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Envelope className="h-4 w-4" />
                <span className="text-sm">{t('email')}</span>
              </div>
              <div className={`flex items-center gap-2 p-3 border rounded ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Phone className="h-4 w-4" />
                <span className="text-sm">{t('phone_number')}</span>
              </div>
              <div className={`flex items-center gap-2 p-3 border rounded ${isRTL ? 'flex-row-reverse' : ''}`}>
                <User className="h-4 w-4" />
                <span className="text-sm">{t('personal_information')}</span>
              </div>
              <div className={`flex items-center gap-2 p-3 border rounded ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Globe className="h-4 w-4" />
                <span className="text-sm">{t('language_selector')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mixed Content Test */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Mixed Content Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`p-4 bg-muted rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}>
                <h3 className="font-semibold mb-2">
                  {isRTL ? 'نص عربي مع أرقام إنجليزية' : 'English text with numbers'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isRTL 
                    ? 'هذا نص تجريبي باللغة العربية يحتوي على أرقام: 123, 456, 789'
                    : 'This is sample text in English containing numbers: 123, 456, 789'
                  }
                </p>
                <div className="mt-2">
                  <span className="western-numerals font-mono">
                    Score: {formatNumber(85.5)}%
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