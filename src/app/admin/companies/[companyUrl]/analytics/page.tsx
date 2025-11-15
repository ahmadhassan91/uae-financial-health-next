'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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

export default function CompanyAnalyticsPage() {
  const params = useParams();
  const companyUrl = params.companyUrl as string;
  
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
        console.error('Error fetching analytics:', error);
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
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Data Available</h2>
              <p className="text-gray-600">Unable to load analytics for this company.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{analytics.company_name}</h1>
          <p className="text-gray-600">Financial Clinic Analytics</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-blue-600">{analytics.total_assessments}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600">
                {analytics.average_score?.toFixed(1) || 'N/A'}
              </p>
              <p className="text-sm text-gray-500">out of 100</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Company URL</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-mono text-gray-800">{analytics.company_url}</p>
              <a 
                href={`/company/${analytics.company_url}/financial-clinic`}
                target="_blank"
                className="text-sm text-blue-600 hover:underline"
              >
                View Survey Link
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Band Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.status_distribution).map(([status, count]) => (
                <div key={status} className="flex items-center">
                  <div className="w-32 font-medium">{status}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full flex items-center justify-end px-2"
                      style={{
                        width: `${(count / analytics.total_assessments) * 100}%`,
                      }}
                    >
                      <span className="text-white text-sm font-medium">{count}</span>
                    </div>
                  </div>
                  <div className="w-20 text-right text-gray-600">
                    {((count / analytics.total_assessments) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Averages */}
        <Card>
          <CardHeader>
            <CardTitle>Category Score Averages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analytics.category_averages).map(([category, score]) => (
                <div key={category} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">{category}</p>
                  <p className="text-2xl font-bold text-blue-600">{score.toFixed(1)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demographics - Gender */}
        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(analytics.demographic_breakdown.by_gender).map(([gender, data]) => (
                <div key={gender} className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">{gender}</h3>
                  <p className="text-gray-600">Count: <span className="font-medium">{data.count}</span></p>
                  <p className="text-gray-600">Avg Score: <span className="font-medium">{data.avg_score.toFixed(1)}</span></p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demographics - Nationality */}
        <Card>
          <CardHeader>
            <CardTitle>Nationality Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(analytics.demographic_breakdown.by_nationality).map(([nationality, data]) => (
                <div key={nationality} className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">{nationality}</h3>
                  <p className="text-gray-600">Count: <span className="font-medium">{data.count}</span></p>
                  <p className="text-gray-600">Avg Score: <span className="font-medium">{data.avg_score.toFixed(1)}</span></p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demographics - Employment */}
        <Card>
          <CardHeader>
            <CardTitle>Employment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(analytics.demographic_breakdown.by_employment).map(([employment, data]) => (
                <div key={employment} className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">{employment}</h3>
                  <p className="text-gray-600">Count: <span className="font-medium">{data.count}</span></p>
                  <p className="text-gray-600">Avg Score: <span className="font-medium">{data.avg_score.toFixed(1)}</span></p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demographics - Emirate */}
        <Card>
          <CardHeader>
            <CardTitle>Emirate Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analytics.demographic_breakdown.by_emirate).map(([emirate, data]) => (
                <div key={emirate} className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">{emirate}</h3>
                  <p className="text-gray-600">Count: <span className="font-medium">{data.count}</span></p>
                  <p className="text-gray-600">Avg Score: <span className="font-medium">{data.avg_score.toFixed(1)}</span></p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
