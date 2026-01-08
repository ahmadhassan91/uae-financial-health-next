"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  CheckCircle,
  EnvelopeSimple,
  Info,
} from "@phosphor-icons/react";
import { OTPInput } from "@/components/OTPInput";
import { useOTPAuth } from "@/hooks/use-otp-auth";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalization } from "@/contexts/LocalizationContext";
import Link from "next/link";
import { HomepageHeader } from "@/components/homepage/Header";
import { HomepageFooter } from "@/components/homepage/Footer";

function FinancialClinicLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const language = (searchParams?.get("lang") as "en" | "ar") || "en";
  const { login: authLogin, isAuthenticated } = useAuth();
  const { setLanguage } = useLocalization();

  // Set language in context when URL parameter changes
  useEffect(() => {
    if (language) {
      setLanguage(language);
    }
  }, [language, setLanguage]);

  // Debug: Log the language
  useEffect(() => {
    console.log("🌐 Login Page Language:", language);
    console.log("📍 URL Params:", searchParams?.toString());
  }, [language, searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(`/financial-clinic/history?lang=${language}`);
    }
  }, [isAuthenticated, router, language]);

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(300);
  const [canResend, setCanResend] = useState(false);

  const { loading, error, requestOTP, verifyOTP, resendOTP, resetState } =
    useOTPAuth(language);

  const isRTL = language === "ar";

  // Timer countdown
  useEffect(() => {
    if (step === "otp" && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step, timeLeft]);

  // Enable resend after 60 seconds
  useEffect(() => {
    if (step === "otp") {
      const timer = setTimeout(() => {
        setCanResend(true);
      }, 60000);

      return () => clearTimeout(timer);
    }
  }, [step]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailPattern.test(email)) {
      return;
    }

    const success = await requestOTP(email);
    if (success) {
      setStep("otp");
      setTimeLeft(300);
      setCanResend(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otpCode.length !== 6) {
      return;
    }

    const result = await verifyOTP(email, otpCode);

    if (result) {
      // Update auth context with session and user data
      authLogin(
        {
          email: result.session.email,
          userId: result.session.user_id,
          createdAt: result.session.created_at,
          accessToken: result.session.access_token,
          tokenType: result.session.token_type,
        },
        {
          id: result.user.id,
          email: result.user.email,
          emailVerified: result.user.email_verified,
        }
      );

      // Redirect to history page after successful login
      setTimeout(() => {
        router.push(`/financial-clinic/history?lang=${language}`);
      }, 500);
    }
  };

  const handleResendOTP = async () => {
    const success = await resendOTP(email);
    if (success) {
      setTimeLeft(300);
      setCanResend(false);
      setOtpCode("");
    }
  };

  const handleBack = () => {
    setStep("email");
    setOtpCode("");
    resetState();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HomepageHeader />
      <div
        className="flex-1 bg-white from-blue-50 to-white flex items-center justify-center p-4"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="max-w-md" style={{ width: "100%" }}>
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">
              {language === "ar" ? "العيادة المالية" : "Financial Clinic"}
            </h1>
            <p className="text-muted-foreground">
              {language === "ar"
                ? "سجل الدخول للوصول إلى سجل التقييم الخاص بك"
                : "Login to access your assessment history"}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {step === "email" ? (
                  <>
                    <EnvelopeSimple
                      className="w-5 h-5 text-blue-600"
                      weight="fill"
                    />
                    {language === "ar" ? "تسجيل الدخول" : "Login"}
                  </>
                ) : (
                  <>
                    <CheckCircle
                      className="w-5 h-5 text-green-600"
                      weight="fill"
                    />
                    {language === "ar"
                      ? "تحقق من بريدك الإلكتروني"
                      : "Check Your Email"}
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {step === "email"
                  ? language === "ar"
                    ? "أدخل بريدك الإلكتروني للحصول على رمز التحقق"
                    : "Enter your email to receive a verification code"
                  : language === "ar"
                  ? `أدخل الرمز المكون من 6 أرقام المرسل إلى ${email}`
                  : `Enter the 6-digit code sent to ${email}`}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {step === "email" ? (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {language === "ar"
                        ? "عنوان البريد الإلكتروني"
                        : "Email Address"}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={
                        language === "ar"
                          ? "example@email.com"
                          : "your@email.com"
                      }
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      autoFocus
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {language === "ar"
                        ? "سنرسل لك رمز تحقق لمرة واحدة مكون من 6 أرقام عبر البريد الإلكتروني."
                        : "We'll send you a 6-digit one-time verification code via email."}
                    </AlertDescription>
                  </Alert>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || !email}
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        {language === "ar" ? "جارٍ الإرسال..." : "Sending..."}
                      </>
                    ) : (
                      <>
                        <EnvelopeSimple
                          className="w-5 h-5 mr-2"
                          weight="fill"
                        />
                        {language === "ar" ? "إرسال الرمز" : "Send Code"}
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <Link href={`/${language ? `?lang=${language}` : ""}`}>
                      <Button variant="link" className="text-sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {language === "ar"
                          ? "العودة إلى العيادة المالية"
                          : "Back to Financial Clinic"}
                      </Button>
                    </Link>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleOTPSubmit} className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex flex-col items-center gap-2">
                      <Label className="text-center">
                        {language === "ar" ? "رمز التحقق" : "Verification Code"}
                      </Label>
                      <OTPInput
                        length={6}
                        value={otpCode}
                        onChange={setOtpCode}
                        onComplete={setOtpCode}
                        disabled={loading}
                        error={!!error}
                        autoFocus
                      />
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        {language === "ar"
                          ? "ينتهي الرمز في: "
                          : "Code expires in: "}
                        <span
                          className={`font-semibold ${
                            timeLeft < 60 ? "text-red-600" : "text-blue-600"
                          }`}
                        >
                          {formatTime(timeLeft)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      onClick={handleResendOTP}
                      disabled={!canResend || loading}
                      className="text-sm"
                    >
                      {canResend
                        ? language === "ar"
                          ? "إعادة إرسال الرمز"
                          : "Resend Code"
                        : language === "ar"
                        ? "يمكن إعادة الإرسال بعد دقيقة واحدة"
                        : "Can resend in 1 minute"}
                    </Button>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {language === "ar"
                        ? "تحقق من بريدك الإلكتروني (بما في ذلك مجلد الرسائل غير المرغوب فيها) للحصول على الرمز."
                        : "Check your email (including spam folder) for the code."}
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={loading}
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {language === "ar" ? "رجوع" : "Back"}
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || otpCode.length !== 6}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          {language === "ar"
                            ? "جارٍ التحقق..."
                            : "Verifying..."}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" weight="fill" />
                          {language === "ar" ? "تحقق" : "Verify"}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>
              {language === "ar"
                ? "🔒 تسجيل الدخول آمن ومشفر. لن نشارك معلوماتك مع أي جهة خارجية."
                : "🔒 Secure and encrypted login. We never share your information with third parties."}
            </p>
          </div>
        </div>
      </div>
      <HomepageFooter />
    </div>
  );
}

export default function FinancialClinicLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col">
          <HomepageHeader />
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
            <div className="animate-pulse">Loading...</div>
          </div>
          <HomepageFooter />
        </div>
      }
    >
      <FinancialClinicLoginContent />
    </Suspense>
  );
}
