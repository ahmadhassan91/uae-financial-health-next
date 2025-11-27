"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  TrendingUp,
  Clock,
  Activity,
  Download,
  User,
  LogOut,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import { useAdminAuth } from "../hooks/use-admin-auth";
import { toast } from "sonner";
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
} from "../lib/admin-api";

// Import chart components
import { FinancialClinicFilters } from "./admin/FinancialClinicFilters";
import { TimeSeriesChart } from "./admin/charts/TimeSeriesChart";
import { ScoreDistributionChart } from "./admin/charts/ScoreDistributionChart";
import { CategoryPerformanceChart } from "./admin/charts/CategoryPerformanceChart";
import { NationalityBreakdownChart } from "./admin/charts/NationalityBreakdownChart";
import { AgeBreakdownChart } from "./admin/charts/AgeBreakdownChart";
import { CompaniesAnalyticsTable } from "./admin/CompaniesAnalyticsTable";
import { ScoreAnalyticsTable } from "./admin/ScoreAnalyticsTable";

// Import existing admin components for other tabs
import { CompanyManagement } from "./CompanyManagement";
import { LeadsManagement } from "./LeadsManagement";
import { SubmissionsTable } from "./admin/SubmissionsTable";
import { IncompleteSurveys } from "./admin/IncompleteSurveys";
import { RegistrationMetrics } from "./admin/RegistrationMetrics";
import { SystemManagement } from "./admin/SystemManagement";

interface FinancialClinicAdminDashboardProps {
  onBack?: () => void;
}

export function FinancialClinicAdminDashboard({
  onBack,
}: FinancialClinicAdminDashboardProps) {
  const { user, logout } = useAdminAuth();
  const [selectedTab, setSelectedTab] = useState("overview");

  // State for filters and date range
  const [filters, setFilters] = useState<DemographicFilters>({});
  const [dateParams, setDateParams] = useState<DateRangeParams>({
    dateRange: "30d",
  });
  const [availableOptions, setAvailableOptions] =
    useState<FilterOptions | null>(null);

  // State for analytics data
  const [loading, setLoading] = useState(true);
  const [overviewMetrics, setOverviewMetrics] =
    useState<OverviewMetrics | null>(null);
  const [scoreDistribution, setScoreDistribution] = useState<
    ScoreDistribution[]
  >([]);
  const [categoryPerformance, setCategoryPerformance] = useState<
    CategoryPerformance[]
  >([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [timeSeriesGroupBy, setTimeSeriesGroupBy] = useState<
    "day" | "week" | "month" | "quarter" | "year"
  >("day");
  const [nationalityBreakdown, setNationalityBreakdown] = useState<
    NationalityBreakdown[]
  >([]);
  const [ageBreakdown, setAgeBreakdown] = useState<AgeBreakdown[]>([]);
  const [companiesAnalytics, setCompaniesAnalytics] = useState<
    CompanyAnalytics[]
  >([]);
  const [scoreAnalyticsTable, setScoreAnalyticsTable] =
    useState<ScoreAnalyticsResponse | null>(null);

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
      console.error("Failed to load filter options:", error);
      toast.error("Failed to load filter options");
    }
  };

  const loadAllAnalytics = async () => {
    setLoading(true);
    try {
      // Load all analytics in parallel
      const [
        overview,
        distribution,
        categories,
        nationality,
        age,
        companies,
        scoreTable,
      ] = await Promise.all([
        adminApi.getOverviewMetrics(filters, dateParams),
        adminApi.getScoreDistribution(filters, dateParams),
        adminApi.getCategoryPerformance(filters, dateParams),
        adminApi.getNationalityBreakdown(filters, dateParams),
        adminApi.getAgeBreakdown(filters, dateParams),
        adminApi.getCompaniesAnalytics(filters, dateParams),
        adminApi.getScoreAnalyticsTable(filters, dateParams),
      ]);

      setOverviewMetrics(overview);
      setScoreDistribution(distribution);
      setCategoryPerformance(categories);
      setNationalityBreakdown(nationality);
      setAgeBreakdown(age);
      setCompaniesAnalytics(companies);
      setScoreAnalyticsTable(scoreTable);
    } catch (error) {
      console.error("Failed to load analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const loadTimeSeries = async () => {
    try {
      const data = await adminApi.getTimeSeries(
        timeSeriesGroupBy,
        filters,
        dateParams
      );
      setTimeSeriesData(data);
    } catch (error) {
      console.error("Failed to load time series:", error);
      toast.error("Failed to load time series data");
    }
  };

  const handleLogout = () => {
    logout();
    if (onBack) {
      onBack();
    }
  };

  const handleExport = async (format: "csv" | "excel") => {
    setExporting(true);
    try {
      const blob =
        format === "csv"
          ? await adminApi.exportCSV(filters, dateParams)
          : await adminApi.exportExcel(filters, dateParams);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `financial-clinic-export-${
        new Date().toISOString().split("T")[0]
      }.${format === "csv" ? "csv" : "xlsx"}`;
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
    if (score >= 65) return { variant: "default" as const, label: "Excellent" };
    if (score >= 50) return { variant: "secondary" as const, label: "Good" };
    if (score >= 35)
      return { variant: "outline" as const, label: "Needs Improvement" };
    return { variant: "destructive" as const, label: "At Risk" };
  };

  if (loading && !overviewMetrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="container mx-auto max-w-7xl py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button
                variant="outline"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                ← Back
              </Button>
            )}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">
                  Financial Clinic Dashboard
                </h1>
                <Badge variant="destructive" className="text-xs">
                  ADMIN
                </Badge>
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
              onClick={() => handleExport("csv")}
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
              onClick={() => handleExport("excel")}
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
                    <div className="text-xs text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Filters */}
        <FinancialClinicFilters
          filters={filters}
          onFiltersChange={setFilters}
          dateParams={dateParams}
          onDateParamsChange={setDateParams}
          availableOptions={availableOptions}
        />

        {/* Tabs */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="space-y-6 mt-6"
        >
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
                {/* KPI Cards - Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Submissions
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {overviewMetrics.total_submissions}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {overviewMetrics.cases_completed_percentage?.toFixed(
                          1
                        ) ?? "0.0"}
                        % completion rate
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Unique Completions
                      </CardTitle>
                      <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {overviewMetrics.unique_completions}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {overviewMetrics.unique_completion_percentage?.toFixed(
                          1
                        ) ?? "0.0"}
                        % unique users
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Average Score
                      </CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {overviewMetrics.average_score?.toFixed(1) ?? "0.0"}
                      </div>
                      <Badge
                        {...getStatusBadge(overviewMetrics.average_score ?? 0)}
                        className="mt-2"
                      >
                        {
                          getStatusBadge(overviewMetrics.average_score ?? 0)
                            .label
                        }
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                {/* KPI Cards - Row 2: Status Bands */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Excellent
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {overviewMetrics.excellent_count}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {overviewMetrics.total_submissions > 0
                          ? (
                              (overviewMetrics.excellent_count /
                                overviewMetrics.total_submissions) *
                              100
                            ).toFixed(1)
                          : 0}
                        % of total
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Good
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {overviewMetrics.good_count}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {overviewMetrics.total_submissions > 0
                          ? (
                              (overviewMetrics.good_count /
                                overviewMetrics.total_submissions) *
                              100
                            ).toFixed(1)
                          : 0}
                        % of total
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Needs Improvement
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">
                        {overviewMetrics.needs_improvement_count}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {overviewMetrics.total_submissions > 0
                          ? (
                              (overviewMetrics.needs_improvement_count /
                                overviewMetrics.total_submissions) *
                              100
                            ).toFixed(1)
                          : 0}
                        % of total
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        At Risk
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {overviewMetrics.at_risk_count}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {overviewMetrics.total_submissions > 0
                          ? (
                              (overviewMetrics.at_risk_count /
                                overviewMetrics.total_submissions) *
                              100
                            ).toFixed(1)
                          : 0}
                        % of total
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Score Distribution & Category Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ScoreDistributionChart data={scoreDistribution} />
                  <CategoryPerformanceChart data={categoryPerformance} />
                </div>

                {/* Time Series Chart */}
                <TimeSeriesChart
                  data={timeSeriesData}
                  groupBy={timeSeriesGroupBy}
                  onGroupByChange={setTimeSeriesGroupBy}
                />

                {/* Nationality & Age Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <NationalityBreakdownChart data={nationalityBreakdown} />
                  <AgeBreakdownChart data={ageBreakdown} />
                </div>

                {/* Score Analytics Table */}
                <ScoreAnalyticsTable data={scoreAnalyticsTable} />
              </>
            )}
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-6">
            <SubmissionsTable />
          </TabsContent>

          {/* Companies Tab */}
          <TabsContent value="companies" className="space-y-6">
            <CompaniesAnalyticsTable data={companiesAnalytics} />
            <CompanyManagement onCompanyCreated={loadFilterOptions} />
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-6">
            <LeadsManagement />
          </TabsContent>

          {/* Incomplete Surveys Tab */}
          <TabsContent value="incomplete" className="space-y-6">
            <IncompleteSurveys />
          </TabsContent>

          {/* Registration Metrics Tab */}
          <TabsContent value="registration" className="space-y-6">
            <RegistrationMetrics />
          </TabsContent>

          {/* System Management Tab */}
          <TabsContent value="system" className="space-y-6">
            <SystemManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
