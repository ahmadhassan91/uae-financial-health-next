import React from 'react';
import Image from 'next/image';
import { useLocalization } from '@/contexts/LocalizationContext';

interface FinancialClinicLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function FinancialClinicLogo({
  className = "",
  width = 250,
  height = 70
}: FinancialClinicLogoProps) {
  const { language } = useLocalization();

  // Choose logo based on language
  const getLogoSrc = () => {
    if (language === 'ar') {
      return '/homepage/icons/Financial-Clinic-logo-04.png';
    }
    return '/logos/financial-clinic-logo.svg'; // Assuming there's an English SVG version
  };

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src={getLogoSrc()}
        alt="Financial Clinic"
        width={width}
        height={height}
        className="object-contain drop-shadow-sm"
        priority
      />
    </div>
  );
}
