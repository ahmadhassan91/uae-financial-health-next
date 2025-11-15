import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApiCall } from '@/hooks/use-admin-auth';

interface SimpleAnalytics {
  total_content_items?: number;
  translated_items?: number;
  quality_scores?: Record<string, number>;
  translation_coverage?: Record<string, number>;
  most_requested_content?: Array<{
    content_type: string;
    content_id: string;
    request_count: number;
  }>;
}

export function SimpleLocalizationTest() {
  const [analytics, setAnalytics] = useState<SimpleAnalytics>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading analytics...');
      const response = await adminApiCall('/api/admin/simple/analytics');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Analytics data received:', data);
        setAnalytics(data);
      } else {
        setError(`Failed to load analytics: ${response.status}`);
      }
    } catch (err) {
      console.error('Analytics error:', err);
      setError(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading analytics...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Simple Analytics Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Items</div>
              <div className="text-2xl font-bold">
                {analytics?.total_content_items || 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Translated Items</div>
              <div className="text-2xl font-bold">
                {analytics?.translated_items || 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quality Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg">
            {analytics?.quality_scores && Object.keys(analytics.quality_scores).length > 0 ? (
              <div>
                Average: {(
                  Object.values(analytics.quality_scores).reduce((a, b) => a + b, 0) / 
                  Object.values(analytics.quality_scores).length
                ).toFixed(1)}
              </div>
            ) : (
              <div>No quality scores available</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Raw Data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(analytics, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}