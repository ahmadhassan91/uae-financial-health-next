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
import {
  getCountries,
  getCountryCallingCode,
} from "react-phone-number-input/input";
import en from "react-phone-number-input/locale/en.json";
import { getExampleNumber } from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";

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
    gender: "" as any,
    nationality: "" as any,
    children: 0,
    employment_status: "" as any,
    income_range: "",
    emirate: "",
    email: "",
    mobile_number: "",
  });

  const [nameError, setNameError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");
  const [dateError, setDateError] = useState<string>("");
  const [genderError, setGenderError] = useState<string>("");
  const [nationalityError, setNationalityError] = useState<string>("");
  const [emirateError, setEmirateError] = useState<string>("");
  const [employmentError, setEmploymentError] = useState<string>("");
  const [incomeError, setIncomeError] = useState<string>("");
  const [countryCode, setCountryCode] = useState<string>("AE");

  // Get list of all countries
  const countries = getCountries();

  // Get placeholder based on country using library
  const getPhonePlaceholder = (countryCode: string) => {
    try {
      const exampleNumber = getExampleNumber(countryCode as any, examples);
      if (exampleNumber) {
        return exampleNumber.nationalNumber.toString();
      }
    } catch (error) {
      console.log("No example for country:", countryCode);
    }
    return "123456789";
  };

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

  // Clear all validation errors when language changes
  useEffect(() => {
    setNameError("");
    setEmailError("");
    setPhoneError("");
    setDateError("");
    setGenderError("");
    setNationalityError("");
    setEmirateError("");
    setEmploymentError("");
    setIncomeError("");
  }, [language]);

  const handleNationalityChange = (value: string) => {
    setProfile((prev) => ({
      ...prev,
      nationality: value as "Emirati" | "Non-Emirati",
    }));
    if (nationalityError) setNationalityError("");
  };

  const handleGenderChange = (value: string) => {
    setProfile((prev) => ({
      ...prev,
      gender: value as "Male" | "Female",
    }));
    if (genderError) setGenderError("");
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
    if (employmentError) setEmploymentError("");
  };

  const handleIncomeChange = (value: string) => {
    setProfile((prev) => ({
      ...prev,
      income_range: value,
    }));
    if (incomeError) setIncomeError("");
  };

  const handleEmirateChange = (value: string) => {
    setProfile((prev) => ({
      ...prev,
      emirate: value,
    }));
    if (emirateError) setEmirateError("");
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

  const handleViewPreviousResults = async () => {
    // Check if user has email in profile or localStorage
    const storedProfile = localStorage.getItem("financialClinicProfile");
    let email = profile.email;

    if (!email && storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        email = parsed.email;
      } catch (e) {
        console.error("Failed to parse stored profile");
      }
    }

    if (!email) {
      toast.error(
        language === "ar"
          ? "الرجاء إدخال بريدك الإلكتروني أولاً"
          : "Please enter your email address first"
      );
      return;
    }

    // Check if user has any results
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/financial-clinic/history/${encodeURIComponent(email)}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          // User has results, navigate to history
          router.push("/financial-clinic/history");
        } else {
          toast.info(
            language === "ar"
              ? "لا توجد نتائج سابقة. يرجى إكمال التقييم أولاً"
              : "No previous results found. Please complete the assessment first"
          );
        }
      } else {
        toast.info(
          language === "ar"
            ? "لا توجد نتائج سابقة. يرجى إكمال التقييم أولاً"
            : "No previous results found. Please complete the assessment first"
        );
      }
    } catch (error) {
      console.error("Error checking for results:", error);
      toast.error(
        language === "ar"
          ? "فشل في التحقق من النتائج السابقة"
          : "Failed to check for previous results"
      );
    }
  };

  const handleStartSurvey = () => {
    // Clear all errors first
    setNameError("");
    setDateError("");
    setGenderError("");
    setNationalityError("");
    setEmirateError("");
    setEmploymentError("");
    setIncomeError("");
    setEmailError("");
    setPhoneError("");

    let hasError = false;

    // Validate all fields and collect errors
    if (!profile.name.trim()) {
      setNameError(language === "ar" ? "الاسم مطلوب" : "Name is required");
      hasError = true;
    } else if (!/^[a-zA-Z\u0600-\u06FF\s]+$/.test(profile.name)) {
      setNameError(
        language === "ar"
          ? "الاسم يجب أن يحتوي على أحرف فقط"
          : "Name must contain only letters"
      );
      hasError = true;
    }

    if (!profile.date_of_birth.trim()) {
      setDateError(
        language === "ar" ? "تاريخ الميلاد مطلوب" : "Date of Birth is required"
      );
      hasError = true;
    }

    if (!profile.gender) {
      setGenderError(language === "ar" ? "الجنس مطلوب" : "Gender is required");
      hasError = true;
    }

    if (!profile.nationality) {
      setNationalityError(
        language === "ar" ? "الجنسية مطلوبة" : "Nationality is required"
      );
      hasError = true;
    }

    if (!profile.emirate) {
      setEmirateError(
        language === "ar" ? "الإمارة مطلوبة" : "Emirate is required"
      );
      hasError = true;
    }

    if (!profile.employment_status) {
      setEmploymentError(
        language === "ar"
          ? "حالة التوظيف مطلوبة"
          : "Employment Status is required"
      );
      hasError = true;
    }

    if (!profile.income_range) {
      setIncomeError(
        language === "ar" ? "نطاق الدخل مطلوب" : "Income Range is required"
      );
      hasError = true;
    }

    if (!profile.email.trim()) {
      setEmailError(
        language === "ar"
          ? "البريد الإلكتروني مطلوب"
          : "Email Address is required"
      );
      hasError = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profile.email.trim())) {
        setEmailError(
          language === "ar"
            ? "يرجى إدخال بريد إلكتروني صحيح"
            : "Please enter a valid email address"
        );
        hasError = true;
      }
    }

    if (!profile.mobile_number || profile.mobile_number.trim() === "") {
      setPhoneError(
        language === "ar" ? "رقم الجوال مطلوب" : "Mobile Number is required"
      );
      hasError = true;
    } else {
      const cleanedNumber = profile.mobile_number.replace(/[^0-9]/g, "");
      if (cleanedNumber.length < 7 || cleanedNumber.length > 15) {
        setPhoneError(
          language === "ar"
            ? "يرجى إدخال رقم جوال صحيح (7-15 رقم)"
            : "Please enter a valid mobile number (7-15 digits)"
        );
        hasError = true;
      }
    }

    // If there are any errors, don't proceed
    if (hasError) {
      toast.error(
        language === "ar"
          ? "يرجى تصحيح الأخطاء في النموذج"
          : "Please correct the errors in the form"
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
    <div
      className="w-full min-h-screen flex flex-col bg-white"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
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
              ? "هل أنتم مستعدون لبدء التقييم؟"
              : "Ready to begin your checkup?"}
          </p>
        </div>

        {/* Description */}
        <div className="flex flex-col items-center gap-[3px] mb-4 md:mb-8 max-w-[833px] px-2">
          <p className="w-full font-[family-name:var(--font-poppins)] font-normal text-[#5a6c64] text-sm tracking-[0] leading-6 text-center">
            {language === "ar"
              ? "قوموا بإدخال الاسم والبريد الإلكتروني للبدء"
              : "Enter your name and email to start."}
          </p>
          <p className="w-full font-[family-name:var(--font-poppins)] font-normal text-[#5a6c64] text-sm tracking-[0] leading-6 text-center">
            {language === "ar"
              ? "سنرسل إليكم التقرير الخاص بكم وبعض التوصيات لضمان التزامكم بالمسار الصحيح"
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
                {language === "ar" ? "الاسم" : "Name"}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder={
                  language === "ar" ? "أدخل اسمك" : "Enter your name"
                }
                value={profile.name}
                onChange={(e) => {
                  const value = e.target.value;
                  handleInputChange("name", value);
                  // Clear error when user starts typing
                  if (nameError) setNameError("");
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  // Validate on blur - check if contains numbers or special characters
                  if (value && !/^[a-zA-Z\u0600-\u06FF\s]+$/.test(value)) {
                    setNameError(
                      language === "ar"
                        ? "الاسم يجب أن يحتوي على أحرف فقط"
                        : "Name must contain only letters"
                    );
                  } else {
                    setNameError("");
                  }
                }}
                className={`h-[50px] px-6 py-2.5 rounded-[3px] border border-solid ${
                  nameError ? "border-red-500" : "border-[#c2d1d9]"
                } font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 placeholder:text-[#a1aeb7] ${
                  language === "ar" ? "flex-row-reverse" : "flex-row"
                }`}
              />
              {nameError && (
                <p className="text-red-500 text-xs mt-1 font-[family-name:var(--font-poppins)]">
                  {nameError}
                </p>
              )}
            </div>

            {/* Date of Birth Input with Label */}
            <div className="flex-1">
              <Label className="font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 mb-2 block">
                {language === "ar" ? "تاريخ الميلاد" : "Date of Birth"}{" "}
                <span className="text-red-500">*</span>
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
                    if (dateError) setDateError("");
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
              {dateError && (
                <p className="text-red-500 text-xs mt-1 font-[family-name:var(--font-poppins)]">
                  {dateError}
                </p>
              )}
            </div>
          </div>

          {/* Gender and Nationality */}
          <div
            className={`flex flex-col md:flex-row items-start md:items-start gap-4 md:gap-8 w-full md:justify-between ${
              language === "ar" ? "md:flex-row-reverse" : ""
            }`}
          >
            <div className="flex flex-col gap-2 flex-1">
              <div
                className={`flex items-center gap-6 md:gap-[35px] ${
                  language === "ar" ? "flex-row-reverse" : ""
                }`}
              >
                <Label className="font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6">
                  {language === "ar" ? "الجنس" : "Gender"}{" "}
                  <span className="text-red-500">*</span>
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
              {genderError && (
                <p className="text-red-500 text-xs font-[family-name:var(--font-poppins)]">
                  {genderError}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <div
                className={`flex items-center gap-[46px] ${
                  language === "ar" ? "flex-row-reverse" : ""
                }`}
              >
                <Label className="font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6">
                  {language === "ar" ? "الجنسية" : "Nationality"}{" "}
                  <span className="text-red-500">*</span>
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
              {nationalityError && (
                <p className="text-red-500 text-xs font-[family-name:var(--font-poppins)]">
                  {nationalityError}
                </p>
              )}
            </div>
          </div>

          {/* Emirate and Children */}
          <div className="flex flex-col md:flex-row items-start md:items-start gap-4 w-full">
            {/* Emirate Dropdown with Label */}
            <div className="flex-1">
              <Label className="font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 mb-2 block">
                {language === "ar" ? "الإمارة" : "Emirate"}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Select
                value={profile.emirate}
                onValueChange={handleEmirateChange}
              >
                <SelectTrigger
                  className={`w-full h-[50px] px-6 py-2.5 rounded-[3px] border border-solid border-[#c2d1d9] font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 ${
                    language === "ar" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <SelectValue
                    placeholder={
                      language === "ar" ? "اختر الإمارة" : "Select emirate"
                    }
                    className="placeholder:text-[#a1aeb7]"
                  />
                </SelectTrigger>
                <SelectContent
                  className={language === "ar" ? "flex-row-reverse" : ""}
                >
                  <SelectItem
                    value="Dubai"
                    className={language === "ar" ? "flex-row-reverse" : ""}
                  >
                    {language === "ar" ? "دبي" : "Dubai"}
                  </SelectItem>
                  <SelectItem
                    value="Abu Dhabi"
                    className={language === "ar" ? "flex-row-reverse" : ""}
                  >
                    {language === "ar" ? "أبو ظبي" : "Abu Dhabi"}
                  </SelectItem>
                  <SelectItem
                    value="Sharjah"
                    className={language === "ar" ? "flex-row-reverse" : ""}
                  >
                    {language === "ar" ? "الشارقة" : "Sharjah"}
                  </SelectItem>
                  <SelectItem
                    value="Ajman"
                    className={language === "ar" ? "flex-row-reverse" : ""}
                  >
                    {language === "ar" ? "عجمان" : "Ajman"}
                  </SelectItem>
                  <SelectItem
                    value="Al Ain"
                    className={language === "ar" ? "flex-row-reverse" : ""}
                  >
                    {language === "ar" ? "العين" : "Al Ain"}
                  </SelectItem>
                  <SelectItem
                    value="Ras Al Khaimah / Fujairah / UAQ / Outside UAE"
                    className={language === "ar" ? "flex-row-reverse" : ""}
                  >
                    {language === "ar"
                      ? "رأس الخيمة / الفجيرة / أم القيوين / خارج الإمارات"
                      : "Ras Al Khaimah / Fujairah / UAQ / Outside UAE"}
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="min-h-[20px]">
                {emirateError && (
                  <p className="text-red-500 text-xs mt-1 font-[family-name:var(--font-poppins)]">
                    {emirateError}
                  </p>
                )}
              </div>
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
                <SelectTrigger
                  className={`w-full h-[50px] px-6 py-2.5 rounded-[3px] border border-solid border-[#c2d1d9] font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 ${
                    language === "ar" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <SelectValue
                    placeholder={
                      language === "ar" ? "عدد الأطفال" : "Number of children"
                    }
                    className="placeholder:text-[#a1aeb7]"
                  />
                </SelectTrigger>
                <SelectContent
                  className={language === "ar" ? "flex-row-reverse" : ""}
                >
                  <SelectItem
                    value="0"
                    className={language === "ar" ? "flex-row-reverse" : ""}
                  >
                    {language === "ar" ? "0" : "0"}
                  </SelectItem>
                  <SelectItem
                    value="1"
                    className={language === "ar" ? "flex-row-reverse" : ""}
                  >
                    {language === "ar" ? "١" : "1"}
                  </SelectItem>
                  <SelectItem
                    value="2"
                    className={language === "ar" ? "flex-row-reverse" : ""}
                  >
                    {language === "ar" ? "٢" : "2"}
                  </SelectItem>
                  <SelectItem
                    value="3"
                    className={language === "ar" ? "flex-row-reverse" : ""}
                  >
                    {language === "ar" ? "٣" : "3"}
                  </SelectItem>
                  <SelectItem
                    value="4"
                    className={language === "ar" ? "flex-row-reverse" : ""}
                  >
                    {language === "ar" ? "٤" : "4"}
                  </SelectItem>
                  <SelectItem
                    value="5"
                    className={language === "ar" ? "flex-row-reverse" : ""}
                  >
                    {language === "ar" ? "٥+" : "5+"}
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="min-h-[20px]"></div>
            </div>
          </div>

          {/* Employment Status and Income Range */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full">
            {/* Employment Status Dropdown with Label */}
            <div className="flex-1">
              <Label className="font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 mb-2 block">
                {language === "ar" ? "حالة التوظيف" : "Employment Status"}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Select
                value={profile.employment_status}
                onValueChange={handleEmploymentChange}
              >
                <SelectTrigger
                  className={`w-full h-[50px] px-6 py-2.5 rounded-[3px] border border-solid border-[#c2d1d9] font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 ${
                    language === "ar" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <SelectValue
                    placeholder={
                      language === "ar" ? "حالة التوظيف" : "Employment Status"
                    }
                    className="placeholder:text-[#a1aeb7]"
                  />
                </SelectTrigger>
                <SelectContent
                  className={language === "ar" ? "flex-row-reverse" : ""}
                >
                  <SelectItem
                    value="Employed"
                    className={language === "ar" ? "flex-row-reverse" : ""}
                  >
                    {language === "ar" ? "موظف" : "Employed"}
                  </SelectItem>
                  <SelectItem
                    value="Self-Employed"
                    className={language === "ar" ? "flex-row-reverse" : ""}
                  >
                    {language === "ar" ? "أعمال حرة" : "Self-Employed"}
                  </SelectItem>
                  <SelectItem
                    value="Unemployed"
                    className={language === "ar" ? "flex-row-reverse" : ""}
                  >
                    {language === "ar" ? "عاطل عن العمل" : "Unemployed"}
                  </SelectItem>
                </SelectContent>
              </Select>
              {employmentError && (
                <p className="text-red-500 text-xs mt-1 font-[family-name:var(--font-poppins)]">
                  {employmentError}
                </p>
              )}
            </div>

            {/* Household Monthly Income Range Dropdown with Label */}
            <div className="flex-1">
              <Label className="font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 mb-2 block">
                {language === "ar"
                  ? "نطاق الدخل الشهري للأسرة بالدرهم الإماراتي"
                  : "Household Monthly Income Range in AED"}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Select
                value={profile.income_range}
                onValueChange={handleIncomeChange}
              >
                <SelectTrigger
                  className={`w-full h-[50px] px-6 py-2.5 rounded-[3px] border border-solid border-[#c2d1d9] font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 ${
                    language === "ar" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <SelectValue
                    placeholder={
                      language === "ar"
                        ? "اختر نطاق دخل الأسرة الشهري"
                        : "Household monthly income range"
                    }
                    className="placeholder:text-[#a1aeb7]"
                  />
                </SelectTrigger>
                <SelectContent
                  className={language === "ar" ? "flex-row-reverse" : ""}
                >
                  <SelectItem
                    value="Below 5,000"
                    className={language === "ar" ? "flex-row-reverse" : ""}
                  >
                    {language === "ar" ? "أقل من 5,000" : "Below 5,000"}
                  </SelectItem>
                  <SelectItem
                    value="5,000 to 10,000"
                    className={language === "ar" ? "flex-row-reverse" : ""}
                  >
                    {language === "ar"
                      ? "من 5,000 إلى 10,000"
                      : "5,000 to 10,000"}
                  </SelectItem>
                  <SelectItem
                    value="10,000 to 20,000"
                    className={language === "ar" ? "flex-row-reverse" : ""}
                  >
                    {language === "ar"
                      ? "من 10,000 إلى 20,000"
                      : "10,000 to 20,000"}
                  </SelectItem>
                  <SelectItem
                    value="20,000 to 30,000"
                    className={language === "ar" ? "flex-row-reverse" : ""}
                  >
                    {language === "ar"
                      ? "من 20,000 إلى 30,000"
                      : "20,000 to 30,000"}
                  </SelectItem>
                  <SelectItem
                    value="30,000 to 40,000"
                    className={language === "ar" ? "flex-row-reverse" : ""}
                  >
                    {language === "ar"
                      ? "من 30,000 إلى 40,000"
                      : "30,000 to 40,000"}
                  </SelectItem>
                  <SelectItem
                    value="40,000 to 50,000"
                    className={language === "ar" ? "flex-row-reverse" : ""}
                  >
                    {language === "ar"
                      ? "من 40,000 إلى 50,000"
                      : "40,000 to 50,000"}
                  </SelectItem>
                  <SelectItem
                    value="50,000 to 100,000"
                    className={language === "ar" ? "flex-row-reverse" : ""}
                  >
                    {language === "ar"
                      ? "من 50,000 إلى 100,000"
                      : "50,000 to 100,000"}
                  </SelectItem>
                  <SelectItem
                    value="Above 100,000"
                    className={language === "ar" ? "flex-row-reverse" : ""}
                  >
                    {language === "ar" ? "أكثر من 100,000" : "Above 100,000"}
                  </SelectItem>
                </SelectContent>
              </Select>
              {incomeError && (
                <p className="text-red-500 text-xs mt-1 font-[family-name:var(--font-poppins)]">
                  {incomeError}
                </p>
              )}
            </div>
          </div>

          {/* Email and Mobile Number */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full">
            {/* Email Field with Label */}
            <div className="flex-1">
              <Label className="font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 mb-2 block">
                {language === "ar"
                  ? "عنوان البريد الإلكتروني"
                  : "Email Address"}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder={
                  language === "ar" ? "example@email.com" : "example@email.com"
                }
                type="email"
                value={profile.email}
                onChange={(e) => {
                  handleInputChange("email", e.target.value);
                  if (emailError) setEmailError("");
                }}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (value && !emailRegex.test(value)) {
                    setEmailError(
                      language === "ar"
                        ? "يرجى إدخال بريد إلكتروني صحيح"
                        : "Please enter a valid email address"
                    );
                  } else {
                    setEmailError("");
                  }
                }}
                className={`w-full h-[50px] px-6 py-2.5 rounded-[3px] border border-solid ${
                  emailError ? "border-red-500" : "border-[#c2d1d9]"
                } font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 placeholder:text-[#a1aeb7] ${
                  language === "ar" ? "flex-row-reverse" : "flex-row"
                }`}
              />
              {emailError && (
                <p className="text-red-500 text-xs mt-1 font-[family-name:var(--font-poppins)]">
                  {emailError}
                </p>
              )}
            </div>

            {/* Mobile Number Field with Label */}
            <div className="flex-1 w-full">
              <Label className="font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 mb-2 block">
                {language === "ar" ? "رقم الجوال" : "Mobile Number"}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2 w-full">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger
                    className="w-[120px] md:w-[140px] h-[50px] px-2 md:px-3 py-2.5 rounded-[3px] border border-solid border-[#c2d1d9] font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 shrink-0"
                    style={{ height: "50px" }}
                  >
                    <SelectValue>
                      +{getCountryCallingCode(countryCode as any)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] w-full md:w-[320px]">
                    {countries.map((country) => {
                      const callingCode = getCountryCallingCode(country);
                      const countryName =
                        en[country as keyof typeof en] || country;
                      return (
                        <SelectItem key={country} value={country}>
                          {countryName} +{callingCode}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Input
                  placeholder={getPhonePlaceholder(countryCode)}
                  type="tel"
                  value={profile.mobile_number || ""}
                  onChange={(e) => {
                    // Only allow numbers and basic formatting
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    handleInputChange("mobile_number", value);
                    if (phoneError) setPhoneError("");
                  }}
                  onBlur={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    if (value && (value.length < 7 || value.length > 15)) {
                      setPhoneError(
                        language === "ar"
                          ? "يرجى إدخال رقم جوال صحيح (7-15 رقم)"
                          : "Please enter a valid mobile number (7-15 digits)"
                      );
                    } else {
                      setPhoneError("");
                    }
                  }}
                  className={`flex-1 h-[50px] px-6 py-2.5 rounded-[3px] border border-solid ${
                    phoneError ? "border-red-500" : "border-[#c2d1d9]"
                  } font-[family-name:var(--font-poppins)] font-medium text-[#505d68] text-sm tracking-[0] leading-6 placeholder:text-[#a1aeb7] ${
                    language === "ar" ? "flex-row-reverse" : "flex-row"
                  }`}
                />
              </div>
              {phoneError && (
                <p className="text-red-500 text-xs mt-1 font-[family-name:var(--font-poppins)]">
                  {phoneError}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 mt-6 md:mt-12 w-full md:w-auto">
          <Button
            onClick={handleStartSurvey}
            className="h-auto px-7 py-2.5 bg-[#3fab4c] hover:bg-[#3fab4c]/90 w-full md:w-auto"
          >
            <span className="font-[family-name:var(--font-poppins)] font-normal text-white text-sm text-center tracking-[0] leading-[18px] whitespace-nowrap">
              {language === "ar" ? "ابدأ فحصي" : "START MY CHECKUP"}
            </span>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <HomepageFooter />
    </div>
  );
}
