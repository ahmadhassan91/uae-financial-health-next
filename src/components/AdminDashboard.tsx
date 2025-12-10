import React, { useState, useMemo } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
} from "recharts";
import {
  Users,
  TrendUp,
  Clock,
  Pulse,
  Download,
  FileText,
  Funnel,
} from "@phosphor-icons/react";
import { User, LogOut } from "lucide-react";
import { ScoreCalculation } from "../lib/types";
import { PILLAR_DEFINITIONS } from "../lib/survey-data";
import { isValidPillarScore } from "../lib/score-display-utils";
import { CompanyManagement } from "./CompanyManagement";
// import { LeadsManagement } from './LeadsManagement';
import { DemographicFiltersComponent } from "./admin/DemographicFilters";
import { PillarHistogram } from "./admin/PillarHistogram";
import { CompletionMetrics } from "./admin/CompletionMetrics";
import { IncompleteSurveys } from "./admin/IncompleteSurveys";
import { RegistrationMetrics } from "./admin/RegistrationMetrics";
import { SystemManagement } from "./admin/SystemManagement";
import { useDemographicFilters } from "../hooks/use-demographic-filters";
import { useAdminAuth } from "../hooks/use-admin-auth";

interface AdminDashboardProps {
  scoreHistory: ScoreCalculation[];
  onExportData: (format: "csv" | "excel" | "pdf", filtered?: boolean) => void;
  onBack?: () => void;
}

export function AdminDashboard({
  scoreHistory,
  onExportData,
  onBack,
}: AdminDashboardProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d"
  );
  const [selectedTab, setSelectedTab] = useState("overview");
  const { user, logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    // Don't call onBack() - logout() already handles redirect to /admin
  };

  // Show loading state if scoreHistory is not yet available
  if (!scoreHistory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  // Use demographic filters hook
  const {
    filters,
    setFilters,
    availableOptions,
    filteredData,
    hasActiveFilters,
    activeFilterCount,
  } = useDemographicFilters(scoreHistory);

  // Calculate analytics from filtered data
  const analytics = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();

    switch (timeRange) {
      case "7d":
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Apply both time range and demographic filters
    const timeAndDemographicFiltered = filteredData.filter(
      (score) => new Date(score.createdAt) >= cutoffDate
    );

    // Overview metrics
    const totalCompletions = timeAndDemographicFiltered.length;
    // Deterministic mock data based on total completions for consistency
    const averageCompletionTime = Math.round(220 + (totalCompletions % 100)); // 220-320 seconds
    const completionRate = Math.round(87 + (totalCompletions % 8)); // 87-95%
    const activeUsers = Math.round(totalCompletions * 0.3); // Mock active users

    // Demographics analysis
    const ageGroups = timeAndDemographicFiltered.reduce((acc, score) => {
      const age = score.profile.age; // age is already a number
      let group = "55+";
      if (age < 25) group = "18-24";
      else if (age < 35) group = "25-34";
      else if (age < 45) group = "35-44";
      else if (age < 55) group = "45-54";

      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const nationalityBreakdown = timeAndDemographicFiltered.reduce(
      (acc, score) => {
        const nat = score.profile.nationality;
        acc[nat] = (acc[nat] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const incomeBreakdown = timeAndDemographicFiltered.reduce((acc, score) => {
      const income = score.profile.incomeRange; // Correct property name
      acc[income] = (acc[income] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const employmentBreakdown = timeAndDemographicFiltered.reduce(
      (acc, score) => {
        const emp = score.profile.employmentStatus;
        acc[emp] = (acc[emp] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Score analytics
    const averageScore =
      timeAndDemographicFiltered.length > 0
        ? Math.round(
            timeAndDemographicFiltered.reduce(
              (sum, score) => sum + score.totalScore,
              0
            ) / timeAndDemographicFiltered.length
          )
        : 0;

    const pillarAverages = Object.entries(PILLAR_DEFINITIONS).map(
      ([pillar, def]) => ({
        pillar: def.name,
        average:
          timeAndDemographicFiltered.length > 0
            ? Number(
                (
                  timeAndDemographicFiltered.reduce((sum, score) => {
                    const pillarScore = score.pillarScores?.find(
                      (p) => p.pillar === pillar
                    );
                    return (
                      sum +
                      (pillarScore && isValidPillarScore(pillarScore)
                        ? pillarScore.score
                        : 0)
                    );
                  }, 0) / timeAndDemographicFiltered.length
                ).toFixed(1)
              )
            : 0,
        fullMark: 5,
      })
    );

    // Trend data (mock for now - would be real historical data)
    const trendData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split("T")[0],
        completions: Math.round(((i % 7) + 1) * 2 + 6), // Deterministic pattern: 8-20
        averageScore: Math.round(50 + ((i * 3) % 15)), // Deterministic pattern: 50-65
      };
    });

    return {
      filteredData: timeAndDemographicFiltered, // Add this for the data table
      overview: {
        totalCompletions,
        completionRate,
        averageCompletionTime,
        activeUsers,
        averageScore,
      },
      demographics: {
        ageGroups: Object.entries(ageGroups).map(([age, count]) => ({
          age,
          count,
          percentage: Math.round((count / totalCompletions) * 100),
        })),
        nationality: Object.entries(nationalityBreakdown).map(
          ([nat, count]) => ({
            nationality: nat,
            count,
            percentage: Math.round((count / totalCompletions) * 100),
          })
        ),
        income: Object.entries(incomeBreakdown).map(([income, count]) => ({
          income,
          count,
          percentage: Math.round((count / totalCompletions) * 100),
        })),
        employment: Object.entries(employmentBreakdown).map(([emp, count]) => ({
          employment: emp,
          count,
          percentage: Math.round((count / totalCompletions) * 100),
        })),
      },
      scores: {
        pillarAverages,
        trendData,
        averageScore,
      },
    };
  }, [filteredData, timeRange]);

  const COLORS = [
    "#1B365D",
    "#D4AF37",
    "#22C55E",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
  ];

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
                  Financial Health Dashboard
                </h1>
                <Badge variant="destructive" className="text-xs">
                  ADMIN
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground">
                  National Bonds Corporation - Survey Analytics & Insights
                </p>
                {hasActiveFilters && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Funnel className="w-3 h-3" />
                    {activeFilterCount} filters active
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
            <Select
              value={timeRange}
              onValueChange={(value: string) =>
                setTimeRange(value as "7d" | "30d" | "90d" | "1y")
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onExportData("csv", hasActiveFilters)}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV {hasActiveFilters && "(Filtered)"}
              </Button>
              <Button
                variant="outline"
                onClick={() => onExportData("excel", hasActiveFilters)}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Export Excel {hasActiveFilters && "(Filtered)"}
              </Button>

              {/* Admin Profile Section */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 ml-4"
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

        {/* Demographic Filters */}
        <DemographicFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          availableOptions={availableOptions}
        />

        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview & Analytics</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="incomplete">Incomplete</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Completions
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics.overview.totalCompletions}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completion Rate
                  </CardTitle>
                  <TrendUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics.overview.completionRate}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +2.1% from last period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg. Completion Time
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.floor(analytics.overview.averageCompletionTime / 60)}m{" "}
                    {analytics.overview.averageCompletionTime % 60}s
                  </div>
                  <p className="text-xs text-muted-foreground">
                    -15s from last period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Score
                  </CardTitle>
                  <Pulse className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics.overview.averageScore}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        analytics.overview.averageScore >= 65
                          ? "default"
                          : analytics.overview.averageScore >= 50
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {analytics.overview.averageScore >= 65
                        ? "Excellent"
                        : analytics.overview.averageScore >= 50
                        ? "Good"
                        : "Needs Improvement"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Score Distribution</CardTitle>
                  <CardDescription>
                    Financial health score ranges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        {
                          range: "15-34",
                          count: Math.floor(
                            analytics.overview.totalCompletions * 0.15
                          ),
                          label: "Needs Improvement",
                        },
                        {
                          range: "35-49",
                          count: Math.floor(
                            analytics.overview.totalCompletions * 0.25
                          ),
                          label: "Fair",
                        },
                        {
                          range: "50-64",
                          count: Math.floor(
                            analytics.overview.totalCompletions * 0.35
                          ),
                          label: "Good",
                        },
                        {
                          range: "65-80",
                          count: Math.floor(
                            analytics.overview.totalCompletions * 0.25
                          ),
                          label: "Excellent",
                        },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#1B365D" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <PillarHistogram
                data={analytics.filteredData}
                title="Pillar Performance"
                description="Average scores across financial pillars (filtered data)"
              />
            </div>
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            <CompanyManagement />
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Consultation Requests (Leads)</CardTitle>
                <CardDescription>
                  Manage consultation requests from the Financial Clinic
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Leads management feature coming soon...
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Integration with consultation API in progress
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incomplete" className="space-y-6">
            <IncompleteSurveys />
          </TabsContent>

          <TabsContent value="registration" className="space-y-6">
            <RegistrationMetrics />
          </TabsContent>

          <TabsContent value="demographics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Age Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Age Distribution</CardTitle>
                  <CardDescription>
                    Survey participants by age group
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.demographics.ageGroups}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ age, percentage }) =>
                          `${age}: ${percentage}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analytics.demographics.ageGroups.map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Nationality Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Nationality Breakdown</CardTitle>
                  <CardDescription>UAE Nationals vs Expats</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.demographics.nationality}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nationality" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#D4AF37" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Income Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Income Distribution</CardTitle>
                  <CardDescription>Monthly income ranges</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.demographics.income}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="income"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#22C55E" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Employment Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Employment Status</CardTitle>
                  <CardDescription>Employment distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.demographics.employment}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ employment, percentage }) =>
                          `${employment}: ${percentage}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analytics.demographics.employment.map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scores" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Pillar Histogram */}
              <PillarHistogram
                data={analytics.filteredData}
                title="Financial Health Pillars Analysis"
                description="Detailed breakdown of 7 financial health pillars (filtered data)"
              />

              {/* Detailed Pillar Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Pillar Performance Summary</CardTitle>
                  <CardDescription>
                    Average scores and percentages for each pillar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.scores.pillarAverages.map((pillar, index) => (
                      <div key={pillar.pillar} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{pillar.pillar}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {pillar.average}/5.0
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {Math.round((pillar.average / 5) * 100)}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${(pillar.average / 5) * 100}%`,
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Completion Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Survey Completion Trends</CardTitle>
                  <CardDescription>
                    Daily survey completions over time (filtered data)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics.scores.trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="completions"
                        stroke="#1B365D"
                        fill="#1B365D"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Score Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Average Score Trends</CardTitle>
                  <CardDescription>
                    Financial health score evolution (filtered data)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.scores.trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[15, 80]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="averageScore"
                        stroke="#D4AF37"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="completion" className="space-y-6">
            <CompletionMetrics
              completedAssessments={analytics.filteredData}
              onExportData={onExportData}
            />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <SystemManagement />
          </TabsContent>

          {/* Submitted Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Submitted Assessments</CardTitle>
                <CardDescription>
                  Complete list of all financial health assessments submitted by
                  users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Nationality</TableHead>
                        <TableHead>Income Range</TableHead>
                        <TableHead>Total Score</TableHead>
                        <TableHead>Interpretation</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.filteredData.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No assessment data available for the selected time
                            period
                          </TableCell>
                        </TableRow>
                      ) : (
                        analytics.filteredData
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt).getTime() -
                              new Date(a.createdAt).getTime()
                          )
                          .map((record) => {
                            const interpretation =
                              record.totalScore >= 60
                                ? "Excellent"
                                : record.totalScore >= 45
                                ? "Good"
                                : record.totalScore >= 30
                                ? "Needs Improvement"
                                : "At Risk";
                            const interpretationColor =
                              interpretation === "Excellent"
                                ? "bg-green-100 text-green-800"
                                : interpretation === "Good"
                                ? "bg-blue-100 text-blue-800"
                                : interpretation === "Needs Improvement"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800";

                            return (
                              <TableRow key={record.id}>
                                <TableCell className="font-medium">
                                  {record.profile.name}
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    record.createdAt
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell>{record.profile.age}</TableCell>
                                <TableCell>
                                  {record.profile.nationality}
                                </TableCell>
                                <TableCell>
                                  {record.profile.incomeRange}
                                </TableCell>
                                <TableCell className="font-semibold">
                                  {record.totalScore}/{record.maxPossibleScore}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="secondary"
                                    className={interpretationColor}
                                  >
                                    {interpretation}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      // Future: Open detailed view modal
                                      alert(
                                        `Detailed view for ${record.profile.name} - Score: ${record.totalScore}/${record.maxPossibleScore}`
                                      );
                                    }}
                                  >
                                    View Details
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Summary Stats for Submitted Data */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">
                        {analytics.filteredData.length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total Assessments
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">
                        {analytics.filteredData.length > 0
                          ? Math.round(
                              analytics.filteredData.reduce(
                                (sum, r) => sum + r.totalScore,
                                0
                              ) / analytics.filteredData.length
                            )
                          : 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Average Score
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">
                        {
                          analytics.filteredData.filter(
                            (r) => r.totalScore >= 60
                          ).length
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Excellent Scores
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">
                        {
                          analytics.filteredData.filter(
                            (r) => r.totalScore < 30
                          ).length
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">At Risk</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
