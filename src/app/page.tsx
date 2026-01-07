'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  HomepageHeader,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  HomepageFooter 
} from '@/components/homepage';

function HomePageContent() {
  const searchParams = useSearchParams();

  // Check for company parameters on mount and persist to localStorage
  useEffect(() => {
    const company = searchParams.get('company');
    const session = searchParams.get('session');
    
    if (company) {
      // Persist company context so profile flow can pick it up if user needs to complete profile
      try {
        localStorage.setItem('company-context', JSON.stringify({
          companyId: company,
          companyName: null,
          referralSource: 'company-link',
          sessionId: session
        }));
      } catch (e) {
        console.warn('Failed to persist company-context', e);
      }
    }
  }, [searchParams]);

  // Note: Consent modal is intentionally NOT auto-shown on landing when a company link is used.
  // Consent is shown when the user clicks the Start CTA (handled inside HeroSection).

  return (
    <div className="w-full flex flex-col bg-white min-h-screen">
      <HomepageHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
      </main>
      <HomepageFooter />
      {/* Consent modal is handled inside HeroSection to avoid premature prompting on landing */}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
