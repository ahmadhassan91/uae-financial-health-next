'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useLocalization } from '@/contexts/LocalizationContext';
import { ConsentModal } from '@/components/ConsentModal';
import { consentService } from '@/services/consentService';

const steps = [
  {
    titleEn: 'Step 1: Take Your Checkup',
    titleAr: 'الخطوة 1: قم بإجراء الفحص',
    descriptionEn: 'Answer a few simple questions about your income, savings, spending, and goals.',
    descriptionAr: 'أجب على بعض الأسئلة البسيطة حول دخلك ومدخراتك وإنفاقك وأهدافك.',
  },
  {
    titleEn: 'Step 2: Get Your Score',
    titleAr: 'الخطوة 2: احصل على درجتك',
    descriptionEn: 'See your personalized Financial Health Score with a clear breakdown of strengths and improvement areas.',
    descriptionAr: 'شاهد درجة صحتك المالية الشخصية مع تفصيل واضح لنقاط القوة ومجالات التحسين.',
  },
  {
    titleEn: 'Step 3: Take Action',
    titleAr: 'الخطوة 3: اتخذ إجراءً',
    descriptionEn: 'Receive tailored recommendations from financial habits to National Bonds solutions that can help you grow your wealth securely.',
    descriptionAr: 'احصل على توصيات مخصصة من العادات المالية إلى حلول صكوك الوطنية التي يمكن أن تساعدك على تنمية ثروتك بأمان.',
  },
];

export function HowItWorksSection() {
  const router = useRouter();
  const { language } = useLocalization();
  const [showConsent, setShowConsent] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);

  // Check for consent on mount
  useEffect(() => {
    const checkConsent = async () => {
      const hasValidConsent = await consentService.hasConsent();
      setHasConsent(hasValidConsent);
    };

    checkConsent();
  }, []);

  const handleStartCheckup = () => {
    console.log('🚀 START button clicked (How It Works). Has consent:', hasConsent);
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
    router.push('/financial-clinic');
  };

  const handleDecline = () => {
    setShowConsent(false);
  };

  return (
    <div className="w-full flex flex-col items-center gap-[65px] px-4 py-12">
      <div
        className="w-full h-[450px] md:h-[541px] bg-cover bg-center bg-no-repeat relative rounded-lg overflow-hidden"
        style={{ backgroundImage: 'url(/homepage/images/frame-12.png)' }}
      >
        <div className="flex flex-col w-full md:max-w-[672px] h-full items-center justify-center gap-2.5 px-6 md:px-[59px] py-[79px] absolute right-0 bg-white">
          <div className="flex flex-col w-full max-w-[488px] items-start gap-[47px]">
            <div className="flex flex-col items-start gap-[46px] w-full">
              <h2 className="self-stretch mt-[-1.00px] font-semibold text-[#437749] text-2xl md:text-[33px] tracking-[0] leading-[38px]">
                {language === 'ar' ? 'كيف يعمل' : 'How It Works'}
              </h2>

              {steps.map((step, index) => (
                <div key={index} className="items-start gap-3 flex w-full">
                  <img
                    className="flex-shrink-0 w-6 h-6"
                    alt="Tick circle"
                    src="/homepage/icons/tick.svg"
                  />

                  <div className="flex flex-col items-start justify-center gap-1.5 flex-1">
                    <h4 className="w-full mt-[-1.00px] font-semibold text-[#437749] text-sm tracking-[0] leading-6">
                      {language === 'ar' ? step.titleAr : step.titleEn}
                    </h4>

                    <p className="self-stretch font-normal text-[#a1aeb7] text-sm tracking-[0] leading-[21px]">
                      {language === 'ar' ? step.descriptionAr : step.descriptionEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Button 
        onClick={handleStartCheckup}
        className="h-auto inline-flex items-center justify-center gap-2.5 px-7 py-2.5 bg-[#3fab4c] hover:bg-[#3fab4c]/90"
      >
        <span className="w-fit mt-[-1.00px] font-normal text-white text-sm text-center tracking-[0] leading-[18px] whitespace-nowrap">
          {language === 'ar'
            ? 'ابدأ الفحص المالي'
            : 'START MY FINANCIAL CHECKUP'}
        </span>
      </Button>

      {/* Consent Modal */}
      {showConsent && (
        <ConsentModal 
          onConsent={handleConsent}
          onDecline={handleDecline}
        />
      )}
    </div>
  );
}
