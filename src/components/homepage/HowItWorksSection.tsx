"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocalization } from "@/contexts/LocalizationContext";
import { ConsentModal } from "@/components/ConsentModal";
import { consentService } from "@/services/consentService";

const steps = [
  {
    titleEn: "Step 1: Take Your Checkup",
    titleAr: "الخطوة الأولى: إجراء التقييم",
    descriptionEn:
      "Answer a few simple questions about your income, savings, spending, and goals.",
    descriptionAr:
      "أجيبوا على مجموعة من الأسئلة البسيطة حول دخلكم، مدخراتكم، إنفاقكم، وأهدافكم المالية.",
  },
  {
    titleEn: "Step 2: Get Your Score",
    titleAr: "الخطوة الثانية: الحصول على النتيجة",
    descriptionEn:
      "See your personalized Financial Health Score with a clear breakdown of strengths and improvement areas.",
    descriptionAr:
      "اطّلعوا على التقييم الشخصي لصحّة أوضاعكم المالية، مع عرض واضح لنقاط القوة ومجالات التحسين الممكنة.",
  },
  {
    titleEn: "Step 3: Take Action",
    titleAr: "الخطوة الثالثة: اتّخاذ الخطوات المناسبة",
    descriptionEn:
      "Receive tailored recommendations from financial habits to National Bonds solutions that can help you grow your wealth securely.",
    descriptionAr:
      "احصلوا على توصيات مُعدّة خصيصاً لكم، تتنوّع ما بين السلوكيات المالية وحلول الصكوك الوطنية التي يُمكن أن تُساعدكم على تعزيز قيمة أموالكم بطريقة آمنة.",
  },
];

export function HowItWorksSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLocalization();
  const [showConsent, setShowConsent] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);

  // Get company URL from query params if present
  const companyParam = searchParams?.get ? searchParams.get("company") : null;
  const sessionParam = searchParams?.get ? searchParams.get("session") : null;

  // Check for consent on mount
  useEffect(() => {
    const checkConsent = async () => {
      const hasValidConsent = await consentService.hasConsent();
      setHasConsent(hasValidConsent);
    };

    checkConsent();
  }, []);

  const handleStartCheckup = () => {
    console.log(
      "🚀 START button clicked (How It Works). Has consent:",
      hasConsent
    );
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
    // Preserve company/session context if present
    if (companyParam) {
      const sessionPart = sessionParam
        ? `&session=${encodeURIComponent(sessionParam)}`
        : "";
      router.push(
        `/financial-clinic?company=${encodeURIComponent(companyParam)}${sessionPart}`
      );
    } else {
      router.push("/financial-clinic");
    }
  };

  const handleDecline = () => {
    setShowConsent(false);
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 sm:gap-10 md:gap-[65px] py-6 sm:py-10 px-2 sm:px-4">
      <div className="w-full flex flex-col lg:flex-row items-stretch gap-0 rounded-lg overflow-hidden">
        {/* Left Side - Image */}
        <div className="w-full h-[180px] xs:h-[240px] sm:h-[320px] md:h-[400px] lg:h-[850px] overflow-hidden relative rounded-lg lg:w-[100%]">
          <img
            width="1000px"
            src="/homepage/images/frame-12.png"
            alt="How it works background"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side - Content */}
        <div className="w-full lg:w-1/2 p-4 xs:p-6 sm:p-8 md:p-12 lg:p-[5%] bg-white">
          <div className="flex flex-col items-start gap-4 xs:gap-6 sm:gap-8 md:gap-[46px] w-full">
            <h2 className="self-stretch font-semibold text-[#5E5E5E] text-lg xs:text-xl sm:text-2xl md:text-[33px] tracking-[0] leading-tight sm:leading-[38px]">
              {language === "ar" ? "كيف يعمل" : "How It Works"}
            </h2>

            {steps.map((step, index) => (
              <div
                key={index}
                className="items-start gap-2 xs:gap-3 flex w-full"
              >
                <img
                  className="flex-shrink-0 w-5 h-5 xs:w-6 xs:h-6 mt-0.5"
                  alt="Tick circle"
                  src="/homepage/icons/tick.svg"
                />

                <div className="flex flex-col items-start justify-center gap-1 flex-1">
                  <h4 className="w-full font-semibold text-[#bd912e] text-xs xs:text-sm sm:text-base tracking-[0] leading-5 sm:leading-6">
                    {language === "ar" ? step.titleAr : step.titleEn}
                  </h4>

                  <p className="self-stretch font-normal text-[#575757] text-xs xs:text-sm sm:text-base tracking-[0] leading-5 sm:leading-[21px]">
                    {language === "ar"
                      ? step.descriptionAr
                      : step.descriptionEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Button
        onClick={handleStartCheckup}
        className="h-auto w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-4 sm:px-6 py-2.5 bg-[#5E5E5E] hover:bg-[#5E5E5E]/90 min-h-[44px]"
        style={{ marginTop: "60px" }}
      >
        <span className="w-fit font-normal text-white text-sm sm:text-sm text-center tracking-[0] leading-[18px] whitespace-normal">
          {language === "ar"
            ? "بدء تقييم وضعي المالي"
            : "START MY FINANCIAL CHECKUP"}
        </span>
      </Button>

      {/* Consent Modal */}
      {showConsent && (
        <ConsentModal onConsent={handleConsent} onDecline={handleDecline} />
      )}
    </div>
  );
}
