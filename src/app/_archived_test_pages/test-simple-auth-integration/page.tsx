'use client';

import React from 'react';
import { useSimpleAuth } from '@/hooks/use-simple-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, LogOut } from 'lucide-react';

export default function TestSimpleAuthIntegrationPage() {
  const { user, isAuthenticated, logout } = useSimpleAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Simple Authentication Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <Badge variant={isAuthenticated ? "default" : "secondary"}>
                {isAuthenticated ? "Authenticated" : "Not Authenticated"}
              </Badge>
            </div>
            
            {user && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium">Email:</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Date of Birth:</span>
                  <span>{user.dateOfBirth}</span>
                </div>
                {user.surveyHistory && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Survey History:</span>
                    <Badge variant="outline">
                      {user.surveyHistory.length} assessments
                    </Badge>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex gap-2 pt-4">
              {isAuthenticated ? (
                <Button onClick={logout} variant="outline">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <Button onClick={() => window.location.href = '/history'}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Sign In with Email & DOB
                </Button>
              )}
              <Button onClick={() => window.location.href = '/'} variant="outline">
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authentication Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="font-medium">Email + Date of Birth</span>
                <Badge variant="secondary">Primary Method</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Users can save and access their assessment results using just their email address and date of birth. 
                No passwords required - simple and secure authentication for financial health tracking.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features Available</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Anonymous assessment (no login required)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Save results with email + date of birth
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Access previous assessment history
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Track progress over time
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Admin access (traditional login for staff)
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}