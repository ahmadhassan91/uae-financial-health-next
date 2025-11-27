'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Users, TrendingUp, Clock, Activity, Download, User, LogOut, FileSpreadsheet, Loader2, Funnel } from 'lucide-react';
import { useAdminAuth } from '../hooks/use-admin-auth';
import { toast } from 'sonner';
import {
  adminApi,
  FilterOptions,
  DemographicFilters,
  DateRangeParams,
  OverviewMetrics,
  ScoreDistribution,
  CategoryPerformance,
  TimeSeriesData,
  NationalityBreakdown,
  AgeBreakdown,
  CompanyAnalytics,
  ScoreAnalyticsRow,
  ScoreAnalyticsResponse,
} from '../lib/admin-api';

// Import chart components
import { FinancialClinicFilters } from './admin/FinancialClinicFilters';
import { SubmissionsChart } from './admin/charts/SubmissionsChart';
import { AverageScoreChart } from './admin/charts/AverageScoreChart';
import { ScoreDistributionChart } from './admin/charts/ScoreDistributionChart';
import { CategoryPerformanceChart } from './admin/charts/CategoryPerformanceChart';
import { NationalityBreakdownChart } from './admin/charts/NationalityBreakdownChart';
import { AgeBreakdownChart } from './admin/charts/AgeBreakdownChart';
import { CompletedSurveysChart } from './admin/charts/CompletedSurveysChart';
import { NationalityPieChart } from './admin/charts/NationalityPieChart';
import { AgeGroupDistributionChart } from './admin/charts/AgeGroupDistributionChart';
import { GenderDistributionChart } from './admin/charts/GenderDistributionChart';
import { EmploymentDistributionChart } from './admin/charts/EmploymentDistributionChart';
import { EmirateDistributionChart } from './admin/charts/EmirateDistributionChart';
import { ChildrenDistributionChart } from './admin/charts/ChildrenDistributionChart';
import { IncomeRangeDistributionChart } from './admin/charts/IncomeRangeDistributionChart';
import { CompaniesAnalyticsTable } from './admin/CompaniesAnalyticsTable';
import { ScoreAnalyticsTable } from './admin/ScoreAnalyticsTable';
import { CompanyManagement } from './CompanyManagement';
import { LeadsManagement } from './LeadsManagement';
import { IncompleteSurveys } from './admin/IncompleteSurveys';
import { SystemManagement } from './admin/SystemManagement';
import { SubmissionsTable } from './admin/SubmissionsTable';
import { RegistrationMetrics } from './admin/RegistrationMetrics';

interface FinancialClinicAdminDashboardProps {
  onBack?: () => void;
}

export function FinancialClinicAdminDashboard({ onBack }: FinancialClinicAdminDashboardProps) {
  const { user, logout } = useAdminAuth();
  const [selectedTab, setSelectedTab] = useState('overview');

  // State for filters and date range
  const [filters, setFilters] = useState<DemographicFilters>({});
  const [dateParams, setDateParams] = useState<DateRangeParams>({ dateRange: '30d' });
  const [availableOptions, setAvailableOptions] = useState<FilterOptions | null>(null);

  // State for analytics data
  const [loading, setLoading] = useState(true);
  const [overviewMetrics, setOverviewMetrics] = useState<OverviewMetrics | null>(null);
  const [scoreDistribution, setScoreDistribution] = useState<ScoreDistribution[]>([]);
  const [categoryPerformance, setCategoryPerformance] = useState<CategoryPerformance[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [timeSeriesGroupBy, setTimeSeriesGroupBy] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('day');
  const [nationalityBreakdown, setNationalityBreakdown] = useState<NationalityBreakdown[]>([]);
  const [ageBreakdown, setAgeBreakdown] = useState<AgeBreakdown[]>([]);
  const [employmentBreakdown, setEmploymentBreakdown] = useState<{ status: string, count: number }[]>([]);
  const [emirateBreakdown, setEmirateBreakdown] = useState<{ emirate: string, count: number }[]>([]);
  const [childrenBreakdown, setChildrenBreakdown] = useState<{ count_label: string, count: number }[]>([]);
  const [incomeBreakdown, setIncomeBreakdown] = useState<{ range: string, count: number }[]>([]);
  const [genderBreakdown, setGenderBreakdown] = useState<{ gender: string, count: number, percentage: number }[]>([]);
  const [companiesAnalytics, setCompaniesAnalytics] = useState<CompanyAnalytics[]>([]);
  const [scoreAnalyticsTable, setScoreAnalyticsTable] = useState<ScoreAnalyticsResponse | null>(null);

  // State for export
  const [exporting, setExporting] = useState(false);

  // Load filter options on mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Load all analytics data when filters or date range changes
  useEffect(() => {
    if (availableOptions) {
      loadAllAnalytics();
    }
  }, [filters, dateParams, availableOptions]);

  // Load time series when groupBy changes
  useEffect(() => {
    if (availableOptions) {
      loadTimeSeries();
    }
  }, [timeSeriesGroupBy, filters, dateParams, availableOptions]);

  const loadFilterOptions = async () => {
    try {
      const options = await adminApi.getFilterOptions();
      setAvailableOptions(options);
    } catch (error) {
      console.error('Failed to load filter options:', error);
      toast.error('Failed to load filter options');
    }
  };

  const loadAllAnalytics = async () => {
    setLoading(true);
    try {
      // Load all analytics in parallel
      const [
        metrics,
        scoreDist,
        catPerf,
        timeSeries,
        natBreakdown,
        ageBreakdownData,
        empBreakdown,
        emirBreakdown,
        childBreakdown,
        incBreakdown,
        compAnalytics,
        scoreTable,
        genBreakdown
      ] = await Promise.all([
        adminApi.getOverviewMetrics(filters, dateParams),
        adminApi.getScoreDistribution(filters, dateParams),
        adminApi.getCategoryPerformance(filters, dateParams),
        adminApi.getTimeSeries(timeSeriesGroupBy, filters, dateParams),
        adminApi.getNationalityBreakdown(filters, dateParams),
        adminApi.getAgeBreakdown(filters, dateParams),
        adminApi.getEmploymentBreakdown(filters, dateParams),
        adminApi.getEmirateBreakdown(filters, dateParams),
        adminApi.getChildrenBreakdown(filters, dateParams),
        adminApi.getIncomeRangeBreakdown(filters, dateParams),
        adminApi.getCompaniesAnalytics(filters, dateParams),
        adminApi.getScoreAnalyticsTable(filters, dateParams),
        adminApi.getGenderBreakdown(filters, dateParams),
      ]);

      setOverviewMetrics(metrics);
      setScoreDistribution(scoreDist);
      setCategoryPerformance(catPerf);
      setTimeSeriesData(timeSeries);
      setNationalityBreakdown(natBreakdown);
      setAgeBreakdown(ageBreakdownData);
      setEmploymentBreakdown(empBreakdown);
      setEmirateBreakdown(emirBreakdown);
      setChildrenBreakdown(childBreakdown);
      setIncomeBreakdown(incBreakdown);
      setCompaniesAnalytics(compAnalytics);
      setScoreAnalyticsTable(scoreTable);
      setGenderBreakdown(genBreakdown);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const loadTimeSeries = async () => {
    try {
      const data = await adminApi.getTimeSeries(timeSeriesGroupBy, filters, dateParams);
      setTimeSeriesData(data);
    } catch (error) {
      console.error('Failed to load time series:', error);
      toast.error('Failed to load time series data');
    }
  };

  const handleLogout = () => {
    logout();
    if (onBack) {
      onBack();
    }
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    setExporting(true);
    try {
      const blob = format === 'csv'
        ? await adminApi.exportCSV(filters, dateParams)
        : await adminApi.exportExcel(filters, dateParams);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-clinic-export-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error(`Failed to export as ${format}:`, error);
      toast.error(`Failed to export data as ${format.toUpperCase()}`);
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (score: number) => {
    if (score >= 65) return { variant: 'default' as const, label: 'Excellent' };
    if (score >= 50) return { variant: 'secondary' as const, label: 'Good' };
    if (score >= 35) return { variant: 'outline' as const, label: 'Needs Improvement' };
    return { variant: 'destructive' as const, label: 'At Risk' };
  };

  if (loading && !overviewMetrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="flex">
        {/* Sidebar for Filters */}
        <aside className="w-80 h-screen sticky top-0 overflow-y-auto border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Funnel className="w-5 h-5" />
              Filters
            </h2>
          </div>
          <div className="p-4">
            <FinancialClinicFilters
              filters={filters}
              onFiltersChange={setFilters}
              dateParams={dateParams}
              onDateParamsChange={setDateParams}
              availableOptions={availableOptions}
            />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 overflow-x-hidden">
          <div className="container mx-auto max-w-7xl p-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div className="flex items-center gap-4">
                {onBack && (
                  <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
                    ← Back
                  </Button>
                )}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">Financial Clinic Dashboard</h1>
                    <Badge variant="destructive" className="text-xs">ADMIN</Badge>
                  </div>
                  <p className="text-muted-foreground">
                    National Bonds Corporation - Financial Health Analytics
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                {/* Export Buttons */}
                <Button
                  variant="outline"
                  onClick={() => handleExport('csv')}
                  disabled={exporting}
                  className="flex items-center gap-2"
                >
                  {exporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExport('excel')}
                  disabled={exporting}
                  className="flex items-center gap-2"
                >
                  {exporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-4 h-4" />
                  )}
                  Export Excel
                </Button>

                {/* Admin Profile Dropdown */}
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <div className="text-left">
                          <div className="font-medium text-sm">{user.username}</div>
                          <div className="text-xs text-muted-foreground">Admin</div>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5 text-sm">
                        <div className="font-medium">{user.username}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview & Analytics</TabsTrigger>
                <TabsTrigger value="submissions">Submissions</TabsTrigger>
                <TabsTrigger value="companies">Companies</TabsTrigger>
                <TabsTrigger value="leads">Leads</TabsTrigger>
                <TabsTrigger value="incomplete">Incomplete</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {overviewMetrics && (
                  <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{overviewMetrics.total_submissions}</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {overviewMetrics.cases_completed_percentage?.toFixed(1) ?? '0.0'}% completion rate
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Today</CardTitle>
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{overviewMetrics.total_submissions || 0}</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Total submissions
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                          <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{overviewMetrics.average_score?.toFixed(1) || '0.0'}</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Out of 100
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Score Distribution & Category Performance */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <ScoreDistributionChart data={scoreDistribution} />
                      <CategoryPerformanceChart data={categoryPerformance} />
                    </div>

                    {/* Time Series Charts - Split into 2 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <SubmissionsChart
                        data={timeSeriesData}
                        groupBy={timeSeriesGroupBy}
                        onGroupByChange={setTimeSeriesGroupBy}
                      />
                      <AverageScoreChart
                        data={timeSeriesData}
                        groupBy={timeSeriesGroupBy}
                        onGroupByChange={setTimeSeriesGroupBy}
                      />
                    </div>

                    {/* Nationality & Age Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <NationalityBreakdownChart data={nationalityBreakdown} />
                      <AgeBreakdownChart data={ageBreakdown} />
                    </div>

                    {/* New Submissions Analytics Charts - Moved above Score Analytics Table */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <CompletedSurveysChart
                        data={timeSeriesData.map(item => ({
                          date: item.period,
                          count: item.submissions
                        }))}
                      />
                      <NationalityPieChart
                        data={nationalityBreakdown.map(item => ({
                          nationality: item.nationality,
                          count: item.total
                        }))}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <AgeGroupDistributionChart
                        data={ageBreakdown.map(item => ({
                          age_group: item.age_group,
                          count: item.total
                        }))}
                      />
                      <GenderDistributionChart data={genderBreakdown} />
                    </div>

                    {/* Demographic Distributions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <EmploymentDistributionChart data={employmentBreakdown} />
                      <EmirateDistributionChart data={emirateBreakdown} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <ChildrenDistributionChart data={childrenBreakdown} />
                      <IncomeRangeDistributionChart data={incomeBreakdown} />
                    </div>

                    {/* Score Analytics Table */}
                    {scoreAnalyticsTable && (
                      <ScoreAnalyticsTable data={scoreAnalyticsTable} />
                    )}
                  </>
                )}
              </TabsContent>

              {/* Submissions Tab */}
              <TabsContent value="submissions">
                <SubmissionsTable />
              </TabsContent>

              {/* Companies Tab */}
              <TabsContent value="companies" className="space-y-6">
                {companiesAnalytics && (
                  <CompaniesAnalyticsTable data={companiesAnalytics} />
                )}
                <CompanyManagement onCompanyCreated={loadFilterOptions} />
              </TabsContent>

              {/* Leads Tab */}
              <TabsContent value="leads" className="space-y-6">
                <LeadsManagement />
              </TabsContent>

              {/* Incomplete Tab */}
              <TabsContent value="incomplete" className="space-y-6">
                <IncompleteSurveys />
              </TabsContent>

              {/* System Tab */}
              <TabsContent value="system" className="space-y-6">
                <SystemManagement />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
