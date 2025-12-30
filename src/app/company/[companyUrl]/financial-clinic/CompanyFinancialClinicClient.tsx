'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CompanyFinancialClinicClientProps {
  companyUrl: string;
}

export default function CompanyFinancialClinicClient({ companyUrl }: CompanyFinancialClinicClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);

  useEffect(() => {
    const validateCompany = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const sessionId = searchParams.get('session');
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/companies/by-url/${companyUrl}`
        );
        if (!response.ok) {
          setError('Company not found or link is invalid');
          setLoading(false);
          return;
        }
        const data = await response.json();
        setCompanyInfo(data);
        setTimeout(() => {
          if (sessionId) {
            router.push(`/?company=${companyUrl}&session=${sessionId}`);
          } else {
            router.push(`/?company=${companyUrl}`);
          }
        }, 2000);
      } catch (err) {
        setError('Failed to validate company link');
        setLoading(false);
      }
    };
    if (companyUrl) {
      validateCompany();
    }
  }, [companyUrl, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Welcome to Financial Clinic
          </h2>
          {companyInfo && (
            <p className="text-gray-600">
              Provided by {companyInfo.company_name}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-4">
            Redirecting to home page...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Invalid Link
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/financial-clinic')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Without Company Link
          </button>
        </div>
      </div>
    );
  }

  return null;
}
