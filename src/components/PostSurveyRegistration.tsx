'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Calendar, Mail, UserPlus, X, CheckCircle, History, Download, Send } from 'lucide-react';
import { NationalBondsLogo } from '@/components/NationalBondsLogo';
import { ScoreCalculation } from '@/lib/types';
import { useSimpleAuth } from '@/hooks/use-simple-auth';

interface PostSurveyRegistrationProps {
  guestSurveyData: ScoreCalculation;
  onRegistrationComplete: (user: SimpleUser) => void;
  onSkipRegistration: () => void;
}

interface SimpleUser {
  id: number;
  email: string;
  dateOfBirth: string;
  sessionId: string;
  surveyHistory: any[];
}

interface RegistrationFormData {
  email: string;
  dateOfBirth: string;
  agreeToTerms: boolean;
  subscribeToUpdates: boolean;
}

export function PostSurveyRegistration({ 
  guestSurveyData, 
  onRegistrationComplete, 
  onSkipRegistration 
}: PostSurveyRegistrationProps) {
  const [formData, setFormData] = useState<RegistrationFormData>({
    email: '',
    dateOfBirth: '',
    agreeToTerms: false,
    subscribeToUpdates: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const { registerFromGuest, loading, error, clearError } = useSimpleAuth();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Date of birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const dobDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dobDate.getFullYear();
      
      if (isNaN(dobDate.getTime())) {
        newErrors.dateOfBirth = 'Please enter a valid date';
      } else if (dobDate > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      } else if (age < 16 || age > 120) {
        newErrors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      // Use the authentication hook to register the user
      const userData = await registerFromGuest(
        formData.email,
        formData.dateOfBirth,
        guestSurveyData,
        formData.subscribeToUpdates
      );
      
      // Show success message briefly
      setShowSuccess(true);
      
      // Auto-complete registration after a short delay
      setTimeout(() => {
        onRegistrationComplete(userData);
      }, 2000);

    } catch (error) {
      // Error is handled by the hook
      console.error('Registration failed:', error);
    }
  };

  const handleInputChange = (field: keyof RegistrationFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear global error when user makes changes
    if (error) {
      clearError();
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
            <p className="text-muted-foreground mb-4">
              Your account has been created and your survey results have been saved. 
              You're being logged in automatically...
            </p>
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <NationalBondsLogo className="h-20" width={280} height={70} variant="secondary" />
          </div>
          <div>
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <UserPlus className="h-6 w-6" />
              Save Your Results
            </CardTitle>
            <CardDescription className="text-center">
              Create an account to save your financial health assessment and track your progress over time
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Benefits Section */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Benefits of Creating an Account:</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <History className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Track Progress</div>
                  <div className="text-muted-foreground">View your assessment history and improvements</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Download className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Download Reports</div>
                  <div className="text-muted-foreground">Get PDF reports of your results</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Send className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Email Results</div>
                  <div className="text-muted-foreground">Receive your results via email</div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={loading}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  disabled={loading}
                  className={errors.dateOfBirth ? 'border-destructive' : ''}
                  max={new Date().toISOString().split('T')[0]} // Prevent future dates
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-destructive">{errors.dateOfBirth}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange('agreeToTerms', !!checked)}
                  disabled={loading}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="agreeToTerms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the Terms and Conditions and Privacy Policy
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Required to create an account and save your assessment data
                  </p>
                </div>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-destructive ml-6">{errors.agreeToTerms}</p>
              )}

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="subscribeToUpdates"
                  checked={formData.subscribeToUpdates}
                  onCheckedChange={(checked) => handleInputChange('subscribeToUpdates', !!checked)}
                  disabled={loading}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="subscribeToUpdates"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Subscribe to financial wellness tips and updates
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Optional: Receive helpful financial guidance and product updates
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account & Save Results
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onSkipRegistration}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Skip for Now
              </Button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Your assessment data will be securely stored and you can access it anytime using your email and date of birth.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}