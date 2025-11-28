"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocalization } from "@/contexts/LocalizationContext";
import { X } from "lucide-react";
import { consentService } from "@/services/consentService";
import { toast } from "sonner";

interface ConsentModalProps {
  onConsent: () => void;
  onDecline: () => void;
}

export function ConsentModal({ onConsent, onDecline }: ConsentModalProps) {
  const { language } = useLocalization();
  const [profilingConsent, setProfilingConsent] = React.useState(false);
  const [dataProcessingConsent, setDataProcessingConsent] =
    React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleGrantConsent = async () => {
    if (profilingConsent && dataProcessingConsent) {
      setIsSubmitting(true);

      try {
        // Grant consent using the PDPL-compliant service
        const result = await consentService.grantConsent(language);

        if (result.success) {
          toast.success(
            language === "ar"
              ? "تم حفظ موافقتك بنجاح"
              : "Your consent has been saved successfully"
          );
          onConsent();
        } else {
          toast.error(
            language === "ar"
              ? "حدث خطأ أثناء حفظ موافقتك. يرجى المحاولة مرة أخرى."
              : "An error occurred while saving your consent. Please try again."
          );
        }
      } catch (error) {
        console.error("Error granting consent:", error);
        toast.error(
          language === "ar"
            ? "حدث خطأ أثناء حفظ موافقتك. يرجى المحاولة مرة أخرى."
            : "An error occurred while saving your consent. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const canProceed = profilingConsent && dataProcessingConsent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-[10px] shadow-lg max-w-[884px] w-full max-h-[90vh] flex flex-col">
        {/* Header - Simple and clean */}
        <div className="bg-white px-8 py-6 flex items-start justify-between border-b border-gray-100 flex-shrink-0">
          <div className="flex-1">
            <h2 className="font-bold text-[#505d68] text-base leading-6 mb-1">
              {language === "ar" ? "الخصوصية والموافقة" : "Privacy & Consent"}
            </h2>
            <p className="font-normal text-[#495565] text-sm leading-5">
              {language === "ar"
                ? "الامتثال لقانون حماية البيانات في الإمارات - حقوق حماية بياناتك"
                : "UAE PDPL Compliance - Your data protection rights"}
            </p>
          </div>
          <button
            onClick={onDecline}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content - Only the informational sections */}
        <div className="px-8 py-6 space-y-8 overflow-y-auto flex-1">
          {/* What We Collect */}
          <div>
            <h3 className="font-normal text-[#767f87] text-base leading-6 mb-3">
              {language === "ar" ? "ما الذي نجمعه" : "What We Collect"}
            </h3>
            <ul className="space-y-2">
              <li className="font-normal text-[#a1aeb7] text-sm leading-5">
                •{" "}
                {language === "ar"
                  ? "إجاباتك على أسئلة الصحة المالية"
                  : "Your responses to financial health questions"}
              </li>
              <li className="font-normal text-[#a1aeb7] text-sm leading-5">
                •{" "}
                {language === "ar"
                  ? "الدرجات المحسوبة وتوصيات التحسين"
                  : "Calculated scores and improvement recommendations"}
              </li>
              <li className="font-normal text-[#a1aeb7] text-sm leading-5">
                •{" "}
                {language === "ar"
                  ? "بيانات المشاركة والتفاعل"
                  : "Engagement and interaction data"}
              </li>
              <li className="font-normal text-[#a1aeb7] text-sm leading-5">
                •{" "}
                {language === "ar"
                  ? "معلومات تقنية أساسية (عنوان IP، نوع المتصفح)"
                  : "Basic technical information (IP address, browser type)"}
              </li>
            </ul>
          </div>

          {/* How We Use Your Data */}
          <div>
            <h3 className="font-normal text-[#767f87] text-base leading-6 mb-3">
              {language === "ar"
                ? "كيف نستخدم بياناتك"
                : "How We Use Your Data"}
            </h3>
            <ul className="space-y-2">
              <li className="font-normal text-[#a1aeb7] text-sm leading-5">
                •{" "}
                {language === "ar"
                  ? "حساب درجة صحتك المالية باستخدام خوارزميتنا الخاصة"
                  : "Calculate your financial health score using our proprietary algorithm"}
              </li>
              <li className="font-normal text-[#a1aeb7] text-sm leading-5">
                •{" "}
                {language === "ar"
                  ? "تقديم توصيات تعليمية مخصصة"
                  : "Provide personalized educational recommendations"}
              </li>
              <li className="font-normal text-[#a1aeb7] text-sm leading-5">
                •{" "}
                {language === "ar"
                  ? "تتبع تقدمك بمرور الوقت"
                  : "Track your progress over time"}
              </li>
              <li className="font-normal text-[#a1aeb7] text-sm leading-5">
                •{" "}
                {language === "ar"
                  ? "تحسين خدماتنا وتجربة المستخدم"
                  : "Improve our services and user experience"}
              </li>
            </ul>
          </div>

          {/* Your Rights */}
          <div>
            <h3 className="font-normal text-[#767f87] text-base leading-6 mb-3">
              {language === "ar" ? "حقوقك" : "Your Rights"}
            </h3>
            <ul className="space-y-2">
              <li className="font-normal text-[#a1aeb7] text-sm leading-5">
                •{" "}
                {language === "ar"
                  ? "الوصول: طلب نسخة من بياناتك الشخصية"
                  : "Access: Request a copy of your personal data"}
              </li>
              <li className="font-normal text-[#a1aeb7] text-sm leading-5">
                •{" "}
                {language === "ar"
                  ? "التصحيح: تصحيح المعلومات غير الدقيقة"
                  : "Rectification: Correct inaccurate information"}
              </li>
              <li className="font-normal text-[#a1aeb7] text-sm leading-5">
                •{" "}
                {language === "ar"
                  ? "المحو: طلب حذف بياناتك"
                  : "Erasure: Request deletion of your data"}
              </li>
              <li className="font-normal text-[#a1aeb7] text-sm leading-5">
                •{" "}
                {language === "ar"
                  ? "قابلية النقل: تصدير بياناتك في تنسيق منظم"
                  : "Portability: Export your data in a structured format"}
              </li>
              <li className="font-normal text-[#a1aeb7] text-sm leading-5">
                •{" "}
                {language === "ar"
                  ? "سحب الموافقة: إلغاء الإذن في أي وقت"
                  : "Withdraw Consent: Revoke permission at any time"}
              </li>
            </ul>
          </div>

          {/* Important Disclaimers */}
          <div className="bg-[#f2f5f7] rounded-lg p-[18px]">
            <h3 className="font-normal text-[#565d63] text-base leading-6 mb-2">
              {language === "ar"
                ? "إخلاء مسؤولية مهم"
                : "Important Disclaimers"}
            </h3>
            <p className="font-normal text-[#697282] text-xs leading-[19.5px]">
              {language === "ar"
                ? "توفر هذه المنصة محتوى تعليميًا فقط؛ نحن لا نقدم ولا يمكننا تقديم المشورة المالية أو توصيات الاستثمار أو التوجيه التنظيمي. استشر المهنيين الماليين المؤهلين للحصول على مشورة شخصية. لن نكون مسؤولين عن أي خسارة أو مشورة تنشأ مباشرة."
                : "This platform provides educational content only; we do not and cannot provide financial advice, investment recommendations, or regulatory guidance. Consult qualified financial professionals for personalized advice. We will not be liable for any loss or advice directly arising."}
            </p>
          </div>
        </div>

        {/* Required Consents - Fixed section without scroll */}
        <div className="px-8 py-6 border-t border-gray-100 flex-shrink-0">
          <div className="space-y-4">
            <h3 className="font-normal text-[#565d63] text-base leading-6">
              {language === "ar" ? "الموافقات المطلوبة" : "Required Consents"}
            </h3>

            {/* Profiling Consent */}
            <div className="space-y-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
              <h4 className="font-normal text-[#767f87] text-base leading-6">
                {language === "ar"
                  ? "موافقة التنميط والتسجيل"
                  : "Profiling & Scoring Consent"}
              </h4>
              <div className="flex items-start gap-4">
                <Checkbox
                  id="profiling-consent"
                  checked={profilingConsent}
                  onCheckedChange={(checked) =>
                    setProfilingConsent(checked as boolean)
                  }
                  className="mt-1 h-5 w-5 border-2 border-gray-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <label
                  htmlFor="profiling-consent"
                  className="flex-1 font-normal text-[#495565] text-sm leading-[22.8px] cursor-pointer"
                >
                  {language === "ar"
                    ? "أوافق على المعالجة التلقائية لردودي لإنشاء درجة صحة مالية ورؤى ذات صلة. يتضمن ذلك التنميط بموجب المادة 18 من قانون حماية البيانات الشخصية."
                    : "I consent to the automated processing of my responses to generate a financial health score and related insights. This involves profiling under PDPL Article 18."}
                </label>
              </div>
            </div>

            {/* Data Processing Consent */}
            <div className="space-y-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
              <h4 className="font-normal text-[#767f87] text-base leading-6">
                {language === "ar"
                  ? "موافقة معالجة البيانات"
                  : "Data Processing Consent"}
              </h4>
              <div className="flex items-start gap-4">
                <Checkbox
                  id="data-processing-consent"
                  checked={dataProcessingConsent}
                  onCheckedChange={(checked) =>
                    setDataProcessingConsent(checked as boolean)
                  }
                  className="mt-1 h-5 w-5 border-2 border-gray-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <label
                  htmlFor="data-processing-consent"
                  className="flex-1 font-normal text-[#495565] text-sm leading-[22.8px] cursor-pointer"
                >
                  {language === "ar"
                    ? "أوافق على جمع وتخزين ومعالجة بياناتي الشخصية كما هو موضح أعلاه، بما في ذلك النقل إلى البنية التحتية السحابية الآمنة لتقديم الخدمة."
                    : "I consent to the collection, storage, and processing of my personal data as described above, including transfer to secure cloud infrastructure for service delivery."}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white px-6 py-4 flex items-center justify-center gap-4 flex-shrink-0">
          <Button
            onClick={handleGrantConsent}
            disabled={!canProceed || isSubmitting}
            className={`flex-1 max-w-[296px] h-9 font-normal text-white text-sm rounded-lg ${
              canProceed && !isSubmitting
                ? "bg-[#1e2939] hover:bg-[#1e2939]/90 cursor-pointer"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {isSubmitting
              ? language === "ar"
                ? "جاري الحفظ..."
                : "Saving..."
              : language === "ar"
              ? "أمنح الموافقة والمتابعة"
              : "I GRANT CONSENT & CONTINUE"}
          </Button>

          <Button
            onClick={onDecline}
            variant="outline"
            className="flex-1 max-w-[296px] h-9 bg-white hover:bg-gray-50 border border-[#0000001a] text-neutral-950 font-normal text-sm rounded-lg"
          >
            {language === "ar" ? "رفض" : "DECLINE"}
          </Button>
        </div>
      </div>
    </div>
  );
}
