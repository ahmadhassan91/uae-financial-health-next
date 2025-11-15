import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart, Scatter } from 'recharts';
import { ArrowLeft, ChartLineUp, ChartLineDown, FileText, EnvelopeSimple } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface FinancialClinicResponse {
  id: number;
  overall_score: number;
  budgeting_score: number;
  savings_score: number;
  debt_management_score: number;
  financial_planning_score: number;
  investment_knowledge_score: number;
  risk_tolerance: string;
  created_at: string;
  completion_time?: string;
}

interface FinancialClinicScoreHistoryProps {
  scoreHistory: FinancialClinicResponse[];
  onBack: () => void;
  onLogout?: () => void;
  userEmail?: string;
}

export function FinancialClinicScoreHistory({ 
  scoreHistory, 
  onBack, 
  onLogout, 
  userEmail 
}: FinancialClinicScoreHistoryProps) {
  const router = useRouter();

  if (!scoreHistory || scoreHistory.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="container mx-auto max-w-4xl py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Score History</h1>
            <p className="text-muted-foreground mb-8">
              No previous assessments found. Complete your first assessment to start tracking your progress.
            </p>
            <Button onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const latestScore = scoreHistory[0];
  const previousScore = scoreHistory[1];
  const scoreDiff = previousScore ? latestScore.overall_score - previousScore.overall_score : 0;

  // Prepare data for line chart (latest on the right)
  const chartData = scoreHistory
    .slice(0, 10) // Show last 10 scores
    .reverse() // Reverse to have oldest first
    .map((response, index) => {
      const assessmentNumber = scoreHistory.length - scoreHistory.slice(0, 10).length + index + 1;
      return {
        assessment: `#${assessmentNumber}`,
        score: response.overall_score,
        date: new Date(response.created_at).toLocaleDateString()
      };
    });

  // Prepare histogram data for latest score using available fields
  const histogramData = [
    { factor: "Budgeting", score: latestScore.budgeting_score || 0, fullMark: 100 },
    { factor: "Savings", score: latestScore.savings_score || 0, fullMark: 100 },
    { factor: "Debt Mgmt", score: latestScore.debt_management_score || 0, fullMark: 100 },
    { factor: "Planning", score: latestScore.financial_planning_score || 0, fullMark: 100 },
    { factor: "Investment", score: latestScore.investment_knowledge_score || 0, fullMark: 100 },
  ];

  // Find the highest score to show a dot only on that pillar
  const maxScore = Math.max(...histogramData.map(d => d.score));
  const histogramDataWithDot = histogramData.map(item => ({
    ...item,
    highlight: item.score === maxScore ? item.score : null
  }));

  const handleDownloadPDF = async (responseId: number) => {
    try {
      toast.info('Generating PDF report...');
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financial-clinic/report/pdf`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            survey_response_id: responseId,
            language: 'en'
          })
        }
      );

      if (response.ok) {
        const contentType = response.headers.get('Content-Type');
        
        if (contentType?.includes('application/pdf')) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `financial-clinic-report-${responseId}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success('PDF downloaded successfully!');
        } else {
          const data = await response.json();
          toast.warning(data.message || 'PDF generation in progress');
        }
      } else {
        toast.error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('PDF download error:', error);
      toast.error('Failed to download PDF');
    }
  };

  const handleEmailReport = async (responseId: number) => {
    if (!userEmail) {
      toast.error('Email address not available');
      return;
    }

    try {
      toast.info('Sending email report...');
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financial-clinic/report/email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            survey_response_id: responseId,
            email: userEmail,
            language: 'en'
          })
        }
      );

      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success('Email sent successfully!');
      } else {
        toast.warning(data.message || 'Email service being configured');
      }
    } catch (error) {
      console.error('Email error:', error);
      toast.error('Failed to send email');
    }
  };

  const getStatusColor = (statusBand: string) => {
    switch (statusBand.toLowerCase()) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'needs improvement':
        return 'text-amber-600';
      case 'at risk':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="container mx-auto max-w-6xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Score History</h1>
              <p className="text-muted-foreground">
                Track your financial health progress over time
                {userEmail && (
                  <span className="block text-sm mt-1">
                    Logged in as: {userEmail}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          {onLogout && (
            <Button variant="outline" onClick={onLogout}>
              Sign Out
            </Button>
          )}
        </div>

        {/* Current Score Summary */}
        <Card className="mb-8 border-none shadow-lg">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {Math.round(latestScore.overall_score)}
                </div>
                <div className="text-sm text-muted-foreground">Current Score</div>
              </div>
              
              {previousScore && (
                <div className="text-center">
                  <div className={`flex items-center justify-center gap-2 text-2xl font-bold mb-2 ${
                    scoreDiff > 0 ? 'text-green-600' : scoreDiff < 0 ? 'text-red-600' : 'text-muted-foreground'
                  }`}>
                    {scoreDiff > 0 ? <ChartLineUp className="w-6 h-6" /> : scoreDiff < 0 ? <ChartLineDown className="w-6 h-6" /> : null}
                    {scoreDiff > 0 ? '+' : ''}{Math.round(scoreDiff)}
                  </div>
                  <div className="text-sm text-muted-foreground">Change from Previous</div>
                </div>
              )}
              
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">
                  {scoreHistory.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Assessments</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Score Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Score Trend</CardTitle>
              <CardDescription>
                Your financial health score progression over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="assessment" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      labelFormatter={(label) => `Assessment ${label}`}
                      formatter={(value, name) => [value, 'Score']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Current Pillar Analysis</CardTitle>
              <CardDescription>
                Breakdown of your latest score by the 6 financial health pillars
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={histogramDataWithDot} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="factor" 
                      tick={{ fontSize: 9 }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tick={{ fontSize: 10 }}
                      label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'highlight') return null; // Don't show highlight in tooltip
                        return [`${Math.round(Number(value))}%`, 'Score'];
                      }}
                      labelFormatter={(label) => `Category: ${label}`}
                    />
                    <Bar
                      dataKey="score"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                    <Scatter
                      dataKey="highlight"
                      fill="#22c55e"
                      stroke="#16a34a"
                      strokeWidth={2}
                      r={8}
                      shape="circle"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assessment History */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment History</CardTitle>
            <CardDescription>
              Detailed view of all your completed assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scoreHistory.map((response, index) => {
                const prevResponse = scoreHistory[index + 1];
                const diff = prevResponse ? response.overall_score - prevResponse.overall_score : 0;
                
                return (
                  <div key={response.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{Math.round(response.overall_score)}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(response.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {index === 0 && (
                        <Badge variant="default">Latest</Badge>
                      )}
                      
                      {response.risk_tolerance && (
                        <Badge variant="outline">
                          {response.risk_tolerance}
                        </Badge>
                      )}
                      
                      {diff !== 0 && (
                        <div className={`flex items-center gap-1 text-sm ${
                          diff > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {diff > 0 ? <ChartLineUp className="w-4 h-4" /> : <ChartLineDown className="w-4 h-4" />}
                          {diff > 0 ? '+' : ''}{Math.round(diff)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                        <div className="text-sm font-medium">
                          Assessment #{scoreHistory.length - index}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(response.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(response.id)}
                        className="gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        PDF
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEmailReport(response.id)}
                        className="gap-2"
                      >
                        <EnvelopeSimple className="w-4 h-4" />
                        Email
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
