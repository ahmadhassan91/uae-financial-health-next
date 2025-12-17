import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StripedProgress } from "@/components/ui/striped-progress";
import { useLocalization } from "@/contexts/LocalizationContext";
import { FinancialClinicResult } from "@/lib/financial-clinic-types";
import {
  RESULTS_COLORS,
  SCORE_BANDS,
  CATEGORY_DESCRIPTIONS,
} from "@/lib/financial-clinic-constants";
import { HomepageHeader } from "@/components/homepage/Header";
import { HomepageFooter } from "@/components/homepage/Footer";
import { ConsultationRequestModal } from "@/components/ConsultationRequestModal";

interface FinancialClinicResultsProps {
  result: FinancialClinicResult;
  onRetake?: () => void;
  onViewProducts?: () => void;
  onDownloadPDF?: () => void;
  onEmailReport?: () => void;
  onShowAccountModal?: () => void;
}

// Helper function to detect if user is on mobile device
const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export function FinancialClinicResults({
  result,
  onRetake,
  onViewProducts,
  onDownloadPDF,
  onEmailReport,
  onShowAccountModal,
}: FinancialClinicResultsProps) {
  const { t, isRTL, language } = useLocalization();
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);

  // Handle National Bonds redirect - web vs mobile
  const handleNationalBondsClick = () => {
    const url = isMobileDevice()
      ? "https://nationalbonds.onelink.me/NAu3/9m8huddj" // Mobile app link
      : "https://www.nationalbonds.ae/"; // Web link
    window.open(url, "_blank");
  };

  // Check if user is logged in
  const isLoggedIn =
    typeof window !== "undefined" &&
    !!localStorage.getItem("simpleAuthSession");

  const handleSaveOrHistory = () => {
    // For both logged in and guest users, go to history page
    // Guest users will see their current result displayed
    window.location.href = "/financial-clinic/history";
  };
  const getScoreBandColor = (score: number): string => {
    if (score >= 80) {
      return "#6cc922"; // Excellent - green
    } else if (score >= 60) {
      return "#fca924"; // Good - orange
    } else if (score >= 30) {
      return "#fe6521"; // Fair - orange-red
    } else {
      return "#f00c01"; // Needs Improvement - red
    }
  };

  const getCategoryTranslation = (category: string): string => {
    const categoryMap: Record<string, { en: string; ar: string }> = {
      "Income Stream": { en: "Income Stream", ar: "موارد الدخل" },
      "Monthly Expenses Management": {
        en: "Monthly Expenses Management",
        ar: "إدارة النفقات الشهرية",
      },
      "Savings Habit": { en: "Savings Habit", ar: "السلوك الادخاري" },
      "Emergency Savings": { en: "Emergency Savings", ar: "مدخرات الطوارئ" },
      "Debt Management": { en: "Debt Management", ar: "إدارة الديون" },
      "Retirement Planning": {
        en: "Retirement Planning",
        ar: "التخطيط للتقاعد",
      },
      "Protecting Your Assets | Loved Ones": {
        en: "Protecting Your Assets | Loved Ones",
        ar: "حماية أصولك | أحبائك",
      },
      "Planning for Your Future | Siblings": {
        en: "Planning for Your Future | Siblings",
        ar: "التخطيط لمستقبلك | الأشقاء",
      },
      "Protecting Your Family": {
        en: "Protecting Your Family",
        ar: "حماية عائلتك",
      },
    };
    const categoryData = categoryMap[category];
    return language === "ar"
      ? categoryData?.ar || category
      : categoryData?.en || category;
  };

  const getCategoryDescription = (category: string): string => {
    const desc =
      CATEGORY_DESCRIPTIONS[category as keyof typeof CATEGORY_DESCRIPTIONS];
    return language === "ar" ? desc?.ar || "" : desc?.en || "";
  };

  const getScoreBandText = (score: number): string => {
    if (score >= 80) {
      return language === "ar" ? "ممتاز" : "Excellent";
    } else if (score >= 60) {
      return language === "ar" ? "جيد" : "Good";
    } else if (score >= 30) {
      return language === "ar" ? "متوسط" : "Fair";
    } else {
      return language === "ar" ? "يحتاج إلى تحسين" : "Needs Improvement";
    }
  };

  const translateInsightCategory = (category: string): string => {
    // Map English insight category names to Arabic
    const categoryMap: Record<string, string> = {
      "Income Stream": "تدفق الدخل",
      "Monthly Expenses Management": "إدارة النفقات الشهرية",
      "Savings Habit": "عادات الادخار",
      "Saving Habits": "عادات الادخار",
      "Emergency Savings": "مدخرات الطوارئ",
      "Debt Management": "إدارة الديون",
      "Retirement Planning": "التخطيط للتقاعد",
      "Protecting Your Assets | Loved Ones": "حماية أصولك | أحبائك",
      "Planning for Your Future | Siblings": "التخطيط لمستقبلك | الأشقاء",
      "Protecting Your Family": "حماية عائلتك",
    };
    return language === "ar" ? categoryMap[category] || category : category;
  };

  return (
    <div
      className="w-full flex flex-col bg-white overflow-hidden font-['Poppins',Helvetica]"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <HomepageHeader />

      <section className="flex flex-col items-center gap-6 md:gap-12 lg:gap-[65px] px-3 md:px-6 lg:px-8 py-4 md:py-8 lg:py-12 w-full">
        {/* Hero Section */}
        <div className="flex flex-col items-center gap-3 md:gap-4 lg:gap-[22px] w-full">
          <div className="inline-flex flex-col items-center gap-1.5 px-4">
            <h1 className="font-semibold text-[#5E5E5E] text-2xl md:text-[28px] lg:text-[33px] tracking-[0] leading-tight md:leading-[38px] text-center">
              {language === "ar"
                ? "إليك درجة صحتك المالية!"
                : "Here's your Financial Health Score!"}
            </h1>

            <p className="font-normal text-[#575757] text-xs md:text-sm text-center tracking-[0] leading-5 md:leading-6 max-w-[600px]">
              {language === "ar"
                ? "نقدّم لكم لمحة سريعة تعكس رؤية واضحة لمدى صحّة وضعكم المالي اليوم."
                : "This is your snapshot; a clear view of how healthy your finances are today."}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-1 md:gap-[3px] w-full px-4">
            <p className="font-normal text-[#575757] text-xs md:text-sm text-center tracking-[0] leading-5 md:leading-6 max-w-[600px]">
              {language === "ar"
                ? "تشير نتيجتكم إلى مستوى أدائكم في الجوانب الرئيسية."
                : "Your score reflects how you're doing across key areas."}
            </p>

            <p className="font-normal text-[#575757] text-xs md:text-sm text-center tracking-[0] leading-5 md:leading-6 max-w-[600px]">
              {language === "ar"
                ? "تابعوا تحسين سلوكيّاتكم المالية لتتعزّز جودة حياتكم المالية تدريجياً مع الوقت."
                : "Keep improving your habits, and your financial wellbeing will grow stronger over time."}
            </p>
          </div>
        </div>

        {/* Score Display */}
        <div className="flex flex-col w-full max-w-[697px] items-center gap-3 md:gap-4 px-4">
          <div
            className="text-6xl md:text-8xl lg:text-[103px] text-center tracking-tight md:tracking-[-5.15px] leading-none md:leading-[106px]"
            style={{
              color:
                result.total_score >= 80
                  ? "#6cc922"
                  : result.total_score >= 60
                  ? "#fca924"
                  : result.total_score >= 30
                  ? "#fe6521"
                  : "#f00c01",
            }}
          >
            {getScoreBandText(result.total_score)}
          </div>

          <div
            className="font-normal text-6xl md:text-8xl lg:text-[103px] text-center tracking-tight md:tracking-[-5.15px] leading-none md:leading-[106px]"
            style={{
              color:
                result.total_score >= 80
                  ? "#6cc922"
                  : result.total_score >= 60
                  ? "#fca924"
                  : result.total_score >= 30
                  ? "#fe6521"
                  : "#f00c01",
            }}
            // style={{
            //   color: "#5E5E5E",
            // }}
          >
            {Math.round(result.total_score)}%
          </div>

          <StripedProgress
            value={result.total_score}
            className="w-full h-[14px] md:h-[18px]"
            scoreBasedColor={true}
            isRTL={isRTL}
          />
        </div>

        {/* Understanding Your Score Card */}
        <Card className="inline-flex flex-col items-center gap-4 md:gap-[19px] p-4 md:p-8 lg:p-[42px] border border-solid border-[#c2d1d9] w-full max-w-[800px]">
          <CardContent className="p-0 flex flex-col items-center gap-4 md:gap-[19px] w-full">
            <h2 className="font-semibold text-[#46545f] text-base md:text-lg text-center tracking-[0] leading-6 md:leading-7">
              {language === "ar" ? "فهم نتيجتك" : "Understanding Your Score"}
            </h2>

            <div className="flex flex-col w-full items-start gap-3 md:gap-3.5">
              {/* Color-coded bands */}
              <div className="flex w-full items-center rounded-[50px] md:rounded-[100px] overflow-hidden">
                {SCORE_BANDS.map((band, index) => (
                  <div
                    key={index}
                    className={`flex flex-1 h-[50px] sm:h-[60px] md:h-[70px] lg:h-[81px] items-center justify-center gap-1 sm:gap-2.5 p-1 sm:p-1.5 md:p-2.5 ${
                      band.bgColor
                    } ${
                      index < SCORE_BANDS.length - 1
                        ? "border-r-2 [border-right-style:solid] border-white"
                        : ""
                    }`}
                  >
                    <div className="font-semibold text-white text-xs sm:text-sm md:text-lg lg:text-2xl text-center tracking-[0] leading-tight md:leading-7 px-0.5">
                      {band.range}
                    </div>
                  </div>
                ))}
              </div>

              {/* Band labels */}
              <div className="flex flex-row items-start w-full">
                {SCORE_BANDS.map((band, index) => (
                  <div
                    key={index}
                    className="flex flex-col flex-1 items-center px-0.5 sm:px-2 md:px-3 py-0"
                  >
                    <div
                      className="font-semibold text-[#575757] text-[8px] sm:text-xs md:text-sm text-center tracking-[0] leading-3 sm:leading-4 md:leading-5 w-full"
                    >
                      {band.title[language]}
                    </div>
                    <div
                      className="font-normal text-[#575757] text-[7px] sm:text-[10px] md:text-sm text-center tracking-[0] leading-[10px] sm:leading-4 md:leading-5 w-full"
                    >
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
            <h2 className="font-semibold text-[#5E5E5E] text-2xl md:text-3xl lg:text-[35px] tracking-[0] leading-tight md:leading-[38px] text-center">
              {language === "ar"
                ? "درجات الركائز المالية"
                : "Financial Pillar Scores"}
            </h2>

            <p className="font-normal text-[#575757] text-sm md:text-base text-center tracking-[0] leading-5 md:leading-6 max-w-[600px]">
              {language === "ar"
                ? "أدائك عبر مجالات رئيسية للصحة المالية"
                : "Your performance across key areas of financial health"}
            </p>
          </div>

          <div className="flex flex-col items-center w-full px-4 gap-6">
            {Object.entries(result.category_scores)
              .sort(([nameA]: [string, any], [nameB]: [string, any]) => {
                // Fixed order as per design specification
                const categoryOrder = [
                  "Income Stream",
                  "Savings Habit",
                  "Emergency Savings",
                  "Debt Management",
                  "Retirement Planning",
                  "Protecting Your Family",
                ];

                const indexA = categoryOrder.indexOf(nameA);
                const indexB = categoryOrder.indexOf(nameB);
                // Put unknown categories at the end
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
              })
              .map(([categoryName, category]: [string, any], index) => {
                const percentage =
                  (category.score / category.max_possible) * 100;

                return (
                  <div
                    key={index}
                    className="flex flex-col items-start gap-3 w-full max-w-[1000px]"
                  >
                    {/* Title and Progress bar on same line */}
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6 w-full">
                      {/* Title and description */}
                      <div
                        className={`flex flex-col gap-1 w-full md:flex-shrink-0 ${
                          isRTL ? "md:w-[190px]" : "md:w-[300px]"
                        }`}
                      >
                        <div
                          className={`font-semibold text-[#424b5a] text-sm md:text-base tracking-[0] leading-5 md:leading-6 ${
                            isRTL ? "" : ""
                          }`}
                        >
                          {getCategoryTranslation(categoryName)}
                        </div>
                        <div
                          className={`font-normal text-[#575757] text-xs md:text-sm tracking-[0] leading-4 md:leading-[21px] ${
                            isRTL ? "" : ""
                          }`}
                        >
                          {getCategoryDescription(categoryName)}
                        </div>
                      </div>

                      {/* Progress bar - inline on desktop */}
                      <StripedProgress
                        value={percentage}
                        className="w-full h-[12px] md:h-[14px]"
                        scoreBasedColor={true}
                        isRTL={isRTL}
                      />
                    </div>

                    {index <
                      Object.entries(result.category_scores).length - 1 && (
                      <Separator className="w-full mt-3" />
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Your Personalized Action Plan */}
        <div className="flex flex-col items-center gap-3 md:gap-4 w-full px-4">
          <h2 className="font-semibold text-[#5E5E5E] text-2xl md:text-3xl lg:text-[35px] tracking-[0] leading-tight md:leading-[38px] text-center">
            {language === "ar"
              ? "خطة العمل المعدّة خصيصاً لكم"
              : "Your Personalized Action Plan"}
          </h2>

          <p className="font-normal text-sm md:text-base leading-5 md:leading-6 text-[#575757] text-center tracking-[0] max-w-[600px]">
            {language === "ar"
              ? "التغييرات البسيطة تُحدث فارقاً كبيراً. لتحسين نتيجتكم، ننصحكم بما يلي"
              : "Small changes make big differences. Here's how to strengthen your score."}
          </p>
        </div>

        <div className="flex flex-col w-full max-w-[948px] items-start gap-3 md:gap-3.5 px-4">
          <h3 className="font-semibold text-[#5E5E5E] text-base md:text-lg tracking-[0] leading-6 md:leading-7">
            {language === "ar"
              ? "فئات التوصيات:"
              : "Recommendation Categories:"}
          </h3>

          <Card className="flex flex-col items-center gap-4 md:gap-[19px] p-4 md:p-8 lg:p-[42px] w-full bg-[#f8fbfd] border border-solid border-[#bdcdd6]">
            <CardContent className="p-0 flex flex-col items-center gap-4 md:gap-[19px] w-full">
              {result.insights.length > 0 ? (
                result.insights.slice(0, 5).map((insight, index) => (
                  <div
                    key={index}
                    className={`flex gap-2 w-full items-start ${
                      isRTL ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {!isRTL && (
                      <div className="font-semibold text-[#767f87] text-base md:text-lg tracking-[0] leading-6 md:leading-7 flex-shrink-0">
                        {index + 1}.
                      </div>
                    )}

                    <div
                      className={`flex-1 ${
                        isRTL ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <span className="font-semibold text-[#767f87] text-base md:text-lg tracking-[0] leading-6 md:leading-7">
                        {translateInsightCategory(insight.category)}:{" "}
                      </span>
                      <span className="text-[#737c84] text-base md:text-lg tracking-[0] leading-6 md:leading-7">
                        {language === "ar"
                          ? insight.text_ar || insight.text
                          : insight.text}
                      </span>
                    </div>

                    {isRTL && (
                      <div className="font-semibold text-[#767f87] text-base md:text-lg tracking-[0] leading-6 md:leading-7 flex-shrink-0">
                        {index + 1}.
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-[#737c84] text-base md:text-lg">
                  {language === "ar"
                    ? "لا توجد توصيات. أنت تقوم بعمل رائع!"
                    : "No recommendations. You're doing great!"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Action Buttons - Design Spec */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 flex-wrap justify-center px-4 w-full max-w-[900px]">
          <Button
            onClick={() => setIsConsultationModalOpen(true)}
            className="inline-flex items-center justify-center gap-2.5 px-6 md:px-7 py-2.5 bg-[#5E5E5E] hover:bg-[#5E5E5E]/90 h-auto w-full md:w-auto"
          >
            <span className="font-normal text-white text-xs md:text-sm text-center tracking-[0] leading-[18px]">
              {language === "ar"
                ? "احجز استشارة مجانية"
                : "BOOK A FREE CONSULTATION"}
            </span>
          </Button>

          <Button
            onClick={handleNationalBondsClick}
            className="inline-flex items-center justify-center gap-2.5 px-6 md:px-7 py-2.5 bg-[#5E5E5E] hover:bg-[#5E5E5E]/90 h-auto w-full md:w-auto"
          >
            <span className="font-normal text-white text-xs md:text-sm text-center tracking-[0] leading-[18px]">
              {language === "ar"
                ? "ابدأ الادخار مع الصكوك الوطنية"
                : "START SAVING WITH NATIONAL BONDS"}
            </span>
          </Button>

          {onDownloadPDF && (
            <Button
              onClick={onDownloadPDF}
              className="inline-flex items-center justify-center gap-2.5 px-6 md:px-7 py-2.5 bg-[#5E5E5E] hover:bg-[#5E5E5E]/90 h-auto w-full md:w-auto"
            >
              <span className="font-normal text-white text-xs md:text-sm text-center tracking-[0] leading-[18px]">
                {language === "ar"
                  ? "تنزيل التقرير الكامل"
                  : "DOWNLOAD FULL REPORT"}
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
              className="gap-2 border-[#5E5E5E] text-[#5E5E5E] hover:bg-[#5E5E5E] hover:text-white w-full md:w-auto text-sm"
            >
              {language === "ar"
                ? "إرسال التقرير بالبريد الإلكتروني"
                : "Email Report"}
            </Button>
          )}

          <Button
            onClick={handleSaveOrHistory}
            variant="outline"
            className="gap-2 border-[#5E5E5E] text-[#5E5E5E] hover:bg-[#5E5E5E] hover:text-white w-full md:w-auto text-sm"
          >
            {isLoggedIn
              ? language === "ar"
                ? "عرض تاريخ التقييمات"
                : "View Assessment History"
              : language === "ar"
              ? "الوصول إلى السجل"
              : "Access My History"}
          </Button>

          {onRetake && (
            <Button
              onClick={onRetake}
              variant="outline"
              className="gap-2 border-[#5E5E5E] text-[#5E5E5E] hover:bg-[#5E5E5E] hover:text-white w-full md:w-auto text-sm"
            >
              {language === "ar" ? "إعادة التقييم" : "Retake Assessment"}
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
