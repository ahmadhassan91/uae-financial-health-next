'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import OriginalFinancialClinicPage from '@/app/financial-clinic/page-original';

interface RestoredSurveyData {
  session_id: string;
  current_step: number;
  total_steps: number;
  responses: Record<string, any>;
  company_url?: string;
  email?: string;
  profile?: any;
}

export default function FinancialClinicWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams?.get('session');
  const companyUrl = searchParams?.get('company');

  const [isRestoring, setIsRestoring] = useState(false);
  const [restoredData, setRestoredData] = useState<RestoredSurveyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Store company URL in sessionStorage if present
    if (companyUrl) {
      console.log('🏢 Storing company URL from parameters:', companyUrl);
      sessionStorage.setItem('company_url', companyUrl);
    }

    if (sessionId) {
      restoreSession(sessionId);
    }
  }, [sessionId, companyUrl]);

  const restoreSession = async (sessionId: string) => {
    setIsRestoring(true);
    setError(null);

    try {
      console.log('🔄 Restoring survey session:', sessionId);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${apiUrl}/surveys/incomplete/resume/${sessionId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Survey session not found. It may have been completed or deleted.');
        } else if (response.status === 410) {
          throw new Error('Survey session has expired. Sessions expire after 9 months.');
        } else {
          throw new Error('Failed to restore survey session');
        }
      }

      const data = await response.json();
      console.log('✅ Survey session restored:', data);

      // Store restored data in localStorage for the survey page to pick up
      localStorage.setItem('restoredAnswers', JSON.stringify(data.responses || {}));
      localStorage.setItem('restoredStep', String(data.current_step || 0));

      // Store profile data if available
      if (data.profile) {
        console.log('👤 Restoring profile data:', data.profile);
        localStorage.setItem('financialClinicProfile', JSON.stringify(data.profile));
      } else if (data.email) {
        // Create basic profile from session data if no full profile available
        const basicProfile = {
          email: data.email,
          phone_number: data.phone_number || '',
          name: data.email.split('@')[0] || 'Guest User',
          gender: 'Male',
          nationality: 'Emirati',
          children: 0,
          employment_status: 'Employed',
          income_range: 'Below 5,000',
          emirate: 'Dubai'
        };
        console.log('👤 Creating basic profile from session:', basicProfile);
        localStorage.setItem('financialClinicProfile', JSON.stringify(basicProfile));
      }

      // If survey has company context, restore it to sessionStorage
      if (data.company_url) {
        console.log('🏢 Restoring company tracking:', data.company_url);
        sessionStorage.setItem('company_url', data.company_url);
      }

      // Redirect to survey page to continue
      console.log('🚀 Redirecting to survey page...');
      router.push('/financial-clinic/survey');

      setRestoredData(data);

    } catch (err) {
      console.error('❌ Failed to restore survey:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore survey';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsRestoring(false);
    }
  };

  // Loading state while restoring
  if (isRestoring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#5E5E5E] mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Restoring Your Survey
          </h2>
          <p className="text-gray-600">
            Please wait while we retrieve your progress...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-16 w-16 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Unable to Resume Survey
            </h2>

            <p className="text-gray-600 mb-6">
              {error}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  // Clear session parameter and start fresh
                  sessionStorage.removeItem('company_url');
                  router.push('/financial-clinic');
                  window.location.reload();
                }}
                className="w-full px-6 py-3 bg-[#437749] text-white rounded-lg hover:bg-[#3fab4c] transition-colors font-medium"
              >
                Start New Survey
              </button>

              <button
                onClick={() => router.push('/')}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render the original Financial Clinic page with restored data
  return <OriginalFinancialClinicPage restoredSession={restoredData} />;
}
