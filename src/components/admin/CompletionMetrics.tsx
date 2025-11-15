import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendUp, TrendDown, Users, CheckCircle, Clock, Download 
} from '@phosphor-icons/react';
import { ScoreCalculation } from '@/lib/types';

interface CompletionMetricsProps {
  completedAssessments: ScoreCalculation[];
  totalSubmissions?: number; // This would come from backend analytics
  onExportData: (format: 'csv' | 'excel' | 'pdf', filtered: boolean) => void;
}

interface CompletionTrendData {
  date: string;
  completions: number;
  submissions: number;
  completionRate: number;
}

export function CompletionMetrics({ 
  completedAssessments, 
  totalSubmissions,
  onExportData 
}: CompletionMetricsProps) {
  // Calculate completion metrics
  const totalCompletions = completedAssessments.length;
  const estimatedSubmissions = totalSubmissions || Math.round(totalCompletions * 1.15); // Mock 15% dropout rate
  const completionRate = totalSubmissions 
    ? Math.round((totalCompletions / totalSubmissions) * 100)
    : Math.round((totalCompletions / estimatedSubmissions) * 100);

  // Generate trend data for the last 30 days
  const trendData: CompletionTrendData[] = React.useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date;
    });

    return last30Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const dayCompletions = completedAssessments.filter(assessment => 
        assessment.createdAt.toString().split('T')[0] === dateStr
      ).length;
      
      // Mock submissions data (would come from backend)
      const daySubmissions = Math.round(dayCompletions * (1 + Math.random() * 0.3));
      const dayCompletionRate = daySubmissions > 0 ? Math.round((dayCompletions / daySubmissions) * 100) : 0;

      return {
        date: dateStr,
        completions: dayCompletions,
        submissions: daySubmissions,
        completionRate: dayCompletionRate
      };
    });
  }, [completedAssessments]);

  // Calculate completion rate by demographic segments
  const completionByAge = React.useMemo(() => {
    const ageGroups = ['18-24', '25-34', '35-44', '45-54', '55+'];
    return ageGroups.map(ageGroup => {
      const count = completedAssessments.filter(assessment => {
        const age = assessment.profile.age;
        switch (ageGroup) {
          case '18-24': return age >= 18 && age < 25;
          case '25-34': return age >= 25 && age < 35;
          case '35-44': return age >= 35 && age < 45;
          case '45-54': return age >= 45 && age < 55;
          case '55+': return age >= 55;
          default: return false;
        }
      }).length;
      
      return {
        ageGroup,
        completions: count,
        percentage: totalCompletions > 0 ? Math.round((count / totalCompletions) * 100) : 0
      };
    });
  }, [completedAssessments, totalCompletions]);

  // Recent completion trend (last 7 days vs previous 7 days)
  const recentTrend = React.useMemo(() => {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previous7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentCompletions = completedAssessments.filter(assessment => 
      new Date(assessment.createdAt) >= last7Days
    ).length;

    const previousCompletions = completedAssessments.filter(assessment => {
      const date = new Date(assessment.createdAt);
      return date >= previous7Days && date < last7Days;
    }).length;

    const trendPercentage = previousCompletions > 0 
      ? Math.round(((recentCompletions - previousCompletions) / previousCompletions) * 100)
      : recentCompletions > 0 ? 100 : 0;

    return {
      recent: recentCompletions,
      previous: previousCompletions,
      trend: trendPercentage,
      isPositive: trendPercentage >= 0
    };
  }, [completedAssessments]);

  const COLORS = ['#1B365D', '#D4AF37', '#22C55E', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Completions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompletions}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {recentTrend.isPositive ? (
                <TrendUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendDown className="h-3 w-3 text-red-500" />
              )}
              <span className={recentTrend.isPositive ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(recentTrend.trend)}%
              </span>
              <span>vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estimatedSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              Includes incomplete attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <div className="flex items-center gap-2">
              <Badge variant={completionRate >= 80 ? 'default' : completionRate >= 60 ? 'secondary' : 'destructive'}>
                {completionRate >= 80 ? 'Excellent' : completionRate >= 60 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Daily Completions</CardTitle>
            <TrendUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(trendData.reduce((sum, day) => sum + day.completions, 0) / trendData.length)}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Completion Trends Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Completion Trends</CardTitle>
              <CardDescription>Daily completions vs submissions over the last 30 days</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onExportData('csv', true)}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Trends
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number, name: string) => [
                  value,
                  name === 'completions' ? 'Completions' : 
                  name === 'submissions' ? 'Submissions' : 'Completion Rate (%)'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="submissions" 
                stackId="1"
                stroke="#E5E7EB" 
                fill="#E5E7EB" 
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="completions" 
                stackId="1"
                stroke="#1B365D" 
                fill="#1B365D" 
                fillOpacity={0.8}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Completion Rate Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Completion Rate Over Time</CardTitle>
            <CardDescription>Percentage of submissions that result in completed assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number) => [`${value}%`, 'Completion Rate']}
                />
                <Line 
                  type="monotone" 
                  dataKey="completionRate" 
                  stroke="#D4AF37" 
                  strokeWidth={2}
                  dot={{ fill: '#D4AF37', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Completion by Age Group */}
        <Card>
          <CardHeader>
            <CardTitle>Completions by Age Group</CardTitle>
            <CardDescription>Distribution of completed assessments across age demographics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={completionByAge}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ ageGroup, percentage }) => `${ageGroup}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="completions"
                >
                  {completionByAge.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [value, 'Completions']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Filtered Data</CardTitle>
          <CardDescription>Download completion metrics and analytics based on current filters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={() => onExportData('csv', true)}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onExportData('excel', true)}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onExportData('pdf', true)}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export PDF Report
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Exports will include all filtered data and current analytics based on your selected demographic filters.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}