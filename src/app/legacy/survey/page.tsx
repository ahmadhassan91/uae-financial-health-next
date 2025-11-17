'use client';

import { useRouter } from 'next/navigation';
import { SurveyFlow } from '@/components/legacy/SurveyFlow';
import { useSurvey } from '@/hooks/legacy/use-survey';
import { LandingPage } from '@/components/legacy/LandingPage';
import { toast } from 'sonner';

export default function SurveyPage() {
  const router = useRouter();
  const { 
    currentStep, 
    setCurrentStep, 
    updateResponse, 
    profile,
    submitSurvey, 
    getResponse 
  } = useSurvey();

  const handleSurveyComplete = async () => {
    try {
      console.log('Starting survey submission...');
      const scoreCalculation = await submitSurvey();
      
      console.log('Survey submitted successfully:', scoreCalculation);
      
      if (!scoreCalculation.pillarScores?.length) {
        throw new Error('Score calculation missing pillar scores');
      }
      
      // Store the score in localStorage for the results page
      localStorage.setItem('currentScore', JSON.stringify(scoreCalculation));
      
      console.log('Navigating to results page...');
      router.push('/results');
      
      toast.success('Assessment completed! Your score has been calculated.');
    } catch (error) {
      console.error('Score calculation error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Error calculating score. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Profile is required')) {
          errorMessage = 'Please complete your profile before submitting the survey.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to server. Please check your connection and try again.';
        } else if (error.message.includes('NetworkError')) {
          errorMessage = 'Network error. Please try again.';
        }
      }
      
      toast.error(errorMessage);
      
      // Don't reload the page on error - let user try again
      return;
    }
  };

  const handleStartSurvey = () => {
    router.push('/consent');
  };

  const handleAdminAccess = () => {
    router.push('/admin');
  };

  // If no profile, redirect to landing page
  if (!profile) {
    return <LandingPage onStartSurvey={handleStartSurvey} onAdminAccess={handleAdminAccess} />;
  }

  return (
    <SurveyFlow
      currentStep={currentStep}
      customerProfile={profile}
      onStepChange={setCurrentStep}
      onResponse={updateResponse}
      getResponse={getResponse}
      onComplete={handleSurveyComplete}
    />
  );
}
