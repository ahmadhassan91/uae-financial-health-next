"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/contexts/LocalizationContext";
import { toast } from "sonner";

export function HomepageHeader() {
  const { language, setLanguage } = useLocalization();
  const router = useRouter();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  const handleViewResults = async () => {
    // Try to get email from localStorage
    const storedProfile = localStorage.getItem("financialClinicProfile");
    let email = "";

    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile);
        email = profile.email;
      } catch (e) {
        console.error("Failed to parse stored profile");
      }
    }

    if (!email) {
      // No email found, prompt user to enter email first
      toast.info(
        language === "ar"
          ? "الرجاء إدخال بريدك الإلكتروني أولاً في صفحة التقييم"
          : "Please enter your email on the assessment page first"
      );
      router.push("/financial-clinic");
      return;
    }

    // Check if user has any results
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/financial-clinic/history/${encodeURIComponent(email)}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          // User has results, navigate to results page (latest)
          router.push("/financial-clinic/results");
        } else {
          toast.info(
            language === "ar"
              ? "لا توجد نتائج سابقة. يرجى إكمال التقييم أولاً"
              : "No previous results found. Please complete the assessment first"
          );
          router.push("/financial-clinic");
        }
      } else {
        toast.info(
          language === "ar"
            ? "لا توجد نتائج سابقة. يرجى إكمال التقييم أولاً"
            : "No previous results found. Please complete the assessment first"
        );
        router.push("/financial-clinic");
      }
    } catch (error) {
      console.error("Error checking for results:", error);
      toast.error(
        language === "ar"
          ? "فشل في التحقق من النتائج السابقة"
          : "Failed to check for previous results"
      );
    }
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

      <nav className="flex items-center gap-4 md:gap-6">
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
          onClick={handleViewResults}
          className="h-auto p-2 font-normal text-[#1b1f26b8] text-sm md:text-base tracking-[0.16px] hover:bg-transparent hover:text-[#1b1f26]"
        >
          {language === "ar" ? "النتائج السابقة" : "View Previous Assessments"}
        </Button>

        <Button
          variant="ghost"
          onClick={toggleLanguage}
          className="h-auto p-2 font-normal text-[#1b1f26b8] text-sm md:text-base tracking-[0.16px] hover:bg-transparent hover:text-[#1b1f26]"
        >
          {language === "ar" ? "EN" : "AR"}
        </Button>
      </nav>
    </header>
  );
}
