'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Calendar, Mail, ArrowLeft } from 'lucide-react';
import { useSimpleAuth } from '@/hooks/use-simple-auth';
import { NationalBondsLogo } from '@/components/NationalBondsLogo';

interface SimpleAuthFormProps {
  onSuccess?: () => void;
  onBack?: () => void;
  title?: string;
  description?: string;
}

export function SimpleAuthForm({ 
  onSuccess, 
  onBack, 
  title = "Access Your History",
  description = "Enter your email and date of birth to view your previous assessments"
}: SimpleAuthFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    dateOfBirth: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { authenticate, loading, error, clearError } = useSimpleAuth();

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
      await authenticate(formData.email, formData.dateOfBirth);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleInputChange = (field: string, value: string) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <NationalBondsLogo className="h-20" width={280} height={70} variant="secondary" />
          </div>
          <div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription className="text-center">
              {description}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Access History
            </Button>
          </form>

          {onBack && (
            <div className="mt-6 text-center">
              <Button variant="ghost" onClick={onBack} disabled={loading}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have any previous assessments?{' '}
              <Button variant="link" className="p-0 h-auto" onClick={onBack}>
                Take a new assessment
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}