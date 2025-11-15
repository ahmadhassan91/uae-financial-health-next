'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomerProfileForm } from '@/components/CustomerProfileForm';
import { useLocalization } from '@/contexts/LocalizationContext';
import { CustomerProfile } from '@/lib/types';

export default function TestProfileFormPage() {
  const { language, setLanguage } = useLocalization();
  const [showForm, setShowForm] = useState(false);
  const [completedProfile, setCompletedProfile] = useState<CustomerProfile | null>(null);

  const handleProfileComplete = (profile: CustomerProfile) => {
    setCompletedProfile(profile);
    alert('Profile completed! Check console for data.');
    console.log('Profile data:', profile);
  };

  if (showForm) {
    return (
      <CustomerProfileForm
        onComplete={handleProfileComplete}
        existingProfile={null}
      />
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Test Profile Form Localization</CardTitle>
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

          <Button 
            onClick={() => setShowForm(true)}
            className="w-full"
          >
            Show Profile Form
          </Button>

          <div className="text-sm text-muted-foreground">
            <p>This will test:</p>
            <ul className="list-disc list-inside ml-4">
              <li>Profile form text localization</li>
              <li>Field labels in Arabic/English</li>
              <li>Dropdown options translation</li>
              <li>Error messages localization</li>
              <li>RTL layout for Arabic</li>
            </ul>
          </div>

          {completedProfile && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Completed Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(completedProfile, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}