"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerComponent } from "@/components/ui/date-picker";
import { useLocalization } from "@/contexts/LocalizationContext";
import type { FinancialClinicProfile } from "@/lib/financial-clinic-types";
import { toast } from "sonner";
import { ConsentModal } from "@/components/ConsentModal";
import { consentService } from "@/services/consentService";
import { HomepageHeader } from "@/components/homepage/Header";
import { HomepageFooter } from "@/components/homepage/Footer";

interface FinancialClinicPageProps {
  restoredSession?: {
    session_id: string;
    current_step: number;
    total_steps: number;
    responses: Record<string, any>;
    company_url?: string;
    email?: string;
    profile?: any;
  } | null;
}

export default function FinancialClinicPage({
  restoredSession,
}: FinancialClinicPageProps) {
  const router = useRouter();
  const { language, isRTL } = useLocalization();

  // Track consent state
  const [showConsent, setShowConsent] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [isCheckingConsent, setIsCheckingConsent] = useState(true);

  // Track company tracking status
  const [companyTracking, setCompanyTracking] = useState<{
    active: boolean;
    companyName?: string;
  } | null>(null);

  const [profile, setProfile] = useState<FinancialClinicProfile>({
    name: "",
    date_of_birth: "",
    gender: "Male",
    nationality: "Emirati",
    children: 0,
    employment_status: "Employed",
    income_range: "Below 5,000",
    emirate: "Dubai",
    email: "",
    mobile_number: "",
  });

  // Handle restored session data
  useEffect(() => {
    if (restoredSession && restoredSession.profile) {
      console.log(
        "🔄 Restoring profile from session:",
        restoredSession.profile
      );
      setProfile(restoredSession.profile);

      // If there's a company URL, restore it
      if (restoredSession.company_url) {
        setCompanyTracking({ active: true });
      }

      // Auto-proceed to survey with restored data
      localStorage.setItem(
        "financialClinicProfile",
        JSON.stringify(restoredSession.profile)
      );
      localStorage.setItem(
        "restoredAnswers",
        JSON.stringify(restoredSession.responses || {})
      );
      localStorage.setItem(
        "restoredStep",
        restoredSession.current_step.toString()
      );

      // Navigate to survey with company parameter if present
      const surveyUrl = restoredSession.company_url
        ? `/financial-clinic/survey?company=${encodeURIComponent(
            restoredSession.company_url
          )}`
        : "/financial-clinic/survey";

      setTimeout(() => {
        router.push(surveyUrl);
      }, 1500);
    }
  }, [restoredSession, router]);

  // Check for consent on mount - PDPL Compliant
  useEffect(() => {
    const checkConsent = async () => {
      try {
        const hasValidConsent = await consentService.hasConsent();
        setHasConsent(hasValidConsent);

        // If no consent, show modal immediately
        if (!hasValidConsent) {
          setShowConsent(true);
        }
      } catch (error) {
        console.error("Error checking consent:", error);
        // On error, show consent modal to be safe
        setShowConsent(true);
      } finally {
        setIsCheckingConsent(false);
      }
    };

    checkConsent();
  }, []);

  // Check for company tracking from URL parameter on mount
  useEffect(() => {
    // Read company parameter from URL
    const searchParams = new URLSearchParams(window.location.search);
    const companyUrl = searchParams.get("company");

    if (companyUrl) {
      // Fetch company name to display
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/companies/by-url/${companyUrl}`)
        .then((res) => res.json())
        .then((data) => {
          setCompanyTracking({
            active: true,
            companyName: data.company_name,
          });
        })
        .catch(() => {
          setCompanyTracking({ active: true }); // Show generic message if fetch fails
        });
    } else {
      setCompanyTracking({ active: false });
    }
  }, []);

  // Clear previous assessment data when component mounts
  useEffect(() => {
    localStorage.removeItem("financialClinicResult");
    // Note: We keep profile in case user is editing, but clear results
  }, []);

  const handleNationalityChange = (value: string) => {
    setProfile((prev) => ({
      ...prev,
      nationality: value as "Emirati" | "Non-Emirati",
    }));
  };

  const handleGenderChange = (value: string) => {
    setProfile((prev) => ({
      ...prev,
      gender: value as "Male" | "Female",
    }));
  };

  const handleChildrenChange = (value: string) => {
    setProfile((prev) => ({
      ...prev,
      children: parseInt(value),
    }));
  };

  const handleEmploymentChange = (value: string) => {
    setProfile((prev) => ({
      ...prev,
      employment_status: value as "Employed" | "Self-Employed" | "Unemployed",
    }));
  };

  const handleIncomeChange = (value: string) => {
    setProfile((prev) => ({
      ...prev,
      income_range: value,
    }));
  };

  const handleEmirateChange = (value: string) => {
    setProfile((prev) => ({
      ...prev,
      emirate: value,
    }));
  };

  const handleInputChange = (
    field: keyof FinancialClinicProfile,
    value: string
  ) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConsentGranted = () => {
    // Consent has been granted and saved by ConsentModal
    setShowConsent(false);
    setHasConsent(true);
    // No need for toast here as ConsentModal already shows success message
  };

  const handleConsentDeclined = () => {
    // User declined consent, redirect to homepage
    router.push("/");
    toast.info(
      language === "ar"
        ? "الموافقة مطلوبة لاستخدام هذه الخدمة."
        : "Consent is required to use this service."
    );
  };

  const handleStartSurvey = () => {
    // Validate required fields
    if (!profile.name.trim()) {
      toast.error(
        language === "ar" ? "يرجى إدخال الاسم" : "Please enter your name"
      );
      return;
    }
    if (!profile.date_of_birth.trim()) {
      toast.error(
        language === "ar"
          ? "يرجى إدخال تاريخ الميلاد"
          : "Please enter your date of birth"
      );
      return;
    }

    // Email validation with proper regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!profile.email.trim() || !emailRegex.test(profile.email.trim())) {
      toast.error(
        language === "ar"
          ? "يرجى إدخال بريد إلكتروني صحيح"
          : "Please enter a valid email address"
      );
      return;
    }

    // Save profile to localStorage
    localStorage.setItem("financialClinicProfile", JSON.stringify(profile));

    // Navigate to survey - preserve company parameter if present
    const searchParams = new URLSearchParams(window.location.search);
    const companyUrl = searchParams.get("company");
    const surveyUrl = companyUrl
      ? `/financial-clinic/survey?company=${encodeURIComponent(companyUrl)}`
      : "/financial-clinic/survey";

    router.push(surveyUrl);

    toast.success(
      language === "ar" ? "لنبدأ التقييم!" : "Let's begin the assessment!"
    );
  };

  // Show loading while checking consent
  if (isCheckingConsent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#437749] mx-auto mb-4"></div>
          <p className="text-[#a1aeb7]">
            {language === "ar" ? "جاري التحقق..." : "Checking..."}
          </p>
        </div>
      </div>
    );
  }

  // Show consent modal if user hasn't consented yet
  if (showConsent) {
    return (
      <ConsentModal
        onConsent={handleConsentGranted}
        onDecline={handleConsentDeclined}
      />
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-white">
      {/* Header */}
      <HomepageHeader />

      {/* Main Content */}
      <main className="flex flex-col items-center px-3 md:px-6 py-4 md:py-8 flex-1">
        {/* Title Section */}
        <div className="flex flex-col items-center gap-1.5 mb-4 md:mb-8">
          <h1 className="font-[family-name:var(--font-poppins)] font-semibold text-[#2a4d2e] text-xl md:text-[28px] lg:text-[33px] tracking-[0] leading-tight text-center">
            {language === "ar" ? "ملف العميل" : "Customer Profile"}
          </h1>
          <p className="font-[family-name:var(--font-poppins)] font-normal text-[#5a6c64] text-sm text-center tracking-[0] leading-6">
            {language === "ar"
              ? "هل أنت مستعد لبدء الفحص الخاص بك؟"
              : "Ready to begin your checkup?"}
          </p>
        </div>

        {/* Description */}
        <div className="flex flex-col items-center gap-[3px] mb-4 md:mb-8 max-w-[833px] px-2">
          <p className="w-full font-[family-name:var(--font-poppins)] font-normal text-[#5a6c64] text-sm tracking-[0] leading-6 text-center">
            {language === "ar"
              ? "أدخل اسمك وبريدك الإلكتروني للبدء."
              : "Enter your name and email to start."}
          </p>
          <p className="w-full font-[family-name:var(--font-poppins)] font-normal text-[#5a6c64] text-sm tracking-[0] leading-6 text-center">
            {language === "ar"
              ? "سنرسل لك تقريرك الشخصي والتوصيات المتابعة لإبقائك على المسار الصحيح."
              : "We'll send you your personalized report and follow-up recommendations to keep you on track."}
          </p>
        </div>

        {/* Company Tracking Indicator */}
        {companyTracking?.active && (
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-[#f0f4f1] border-2 border-[#3fab4c] rounded-lg shadow-md max-w-[850px] w-full">
            <div className="flex items-center justify-center gap-3">
              <svg
                className="w-6 h-6 text-[#437749]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <div className="text-center">
                <div className="font-semibold text-[#437749]">
                  {language === "ar"
                    ? "🏢 التقييم المقدم من شركة"
                    : "🏢 Company Assessment"}
                </div>
                {companyTracking.companyName && (
                  <div className="text-sm text-[#3fab4c] mt-1">
                    {companyTracking.companyName}
                  </div>
                )}
                <div className="text-xs text-[#a1aeb7] mt-1">
                  {language === "ar"
                    ? "سيتم تتبع نتائجك تلقائياً لتحليل الشركة"
                    : "Your results will be automatically tracked for company analytics"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="flex flex-col items-center gap-4 md:gap-6 w-full max-w-[850px]">
          {/* Name and Date of Birth */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 w-full">
            {/* Name Input with Label */}
            <div className="flex-1">
              <Label className="font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 mb-2 block">
                {language === "ar" ? "الاسم" : "Name"}
              </Label>
              <Input
                placeholder={
                  language === "ar" ? "أدخل اسمك" : "Enter your name"
                }
                value={profile.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="h-[50px] px-6 py-2.5 rounded-[3px] border border-solid border-[#c2d1d9] font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 placeholder:text-[#a1aeb7]"
              />
            </div>

            {/* Date of Birth Input with Label */}
            <div className="flex-1">
              <Label className="font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 mb-2 block">
                {language === "ar" ? "تاريخ الميلاد" : "Date of Birth"}
              </Label>
              <DatePickerComponent
                date={
                  profile.date_of_birth
                    ? new Date(profile.date_of_birth)
                    : undefined
                }
                onSelect={(date) => {
                  if (date) {
                    // Format date as YYYY-MM-DD for storage
                    const formattedDate = date.toISOString().split("T")[0];
                    handleInputChange("date_of_birth", formattedDate);
                  } else {
                    handleInputChange("date_of_birth", "");
                  }
                }}
                placeholder={
                  language === "ar"
                    ? "اختر تاريخ الميلاد"
                    : "Select date of birth"
                }
                maxDate={new Date()} // Prevent future dates
                minDate={new Date(1920, 0, 1)} // Minimum year 1920
              />
            </div>
          </div>

          {/* Gender and Nationality */}
          <div
            className={`flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 w-full md:justify-between ${
              language === "ar" ? "md:flex-row-reverse" : ""
            }`}
          >
            <div
              className={`flex items-center gap-6 md:gap-[46px] ${
                language === "ar" ? "flex-row-reverse" : ""
              }`}
            >
              <Label className="font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 whitespace-nowrap">
                {language === "ar" ? "الجنس" : "Gender"}
              </Label>

              <RadioGroup
                value={profile.gender}
                onValueChange={handleGenderChange}
                className={`flex items-center gap-[46px] ${
                  language === "ar" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex items-center gap-[5px] ${
                    language === "ar" ? "flex-row-reverse" : ""
                  }`}
                >
                  <RadioGroupItem
                    value="Male"
                    id="male"
                    className="w-[17px] h-[17px] border-[#a1aeb7]"
                  />
                  <Label
                    htmlFor="male"
                    className="font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 whitespace-nowrap cursor-pointer"
                  >
                    {language === "ar" ? "ذكر" : "Male"}
                  </Label>
                </div>
                <div
                  className={`flex items-center gap-[5px] ${
                    language === "ar" ? "flex-row-reverse" : ""
                  }`}
                >
                  <RadioGroupItem
                    value="Female"
                    id="female"
                    className="w-[17px] h-[17px] border-[#a1aeb7]"
                  />
                  <Label
                    htmlFor="female"
                    className="font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 whitespace-nowrap cursor-pointer"
                  >
                    {language === "ar" ? "أنثى" : "Female"}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div
              className={`flex items-center gap-[46px] ${
                language === "ar" ? "flex-row-reverse" : ""
              }`}
            >
              <Label className="font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 whitespace-nowrap">
                {language === "ar" ? "الجنسية" : "Nationality"}
              </Label>

              <RadioGroup
                value={profile.nationality}
                onValueChange={handleNationalityChange}
                className={`flex items-center gap-[46px] ${
                  language === "ar" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex items-center gap-[5px] ${
                    language === "ar" ? "flex-row-reverse" : ""
                  }`}
                >
                  <RadioGroupItem
                    value="Emirati"
                    id="emirati"
                    className="w-[17px] h-[17px] border-[#a1aeb7]"
                  />
                  <Label
                    htmlFor="emirati"
                    className="font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 whitespace-nowrap cursor-pointer"
                  >
                    {language === "ar" ? "إماراتي" : "Emirati"}
                  </Label>
                </div>
                <div
                  className={`flex items-center gap-[5px] ${
                    language === "ar" ? "flex-row-reverse" : ""
                  }`}
                >
                  <RadioGroupItem
                    value="Non-Emirati"
                    id="non-emirati"
                    className="w-[17px] h-[17px] border-[#a1aeb7]"
                  />
                  <Label
                    htmlFor="non-emirati"
                    className="font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 whitespace-nowrap cursor-pointer"
                  >
                    {language === "ar" ? "غير إماراتي" : "Non- Emirati"}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Emirate and Children */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full">
            {/* Emirate Dropdown with Label */}
            <div className="flex-1">
              <Label className="font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 mb-2 block">
                {language === "ar" ? "الإمارة" : "Emirate"}
              </Label>
              <Select
                value={profile.emirate}
                onValueChange={handleEmirateChange}
              >
                <SelectTrigger className="w-full h-[50px] px-6 py-2.5 rounded-[3px] border border-solid border-[#c2d1d9] font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6">
                  <SelectValue
                    placeholder={
                      language === "ar" ? "اختر الإمارة" : "Select emirate"
                    }
                    className="placeholder:text-[#a1aeb7]"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dubai">Dubai</SelectItem>
                  <SelectItem value="Abu Dhabi">Abu Dhabi</SelectItem>
                  <SelectItem value="Sharjah">Sharjah</SelectItem>
                  <SelectItem value="Ajman">Ajman</SelectItem>
                  <SelectItem value="Al Ain">Al Ain</SelectItem>
                  <SelectItem value="Ras Al Khaimah / Fujairah / UAQ / Outside UAE">
                    Ras Al Khaimah / Fujairah / UAQ / Outside UAE
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Children Dropdown with Label */}
            <div className="flex-1">
              <Label className="font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 mb-2 block">
                {language === "ar" ? "الأطفال" : "Children"}
              </Label>
              <Select
                value={profile.children.toString()}
                onValueChange={handleChildrenChange}
              >
                <SelectTrigger className="w-full h-[50px] px-6 py-2.5 rounded-[3px] border border-solid border-[#c2d1d9] font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6">
                  <SelectValue
                    placeholder={
                      language === "ar" ? "عدد الأطفال" : "Number of children"
                    }
                    className="placeholder:text-[#a1aeb7]"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Employment Status and Income Range */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full">
            {/* Employment Status Dropdown with Label */}
            <div className="flex-1">
              <Label className="font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 mb-2 block">
                {language === "ar" ? "حالة التوظيف" : "Employment Status"}
              </Label>
              <Select
                value={profile.employment_status}
                onValueChange={handleEmploymentChange}
              >
                <SelectTrigger className="w-full h-[50px] px-6 py-2.5 rounded-[3px] border border-solid border-[#c2d1d9] font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6">
                  <SelectValue
                    placeholder={
                      language === "ar" ? "حالة التوظيف" : "Employment Status"
                    }
                    className="placeholder:text-[#a1aeb7]"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Employed">
                    {language === "ar" ? "موظف" : "Employed"}
                  </SelectItem>
                  <SelectItem value="Self-Employed">
                    {language === "ar" ? "أعمال حرة" : "Self-Employed"}
                  </SelectItem>
                  <SelectItem value="Unemployed">
                    {language === "ar" ? "عاطل عن العمل" : "Unemployed"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Household Monthly Income Range Dropdown with Label */}
            <div className="flex-1">
              <Label className="font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 mb-2 block">
                {language === "ar"
                  ? "نطاق الدخل الشهري للأسرة بالدرهم الإماراتي"
                  : "Household Monthly Income Range in AED"}
              </Label>
              <Select
                value={profile.income_range}
                onValueChange={handleIncomeChange}
              >
                <SelectTrigger className="w-full h-[50px] px-6 py-2.5 rounded-[3px] border border-solid border-[#c2d1d9] font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6">
                  <SelectValue
                    placeholder={
                      language === "ar"
                        ? "اختر نطاق دخل الأسرة الشهري"
                        : "Select household monthly income range"
                    }
                    className="placeholder:text-[#a1aeb7]"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Below 5,000">Below 5,000</SelectItem>
                  <SelectItem value="5,000 to 10,000">
                    5,000 to 10,000
                  </SelectItem>
                  <SelectItem value="10,000 to 20,000">
                    10,000 to 20,000
                  </SelectItem>
                  <SelectItem value="20,000 to 30,000">
                    20,000 to 30,000
                  </SelectItem>
                  <SelectItem value="30,000 to 40,000">
                    30,000 to 40,000
                  </SelectItem>
                  <SelectItem value="40,000 to 50,000">
                    40,000 to 50,000
                  </SelectItem>
                  <SelectItem value="50,000 to 100,000">
                    50,000 to 100,000
                  </SelectItem>
                  <SelectItem value="Above 100,000">Above 100,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Email and Mobile Number */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full">
            {/* Email Field with Label */}
            <div className="flex-1">
              <Label className="font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 mb-2 block">
                {language === "ar"
                  ? "عنوان البريد الإلكتروني"
                  : "Email Address"}
              </Label>
              <Input
                placeholder={
                  language === "ar"
                    ? "أدخل بريدك الإلكتروني"
                    : "Enter your email"
                }
                type="email"
                value={profile.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full h-[50px] px-6 py-2.5 rounded-[3px] border border-solid border-[#c2d1d9] font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 placeholder:text-[#a1aeb7]"
              />
            </div>

            {/* Mobile Number Field with Label */}
            <div className="flex-1">
              <Label className="font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 mb-2 block">
                {language === "ar" ? "رقم الجوال" : "Mobile Number"}
              </Label>
              <Input
                placeholder={
                  language === "ar"
                    ? "أدخل رقم جوالك"
                    : "Enter your mobile number"
                }
                type="tel"
                value={profile.mobile_number || ""}
                onChange={(e) =>
                  handleInputChange("mobile_number", e.target.value)
                }
                className="w-full h-[50px] px-6 py-2.5 rounded-[3px] border border-solid border-[#c2d1d9] font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 placeholder:text-[#a1aeb7]"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleStartSurvey}
          className="h-auto mt-6 md:mt-12 px-7 py-2.5 bg-[#3fab4c] hover:bg-[#3fab4c]/90 w-full md:w-auto"
        >
          <span className="font-[family-name:var(--font-poppins)] font-normal text-white text-sm text-center tracking-[0] leading-[18px] whitespace-nowrap">
            {language === "ar" ? "ابدأ فحصي" : "START MY CHECKUP"}
          </span>
        </Button>
      </main>

      {/* Footer */}
      <HomepageFooter />
    </div>
  );
}
