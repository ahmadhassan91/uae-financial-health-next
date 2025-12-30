'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface CompanyAnalytics {
  company_name: string;
  company_url: string;
  total_assessments: number;
  average_score: number;
  status_distribution: Record<string, number>;
  category_averages: Record<string, number>;
  demographic_breakdown: {
    by_gender: Record<string, { count: number; avg_score: number }>;
    by_nationality: Record<string, { count: number; avg_score: number }>;
    by_employment: Record<string, { count: number; avg_score: number }>;
    by_income_range: Record<string, { count: number; avg_score: number }>;
    by_emirate: Record<string, { count: number; avg_score: number }>;
  };
}

interface CompanyAnalyticsClientProps {
  companyUrl: string;
}

export default function CompanyAnalyticsClient({ companyUrl }: CompanyAnalyticsClientProps) {
  const [analytics, setAnalytics] = useState<CompanyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Authentication required');
          return;
        }
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/financial-clinic/company/${companyUrl}/analytics`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        toast.error('Failed to load company analytics');
      } finally {
        setLoading(false);
      }
    };
    if (companyUrl) {
      fetchAnalytics();
    }
  }, [companyUrl]);

  if (loading) {
    return <div>Loading analytics...</div>;
  }
  if (!analytics) {
    return <div>No Data Available</div>;
  }
  return (
    <div>
      <h1>{analytics.company_name}</h1>
      {/* ...rest of analytics UI... */}
    </div>
  );
}
