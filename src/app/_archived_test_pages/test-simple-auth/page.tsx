'use client';

import { useState } from 'react';
import { SimpleAuthForm } from '@/components/SimpleAuthForm';
import { useSimpleAuth } from '@/hooks/use-simple-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestSimpleAuthPage() {
  const { isAuthenticated, user, logout } = useSimpleAuth();
  const [showAuthForm, setShowAuthForm] = useState(!isAuthenticated);

  if (showAuthForm && !isAuthenticated) {
    return (
      <SimpleAuthForm
        onSuccess={() => setShowAuthForm(false)}
        onBack={() => window.history.back()}
        title="Test Simple Authentication"
        description="This is a test page for the simple authentication system"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Simple Authentication Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800">Authentication Successful!</h3>
                  <p className="text-green-700">Email: {user?.email}</p>
                  <p className="text-green-700">Session ID: {user?.sessionId}</p>
                  <p className="text-green-700">Survey History: {user?.surveyHistory?.length || 0} assessments</p>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={logout} variant="outline">
                    Logout
                  </Button>
                  <Button onClick={() => setShowAuthForm(true)}>
                    Test Auth Form Again
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-800">Not Authenticated</h3>
                  <p className="text-blue-700">Click the button below to test simple authentication</p>
                </div>
                
                <Button onClick={() => setShowAuthForm(true)}>
                  Test Simple Authentication
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}