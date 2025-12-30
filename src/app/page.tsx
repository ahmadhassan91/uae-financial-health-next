'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  HomepageHeader,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  HomepageFooter 
} from '@/components/homepage';
import { ConsentModal } from '@/components/ConsentModal';
import { consentService } from '@/services/consentService';
import { toast } from 'sonner';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showConsent, setShowConsent] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [isCheckingConsent, setIsCheckingConsent] = useState(true);
  const [companyUrl, setCompanyUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Check for company parameters and consent on mount
  useEffect(() => {
    const company = searchParams.get('company');
    const session = searchParams.get('session');
    
    if (company) {
      setCompanyUrl(company);
      setSessionId(session);
    }

    const checkConsent = async () => {
      const hasValidConsent = await consentService.hasConsent();
      setHasConsent(hasValidConsent);
      setIsCheckingConsent(false);
    };

    checkConsent();
  }, [searchParams]);

  const handleConsentGranted = () => {
    setShowConsent(false);
    
    // If this is a company link, proceed to financial clinic with company context
    if (companyUrl) {
      const url = sessionId 
        ? `/financial-clinic?company=${companyUrl}&session=${sessionId}`
        : `/financial-clinic?company=${companyUrl}`;
      router.push(url);
    } else {
      router.push('/profile');
    }
    
    toast.success('Consent recorded. Proceeding to Financial Clinic.');
  };

  const handleConsentDeclined = () => {
    setShowConsent(false);
    toast.error('Consent is required to use this service.');
  };

  // Auto-show consent for company links if not already consented
  useEffect(() => {
    if (!isCheckingConsent && companyUrl && !hasConsent) {
      setShowConsent(true);
    }
  }, [isCheckingConsent, companyUrl, hasConsent]);

  return (
    <div className="w-full flex flex-col bg-white min-h-screen">
      <HomepageHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
      </main>
      <HomepageFooter />
      
      {/* Consent Modal */}
      {showConsent && (
        <ConsentModal 
          onConsent={handleConsentGranted}
          onDecline={handleConsentDeclined}
        />
      )}
    </div>
  );
}
