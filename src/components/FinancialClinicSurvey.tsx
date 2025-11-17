import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useLocalization } from '@/contexts/LocalizationContext';
import { 
  FinancialClinicQuestion, 
  FinancialClinicProfile 
} from '@/lib/financial-clinic-types';
import { fetchFinancialClinicQuestions } from '@/lib/financial-clinic-survey-data';
import { HomepageHeader } from '@/components/homepage/Header';
import { HomepageFooter } from '@/components/homepage/Footer';
import { StripedProgress } from '@/components/ui/striped-progress';

interface FinancialClinicSurveyProps {
  currentStep: number;
  profile: FinancialClinicProfile;
  onStepChange: (step: number) => void;
  onResponse: (questionId: string, value: number) => void;
  getResponse: (questionId: string) => number | undefined;
  onComplete: () => void;
}

export function FinancialClinicSurvey({ 
  currentStep, 
  profile, 
  onStepChange, 
  onResponse, 
  getResponse, 
  onComplete 
}: FinancialClinicSurveyProps) {
  const { t, isRTL, language } = useLocalization();
  const [questions, setQuestions] = useState<FinancialClinicQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load questions from backend API
  // Questions are conditional based on children count (Q15 only shows if children > 0)
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('📋 Loading Financial Clinic questions...');
        console.log('  Profile:', profile);
        console.log('  Children count:', profile.children);
        
        // Fetch questions based on children count (14 or 15 questions)
        const fetchedQuestions = await fetchFinancialClinicQuestions(profile.children);
        console.log(`  ✅ Loaded ${fetchedQuestions.length} questions`);
        setQuestions(fetchedQuestions);
      } catch (err: any) {
        console.error('Failed to load Financial Clinic questions:', err);
        setError(err.message || 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    };
    
    loadQuestions();
  }, [profile.children]);  // Re-fetch if children count changes

  // Group questions by category
  const questionsByCategory: { [key: string]: FinancialClinicQuestion[] } = {};
  questions.forEach(q => {
    if (!questionsByCategory[q.category]) {
      questionsByCategory[q.category] = [];
    }
    questionsByCategory[q.category].push(q);
  });
  
  const categories = Object.keys(questionsByCategory);
  const totalCategories = categories.length;
  const currentCategory = categories[currentStep] || categories[0];
  const currentCategoryQuestions = questionsByCategory[currentCategory] || [];
  
  // Calculate progress based on answered questions
  const answeredQuestionsCount = questions.filter(q => getResponse(q.id) !== undefined).length;
  const totalSteps = questions.length;
  const progress = totalSteps > 0 ? (answeredQuestionsCount / totalSteps) * 100 : 0;
  
  // Check if all questions in current category are answered
  const allCurrentQuestionsAnswered = currentCategoryQuestions.every(q => 
    getResponse(q.id) !== undefined
  );
  
  const isLastCategory = currentStep === totalCategories - 1;

  // Loading state
  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-white">
        <HomepageHeader />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#437749] mx-auto"></div>
            <p className="text-[#a1aeb7]">
              {language === 'ar' ? 'جاري تحميل الأسئلة...' : 'Loading questions...'}
            </p>
          </div>
        </div>
        <HomepageFooter />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-white">
        <HomepageHeader />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-red-900">
              {language === 'ar' ? 'خطأ في تحميل الأسئلة' : 'Error Loading Questions'}
            </h3>
            <p className="text-[#a1aeb7]">
              {error}
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-[#3fab4c] hover:bg-[#3fab4c]/90"
            >
              {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </Button>
          </div>
        </div>
        <HomepageFooter />
      </div>
    );
  }

  // Return early if no questions available
  if (currentCategoryQuestions.length === 0 || totalSteps === 0) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-white">
        <HomepageHeader />
        <div className="flex-1 flex items-center justify-center px-4">
          <p className="text-[#a1aeb7]">
            {language === 'ar' ? 'لا توجد أسئلة متاحة' : 'No questions available'}
          </p>
        </div>
        <HomepageFooter />
      </div>
    );
  }

  const handleNext = (e?: React.MouseEvent) => {
    e?.preventDefault();
    
    if (isLastCategory) {
      // Complete the survey
      onComplete();
    } else {
      // Move to next category
      onStepChange(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      // Move to previous category
      onStepChange(currentStep - 1);
    }
  };
  
  // Get category display name
  const getCategoryDisplay = (category: string): string => {
    const categoryMap: Record<string, { en: string; ar: string }> = {
      'Income Stream': { 
        en: 'Income Stream', 
        ar: 'تدفق الدخل' 
      },
      'Savings Habit': { 
        en: 'Savings Habit', 
        ar: 'عادات الادخار' 
      },
      'Emergency Savings': { 
        en: 'Emergency Savings', 
        ar: 'مدخرات الطوارئ' 
      },
      'Debt Management': { 
        en: 'Debt Management', 
        ar: 'إدارة الديون' 
      },
      'Retirement Planning': { 
        en: 'Retirement Planning', 
        ar: 'التخطيط للتقاعد' 
      },
      'Protecting Your Family': { 
        en: 'Protecting Your Family', 
        ar: 'حماية عائلتك' 
      }
    };
    
    const categoryData = categoryMap[category];
    return language === 'ar' ? (categoryData?.ar || category) : (categoryData?.en || category);
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-white">
      {/* Header */}
      <HomepageHeader />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-8 lg:py-12">
        {/* Title Section */}
        <div className="flex flex-col items-center gap-1.5 mb-4 md:mb-6 lg:mb-8">
          <h1 className="font-[family-name:var(--font-poppins)] font-semibold text-[#2a4d2e] text-xl md:text-[28px] lg:text-[33px] tracking-[0] leading-tight text-center">
            {language === 'ar' ? 'ملف العميل' : 'Customer Profile'}
          </h1>
          <p className="font-[family-name:var(--font-poppins)] font-normal text-[#5a6c64] text-xs md:text-sm text-center tracking-[0] leading-5 md:leading-6">
            {language === 'ar' ? 'هل أنت مستعد لبدء الفحص الخاص بك؟' : 'Ready to begin your checkup?'}
          </p>
        </div>

        {/* Welcome Text */}
        <div className="w-full max-w-[833px] mb-4 md:mb-6 lg:mb-8 px-2">
          <p className="font-[family-name:var(--font-poppins)] font-normal text-[#5a6c64] text-xs md:text-sm tracking-[0] leading-5 md:leading-6 text-center">
            {language === 'ar' 
              ? 'مرحباً بك في فحص العيادة المالية! دعنا نأخذ بضع دقائق لفهم عاداتك المالية - بدون أحكام، فقط رؤى.'
              : "Welcome to your Financial Clinic checkup! Let's take a few minutes to understand your financial habits—no judgments, just insights."}
          </p>
        </div>

        {/* Progress Bar Section */}
        <div className="w-full max-w-[697px] mb-6 md:mb-8 lg:mb-12 px-2">
          <div className="flex flex-col items-center gap-3 md:gap-4">
            {/* Striped Progress Bar (same as results page) */}
            <StripedProgress value={progress} className="w-full h-[14px] md:h-[16px] lg:h-[18px]" />

            {/* Progress Text */}
            <div className="flex flex-col items-center justify-center gap-[3px]">
              <p className="font-[family-name:var(--font-poppins)] font-normal text-[#5a6c64] text-xs md:text-sm text-center tracking-[0] leading-5 md:leading-6">
                {language === 'ar' 
                  ? `أنت ${Math.round(progress)}٪ من خلال فحصك - تقدم رائع!`
                  : `You're ${Math.round(progress)}% through your checkup—great progress!`}
              </p>
            </div>
          </div>
        </div>

        {/* Questions Category */}
        {currentCategoryQuestions.length > 0 && (
          <div className="w-full max-w-[1380px] px-1 sm:px-2">
            <h2 className={`font-[family-name:var(--font-poppins)] font-semibold text-[#2a4d2e] text-base md:text-lg lg:text-xl tracking-[0] leading-6 md:leading-7 mb-3 md:mb-4 px-2 sm:px-0 ${isRTL ? 'text-right' : 'text-left'}`}>
              {language === 'ar' ? 'فئة الأسئلة: ' : 'Questions Category: '}
              {getCategoryDisplay(currentCategory)}
            </h2>

            {/* Question Cards - All questions from current category */}
            <div className="flex flex-col gap-2 md:gap-3 w-full">
              {currentCategoryQuestions.map((question) => {
                const questionText = language === 'ar' ? question.text_ar : question.text_en;
                const currentResponse = getResponse(question.id);

                return (
                  <Card key={question.id} className="w-full bg-[#f8fbfd] border border-solid border-[#bdcdd6] overflow-hidden">
                    <CardContent className="flex flex-col sm:flex-row items-start gap-3 md:gap-4 lg:gap-6 p-3 sm:p-4 md:p-5 lg:p-8">
                      {/* Question Number Circle */}
                      <div className="flex flex-col w-[35px] h-[35px] md:w-[40px] md:h-[40px] lg:w-[43px] lg:h-[43px] items-center justify-center gap-2.5 p-2 md:p-2.5 lg:p-3 bg-[#c2d1d9] rounded-[100px] flex-shrink-0 self-center sm:self-start">
                        <div className="font-[family-name:var(--font-poppins)] font-normal text-[#4a5a68] text-sm sm:text-base md:text-lg text-center tracking-[0] leading-5 md:leading-7">
                          {question.number}
                        </div>
                      </div>

                      {/* Question Content */}
                      <div className="flex flex-col items-start gap-2 flex-1 w-full min-w-0">
                        <h3 className={`font-[family-name:var(--font-poppins)] font-semibold text-[#2a3f4a] text-sm md:text-base lg:text-lg tracking-[0] leading-5 md:leading-6 lg:leading-7 break-words ${isRTL ? 'text-right' : 'text-left'}`}>
                          {questionText}
                        </h3>

                        {/* Radio Options */}
                        <RadioGroup
                          value={currentResponse !== undefined ? currentResponse.toString() : ""}
                          onValueChange={(value) => onResponse(question.id, parseInt(value))}
                          className="flex flex-col gap-2 md:gap-2.5 w-full mt-2 md:mt-3"
                        >
                          {question.options.map((option) => {
                            const optionLabel = language === 'ar' ? option.label_ar : option.label_en;
                            const isSelected = currentResponse === option.value;
                            
                            return (
                              <div 
                                key={option.value} 
                                className={`flex items-start gap-2.5 md:gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'} min-h-[24px]`}
                              >
                                <RadioGroupItem
                                  value={option.value.toString()}
                                  id={`${question.id}-${option.value}`}
                                  className="w-4 h-4 md:w-[18px] md:h-[18px] rounded-lg border-[#a1aeb7] flex-shrink-0 mt-0.5"
                                />
                                <Label
                                  htmlFor={`${question.id}-${option.value}`}
                                  className={`font-[family-name:var(--font-poppins)] font-normal text-sm md:text-base lg:text-lg tracking-[0] leading-5 md:leading-6 cursor-pointer flex-1 min-w-0 break-words ${
                                    isSelected ? 'text-[#2a3f4a]' : 'text-[#6b7c8a]'
                                  } ${isRTL ? 'text-right' : 'text-left'}`}
                                >
                                  {optionLabel}
                                </Label>
                              </div>
                            );
                          })}
                        </RadioGroup>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className={`flex flex-col sm:flex-row ${currentStep > 0 ? 'sm:justify-between' : 'sm:justify-end'} items-stretch sm:items-center w-full max-w-[1380px] mt-6 md:mt-8 lg:mt-12 gap-3 md:gap-4 px-2 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
          {/* Previous Button - Only show if not on first category */}
          {currentStep > 0 && (
            <Button 
              onClick={handlePrevious}
              variant="outline"
              className="h-auto border-[#c2d1d9] text-[#767f87] hover:bg-[#f8fbfd] hover:text-[#505d68] hover:border-[#a1aeb7] px-4 md:px-6 lg:px-7 py-3 sm:py-2 md:py-2.5 w-full sm:w-auto min-w-0 flex-1 sm:flex-initial transition-colors"
            >
              <span className="font-[family-name:var(--font-poppins)] font-normal text-xs md:text-sm text-center tracking-[0] leading-[18px] truncate">
                {language === 'ar' ? 'الفئة السابقة' : 'PREVIOUS'}
              </span>
            </Button>
          )}

          {/* Next/Complete Button */}
          <Button 
            onClick={handleNext}
            disabled={!allCurrentQuestionsAnswered}
            className="h-auto bg-[#3fab4c] hover:bg-[#3fab4c]/90 px-4 md:px-6 lg:px-7 py-3 sm:py-2 md:py-2.5 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto min-w-0 flex-1 sm:flex-initial order-first sm:order-last"
          >
            <span className="font-[family-name:var(--font-poppins)] font-normal text-white text-xs md:text-sm text-center tracking-[0] leading-[18px] truncate">
              {isLastCategory
                ? (language === 'ar' ? 'إكمال التقييم' : 'COMPLETE')
                : (language === 'ar' ? 'الفئة التالية' : 'NEXT')
              }
            </span>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <HomepageFooter />
    </div>
  );
}
