"use client";

import React from "react";
import { useLocalization } from "@/contexts/LocalizationContext";

const features = [
  {
    icon: "/homepage/icons/chart.svg",
    textEn: "Understand where you stand&nbsp;financially",
    textAr: "معرفة وضعكم المالي&nbsp;الحالي",
  },
  {
    icon: "/homepage/icons/improvement.svg",
    textEn: "Identify habits that need&nbsp;improvement",
    textAr: "تحديد السلوكيات التي لا بدّ من&nbsp;تحسينها",
  },
  {
    icon: "/homepage/icons/steps.svg",
    textEn: "Receive easy, actionable steps to reach your&nbsp;goals",
    textAr: "الحصول على خطوات سهلة وعملية لتحقيق&nbsp;أهدافكم",
  },
  {
    icon: "/homepage/icons/products.svg",
    textEn:
      "Discover products and tools designed to empower your financial&nbsp;journey",
    textAr: "اكتشاف البرامج والأدوات المُصممة لدعم رحلتكم&nbsp;المالية",
  },
];

export function FeaturesSection() {
  const { language } = useLocalization();

  return (
    <div className="flex flex-col w-full max-w-[1200px] mx-auto items-start gap-6 sm:gap-8 md:gap-[43px] px-4 py-8 sm:py-12">
      <div className="flex-col items-center gap-4 sm:gap-[22px] flex w-full">
        <div className="inline-flex flex-col items-center">
          <h2 className="w-fit mt-[-1.00px] font-semibold text-[#5E5E5E] text-xl sm:text-2xl md:text-[35px] tracking-[0] leading-tight sm:leading-[38px] text-center px-4">
            {language === "ar"
              ? "لماذا يُعدّ هذا التقييم مهمًا بالنسبة لكم؟"
              : "Why Take the Checkup?"}
          </h2>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 sm:gap-[3px] w-full">
          <p className="self-stretch mt-[-1.00px] font-normal text-[#575757] text-sm sm:text-base text-center tracking-[0] leading-5 sm:leading-6 px-4">
            {language === "ar"
              ? "لأنّ المراجعة الدورية لجودة أوضاعكم المالية أمرٌ ضروريّ."
              : "Because your financial wellbeing deserves a regular checkup."}
          </p>

          <p className="w-fit font-normal text-[#575757] text-sm sm:text-base text-center tracking-[0] leading-5 sm:leading-6 px-4">
            {language === "ar"
              ? "فصحّتكم المالية بحاجة إلى الرعاية والاهتمام، تماماً كصحّتكم الجسدية."
              : "Just like your physical health, your financial health needs care and attention."}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 sm:gap-6 md:gap-[27px] w-full">
        <div className="flex-col items-center gap-4 sm:gap-[22px] flex w-full">
          <div className="inline-flex flex-col items-center">
            <h3 className="w-fit mt-[-1.00px] font-semibold text-[#5E5E5E] text-lg sm:text-xl md:text-2xl tracking-[0] leading-tight sm:leading-[38px] text-center px-4">
              {language === "ar"
                ? "تساعدكم عيادتنا الماليّة على"
                : "The Financial Clinic helps you"}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-2 w-full">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center w-full h-full p-4 sm:p-3"
            >
              <div className="flex flex-col items-center justify-center">
                <img
                  className="w-12 h-12 mb-2 mx-auto"
                  alt="Feature icon"
                  src={feature.icon}
                />
                <span
                  className="text-[#575757] text-xs sm:text-sm tracking-[0] leading-5 sm:leading-6 text-center"
                  dangerouslySetInnerHTML={{
                    __html: language === "ar" ? feature.textAr : feature.textEn,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
