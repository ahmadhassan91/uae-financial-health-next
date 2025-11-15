'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, UserPlus } from 'lucide-react';
import { SimpleAuthForm } from './SimpleAuthForm';
import { useGuestMigration } from '@/hooks/use-guest-migration';

interface GuestDataMigrationProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export function GuestDataMigration({ onComplete, onSkip }: GuestDataMigrationProps) {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);
  const { migrateGuestData, loading, error, clearError } = useGuestMigration();

  const handleAuthSuccess = async () => {
    try {
      await migrateGuestData();
      setMigrationComplete(true);
      onComplete?.();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleSkip = () => {
    onSkip?.();
  };

  if (showAuthForm) {
    return (
      <SimpleAuthForm
        onSuccess={handleAuthSuccess}
        onBack={() => setShowAuthForm(false)}
        title="Save Your Assessment"
        description="Enter your email and date of birth to save your assessment results and access them later"
      />
    );
  }

  if (migrationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Save className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Assessment Saved!</CardTitle>
            <CardDescription>
              Your assessment results have been saved and you can now access them anytime using your email and date of birth.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onComplete} className="w-full">
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Save Your Results?</CardTitle>
          <CardDescription>
            Would you like to save your assessment results so you can access them later and track your progress over time?
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button 
              onClick={() => setShowAuthForm(true)} 
              className="w-full"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Yes, Save My Results
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleSkip} 
              className="w-full"
              disabled={loading}
            >
              Continue Without Saving
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Saving your results allows you to:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• Track your progress over time</li>
              <li>• Access personalized recommendations</li>
              <li>• Compare multiple assessments</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}