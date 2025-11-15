'use client';

import React from 'react';
import { useLocalization } from '@/contexts/LocalizationContext';

const features = [
  {
    icon: '/homepage/icons/chart.svg',
    textEn: 'Understand where you stand financially',
    textAr: 'فهم وضعك المالي الحالي',
  },
  {
    icon: '/homepage/images/group-3.png',
    textEn: 'Identify habits that need improvement',
    textAr: 'تحديد العادات التي تحتاج إلى تحسين',
  },
  {
    icon: '/homepage/images/group-2.png',
    textEn: 'Receive easy, actionable steps to reach your goals',
    textAr: 'احصل على خطوات سهلة وقابلة للتنفيذ لتحقيق أهدافك',
  },
  {
    icon: '/homepage/icons/products.svg',
    textEn: 'Discover products and tools designed to empower your financial journey',
    textAr: 'اكتشف المنتجات والأدوات المصممة لتمكين رحلتك المالية',
  },
];

export function FeaturesSection() {
  const { language } = useLocalization();

  return (
    <div className="flex flex-col w-full max-w-[1200px] mx-auto items-start gap-[43px] px-4 py-12">
      <div className="flex-col items-center gap-[22px] flex w-full">
        <div className="inline-flex flex-col items-center">
          <h2 className="w-fit mt-[-1.00px] font-semibold text-[#437749] text-2xl md:text-[35px] tracking-[0] leading-[38px] text-center">
            {language === 'ar' ? 'لماذا يجب إجراء الفحص؟' : 'Why Take the Checkup?'}
          </h2>
        </div>

        <div className="flex flex-col items-center justify-center gap-[3px] w-full">
          <p className="self-stretch mt-[-1.00px] font-normal text-[#a1aeb7] text-base text-center tracking-[0] leading-6">
            {language === 'ar'
              ? 'لأن رفاهيتك المالية تستحق فحصًا منتظمًا.'
              : 'Because your financial wellbeing deserves a regular checkup.'}
          </p>

          <p className="w-fit font-normal text-[#a1aeb7] text-base text-center tracking-[0] leading-6">
            {language === 'ar'
              ? 'تمامًا مثل صحتك البدنية، تحتاج صحتك المالية إلى رعاية واهتمام.'
              : 'Just like your physical health, your financial health needs care and attention.'}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-[27px] w-full">
        <div className="flex-col items-center gap-[22px] flex w-full">
          <div className="inline-flex flex-col items-center">
            <h3 className="w-fit mt-[-1.00px] font-semibold text-[#437749] text-xl md:text-2xl tracking-[0] leading-[38px] text-center">
              {language === 'ar'
                ? 'العيادة المالية تساعدك على'
                : 'The Financial Clinic helps you'}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col w-full items-start gap-3 p-4"
            >
              <img
                className="w-8 h-8"
                alt="Feature icon"
                src={feature.icon}
              />

              <p className="self-stretch font-normal text-[#a1aeb7] text-sm tracking-[0] leading-6">
                {language === 'ar' ? feature.textAr : feature.textEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
