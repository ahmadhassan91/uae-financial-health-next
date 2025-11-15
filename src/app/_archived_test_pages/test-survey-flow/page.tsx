'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SurveyFlow } from '@/components/SurveyFlow';
import { useLocalization } from '@/contexts/LocalizationContext';
import { CustomerProfile } from '@/lib/types';

export default function TestSurveyFlowPage() {
  const { language, setLanguage } = useLocalization();
  const [showSurvey, setShowSurvey] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});

  // Mock customer profile
  const mockProfile: CustomerProfile = {
    name: 'Test User',
    age: 35,
    gender: 'Male',
    nationality: 'UAE National',
    children: 'Yes', // This should show Q16
    employmentStatus: 'Employed Full-Time',
    employmentSector: 'Technology',
    monthlyIncome: '15000-25000',
    emirate: 'Dubai',
    email: 'test@example.com',
    phoneNumber: '+971501234567'
  };

  const handleResponse = (questionId: string, value: number) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const getResponse = (questionId: string) => {
    return responses[questionId];
  };

  const handleComplete = () => {
    alert('Survey completed! Check console for responses.');
    console.log('Survey responses:', responses);
  };

  if (showSurvey) {
    return (
      <SurveyFlow
        currentStep={currentStep}
        customerProfile={mockProfile}
        onStepChange={setCurrentStep}
        onResponse={handleResponse}
        getResponse={getResponse}
        onComplete={handleComplete}
      />
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Test Survey Flow with Arabic Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Current Language:</strong> {language}
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

          <div className="space-y-2">
            <h3 className="font-semibold">Mock Profile:</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Name: {mockProfile.name}</li>
              <li>Age: {mockProfile.age}</li>
              <li>Children: {mockProfile.children} (should show Q16)</li>
              <li>Nationality: {mockProfile.nationality}</li>
            </ul>
          </div>

          <Button 
            onClick={() => setShowSurvey(true)}
            className="w-full"
          >
            Start Survey Flow Test
          </Button>

          <div className="text-sm text-muted-foreground">
            <p>This will test:</p>
            <ul className="list-disc list-inside ml-4">
              <li>Arabic question loading from API</li>
              <li>Question filtering (Q16 should appear since children = 'Yes')</li>
              <li>RTL layout for Arabic</li>
              <li>Question navigation</li>
              <li>Response handling</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}