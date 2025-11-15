'use client';

import React from 'react';
import { 
  HomepageHeader,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  HomepageFooter 
} from '@/components/homepage';

export default function HomePage() {
  return (
    <div className="w-full flex flex-col bg-white min-h-screen">
      <HomepageHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
      </main>
      <HomepageFooter />
    </div>
  );
}
