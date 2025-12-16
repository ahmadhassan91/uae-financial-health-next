"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocalization } from "@/contexts/LocalizationContext";
import { X, ChevronDown, ChevronUp } from "lucide-react";
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
  const [termsExpanded, setTermsExpanded] = React.useState(false);
  const [acknowledgementExpanded, setAcknowledgementExpanded] = React.useState(false);
  const [noOfferExpanded, setNoOfferExpanded] = React.useState(false);
  const [disclaimerExpanded, setDisclaimerExpanded] = React.useState(false);
  const [trademarksExpanded, setTrademarksExpanded] = React.useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="bg-white rounded-[10px] shadow-lg max-w-[884px] w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header - Simple and clean */}
        <div className="bg-white px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 flex items-start justify-between border-b border-gray-100 flex-shrink-0">
          <div className="flex-1 pr-2">
            <h2 className="font-bold text-[#505d68] text-sm sm:text-base leading-5 sm:leading-6 mb-1">
              {language === "ar" ? "الشروط والأحكام" : "Terms & Conditions"}
            </h2>
            <p className="font-normal text-[#495565] text-xs sm:text-sm leading-4 sm:leading-5">
              {language === "ar"
                ? "يُرجى قراءة هذه الشروط والأحكام المهمة قبل الدخول إلى هذا الموقع."
                : "Please read the following important terms and conditions before accessing this website."}
            </p>
          </div>
          <button
            onClick={onDecline}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Scrollable Content - Only the informational sections */}
        <div className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 space-y-3 sm:space-y-4 md:space-y-8 overflow-y-auto flex-1 max-h-[25vh] sm:max-h-[35vh] md:max-h-none">
          {/* What We Collect */}
          <div className="bg-[#f2f5f7] rounded-lg overflow-hidden">
            <button
              onClick={() => setTermsExpanded(!termsExpanded)}
              className="w-full p-3 sm:p-4 md:p-[18px] flex items-center justify-between text-left hover:bg-[#e8ecf0] transition-colors"
            >
              <h3 className="font-normal text-[#767f87] text-sm sm:text-base leading-5 sm:leading-6">
                {language === "ar" ? "الشروط والأحكام" : "Terms & Conditions"}
              </h3>
              {termsExpanded ? (
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#767f87] flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#767f87] flex-shrink-0" />
              )}
            </button>
            {termsExpanded && (
              <div className="px-3 sm:px-4 md:px-[18px] pb-3 sm:pb-4 md:pb-[18px]">
                <p className="font-normal text-[#a1aeb7] text-xs sm:text-sm leading-4 sm:leading-5 whitespace-pre-line">
                  {language === "ar"
                    ? `بدخولكم إلى هذا الموقع الإلكتروني، فإنّكم توافقون على الالتزام بهذه الشروط والأحكام. في حال عدم موافقتكم على الالتزام بهذه الشروط والأحكام، يُرجى عدم دخول الموقع. إنّ محتويات هذا الموقع الإلكتروني هي لأغراض المعلومات فقط، ولا ينبغي اعتبارها كاملة أو مُحدّثة. يُمكن الحصول على التفاصيل الكاملة لبرامج الصكوك الوطنية والخدمات التي تقدّمها من أيّ من فروع شركة الصكوك الوطنية شركة الشخص الواحد مساهمة خاصة أو موزعيها المعتمدين. كما أنّ بعض الخدمات المُشار إليها في هذا الموقع الإلكتروني مُخصصة لسكان دولة الإمارات العربية المتحدة وغير متاحة للمقيمين في الخارج، نظراً لاحتمال عدم امتثالها للقوانين الأجنبية. لا تهدف هذه المعلومات إلى تقديم مشورة مهنية، ولا ينبغي الاستناد إليها في هذا الشأن. يُنصح زوّار هذه الصفحات بالحصول على المشورة المهنية المناسبة عند الحاجة.`
                    : `By accessing this website, you agree to be bound by these terms and conditions. If you do not agree to be bound by these terms and conditions, please do not access this website. The contents of this website are for information only. They should not be regarded as complete or up-to-date. Full details of National Bonds products and services are available from any of its branch or approved distributers of National Bonds Corporation Sole Proprietorship PSC. Certain services referred to in this website are intended for residents of United Arab Emirates and are not available to overseas residents, as they may not comply with foreign laws. This information is not intended to provide professional advice and should not be relied upon in that regard. Persons accessing these pages are advised to obtain appropriate professional advice where necessary.`}
                </p>
              </div>
            )}
          </div>

          {/* How We Use Your Data */}
          <div className="bg-[#f2f5f7] rounded-lg overflow-hidden">
            <button
              onClick={() => setAcknowledgementExpanded(!acknowledgementExpanded)}
              className="w-full p-3 sm:p-4 md:p-[18px] flex items-center justify-between text-left hover:bg-[#e8ecf0] transition-colors"
            >
              <h3 className="font-normal text-[#565d63] text-sm sm:text-base leading-5 sm:leading-6">
                {language === "ar"
                  ? "الإقرار بالشروط والأحكام والموافقة عليها"
                  : "Acknowledgement and Acceptance of Terms"}
              </h3>
              {acknowledgementExpanded ? (
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#565d63] flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#565d63] flex-shrink-0" />
              )}
            </button>
            {acknowledgementExpanded && (
              <div className="px-3 sm:px-4 md:px-[18px] pb-3 sm:pb-4 md:pb-[18px] space-y-3 sm:space-y-4">
                <p className="font-normal text-[#a1aeb7] text-xs sm:text-sm leading-4 sm:leading-5 whitespace-pre-line">
                  {language === "ar"
                    ? `بدخولكم إلى هذا الموقع الإلكتروني، فإنّكم توافقون على الالتزام بهذه الشروط والأحكام. في حال عدم موافقتكم على الالتزام بهذه الشروط والأحكام، يُرجى عدم دخول الموقع. إنّ محتويات هذا الموقع الإلكتروني هي لأغراض المعلومات فقط، ولا ينبغي اعتبارها كاملة أو مُحدّثة. يُمكن الحصول على التفاصيل الكاملة لبرامج الصكوك الوطنية والخدمات التي تقدّمها من أيّ من فروع شركة الصكوك الوطنية شركة الشخص الواحد مساهمة خاصة أو موزعيها المعتمدين. كما أنّ بعض الخدمات المُشار إليها في هذا الموقع الإلكتروني مُخصصة لسكان دولة الإمارات العربية المتحدة وغير متاحة للمقيمين في الخارج، نظراً لاحتمال عدم امتثالها للقوانين الأجنبية. لا تهدف هذه المعلومات إلى تقديم مشورة مهنية، ولا ينبغي الاستناد إليها في هذا الشأن. يُنصح زوّار هذه الصفحات بالحصول على المشورة المهنية المناسبة عند الحاجة.`
                    : `This website is owned and operated by National Bonds Corporation Sole Proprietorship PSC. All National Bonds Corporation Sole Proprietorship PSC products and services are subject to the terms and conditions and disclaimers of the applicable agreement governing their use. These Terms are to be read by you together with such other terms, conditions and disclaimers. In the event of any conflict, the terms, conditions and disclaimers applicable to specific products or services shall prevail over these Terms.`}
                </p>
                <p className="font-normal text-[#a1aeb7] text-xs sm:text-sm leading-4 sm:leading-5 whitespace-pre-line">
                  {language === "ar"
                    ? `قد تخضع المعلومات والمواد الأخرى الواردة في صفحات هذا الموقع الإلكتروني (بما في ذلك الأحكام) للتغيير في أي وقت بدون إشعار مسبق، وذلك من خلال تحديث هذا المحتوى. أنتم توافقون على الاطّلاع على محتوى هذا الموقع بانتظام، كما أنّ مواصلة دخولكم إليه أو استخدامه بعد أيّ تغييرات، تُعدّ موافقةً منكم على تلك التغييرات (بما في ذلك أيّ أحكام معدّلة).`
                    : `By using this website, whether browsing or opening an application, you acknowledge that you have read and understood the Terms and agree to be bound by them. The information and other material provided in the pages of this website (including the Terms) may be changed at any time without notice by updating this posting. You agree to review the website regularly and your continued access to, or use of, this website following any changes will mean that you agree to any changes (including any amended Terms).`}
                </p>
              </div>
            )}
          </div>

          {/* Your Rights */}
          <div className="bg-[#f2f5f7] rounded-lg overflow-hidden">
            <button
              onClick={() => setNoOfferExpanded(!noOfferExpanded)}
              className="w-full p-3 sm:p-4 md:p-[18px] flex items-center justify-between text-left hover:bg-[#e8ecf0] transition-colors"
            >
              <h3 className="font-normal text-[#565d63] text-sm sm:text-base leading-5 sm:leading-6">
                {language === "ar" ? "لا عروض أو مشورة" : "No Offer or Advice"}
              </h3>
              {noOfferExpanded ? (
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#565d63] flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#565d63] flex-shrink-0" />
              )}
            </button>
            {noOfferExpanded && (
              <div className="px-3 sm:px-4 md:px-[18px] pb-3 sm:pb-4 md:pb-[18px]">
                <p className="font-normal text-[#a1aeb7] text-xs sm:text-sm leading-4 sm:leading-5 whitespace-pre-line">
                  {language === "ar"
                    ? `تتضمّن المواد المنشورة على هذا الموقع الإلكتروني معلومات عامة عن البرامج والخدمات التي تقدّمها شركة الصكوك الوطنية شركة الشخص الواحد مساهمة خاصة. وما لم يُنصّ صراحةً على خلاف ذلك، فإنّ هذه المعلومات لا تُشكّل عرضًا أو دعوة لإبرام عقد ملزم قانوناً، كما أنّها لا تُشكّل جزءاً من الشروط والأحكام الخاصة بهذه البرامج والخدمات. لا ينبغي اعتبار هذه المعلومات نصيحة مالية، وهي لا تُراعي المتطلّبات والظروف الشخصية لأي مستثمر`
                    : `The material on this website contains general information about National Bonds Corporation Sole Proprietorship PSC products and services. Unless expressly stated otherwise this information does not constitute an offer or inducement to enter into a legally binding contract and does not form part of the terms and conditions for such products and services. The information is not intended to be taken as financial advice and does not take into account any investor's individual requirements and circumstances`}
                </p>
              </div>
            )}
          </div>

          {/* Important Disclaimers */}
          <div className="bg-[#f2f5f7] rounded-lg overflow-hidden">
            <button
              onClick={() => setDisclaimerExpanded(!disclaimerExpanded)}
              className="w-full p-3 sm:p-4 md:p-[18px] flex items-center justify-between text-left hover:bg-[#e8ecf0] transition-colors"
            >
              <h3 className="font-normal text-[#565d63] text-sm sm:text-base leading-5 sm:leading-6">
                {language === "ar"
                  ? "إخلاء المسؤولية وحدود المسؤولية القانونية"
                  : "Disclaimer and Limitation of Liability"}
              </h3>
              {disclaimerExpanded ? (
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#565d63] flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#565d63] flex-shrink-0" />
              )}
            </button>
            {disclaimerExpanded && (
              <div className="px-3 sm:px-4 md:px-[18px] pb-3 sm:pb-4 md:pb-[18px]">
                <p className="font-normal text-[#a1aeb7] text-xs sm:text-sm leading-4 sm:leading-5 whitespace-pre-line">
                  {language === "ar"
                    ? `تحدّد البنود التالية المسؤولية القانونية لشركة الصكوك الوطنية شركة الشخص الواحد مساهمة خاصة عن تطبيق هذا الموقع، أو تعفيها منها. يُرجى قراءتها بعناية. وهي لا تنطبق إلا بقدر ما يسمح به القانون. ومع أنّ شركة الصكوك الوطنيّة حرصت على اتّخاذ جميع الخطوات المعقولة لضمان أن تكون المعلومات الواردة في هذا الموقع دقيقة، ومحدَّثة، ومتاحة، وكاملة، إلّا أنّ المعلومات مقدّمة بحسن نيّة، كما هي وحسب توافرها، ولا تُقدِّم الصكوك الوطنيّة أيّ إقرار أو ضمان، صريحاً كان أو ضمنياً، بشأن موثوقية المعلومات المنشورة على هذا الموقع. ويُفترض بأنّ المعلومات كانت كاملة وحديثة في تاريخ نشرها على الموقع. لا تتحمّل شركة الصكوك الوطنية شركة الشخص الواحد مساهمة خاصة أيّ مسؤولية تنشأ بأيّ شكل من الأشكال (بما في ذلك الإهمال) عن أي خطأ أو إغفال في المعلومات الواردة على هذا الموقع. ويكون استخدام الموقع على مسؤوليتكم الخاصة. لن تتحمّل شركة الصكوك الوطنية شركة الشخص الواحد مساهمة خاصة أيّ مسؤولية عن أي خسائر أو أضرار أو نفقات (بما في ذلك التكاليف القانونية)، ناشئة عن أو مرتبطة بمواد واردة في هذا الموقع أو يتمّ الوصول إليها من خلاله، حتى وإن تمّ إعلام الصكوك الوطنية بإمكانية حدوث تلك الأضرار. ولا تتعهّد الصكوك ا...[892 bytes truncated]`
                    : "The following clauses exclude or limit National Bonds Corporation Sole Proprietorship PSC  legal liability for this website app. You should read them carefully. They all apply only so far as the law permits. Whilst National Bonds has taken reasonable steps to ensure the accuracy, currency, availability and completeness of the information contained on this website, information is provided in good faith on an 'as is', 'as available' basis and National Bonds does not make any representation or warranty of any kind, whether express or implied, as to the reliability of the information contained on this website. The information is believed to be accurate and current at the date the information was placed on this website. National Bonds Corporation Sole Proprietorship PSC does not accept any responsibility arising in any way (including negligence) for errors in, or omissions from, the information contained in this website. The use of this website is at your sole risk. National Bonds Corporation Sole Proprietorship PSC  shall not be liable for any losses or damages or expenses (including legal costs) whatsoever arising out of or referable to materials on this website or accessed through this website, even if National Bonds has been advised of the possibility of such damage. National Bonds does not represent or warrant that this website will be available and meet your requirements, that access will be uninterrupted, that there will be no delays, failures, errors or omissions or loss of transmitted information, that no viruses or other contaminating or destructive properties will be transmitted or that no damage will occur to your computer system. You have sole responsibility for adequate protection and back up of data and/or equipment and to undertake reasonable and appropriate precautions to scan for computer viruses or other destructive properties. National Bonds makes no representations or warranties regarding the accuracy, functionality or performance ...[636 bytes truncated]"}
                </p>
              </div>
            )}
          </div>
          <div className="bg-[#f2f5f7] rounded-lg overflow-hidden">
            <button
              onClick={() => setTrademarksExpanded(!trademarksExpanded)}
              className="w-full p-3 sm:p-4 md:p-[18px] flex items-center justify-between text-left hover:bg-[#e8ecf0] transition-colors"
            >
              <h3 className="font-normal text-[#565d63] text-sm sm:text-base leading-5 sm:leading-6">
                {language === "ar"
                  ? "العلامات التجارية وحقوق النشر الخاصة بشركة الصكوك الوطنية شركة الشخص الواحد مساهمة خاصة"
                  : "National Bonds Corporation Sole Proprietorship PSC Trademarks and Copyright"}
              </h3>
              {trademarksExpanded ? (
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#565d63] flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#565d63] flex-shrink-0" />
              )}
            </button>
            {trademarksExpanded && (
              <div className="px-3 sm:px-4 md:px-[18px] pb-3 sm:pb-4 md:pb-[18px]">
                <p className="font-normal text-[#a1aeb7] text-xs sm:text-sm leading-4 sm:leading-5 whitespace-pre-line">
                  {language === "ar"
                    ? `إنّ المحتوى والمعلومات الواردة في موقع شركة الصكوك الوطنية شركة الشخص الواحد مساهمة خاصة، أو المُقدمة إليكم في إطار استخدامكم لموقعها الإلكتروني، هي ملكٌ لشركة الصكوك الوطنية ولأي جهة خارجية أخرى (إن وُجدت). تشمل العلامات التجارية والأسماء التجارية والشعارات (المشار إليها فيما يلي بــ"العلامات التجارية") المستخدمة والمعروضة على موقع شركة الصكوك الوطنية شركة الشخص الواحد مساهمة خاصة، العلامات التجارية المسجلة وغير المسجلة لشركة الصكوك الوطنية شركة الشخص الواحد مساهمة خاصة ولجهات خارجية أخرى. ولا ينبغي تفسير أيّ شيء على موقع شركة الصكوك الوطنية شركة الشخص الواحد مساهمة خاصة على أنه يمنح أيّ ترخيص أو حقّ في استخدام أيّ علامات تجارية معروضة على موقع شركة الصكوك الوطنية شركة الشخص الواحد مساهمة خاصة. تحتفظ شركة الصكوك الوطنية شركة الشخص الواحد مساهمة خاصة بكافة حقوق الملكيّة المتعلّقة بموقعها. ويُمنع على المستخدمين استخدامه بدون إذن خطي مسبق من شركة الصكوك الوطنية شركة الشخص الواحد مساهمة خاصة أو الأطراف الأخرى ذات الصلة. إنّ المواد الموجودة على هذا الموقع الإلكتروني محمية بموجب حقوق الطبع والنشر، ولا يجوز تعديل أي جزء منها، أو إعادة إنتاجه، أو تخزينه في نظام استرجاع، أو ...[374 bytes truncated]`
                    : "The content and information contained within National Bonds Corporation Sole Proprietorship PSC website or delivered to you in connection with your use of National Bond's website is the property of National Bonds and any other third party (where applicable). The trademark, trade names and logos (the 'Trade Marks') that are used and displayed on National Bonds Corporation Sole Proprietorship PSC  website include registered and unregistered Trade Marks of National Bonds Corporation Sole Proprietorship PSC  and other third parties. Nothing on National Bonds Corporation Sole Proprietorship PSC website should be construed as granting any licence or right to use any Trade Marks displayed on National Bonds Corporation Sole Proprietorship PSC website. National Bonds Corporation Sole Proprietorship PSC retains all proprietary rights on its website. Users are prohibited from using the same without written permission of National Bonds Corporation Sole Proprietorship PSC  of such or such other parties. The materials on this website are protected by copyright and no part of such materials may be modified, reproduced, stored in a retrieval system, transmitted (in any form or by any means), copied, distributed, used for creating derivative works or used in any other way for commercial or public purposes without National Bonds Corporation Sole Proprietorship PSC prior written consent"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Required Consents - Fixed section outside scrollable area */}
        <div className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 border-t border-gray-100 flex-shrink-0">
          <div className="space-y-2 sm:space-y-3">
            <h3 className="font-normal text-[#565d63] text-sm sm:text-base leading-5 sm:leading-6">
              {language === "ar"
                ? "الموافقة والتأكيد المطلوبان"
                : "Required Consent & Confirmation"}
            </h3>

            {/* Profiling Consent */}
            <div className="p-2.5 sm:p-3 md:p-4 border border-gray-200 rounded-lg 
            transition-colors">
              <div className="flex items-start gap-2.5 sm:gap-3 md:gap-4">
                <Checkbox
                  id="profiling-consent"
                  checked={profilingConsent}
                  onCheckedChange={(checked) =>
                    setProfilingConsent(checked as boolean)
                  }
                  className="mt-0.5 sm:mt-1 h-4 w-4 sm:h-5 sm:w-5 border-2 border-gray-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 flex-shrink-0"
                />
                <label
                  htmlFor="profiling-consent"
                  className="flex-1 font-normal text-[#495565] text-xs sm:text-sm leading-5 sm:leading-[22.8px] cursor-pointer"
                >
                  {language === "ar"
                    ? "أوافق على المعالجة الآلية لإجاباتي بهدف تحديد درجة صحتي المالية، وتقديم رؤى مرتبطة بها، بما في ذلك جمع بياناتي الشخصية وتخزينها ومعالجتها"
                    : "I consent to the automated processing of my responses to generate a financial health score and related insights including the collection, storage, and processing of my personal data."}
                </label>
              </div>
            </div>

            {/* Data Processing Consent */}
            <div className="p-2.5 sm:p-3 md:p-4 border border-gray-200 rounded-lg transition-colors">
              <div className="flex items-start gap-2.5 sm:gap-3 md:gap-4">
                <Checkbox
                  id="data-processing-consent"
                  checked={dataProcessingConsent}
                  onCheckedChange={(checked) =>
                    setDataProcessingConsent(checked as boolean)
                  }
                  className="mt-0.5 sm:mt-1 h-4 w-4 sm:h-5 sm:w-5 border-2 border-gray-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 flex-shrink-0"
                />
                <label
                  htmlFor="data-processing-consent"
                  className="flex-1 font-normal text-[#495565] text-xs sm:text-sm leading-5 sm:leading-[22.8px] cursor-pointer"
                >
                  {language === "ar"
                    ? "أُقرّ بأن المعلومات المقدّمة لا تُعدّ مشورة مالية أو مهنية ولا ينبغي اعتبارها كذلك."
                    : " I confirm that the information provided is not to be take as financial or professional advice"}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-1 sm:gap-1 flex-shrink-0">
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
            className="w-full sm:flex-1 sm:max-w-[296px] h-10 sm:h-9 bg-white hover:bg-gray-50 border border-[#0000001a] text-neutral-950 font-normal text-xs sm:text-sm rounded-lg"
          >
            {language === "ar" ? "رفض" : "DECLINE"}
          </Button>
        </div>
      </div>
    </div>
  );
}
