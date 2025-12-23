"use client";

import React from "react";
import { useLocalization } from "@/contexts/LocalizationContext";

export function HomepageFooter() {
  const { language } = useLocalization();

  return (
    <footer className="w-full bg-white py-8 sm:py-12 md:py-16 px-4 sm:px-6 border-t border-gray-200">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center">
        <div className="mb-6 sm:mb-8">
          <img
            src="/logos/national-bonds-logo.png"
            alt="National Bonds"
            className="h-16 sm:h-15 md:h-18 object-contain"
          />
        </div>

        <p className="text-xs sm:text-sm text-[#a1aeb7] text-center px-4">
          {language === "ar"
            ? `© ${new Date().getFullYear()} صكوك الوطنية. جميع الحقوق محفوظة.`
            : `© ${new Date().getFullYear()} National Bonds. All rights reserved.`}
        </p>
      </div>
    </footer>
  );
}
