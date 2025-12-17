'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Info, X, ArrowLeft, EnvelopeSimple, SpinnerGap } from '@phosphor-icons/react';
import { toast } from 'sonner';
import type { FinancialClinicResult } from '@/lib/financial-clinic-types';
import { OTPInput } from '@/components/OTPInput';
import { useOTPAuth } from '@/hooks/use-otp-auth';

interface FinancialClinicAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  currentResult: FinancialClinicResult;
  currentProfile: any;
  language?: 'en' | 'ar';
}

export function FinancialClinicAccountModal({
  isOpen,
  onClose,
  onSuccess,
  currentResult,
  currentProfile,
  language = 'en'
}: FinancialClinicAccountModalProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  
  const { loading, error, otpSent, otpExpiry, requestOTP, verifyOTP, resendOTP, resetState } = useOTPAuth(language);

  const isRTL = language === 'ar';

  // Timer countdown
  useEffect(() => {
    if (step === 'otp' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
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
    if (step === 'otp') {
      const timer = setTimeout(() => {
        setCanResend(true);
      }, 60000); // 60 seconds

      return () => clearTimeout(timer);
    }
  }, [step]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailPattern.test(email)) {
      toast.error(language === 'ar' ? 'يرجى إدخال عنوان بريد إلكتروني صالح' : 'Please enter a valid email address');
      return;
    }

    const success = await requestOTP(email);
    if (success) {
      setStep('otp');
      setTimeLeft(300); // Reset timer
      setCanResend(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otpCode.length !== 6) {
      toast.error(language === 'ar' ? 'يرجى إدخال رمز مكون من 6 أرقام' : 'Please enter a 6-digit code');
      return;
    }

    const result = await verifyOTP(
      email,
      otpCode,
      currentResult?.survey_response_id ?? undefined,
      currentProfile
    );

    if (result) {
      onSuccess(result.user);
      onClose();
      resetState();
    }
  };

  const handleResendOTP = async () => {
    const success = await resendOTP(email);
    if (success) {
      setTimeLeft(300); // Reset timer
      setCanResend(false);
      setOtpCode(''); // Clear OTP input
    }
  };

  const handleBack = () => {
    setStep('email');
    setOtpCode('');
    resetState();
  };

  const handleSkip = () => {
    toast.info(
      language === 'ar'
        ? 'يمكنك إنشاء حساب لاحقاً لحفظ نتائجك'
        : 'You can create an account later to save your results'
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {step === 'email' ? (
              <>
                <CheckCircle className="w-6 h-6 text-green-600" weight="fill" />
                {language === 'ar' ? 'احفظ نتائجك' : 'Save Your Results'}
              </>
            ) : (
              <>
                <EnvelopeSimple className="w-6 h-6 text-blue-600" weight="fill" />
                {language === 'ar' ? 'تحقق من بريدك الإلكتروني' : 'Check Your Email'}
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-base">
            {step === 'email' ? (
              language === 'ar'
                ? 'أنشئ حساباً للوصول إلى نتائجك في أي وقت وتتبع تقدمك بمرور الوقت'
                : 'Create an account to access your results anytime and track your progress over time'
            ) : (
              language === 'ar'
                ? `أدخل الرمز المكون من 6 أرقام المرسل إلى ${email}`
                : `Enter the 6-digit code sent to ${email}`
            )}
          </DialogDescription>
        </DialogHeader>

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit}>
          <div className="space-y-4 py-4">
            {/* Benefits */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="text-sm">
                  {language === 'ar' ? (
                    <>
                      <strong>فوائد إنشاء حساب:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>الوصول إلى سجل التقييم الكامل</li>
                        <li>تتبع تقدمك بمرور الوقت</li>
                        <li>مقارنة النتائج الحالية والسابقة</li>
                        <li>تنزيل تقارير PDF السابقة</li>
                      </ul>
                    </>
                  ) : (
                    <>
                      <strong>Benefits of creating an account:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Access your full assessment history</li>
                        <li>Track your progress over time</li>
                        <li>Compare current and past results</li>
                        <li>Download previous PDF reports</li>
                      </ul>
                    </>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">
                {language === 'ar' ? 'عنوان البريد الإلكتروني' : 'Email Address'}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={language === 'ar' ? 'example@email.com' : 'your@email.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="text-base"
              />
              <p className="text-xs text-muted-foreground">
                {language === 'ar'
                  ? 'سنستخدم هذا البريد الإلكتروني لتسجيل الدخول في المستقبل'
                  : 'We\'ll use this email for future logins'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Privacy Note */}
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                {language === 'ar' ? (
                  <>
                    🔒 نحن نحترم خصوصيتك. لن نشارك معلوماتك مع أطراف ثالثة.
                    <br />
                    سنرسل لك رمز تحقق لمرة واحدة عبر البريد الإلكتروني.
                  </>
                ) : (
                  <>
                    🔒 We respect your privacy. Your information will not be shared with third parties.
                    <br />
                    We'll send you a one-time verification code via email.
                  </>
                )}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              disabled={loading}
            >
              {language === 'ar' ? 'تخطي الآن' : 'Skip for Now'}
            </Button>
            <Button
              type="submit"
              disabled={loading || !email}
            >
              {loading ? (
                <>
                  <SpinnerGap className="w-4 h-4 mr-2 animate-spin text-[#5E5E5E]" weight="bold" />
                  {language === 'ar' ? 'جارٍ الإرسال...' : 'Sending...'}
                </>
              ) : (
                <>
                  <EnvelopeSimple className="w-5 h-5 mr-2" weight="fill" />
                  {language === 'ar' ? 'إرسال الرمز' : 'Send Code'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
        ) : (
          <form onSubmit={handleOTPSubmit}>
            <div className="space-y-4 py-4">
              {/* OTP Input */}
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-2">
                  <Label className="text-center">
                    {language === 'ar' ? 'رمز التحقق' : 'Verification Code'}
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

                {/* Timer */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'ينتهي الرمز في: ' : 'Code expires in: '}
                    <span className={`font-semibold ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`}>
                      {formatTime(timeLeft)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Resend Code */}
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResendOTP}
                  disabled={!canResend || loading}
                  className="text-sm"
                >
                  {canResend ? (
                    language === 'ar' ? 'إعادة إرسال الرمز' : 'Resend Code'
                  ) : (
                    language === 'ar' ? 'يمكن إعادة الإرسال بعد دقيقة واحدة' : 'Can resend in 1 minute'
                  )}
                </Button>
              </div>

              {/* Info */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {language === 'ar'
                    ? 'تحقق من بريدك الإلكتروني (بما في ذلك مجلد الرسائل غير المرغوب فيها) للحصول على الرمز المكون من 6 أرقام.'
                    : 'Check your email (including spam folder) for the 6-digit code.'}
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'رجوع' : 'Back'}
              </Button>
              <Button
                type="submit"
                disabled={loading || otpCode.length !== 6}
              >
                {loading ? (
                  <>
                    <SpinnerGap className="w-4 h-4 mr-2 animate-spin text-[#5E5E5E]" weight="bold" />
                    {language === 'ar' ? 'جارٍ التحقق...' : 'Verifying...'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" weight="fill" />
                    {language === 'ar' ? 'تحقق وحفظ' : 'Verify & Save'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
