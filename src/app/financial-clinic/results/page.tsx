'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FinancialClinicResults } from '@/components/FinancialClinicResults';
import { FinancialClinicAccountModal } from '@/components/FinancialClinicAccountModal';
import { useAuth } from '@/contexts/AuthContext';
import type { FinancialClinicResult } from '@/lib/financial-clinic-types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function FinancialClinicResultsPage() {
  const router = useRouter();
  const { isAuthenticated, session, user } = useAuth();
  const [result, setResult] = useState<FinancialClinicResult | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAccountModal, setShowAccountModal] = useState(false);

  useEffect(() => {
    // Load result from localStorage
    const storedResult = localStorage.getItem('financialClinicResult');
    const storedProfile = localStorage.getItem('financialClinicProfile');
    
    if (storedResult) {
      try {
        const parsedResult = JSON.parse(storedResult);
        setResult(parsedResult);
        
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        }
      } catch (error) {
        console.error('Failed to parse result:', error);
        toast.error('Failed to load results. Please retake the assessment.');
        router.push('/financial-clinic');
      }
    } else {
      // No result found - redirect to start
      toast.error('No results found. Please complete the assessment first.');
      router.push('/financial-clinic');
    }
    
    setLoading(false);
  }, [router]);

  // Modal is now only shown when user explicitly clicks "Access History"
  // No longer auto-showing after 5 seconds per client request
  // Results are auto-saved with email from profile

  const handleAccountCreated = (user: any) => {
    // Update login status
    setShowAccountModal(false);
    
    toast.success('Your results have been saved to your account!');
    
    // Optionally update result with user info
    if (result && user) {
      const updatedResult = {
        ...result,
        user_id: user.id,
        email: user.email
      };
      setResult(updatedResult);
      localStorage.setItem('financialClinicResult', JSON.stringify(updatedResult));
    }
  };

  const handleShowAccountModal = () => {
    setShowAccountModal(true);
  };

  const handleRetake = () => {
    // Clear stored data
    localStorage.removeItem('financialClinicResult');
    localStorage.removeItem('financialClinicProfile');
    
    // Redirect to start
    router.push('/financial-clinic');
    
    toast.success('Starting new assessment...');
  };

  const handleViewProducts = () => {
    // TODO: Implement product catalog page
    toast.info('Product catalog coming soon!');
  };

  const handleDownloadPDF = async () => {
    if (!result) return;
    
    try {
      toast.info('Generating PDF report...');
      
      // Add aggressive cache-busting to force fresh request
      const cacheBuster = `?t=${Date.now()}&r=${Math.random()}`;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/financial-clinic/report/pdf${cacheBuster}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        cache: 'no-store',
        body: JSON.stringify({
          result: result,
          profile: JSON.parse(localStorage.getItem('financialClinicProfile') || '{}'),
          language: 'en' // Could be from localization context
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to generate PDF');
      }

      // Check if response is JSON (error/note) or PDF
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        if (data.note) {
          toast.warning(data.note);
        }
        return;
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-clinic-report-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('PDF report downloaded successfully!');
    } catch (error) {
      console.error('PDF download error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to download PDF report');
    }
  };

  const handleEmailReport = async () => {
    if (!result) return;
    
    try {
      // Get email from profile or prompt user
      const storedProfile = localStorage.getItem('financialClinicProfile');
      let email = '';
      
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        email = profile.email;
      }
      
      if (!email) {
        email = prompt('Please enter your email address:') || '';
        if (!email) {
          toast.error('Email address is required');
          return;
        }
      }
      
      toast.info('Sending email report...');
      
      // Prepare request payload
      const payload = {
        result: result,
        profile: JSON.parse(storedProfile || '{}'),
        email: email,
        language: 'en' // Could be from localization context
      };
      
      // Debug: Log what we're sending
      console.log('📧 Email Request Payload:', {
        result_type: typeof payload.result,
        result_keys: payload.result ? Object.keys(payload.result) : [],
        profile_type: typeof payload.profile,
        email: payload.email
      });
      
      // Add aggressive cache-busting to force fresh request
      const cacheBuster = `?t=${Date.now()}&r=${Math.random()}`;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/financial-clinic/report/email${cacheBuster}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        cache: 'no-store',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to send email');
      }

      const data = await response.json();
      
      if (data.note) {
        toast.info(data.note);
      } else if (data.success) {
        toast.success(`Email report will be sent to ${email}!`);
      }
    } catch (error) {
      console.error('Email send error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send email report');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading your results...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No result state
  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">No Results Found</h2>
              <p className="text-muted-foreground">
                Please complete the Financial Clinic assessment first.
              </p>
              <Button onClick={() => router.push('/financial-clinic')}>
                Start Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <FinancialClinicResults
        result={result}
        onRetake={handleRetake}
        onViewProducts={handleViewProducts}
        onDownloadPDF={handleDownloadPDF}
        onEmailReport={handleEmailReport}
        onShowAccountModal={handleShowAccountModal}
      />
      {result && profile && (
        <FinancialClinicAccountModal
          isOpen={showAccountModal}
          onClose={() => setShowAccountModal(false)}
          onSuccess={handleAccountCreated}
          currentResult={result}
          currentProfile={profile}
          language="en"
        />
      )}
    </>
  );
}
