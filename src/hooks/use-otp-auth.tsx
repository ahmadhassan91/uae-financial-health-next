'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface OTPAuthState {
  loading: boolean;
  error: string | null;
  otpSent: boolean;
  otpExpiry: Date | null;
}

interface OTPRequestResponse {
  message: string;
  expires_at: string;
}

interface OTPVerifyResponse {
  message: string;
  user: {
    id: number;
    email: string;
    email_verified: boolean;
    created_at: string;
  };
  session: {
    email: string;
    user_id: number;
    created_at: string;
    access_token: string;  // JWT token for API authentication
    token_type: string;
  };
}

export function useOTPAuth(language: 'en' | 'ar' = 'en') {
  const [state, setState] = useState<OTPAuthState>({
    loading: false,
    error: null,
    otpSent: false,
    otpExpiry: null,
  });

  const requestOTP = useCallback(async (email: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/otp/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, language }),
      });

      const data: OTPRequestResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setState({
        loading: false,
        error: null,
        otpSent: true,
        otpExpiry: new Date(data.expires_at),
      });

      toast.success(
        language === 'ar'
          ? 'تم إرسال رمز التحقق إلى بريدك الإلكتروني'
          : 'Verification code sent to your email'
      );

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      
      toast.error(
        language === 'ar'
          ? 'فشل إرسال رمز التحقق. يرجى المحاولة مرة أخرى.'
          : 'Failed to send verification code. Please try again.'
      );

      return false;
    }
  }, [language]);

  const verifyOTP = useCallback(async (
    email: string,
    code: string,
    surveyResponseId?: number,
    profile?: any
  ): Promise<OTPVerifyResponse | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code,
          survey_response_id: surveyResponseId,
          profile,
        }),
      });

      const data: OTPVerifyResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid verification code');
      }

      // Save session to localStorage with access token
      localStorage.setItem('simpleAuthSession', JSON.stringify({
        email: data.session.email,
        userId: data.session.user_id,
        createdAt: data.session.created_at,
        accessToken: data.session.access_token,  // Store JWT token
        tokenType: data.session.token_type,
      }));

      setState({
        loading: false,
        error: null,
        otpSent: false,
        otpExpiry: null,
      });

      toast.success(
        language === 'ar'
          ? 'تم تسجيل الدخول بنجاح!'
          : 'Successfully logged in!'
      );

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid verification code';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      
      toast.error(
        language === 'ar'
          ? 'رمز التحقق غير صحيح أو منتهي الصلاحية'
          : 'Invalid or expired verification code'
      );

      return null;
    }
  }, [language]);

  const resendOTP = useCallback(async (email: string): Promise<boolean> => {
    return await requestOTP(email);
  }, [requestOTP]);

  const resetState = useCallback(() => {
    setState({
      loading: false,
      error: null,
      otpSent: false,
      otpExpiry: null,
    });
  }, []);

  return {
    ...state,
    requestOTP,
    verifyOTP,
    resendOTP,
    resetState,
  };
}
