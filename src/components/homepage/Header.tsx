'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLocalization } from '@/contexts/LocalizationContext';

export function HomepageHeader() {
  const { language, setLanguage } = useLocalization();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <header className="flex w-full items-center justify-between px-6 md:px-[90px] py-[42px] bg-white border-b border-[#c2d1d9]">
      <Link href="/">
        <img
          className="w-[140px] md:w-[179.53px] cursor-pointer"
          alt="Financial Clinic Logo"
          src="/homepage/icons/logo.svg"
        />
      </Link>

      <nav className="flex items-center gap-6 md:gap-10">
        {/* Sign-in button removed - not needed for public surveys */}
        
        <Button
          variant="ghost"
          onClick={toggleLanguage}
          className="h-auto p-0 font-normal text-[#1b1f26b8] text-sm md:text-base tracking-[0.16px] hover:bg-transparent hover:text-[#1b1f26]"
        >
          {language === 'ar' ? 'EN' : 'AR'}
        </Button>
      </nav>
    </header>
  );
}
