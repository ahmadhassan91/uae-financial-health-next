"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/contexts/LocalizationContext";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api-config";

export function HomepageHeader() {
  const { language, setLanguage } = useLocalization();
  const router = useRouter();

  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "ar" : "en";
    setLanguage(newLanguage);

    // Update URL with language parameter
    const currentPath = window.location.pathname;
    const currentSearch = new URLSearchParams(window.location.search);
    currentSearch.set("lang", newLanguage);
    router.push(`${currentPath}?${currentSearch.toString()}`);
  };

  const handleViewResults = async () => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("simpleAuthSession");

    if (!isLoggedIn) {
      // User is not logged in, redirect to login page
      toast.info(
        language === "ar"
          ? "الرجاء تسجيل الدخول لعرض النتائج السابقة"
          : "Please login to view previous assessments"
      );
      router.push(`/financial-clinic/login?lang=${language}`);
      return;
    }

    // User is logged in, navigate directly to history page
    // The history page will handle authentication and data fetching
    router.push("/financial-clinic/history");
  };

  return (
    <header className="flex flex-col w-full bg-white border-b border-[#c2d1d9]">
      {/* Top row: Menu items aligned right */}
      <div className="flex w-full items-center justify-end px-4 sm:px-6 md:px-[90px] py-2 sm:py-3 gap-2 sm:gap-4 md:gap-6">
        <Link href="/">
          <Button
            variant="ghost"
            className="h-auto p-1.5 sm:p-2 font-normal text-[#1b1f26b8] text-xs sm:text-sm md:text-base tracking-[0.16px] hover:bg-transparent hover:text-[#1b1f26]"
          >
            {language === "ar" ? "الرئيسية" : "Home"}
          </Button>
        </Link>

        <Button
          variant="ghost"
          onClick={toggleLanguage}
          className="h-auto p-1.5 sm:p-2 font-normal text-[#1b1f26b8] text-xs sm:text-sm md:text-base tracking-[0.16px] hover:bg-transparent hover:text-[#1b1f26]"
        >
          {language === "ar" ? "EN" : "AR"}
        </Button>
      </div>

      {/* Bottom row: Dual logos centered */}
      <div className="flex w-full items-center justify-center px-2 sm:px-4 md:px-[90px] py-2 sm:py-3 md:py-3">
        <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-6">
          {/* National Bonds Logo */}
          <Link href="/">
            <img
              className="w-[120px] sm:w-[150px] md:w-[180px] lg:w-[200px] h-auto max-h-[80px] cursor-pointer object-contain transition-all duration-300 ease-in-out"
              alt="National Bonds Logo"
              src={
                language === "ar"
                  ? "/homepage/images/Logo_arb.svg"
                  : "/homepage/images/NATIONAL BONDS LOGO.svg"
              }
            />
          </Link>

          {/* Divider */}
          <div className="h-[40px] sm:h-[50px] md:h-[60px] w-px bg-[#c2d1d9] transition-all duration-300 ease-in-out flex-shrink-0" />

          {/* Financial Clinic Logo */}
          <Link href="/">
            <img
              className={
                language === "ar"
                  ? "w-[100px] sm:w-[120px] md:w-[140px] lg:w-[160px] h-auto max-h-[80px] cursor-pointer object-contain object-right transition-all duration-300 ease-in-out"
                  : "w-[120px] sm:w-[150px] md:w-[180px] lg:w-[200px] h-auto max-h-[80px] cursor-pointer object-contain transition-all duration-300 ease-in-out"
              }
              alt="Financial Clinic Logo"
              src={
                language === "ar"
                  ? "/homepage/icons/Financial-Clinic-logo-04.png"
                  : "/homepage/icons/logo.svg"
              }
            />
          </Link>
        </div>
      </div>

      {/* Golden accent line below logos */}
      <div className="w-full h-1 bg-[#bd912e]" />
    </header>
  );
}
