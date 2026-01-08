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
      <div className={
                language === "ar"
                  ? "flex w-full items-center justify-center px-4 sm:px-6 md:px-[40px] py-4 sm:py-6 md:py-8"
                  : "flex w-full items-center justify-center px-4 sm:px-6 md:px-[90px] py-4 sm:py-6 md:py-8"
              }>
        <div className="flex items-center justify-center">
          {/* National Bonds Logo */}
          <Link href="/">
            <img
              className={
                language === "ar"
                  ? "h-[80px] sm:h-[95px] md:h-[170px] cursor-pointer object-contain"
                  : "h-[42px] sm:h-[58px] md:h-[60px] cursor-pointer object-contain"
              }
              style={
                language === "ar"
                  ? { marginLeft: "35px" }
                  : { marginRight: "35px" }
              }
              alt="National Bonds Logo"
              src={
                language === "ar"
                  ? "/homepage/images/Logo_arb.svg"
                  : "/homepage/images/NATIONAL BONDS LOGO.svg"
              }
            />
          </Link>

          {/* Divider */}
          <div className="h-8 sm:h-12 md:h-14 w-px bg-[#c2d1d9]" />

          {/* Financial Clinic Logo */}
          <Link href="/">
            <img
              className={
                language === "ar"
                  ? "h-[80px] sm:h-[95px] md:h-[100px] cursor-pointer object-cover object-center"
                  : "h-[50px] sm:h-[65px] md:h-[60px] cursor-pointer object-contain"
              }
              style={
                language === "ar"
                  ? {}
                  : { marginLeft: "35px" }
              }
              alt="Financial Clinic Logo"
              src={
                language === "ar"
                  ? "/homepage/icons/Financial Clinic logo-04.png"
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
