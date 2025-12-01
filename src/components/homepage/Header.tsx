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
    setLanguage(language === "en" ? "ar" : "en");
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
      router.push("/financial-clinic/login");
      return;
    }

    // User is logged in, navigate directly to history page
    // The history page will handle authentication and data fetching
    router.push("/financial-clinic/history");
  };

  return (
    <header className="flex flex-col w-full bg-white border-b border-[#c2d1d9]">
      {/* Top row: Menu items aligned right */}
      <div className="flex w-full items-center justify-end px-6 md:px-[90px] py-3 gap-4 md:gap-6">
        <Link href="/">
          <Button
            variant="ghost"
            className="h-auto p-2 font-normal text-[#1b1f26b8] text-sm md:text-base tracking-[0.16px] hover:bg-transparent hover:text-[#1b1f26]"
          >
            {language === "ar" ? "الرئيسية" : "Home"}
          </Button>
        </Link>

        <Button
          variant="ghost"
          onClick={toggleLanguage}
          className="h-auto p-2 font-normal text-[#1b1f26b8] text-sm md:text-base tracking-[0.16px] hover:bg-transparent hover:text-[#1b1f26]"
        >
          {language === "ar" ? "EN" : "AR"}
        </Button>
      </div>

      {/* Bottom row: Dual logos centered */}
      <div className="flex w-full items-center justify-center px-6 md:px-[90px] py-6 md:py-8">
        <div className="flex items-center gap-6 md:gap-8">
          {/* National Bonds Logo */}
          <Link href="/">
            <img
              className="h-[50px] md:h-[60px] cursor-pointer object-contain"
              alt="National Bonds Logo"
              src="/homepage/images/nbc-logo2-02-1.png"
            />
          </Link>

          {/* Divider */}
          <div className="h-12 md:h-14 w-px bg-[#c2d1d9]" />

          {/* Financial Clinic Logo */}
          <Link href="/">
            <img
              className="h-[40px] md:h-[50px] cursor-pointer"
              alt="Financial Clinic Logo"
              src="/homepage/icons/logo.svg"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
