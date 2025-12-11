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
  Funnel,
  Menu,
  X,
} from "lucide-react";
import { useAdminAuth } from "../hooks/use-admin-auth";
import { notify } from "@/lib/notifications";
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
import { toast } from "sonner";

// Import chart components
import { FinancialClinicFilters } from "./admin/FinancialClinicFilters";
import { SubmissionsChart } from "./admin/charts/SubmissionsChart";
import { AverageScoreChart } from "./admin/charts/AverageScoreChart";
import { ScoreDistributionChart } from "./admin/charts/ScoreDistributionChart";
import { CategoryPerformanceChart } from "./admin/charts/CategoryPerformanceChart";
import { NationalityBreakdownChart } from "./admin/charts/NationalityBreakdownChart";
import { AgeBreakdownChart } from "./admin/charts/AgeBreakdownChart";
import { CompletedSurveysChart } from "./admin/charts/CompletedSurveysChart";
import { NationalityPieChart } from "./admin/charts/NationalityPieChart";
import { AgeGroupDistributionChart } from "./admin/charts/AgeGroupDistributionChart";
import { GenderDistributionChart } from "./admin/charts/GenderDistributionChart";
import { EmploymentDistributionChart } from "./admin/charts/EmploymentDistributionChart";
import { EmirateDistributionChart } from "./admin/charts/EmirateDistributionChart";
import { ChildrenDistributionChart } from "./admin/charts/ChildrenDistributionChart";
import { IncomeRangeDistributionChart } from "./admin/charts/IncomeRangeDistributionChart";
import { CompaniesAnalyticsTable } from "./admin/CompaniesAnalyticsTable";
import { ScoreAnalyticsTable } from "./admin/ScoreAnalyticsTable";
import { CompanyManagement } from "./CompanyManagement";
import { LeadsManagement } from "./LeadsManagement";
import { IncompleteSurveys } from "./admin/IncompleteSurveys";
import { SystemManagement } from "./admin/SystemManagement";
import { SubmissionsTable } from "./admin/SubmissionsTable";
import { RegistrationMetrics } from "./admin/RegistrationMetrics";

interface FinancialClinicAdminDashboardProps {
  onBack?: () => void;
}

export function FinancialClinicAdminDashboard({
  onBack,
}: FinancialClinicAdminDashboardProps) {
  const { user, logout } = useAdminAuth();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
  const [employmentBreakdown, setEmploymentBreakdown] = useState<
    { status: string; count: number }[]
  >([]);
  const [emirateBreakdown, setEmirateBreakdown] = useState<
    { emirate: string; count: number }[]
  >([]);
  const [childrenBreakdown, setChildrenBreakdown] = useState<
    { count_label: string; count: number; average_score: number }[]
  >([]);
  const [incomeBreakdown, setIncomeBreakdown] = useState<
    { range: string; count: number; average_score: number }[]
  >([]);
  const [genderBreakdown, setGenderBreakdown] = useState<
    { gender: string; count: number; percentage: number }[]
  >([]);
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
  useEffect(() => {
    console.log("overviewMetrics:", overviewMetrics);
  }, [overviewMetrics]);
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
      // Load all analytics in parallel with individual error handling
      const results = await Promise.allSettled([
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

      // Extract successful results
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
        genBreakdown,
      ] = results.map((result, index) => {
        if (result.status === "fulfilled") {
          return result.value;
        } else {
          console.error(
            `Failed to load analytics item ${index}:`,
            result.reason
          );
          return null;
        }
      }) as [
        OverviewMetrics | null,
        ScoreDistribution[] | null,
        CategoryPerformance[] | null,
        TimeSeriesData[] | null,
        NationalityBreakdown[] | null,
        AgeBreakdown[] | null,
        { status: string; count: number }[] | null,
        { emirate: string; count: number }[] | null,
        { count_label: string; count: number; average_score: number }[] | null,
        { range: string; count: number; average_score: number }[] | null,
        CompanyAnalytics[] | null,
        ScoreAnalyticsResponse | null,
        { gender: string; count: number; percentage: number }[] | null
      ];

      // Set data only if successfully loaded
      if (metrics) setOverviewMetrics(metrics);
      if (scoreDist) setScoreDistribution(scoreDist);
      if (catPerf) setCategoryPerformance(catPerf);
      if (timeSeries) setTimeSeriesData(timeSeries);
      if (natBreakdown) setNationalityBreakdown(natBreakdown);
      if (ageBreakdownData) setAgeBreakdown(ageBreakdownData);
      if (empBreakdown) setEmploymentBreakdown(empBreakdown);
      if (emirBreakdown) setEmirateBreakdown(emirBreakdown);
      if (childBreakdown) setChildrenBreakdown(childBreakdown);
      if (incBreakdown) setIncomeBreakdown(incBreakdown);
      if (compAnalytics) setCompaniesAnalytics(compAnalytics);
      if (scoreTable) setScoreAnalyticsTable(scoreTable);
      if (genBreakdown) setGenderBreakdown(genBreakdown);
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
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="flex relative">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar for Filters */}
        <aside
          className={`
          fixed lg:sticky top-0 h-screen overflow-y-auto border-r bg-background z-50
          w-80 transition-transform duration-300 ease-in-out
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
        >
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Funnel className="w-5 h-5" />
              Filters
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
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
        <div className="flex-1 overflow-x-hidden w-full lg:w-auto">
          <div className="container mx-auto max-w-7xl p-4 py-8">
            {/* Header */}
            <div className="flex flex-col gap-4 mb-8">
              {/* Mobile Menu Button */}
              <div className="flex items-center gap-2 lg:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSidebarOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Menu className="w-4 h-4" />
                  Filters
                </Button>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold">
                      Financial Clinic Dashboard
                    </h1>
                    <Badge variant="destructive" className="text-xs">
                      ADMIN
                    </Badge>
                    {user?.admin_role === "view_only" && (
                      <Badge
                        variant="outline"
                        className="text-xs border-amber-500 text-amber-600"
                      >
                        VIEW ONLY
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground">
                    National Bonds Corporation - Financial Health Analytics
                  </p>
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
                        <Button
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <User className="w-4 h-4" />
                          <div className="text-left">
                            <div className="font-medium text-sm">
                              {user.username}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Admin
                            </div>
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
                          {user.admin_role === "view_only" && (
                            <div className="text-xs text-amber-600 font-medium mt-1">
                              View-Only Access
                            </div>
                          )}
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
            </div>

            {/* Loading indicator for filter changes */}
            {loading && overviewMetrics && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-primary/10 border border-primary/20">
                <Loader2 className="animate-spin h-4 w-4 text-primary" />
                <span className="text-sm text-primary font-medium">
                  Applying filters...
                </span>
              </div>
            )}

            {/* Tabs */}
            <Tabs
              value={selectedTab}
              onValueChange={setSelectedTab}
              className="space-y-6"
            >
              <div className="w-full overflow-x-auto pb-2">
                <TabsList
                  className={`inline-flex w-auto min-w-full lg:grid ${
                    user?.admin_role === "view_only"
                      ? "lg:grid-cols-4"
                      : "lg:grid-cols-6"
                  } gap-1`}
                >
                  <TabsTrigger
                    value="overview"
                    className="text-xs sm:text-sm whitespace-nowrap"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="submissions"
                    className="text-xs sm:text-sm whitespace-nowrap"
                  >
                    Submissions
                  </TabsTrigger>
                  {user?.admin_role !== "view_only" && (
                    <TabsTrigger
                      value="companies"
                      className="text-xs sm:text-sm whitespace-nowrap"
                    >
                      Companies
                    </TabsTrigger>
                  )}
                                    <TabsTrigger
                    value="leads"
                    className="text-xs sm:text-sm whitespace-nowrap"
                  >
                    Leads
                  </TabsTrigger>
                  <TabsTrigger
                    value="incomplete"
                    className="text-xs sm:text-sm whitespace-nowrap"
                  >
                    Incomplete
                  </TabsTrigger>
                  {user?.admin_role !== "view_only" && (
                    <TabsTrigger
                      value="system"
                      className="text-xs sm:text-sm whitespace-nowrap"
                    >
                      System
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {overviewMetrics && (
                  <>
                    {/* KPI Cards */}
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
                            Today
                          </CardTitle>
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {overviewMetrics.today_submissions ??
                              overviewMetrics.total_submissions ??
                              0}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date().toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}{" "}
                            - Submitted results
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
                            {overviewMetrics.average_score?.toFixed(1) || "0.0"}
                          </div>
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
                        data={timeSeriesData.map((item) => ({
                          date: item.period,
                          count: item.submissions,
                        }))}
                      />
                      <NationalityPieChart
                        data={nationalityBreakdown.map((item) => ({
                          nationality: item.nationality,
                          count: item.total,
                        }))}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <AgeGroupDistributionChart
                        data={ageBreakdown.map((item) => ({
                          age_group: item.age_group,
                          count: item.total,
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

              {/* Companies Tab - Only for full admins */}
              {user?.admin_role !== "view_only" && (
                <TabsContent value="companies" className="space-y-6">
                  {companiesAnalytics && (
                    <CompaniesAnalyticsTable data={companiesAnalytics} />
                  )}
                  <CompanyManagement onCompanyCreated={loadFilterOptions} />
                </TabsContent>
              )}

              
              {/* Leads Tab */}
              <TabsContent value="leads" className="space-y-6">
                <LeadsManagement />
              </TabsContent>

              {/* Incomplete Tab */}
              <TabsContent value="incomplete" className="space-y-6">
                <IncompleteSurveys />
              </TabsContent>

              {/* System Tab - Only for full admins */}
              {user?.admin_role !== "view_only" && (
                <TabsContent value="system" className="space-y-6">
                  <SystemManagement />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
