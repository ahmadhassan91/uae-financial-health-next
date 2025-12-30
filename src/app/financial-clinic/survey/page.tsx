'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FinancialClinicSurvey } from '@/components/FinancialClinicSurvey';
import { 
  calculateFinancialClinicScore,
  submitFinancialClinicSurvey 
} from '@/lib/financial-clinic-survey-data';
import type { 
  FinancialClinicProfile,
  FinancialClinicAnswers,
  FinancialClinicResult 
} from '@/lib/financial-clinic-types';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { incompleteSurveyService } from '@/services/incompleteSurveyService';

export default function FinancialClinicSurveyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<FinancialClinicAnswers>({});
  const [profile, setProfile] = useState<FinancialClinicProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load profile from localStorage on mount and handle session restoration
  useEffect(() => {
    const storedProfile = localStorage.getItem('financialClinicProfile');
    if (storedProfile) {
      try {
        const parsedProfile = JSON.parse(storedProfile);
        setProfile(parsedProfile);
        
        // Check for session restoration from URL parameter (from follow-up email)
        const searchParams = new URLSearchParams(window.location.search);
        const sessionId = searchParams.get('session');
        
        if (sessionId) {
          // Resume from email link - fetch session data from backend
          console.log('🔗 Resuming from email link with session:', sessionId);
          
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/surveys/incomplete/resume/${sessionId}`)
            .then(response => {
              if (!response.ok) {
                throw new Error('Session not found or expired');
              }
              return response.json();
            })
            .then(sessionData => {
              console.log('📋 Session data retrieved:', sessionData);
              
              // Restore answers and step from session data
              setAnswers(sessionData.responses || {});
              setCurrentStep(sessionData.current_step || 0);
              
              // Set the session ID for future updates
              sessionStorage.setItem('incomplete_survey_session', sessionData.session_id);
              
              toast.success('Welcome back! Your progress has been restored. Continue from where you left off.');
            })
            .catch(error => {
              console.error('❌ Failed to resume session:', error);
              toast.error('Session expired or not found. Starting fresh survey.');
              
              // Start a new survey if session resume fails
              startNewSurvey(parsedProfile, searchParams);
            });
        } else {
          // Check for restored session data from localStorage
          const restoredAnswers = localStorage.getItem('restoredAnswers');
          const restoredStep = localStorage.getItem('restoredStep');
          
          if (restoredAnswers) {
            const parsedAnswers = JSON.parse(restoredAnswers);
            console.log('🔄 Restoring answers from localStorage:', parsedAnswers);
            setAnswers(parsedAnswers);
            
            // Clear restored answers after using
            localStorage.removeItem('restoredAnswers');
          }
          
          if (restoredStep) {
            const step = parseInt(restoredStep, 10);
            console.log('🔄 Restoring step from localStorage:', step);
            setCurrentStep(step);
            
            // Clear restored step after using
            localStorage.removeItem('restoredStep');
            
            toast.success('Your progress has been restored! Continue from where you left off.');
          } else {
            // New survey - start tracking
            startNewSurvey(parsedProfile, searchParams);
          }
        }
      } catch (error) {
        console.error('Failed to parse profile or restored data:', error);
        toast.error('Profile data corrupted. Please start over.');
        router.push('/financial-clinic');
      }
    } else {
      // No profile - redirect to profile creation
      toast.error('Please complete your profile first.');
      router.push('/financial-clinic');
    }
  }, [router]);

  // Helper function to start a new survey
  const startNewSurvey = (parsedProfile: any, searchParams: URLSearchParams) => {
    // Check company URL from both URL parameters and sessionStorage
    let companyUrl = searchParams.get('company');
    
    // If not in URL params, check sessionStorage (preserved from home page)
    if (!companyUrl) {
      companyUrl = sessionStorage.getItem('company_url');
    }
    
    console.log('🏢 Starting survey with company URL:', companyUrl);
    
    incompleteSurveyService.startTracking({
      current_step: 0,
      total_steps: parsedProfile.children > 0 ? 15 : 14,
      responses: {},
      email: parsedProfile.email,
      phone_number: parsedProfile.mobile_number,
      company_url: companyUrl || undefined,
      profile: parsedProfile
    }).catch(err => {
      console.error('Failed to start survey tracking:', err);
      // Don't block the user if tracking fails
    });
  };

  const handleResponse = (questionId: string, value: number) => {
    const newAnswers = {
      ...answers,
      [questionId]: value
    };
    
    setAnswers(newAnswers);
    
    // Auto-save progress to incomplete survey
    incompleteSurveyService.updateProgress({
      current_step: currentStep,
      responses: newAnswers
    }).catch(err => {
      console.error('Failed to auto-save progress:', err);
      // Don't block the user if auto-save fails
    });
  };

  const handleStepChange = (newStep: number) => {
    setCurrentStep(newStep);
    
    // Auto-save progress when step changes
    incompleteSurveyService.updateProgress({
      current_step: newStep,
      responses: answers
    }).catch(err => {
      console.error('Failed to auto-save step progress:', err);
      // Don't block the user if auto-save fails
    });
  };

  const getResponse = (questionId: string): number | undefined => {
    return answers[questionId];
  };

  const handleComplete = async () => {
    if (!profile) {
      toast.error('Profile is missing. Please start over.');
      router.push('/financial-clinic');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting Financial Clinic survey...');
      console.log('Answers:', answers);
      console.log('Profile:', profile);

      // Submit and save survey to database
      const result: FinancialClinicResult = await submitFinancialClinicSurvey(
        answers,
        profile  // Send complete profile with all fields
      );

      console.log('Survey submitted successfully:', result);

      // Mark survey as completed (remove from incomplete)
      await incompleteSurveyService.markCompleted();
      
      // Store result in localStorage for results page
      localStorage.setItem('financialClinicResult', JSON.stringify(result));

      // Navigate to results page
      router.push('/financial-clinic/results');

      toast.success((typeof window !== 'undefined' && localStorage.getItem('preferred_language') === 'ar')
        ? 'تم الانتهاء من التقييم! تم حساب نتيجتك.'
        : 'Assessment completed! Your score has been calculated.');
    } catch (error: any) {
      console.error('Survey submission error:', error);

      let errorMessage = 'Failed to submit survey. Please try again.';

      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to server. Please check your connection.';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while profile is being loaded
  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5E5E5E] mx-auto"></div>
          <p className="text-[##5E5E5E]">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Survey Component */}
      <FinancialClinicSurvey
        currentStep={currentStep}
        profile={profile}
        onStepChange={handleStepChange}
        onResponse={handleResponse}
        getResponse={getResponse}
        onComplete={handleComplete}
      />

      {/* Submitting Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#437749] mx-auto"></div>
              <h3 className="text-lg font-semibold text-[#437749]">
                {(typeof window !== 'undefined' && (localStorage.getItem('preferred_language') === 'ar'))
                  ? 'جاري حساب نتيجتك...'
                  : 'Calculating Your Score...'}
              </h3>
              <p className="text-[#a1aeb7]">
                {(typeof window !== 'undefined' && (localStorage.getItem('preferred_language') === 'ar'))
                  ? 'يرجى الانتظار بينما نقوم بتحليل إجاباتك وتوليد توصيات مخصصة.'
                  : 'Please wait while we analyze your responses and generate personalized recommendations.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
