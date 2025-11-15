import React from 'react';
import Image from 'next/image';

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

  // Choose logo based on variant
  const getLogoSrc = () => {
    switch (variant) {
      case 'primary':
        return '/logos/nbc-logo.jpg';
      case 'secondary':
        return '/logos/nbc-logo-02.png';
      case 'full':
        return '/logos/nbc-logo.jpg';
      default:
        return '/logos/nbc-logo-01.png';
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