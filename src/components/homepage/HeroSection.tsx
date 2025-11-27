"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useLocalization } from "@/contexts/LocalizationContext";
import { ConsentModal } from "@/components/ConsentModal";
import { consentService } from "@/services/consentService";

export function HeroSection() {
  const router = useRouter();
  const { language } = useLocalization();
  const [showConsent, setShowConsent] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [isCheckingConsent, setIsCheckingConsent] = useState(true);

  // Check for consent on mount
  useEffect(() => {
    const checkConsent = async () => {
      const hasValidConsent = await consentService.hasConsent();
      console.log("🔍 Consent check result:", hasValidConsent);
      setHasConsent(hasValidConsent);
      setIsCheckingConsent(false);
    };

    checkConsent();
  }, []);

  const handleStartCheckup = () => {
    console.log("🚀 START button clicked. Has consent:", hasConsent);
    // ALWAYS show consent modal first (for testing)
    setShowConsent(true);

    // After testing, uncomment this:
    // if (!hasConsent) {
    //   setShowConsent(true);
    // } else {
    //   router.push('/financial-clinic');
    // }
  };

  const handleConsent = () => {
    setShowConsent(false);
    setHasConsent(true);
    router.push("/financial-clinic");
  };

  const handleDecline = () => {
    setShowConsent(false);
  };

  return (
    <section className="flex w-full relative flex-col items-center gap-[65px] px-4 py-[65px]">
      {/* Tagline */}
      <div className="flex flex-col w-full max-w-[1199px] items-center gap-[22px]">
        <div className="inline-flex flex-col items-center">
          <h1 className="w-fit mt-[-1.00px] font-semibold text-[#437749] text-2xl md:text-[33px] tracking-[0] leading-[38px] text-center px-4">
            {language === "ar"
              ? "لبناء عادات مالية أكثر صحة كل يوم"
              : "Inspiring healthier financial habits every day"}
          </h1>

          <p className="self-stretch font-normal text-[#437749] text-lg md:text-2xl text-center tracking-[0] leading-[38px]">
            {language === "ar"
              ? "مع الصكوك الوطنية."
              : "Powered by National Bonds"}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-[3px] w-full max-w-[900px]">
          <p className="self-stretch mt-[-1.00px] font-normal text-[#a1aeb7] text-sm text-center tracking-[0] leading-6 px-4">
            {language === "ar"
              ? "ساعدت الصكوك الوطنية الأفراد والعائلات في مختلف أنحاء الإمارات على بناء مستقبل مالي أفضل لأكثر من 18 عامًا."
              : "For over 18 years National Bonds has empowered individuals and families across the UAE to build a better financial future."}
          </p>

          <p className="w-fit font-normal text-[#a1aeb7] text-sm text-center tracking-[0] leading-6 px-4">
            {language === "ar"
              ? "واليوم، نضع هذه الخبرة بين أيديكم عبر عيادتكم المالية؛ الطريقة التي تجمع بين الرؤية المالية وعلم السلوك لمساعدتكم على اتخاذ قرارات أذكى وأكثر ثقة."
              : "Now, we bring that expertise into your Financial Clinic; combining financial insight with behavioral science to help you make smarter, more confident decisions."}
          </p>
        </div>
      </div>

      {/* Hero Banner with CTA */}
      <div className="w-full h-[500px] md:h-[647px] overflow-hidden relative rounded-lg">
        <img
          src="/homepage/images/frame-9.png"
          alt="Financial health hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className={`absolute ${
            language === "ar" ? "left-0" : "right-0"
          } w-full md:max-w-[647px] h-full flex bg-[#ffffffe6] opacity-90`}
        >
          <div className="flex w-full items-center justify-center px-6 md:px-[59px] py-[79px]">
            <div className="flex flex-col w-full max-w-[494px] items-start gap-7">
              <div className="flex flex-col items-start gap-[21px] w-full">
                <h2 className="self-stretch mt-[-1.00px] font-semibold text-[#437749] text-2xl md:text-[33px] tracking-[0] leading-[38px]">
                  {language === "ar"
                    ? "ما مدى صحة أوضاعكم المالية؟"
                    : "How healthy are your finances?"}
                </h2>

                <p className="self-stretch font-normal text-[#a1aeb7] text-sm tracking-[0] leading-6">
                  {language === "ar"
                    ? "احصلوا على تقييم صحّة أوضاعكم المالية في دقائق، وتعرّفوا على الخطوات المناسبة لتعزيز مستقبلكم المالي."
                    : "Discover your financial health score in minutes, and get personalized steps to strengthen your future."}
                </p>
              </div>

              <Button
                onClick={handleStartCheckup}
                className="h-auto w-auto items-center justify-center gap-2.5 p-2.5 px-6 bg-[#3fab4c] hover:bg-[#3fab4c]/90"
              >
                <span className="w-fit mt-[-1.00px] font-normal text-white text-sm text-center tracking-[0] leading-[18px] whitespace-nowrap">
                  {language === "ar"
                    ? "بدء تقييم وضعي المالي"
                    : "START MY FINANCIAL CHECKUP"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Consent Modal */}
      {showConsent && (
        <ConsentModal onConsent={handleConsent} onDecline={handleDecline} />
      )}
    </section>
  );
}
