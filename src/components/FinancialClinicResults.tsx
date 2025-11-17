import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StripedProgress } from '@/components/ui/striped-progress';
import { useLocalization } from '@/contexts/LocalizationContext';
import { 
  FinancialClinicResult 
} from '@/lib/financial-clinic-types';
import { RESULTS_COLORS, SCORE_BANDS, CATEGORY_DESCRIPTIONS } from '@/lib/financial-clinic-constants';
import { HomepageHeader } from '@/components/homepage/Header';
import { HomepageFooter } from '@/components/homepage/Footer';
import { ConsultationRequestModal } from '@/components/ConsultationRequestModal';

interface FinancialClinicResultsProps {
  result: FinancialClinicResult;
  onRetake?: () => void;
  onViewProducts?: () => void;
  onDownloadPDF?: () => void;
  onEmailReport?: () => void;
  onShowAccountModal?: () => void;
}

export function FinancialClinicResults({ 
  result, 
  onRetake,
  onViewProducts,
  onDownloadPDF,
  onEmailReport,
  onShowAccountModal
}: FinancialClinicResultsProps) {
  const { t, isRTL, language } = useLocalization();
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);

  // Check if user is logged in
  const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem('simpleAuthSession');

  const handleSaveOrHistory = () => {
    if (isLoggedIn) {
      // User is logged in - go to history
      window.location.href = '/financial-clinic/history';
    } else {
      // Guest user - show account modal
      if (onShowAccountModal) {
        onShowAccountModal();
      } else {
        // Fallback: redirect to history (will show login)
        window.location.href = '/financial-clinic/history';
      }
    }
  };

  const getCategoryTranslation = (category: string): string => {
    const categoryMap: Record<string, { en: string; ar: string }> = {
      'Income Stream': { en: 'Income Stream', ar: 'تدفق الدخل' },
      'Monthly Expenses Management': { en: 'Monthly Expenses Management', ar: 'إدارة النفقات الشهرية' },
      'Savings Habit': { en: 'Saving Habits', ar: 'عادات الادخار' },
      'Emergency Savings': { en: 'Emergency Savings', ar: 'مدخرات الطوارئ' },
      'Debt Management': { en: 'Debt Management', ar: 'إدارة الديون' },
      'Retirement Planning': { en: 'Retirement Planning', ar: 'التخطيط للتقاعد' },
      'Protecting Your Assets | Loved Ones': { en: 'Protecting Your Assets | Loved Ones', ar: 'حماية أصولك | أحبائك' },
      'Planning for Your Future | Siblings': { en: 'Planning for Your Future | Siblings', ar: 'التخطيط لمستقبلك | الأشقاء' },
      'Protecting Your Family': { en: 'Protecting Your Family', ar: 'حماية عائلتك' }
    };
    const categoryData = categoryMap[category];
    return language === 'ar' ? (categoryData?.ar || category) : (categoryData?.en || category);
  };

  const getCategoryDescription = (category: string): string => {
    const desc = CATEGORY_DESCRIPTIONS[category as keyof typeof CATEGORY_DESCRIPTIONS];
    return language === 'ar' ? (desc?.ar || '') : (desc?.en || '');
  };

  const translateInsightCategory = (category: string): string => {
    // Map English insight category names to Arabic
    const categoryMap: Record<string, string> = {
      'Income Stream': 'تدفق الدخل',
      'Monthly Expenses Management': 'إدارة النفقات الشهرية',
      'Savings Habit': 'عادات الادخار',
      'Saving Habits': 'عادات الادخار',
      'Emergency Savings': 'مدخرات الطوارئ',
      'Debt Management': 'إدارة الديون',
      'Retirement Planning': 'التخطيط للتقاعد',
      'Protecting Your Assets | Loved Ones': 'حماية أصولك | أحبائك',
      'Planning for Your Future | Siblings': 'التخطيط لمستقبلك | الأشقاء',
      'Protecting Your Family': 'حماية عائلتك'
    };
    return language === 'ar' ? (categoryMap[category] || category) : category;
  };

  return (
    <div className="w-full flex flex-col bg-white overflow-hidden font-['Poppins',Helvetica]" dir={isRTL ? 'rtl' : 'ltr'}>
      <HomepageHeader />
      
      <section className="flex flex-col items-center gap-6 md:gap-12 lg:gap-[65px] px-3 md:px-6 lg:px-8 py-4 md:py-8 lg:py-12 w-full">
        {/* Hero Section */}
        <div className="flex flex-col items-center gap-3 md:gap-4 lg:gap-[22px] w-full">
          <div className="inline-flex flex-col items-center gap-1.5 px-4">
            <h1 className="font-semibold text-[#437749] text-2xl md:text-[28px] lg:text-[33px] tracking-[0] leading-tight md:leading-[38px] text-center">
              {language === 'ar' 
                ? 'إليك درجة صحتك المالية!' 
                : "Here's your Financial Health Score!"
              }
            </h1>

            <p className="font-normal text-[#a1aeb7] text-xs md:text-sm text-center tracking-[0] leading-5 md:leading-6 max-w-[600px]">
              {language === 'ar' 
                ? 'هذه لمحة سريعة، نظرة واضحة على مدى صحة أموالك اليوم' 
                : 'This is your snapshot; a clear view of how healthy your finances are today.'
              }
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-1 md:gap-[3px] w-full px-4">
            <p className="font-normal text-[#a1aeb7] text-xs md:text-sm text-center tracking-[0] leading-5 md:leading-6 max-w-[600px]">
              {language === 'ar' 
                ? 'تعكس نتيجتك كيفية أدائك عبر المجالات الرئيسية.' 
                : "Your score reflects how you're doing across five key areas."
              }
            </p>

            <p className="font-normal text-[#a1aeb7] text-xs md:text-sm text-center tracking-[0] leading-5 md:leading-6 max-w-[600px]">
              {language === 'ar' 
                ? 'استمر في تحسين عاداتك، وسوف تنمو رفاهيتك المالية بشكل أقوى مع مرور الوقت.' 
                : 'Keep improving your habits, and your financial wellbeing will grow stronger over time.'
              }
            </p>
          </div>
        </div>

        {/* Score Display */}
        <div className="flex flex-col w-full max-w-[697px] items-center gap-3 md:gap-4 px-4">
          <div 
            className="font-normal text-6xl md:text-8xl lg:text-[103px] text-center tracking-tight md:tracking-[-5.15px] leading-none md:leading-[106px]"
            style={{ 
              color: result.total_score >= 80 ? '#6cc922' : 
                     result.total_score >= 60 ? '#fca924' : 
                     result.total_score >= 30 ? '#fe6521' : '#f00c01'
            }}
          >
            {Math.round(result.total_score)}%
          </div>

          <StripedProgress 
            value={result.total_score} 
            className="w-full h-[14px] md:h-[18px]"
            scoreBasedColor={true}
          />
        </div>

        {/* Understanding Your Score Card */}
        <Card className="inline-flex flex-col items-center gap-4 md:gap-[19px] p-4 md:p-8 lg:p-[42px] border border-solid border-[#c2d1d9] w-full max-w-[800px]">
          <CardContent className="p-0 flex flex-col items-center gap-4 md:gap-[19px] w-full">
            <h2 className="font-semibold text-[#46545f] text-base md:text-lg text-center tracking-[0] leading-6 md:leading-7">
              {language === 'ar' ? 'فهم نتيجتك' : 'Understanding Your Score'}
            </h2>

            <div className="flex flex-col w-full items-start gap-3 md:gap-3.5">
              {/* Color-coded bands */}
              <div className="flex w-full items-center rounded-[50px] md:rounded-[100px] overflow-hidden">
                {SCORE_BANDS.map((band, index) => (
                  <div
                    key={index}
                    className={`flex flex-1 h-[60px] md:h-[70px] lg:h-[81px] items-center justify-center gap-2.5 p-1.5 md:p-2.5 ${band.bgColor} ${
                      index < SCORE_BANDS.length - 1 ? 'border-r-2 [border-right-style:solid] border-white' : ''
                    }`}
                  >
                    <div className="font-semibold text-white text-sm md:text-lg lg:text-2xl text-center tracking-[0] leading-tight md:leading-7">
                      {band.range}
                    </div>
                  </div>
                ))}
              </div>

              {/* Band labels */}
              <div className="flex flex-col md:flex-row items-start md:items-center w-full gap-3 md:gap-0">
                {SCORE_BANDS.map((band, index) => (
                  <div key={index} className="flex flex-col flex-1 items-start md:items-center px-2 md:px-3 py-0 w-full md:w-auto">
                    <div className="font-semibold text-[#a1aeb7] text-xs md:text-sm text-left md:text-center tracking-[0] leading-4 md:leading-5 w-full">
                      {band.title[language]}
                    </div>
                    <div className="font-normal text-[#a1aeb7] text-xs md:text-sm text-left md:text-center tracking-[0] leading-4 md:leading-5 w-full">
                      {band.description[language]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Pillar Scores */}
        <div className="flex flex-col items-start gap-8 md:gap-[60px] w-full">
          <div className="flex flex-col items-center gap-3 md:gap-4 w-full px-4">
            <h2 className="font-semibold text-[#437749] text-2xl md:text-3xl lg:text-[35px] tracking-[0] leading-tight md:leading-[38px] text-center">
              {language === 'ar' ? 'درجات الركائز المالية' : 'Financial Pillar Scores'}
            </h2>

            <p className="font-normal text-[#a1aeb7] text-sm md:text-base text-center tracking-[0] leading-5 md:leading-6 max-w-[600px]">
              {language === 'ar' 
                ? 'أدائك عبر 7 مجالات رئيسية للصحة المالية' 
                : 'Your performance across the 7 key areas of financial health'}
            </p>
          </div>

          <div className="flex flex-col items-center gap-6 md:gap-[38px] w-full max-w-[1100px] mx-auto px-4">
            {Object.entries(result.category_scores).map(([categoryName, category]: [string, any], index) => {
              const percentage = (category.score / category.max_possible) * 100;
              
              return (
                <div key={index} className="flex flex-col items-center gap-4 md:gap-[35px] w-full">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-8 lg:gap-[54px] w-full">
                    {/* Title and description - responsive order for RTL */}
                    <div className={`flex flex-col w-full md:max-w-[400px] lg:max-w-[506px] justify-center gap-1.5 ${isRTL ? 'items-end md:pr-0' : 'items-start'}`}>
                      <div className={`font-semibold text-[#424b5a] text-sm md:text-base tracking-[0] leading-5 md:leading-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {getCategoryTranslation(categoryName)}
                      </div>

                      <div className={`font-normal text-[#a1aeb7] text-xs md:text-sm tracking-[0] leading-5 md:leading-[21px] ${isRTL ? 'text-right' : 'text-left'}`}>
                        {getCategoryDescription(categoryName)}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <StripedProgress 
                      value={percentage} 
                      className="w-full md:max-w-[300px] lg:max-w-[476px] h-[10px] md:h-[12.29px] flex-shrink-0"
                      scoreBasedColor={true}
                    />
                  </div>

                  <Separator className="w-full" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Your Personalized Action Plan */}
        <div className="flex flex-col items-center gap-3 md:gap-4 w-full px-4">
          <h2 className="font-semibold text-[#437749] text-2xl md:text-3xl lg:text-[35px] tracking-[0] leading-tight md:leading-[38px] text-center">
            {language === 'ar' ? 'خطة عملك الشخصية' : 'Your Personalized Action Plan'}
          </h2>

          <p className="font-normal text-sm md:text-base leading-5 md:leading-6 text-[#a1aeb7] text-center tracking-[0] max-w-[600px]">
            {language === 'ar' 
              ? 'التغييرات الصغيرة تحدث فرقًا كبيرًا. إليك كيفية تقوية نتيجتك.' 
              : "Small changes make big differences. Here's how to strengthen your score."}
          </p>
        </div>

        <div className="flex flex-col w-full max-w-[948px] items-start gap-3 md:gap-3.5 px-4">
          <h3 className="font-semibold text-[#437749] text-base md:text-lg tracking-[0] leading-6 md:leading-7">
            {language === 'ar' ? 'فئات التوصيات:' : 'Recommendation Categories:'}
          </h3>

          <Card className="flex flex-col items-center gap-4 md:gap-[19px] p-4 md:p-8 lg:p-[42px] w-full bg-[#f8fbfd] border border-solid border-[#bdcdd6]">
            <CardContent className="p-0 flex flex-col items-center gap-4 md:gap-[19px] w-full">
              {result.insights.length > 0 ? (
                result.insights.slice(0, 5).map((insight, index) => (
                  <div key={index} className={`flex gap-3 md:gap-[22px] w-full items-start ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isRTL && (
                      <div className="font-semibold text-[#767f87] text-base md:text-lg tracking-[0] leading-6 md:leading-7 flex-shrink-0">
                        {index + 1}.
                      </div>
                    )}

                    <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <span className="font-semibold text-[#767f87] text-base md:text-lg tracking-[0] leading-6 md:leading-7">
                        {translateInsightCategory(insight.category)}:{' '}
                      </span>
                      <span className="text-[#737c84] text-base md:text-lg tracking-[0] leading-6 md:leading-7">
                        {language === 'ar' ? (insight.text_ar || insight.text) : insight.text}
                      </span>
                    </div>

                    {isRTL && (
                      <div className="font-semibold text-[#767f87] text-base md:text-lg tracking-[0] leading-6 md:leading-7 flex-shrink-0">
                        .{index + 1}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-[#737c84] text-base md:text-lg">
                  {language === 'ar' 
                    ? 'لا توجد توصيات. أنت تقوم بعمل رائع!' 
                    : 'No recommendations. You\'re doing great!'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Action Buttons - Design Spec */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 lg:gap-8 flex-wrap justify-center px-4 w-full max-w-[900px]">
          <Button 
            onClick={() => setIsConsultationModalOpen(true)}
            className="inline-flex items-center justify-center gap-2.5 px-6 md:px-7 py-2.5 bg-[#3fab4c] hover:bg-[#3fab4c]/90 h-auto w-full md:w-auto"
          >
            <span className="font-normal text-white text-xs md:text-sm text-center tracking-[0] leading-[18px]">
              {language === 'ar' ? 'احجز استشارة مجانية' : 'BOOK A FREE CONSULTATION'}
            </span>
          </Button>

          <Button 
            onClick={() => window.open('https://nationalbonds.onelink.me/NAu3/9m8huddj', '_blank')}
            className="inline-flex items-center justify-center gap-2.5 px-6 md:px-7 py-2.5 bg-[#3fab4c] hover:bg-[#3fab4c]/90 h-auto w-full md:w-auto"
          >
            <span className="font-normal text-white text-xs md:text-sm text-center tracking-[0] leading-[18px]">
              {language === 'ar' ? 'ابدأ الادخار مع الصكوك الوطنية' : 'START SAVING WITH NATIONAL BONDS'}
            </span>
          </Button>

          {onDownloadPDF && (
            <Button 
              onClick={onDownloadPDF}
              className="inline-flex items-center justify-center gap-2.5 px-6 md:px-7 py-2.5 bg-[#3fab4c] hover:bg-[#3fab4c]/90 h-auto w-full md:w-auto"
            >
              <span className="font-normal text-white text-xs md:text-sm text-center tracking-[0] leading-[18px]">
                {language === 'ar' ? 'تنزيل التقرير الكامل' : 'DOWNLOAD FULL REPORT'}
              </span>
            </Button>
          )}
        </div>

        {/* Additional Action Buttons - Keep existing functionality */}
        <div className="flex flex-col md:flex-row flex-wrap justify-center gap-3 md:gap-4 pt-6 px-4 w-full max-w-[800px]">
          {onEmailReport && (
            <Button 
              onClick={onEmailReport} 
              variant="outline" 
              className="gap-2 border-[#3fab4c] text-[#3fab4c] hover:bg-[#3fab4c] hover:text-white w-full md:w-auto text-sm"
            >
              📧 {language === 'ar' ? 'إرسال التقرير بالبريد الإلكتروني' : 'Email Report'}
            </Button>
          )}
          
          <Button 
            onClick={handleSaveOrHistory} 
            variant="outline"
            className="gap-2 border-[#3fab4c] text-[#3fab4c] hover:bg-[#3fab4c] hover:text-white w-full md:w-auto text-sm"
          >
            📊 {isLoggedIn 
              ? (language === 'ar' ? 'عرض تاريخ التقييمات' : 'View Assessment History')
              : (language === 'ar' ? 'الوصول إلى السجل' : 'Access My History')
            }
          </Button>
          
          {onRetake && (
            <Button 
              onClick={onRetake} 
              variant="outline"
              className="gap-2 border-[#3fab4c] text-[#3fab4c] hover:bg-[#3fab4c] hover:text-white w-full md:w-auto text-sm"
            >
              🔄 {language === 'ar' ? 'إعادة التقييم' : 'Retake Assessment'}
            </Button>
          )}
        </div>
      </section>
      
      <HomepageFooter />
      
      {/* Consultation Request Modal */}
      <ConsultationRequestModal 
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
      />
    </div>
  );
}
