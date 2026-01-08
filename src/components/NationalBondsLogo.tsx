import React from 'react';
import Image from 'next/image';
import { useLocalization } from '@/contexts/LocalizationContext';

interface NationalBondsLogoProps {
  className?: string;
  width?: number;
  height?: number;
  variant?: 'primary' | 'secondary' | 'full';
}

export function NationalBondsLogo({
  className = "",
  width = 320,
  height = 80,
  variant = 'primary'
}: NationalBondsLogoProps) {
  const { language } = useLocalization();

  // Choose logo based on variant and language
  const getLogoSrc = () => {
    if (language === 'ar') {
      return '/homepage/images/Logo_arb.svg';
    }
    
    switch (variant) {
      case 'primary':
        return '/homepage/images/NATIONAL BONDS LOGO.svg';
      case 'secondary':
        return '/logos/nbc-logo-02.png';
      case 'full':
        return '/logos/nbc-logo.jpg';
      default:
        return '/homepage/images/NATIONAL BONDS LOGO.svg';
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src={getLogoSrc()}
        alt="National Bonds Corporation"
        width={width}
        height={height}
        className="object-contain drop-shadow-sm"
        priority
      />
    </div>
  );
}