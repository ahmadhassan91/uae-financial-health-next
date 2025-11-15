'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  Users, 
  BarChart3, 
  Settings, 
  Eye,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import CompanyQuestionManager from './CompanyQuestionManager';

interface Company {
  id: number;
  company_name: string;
  company_email: string;
  contact_person: string;
  unique_url: string;
  total_assessments: number;
  average_score: number;
  is_active: boolean;
  created_at: string;
}

interface CompanyAnalytics {
  total_responses: number;
  average_score: number;
  participation_rate?: number;
  at_risk_employees: number;
  improvement_needed: number;
  good_health: number;
  excellent_health: number;
  age_distribution?: Record<string, number>;
  gender_distribution?: Record<string, number>;
  department_distribution?: Record<string, number>;
}

interface CompanyAdminDashboardProps {
  companyId: number;
}

export default function CompanyAdminDashboard({ companyId }: CompanyAdminDashboardProps) {
  const [company, setCompany] = useState<Company | null>(null);
  const [analytics, setAnalytics] = useState<CompanyAnalytics | null>(null);
  const [linkStatus, setLinkStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompanyData();
    loadAnalytics();
    loadLinkStatus();
  }, [companyId]);

  const loadCompanyData = async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompany(data);
      } else {
        setError('Failed to load company data');
      }
    } catch (error) {
      setError('Network error occurred');
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}/analytics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadLinkStatus = async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}/link-status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLinkStatus(data);
      }
    } catch (error) {
      console.error('Error loading link status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshData = async () => {
    setIsLoading(true);
    await Promise.all([
      loadCompanyData(),
      loadAnalytics(),
      loadLinkStatus()
    ]);
    setIsLoading(false);
  };

  const handleGenerateNewLink = async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}/generate-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          expiry_days: 30,
          max_responses: 1000
        })
      });

      if (response.ok) {
        await loadLinkStatus();
      }
    } catch (error) {
      console.error('Error generating link:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Loading company dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!company) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Company not found</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{company.company_name}</h1>
          <p className="text-muted-foreground">
            Company Admin Dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_responses || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.participation_rate ? 
                `${analytics.participation_rate.toFixed(1)}% participation` : 
                'All time'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.average_score ? analytics.average_score.toFixed(1) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of 100 points
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics?.excellent_health || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Excellent health employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Link Status</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {linkStatus?.has_active_link ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Inactive
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {linkStatus?.current_responses || 0} responses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Link Management */}
      {linkStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Assessment Link</CardTitle>
            <CardDescription>
              Manage the assessment link for your employees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-mono text-sm bg-muted p-2 rounded">
                    {linkStatus.url}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                    <span>Status: {linkStatus.has_active_link ? 'Active' : 'Inactive'}</span>
                    <span>Responses: {linkStatus.current_responses}</span>
                    {linkStatus.expires_at && (
                      <span>Expires: {new Date(linkStatus.expires_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(linkStatus.url)}
                  >
                    Copy Link
                  </Button>
                  {!linkStatus.has_active_link && (
                    <Button size="sm" onClick={handleGenerateNewLink}>
                      Generate New Link
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="questions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="questions">Question Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4">
          <CompanyQuestionManager 
            companyId={companyId} 
            companyName={company.company_name}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Excellent (80-100)</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ 
                              width: `${(analytics.excellent_health / analytics.total_responses) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">{analytics.excellent_health}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Good (60-79)</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ 
                              width: `${(analytics.good_health / analytics.total_responses) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">{analytics.good_health}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Needs Improvement (40-59)</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full" 
                            style={{ 
                              width: `${(analytics.improvement_needed / analytics.total_responses) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">{analytics.improvement_needed}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">At Risk (0-39)</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ 
                              width: `${(analytics.at_risk_employees / analytics.total_responses) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">{analytics.at_risk_employees}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.age_distribution && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Age Distribution</h4>
                    {Object.entries(analytics.age_distribution).map(([age, count]) => (
                      <div key={age} className="flex justify-between items-center">
                        <span className="text-sm">{age}</span>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Settings</CardTitle>
              <CardDescription>
                Manage company configuration and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Company Name</label>
                    <p className="text-sm text-muted-foreground">{company.company_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Contact Person</label>
                    <p className="text-sm text-muted-foreground">{company.contact_person}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground">{company.company_email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Unique URL</label>
                    <p className="text-sm text-muted-foreground">{company.unique_url}</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports & Exports</CardTitle>
              <CardDescription>
                Download detailed reports and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Download className="w-6 h-6 mb-2" />
                  <span>Export Assessment Data</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <BarChart3 className="w-6 h-6 mb-2" />
                  <span>Analytics Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="w-6 h-6 mb-2" />
                  <span>Demographics Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <TrendingUp className="w-6 h-6 mb-2" />
                  <span>Trends Analysis</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}