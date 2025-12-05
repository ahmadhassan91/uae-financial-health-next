import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Scatter,
  Legend,
} from "recharts";
import {
  ArrowLeft,
  ChartLineUp,
  ChartLineDown,
  FileText,
  EnvelopeSimple,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  userEmail,
}: FinancialClinicScoreHistoryProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  if (!scoreHistory || scoreHistory.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="container mx-auto max-w-4xl py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Score History</h1>
            <p className="text-muted-foreground mb-8">
              No previous assessments found. Complete your first assessment to
              start tracking your progress.
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
  const scoreDiff = previousScore
    ? latestScore.overall_score - previousScore.overall_score
    : 0;

  // Prepare data for line chart (latest on the right)
  const chartData = scoreHistory
    .slice(0, 10) // Show last 10 scores
    .reverse() // Reverse to have oldest first
    .map((response, index) => {
      const assessmentNumber =
        scoreHistory.length - scoreHistory.slice(0, 10).length + index + 1;
      return {
        assessment: `#${assessmentNumber}`,
        score: response.overall_score,
        date: new Date(response.created_at).toLocaleDateString(),
      };
    });

  // Prepare histogram data for latest score using available fields
  const histogramData = [
    {
      factor: "Income Stream",
      score: latestScore.budgeting_score || 0,
      fullMark: 100,
    },
    {
      factor: "Saving Habits",
      score: latestScore.savings_score || 0,
      fullMark: 100,
    },
    {
      factor: "Emergency Savings",
      score: latestScore.debt_management_score || 0,
      fullMark: 100,
    },
    {
      factor: "Debt Management",
      score: latestScore.financial_planning_score || 0,
      fullMark: 100,
    },
    {
      factor: "Retirement Planning",
      score: latestScore.investment_knowledge_score || 0,
      fullMark: 100,
    },
    {
      factor: "Family Protection",
      score: 0,
      fullMark: 100,
    },
  ];

  // Calculate average scores across all assessments for comparison
  const averageScores = {
    incomeStream:
      scoreHistory.reduce((sum, s) => sum + (s.budgeting_score || 0), 0) /
      scoreHistory.length,
    savingHabits:
      scoreHistory.reduce((sum, s) => sum + (s.savings_score || 0), 0) /
      scoreHistory.length,
    emergencySavings:
      scoreHistory.reduce((sum, s) => sum + (s.debt_management_score || 0), 0) /
      scoreHistory.length,
    debtManagement:
      scoreHistory.reduce(
        (sum, s) => sum + (s.financial_planning_score || 0),
        0
      ) / scoreHistory.length,
    retirementPlanning:
      scoreHistory.reduce(
        (sum, s) => sum + (s.investment_knowledge_score || 0),
        0
      ) / scoreHistory.length,
    familyProtection: 0,
  };

  // Add average scores to histogram data
  const histogramDataWithAverage = [
    {
      factor: "Income Stream",
      score: latestScore.budgeting_score || 0,
      average: averageScores.incomeStream,
      fullMark: 100,
    },
    {
      factor: "Saving Habits",
      score: latestScore.savings_score || 0,
      average: averageScores.savingHabits,
      fullMark: 100,
    },
    {
      factor: "Emergency Savings",
      score: latestScore.debt_management_score || 0,
      average: averageScores.emergencySavings,
      fullMark: 100,
    },
    {
      factor: "Debt Management",
      score: latestScore.financial_planning_score || 0,
      average: averageScores.debtManagement,
      fullMark: 100,
    },
    {
      factor: "Retirement Planning",
      score: latestScore.investment_knowledge_score || 0,
      average: averageScores.retirementPlanning,
      fullMark: 100,
    },
    {
      factor: "Family Protection",
      score: 0,
      average: averageScores.familyProtection,
      fullMark: 100,
    },
  ];

  const handleDownloadPDF = async (responseId: number) => {
    try {
      toast.info("Generating PDF report...");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financial-clinic/report/pdf`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            survey_response_id: responseId,
            language: "en",
          }),
        }
      );

      if (response.ok) {
        const contentType = response.headers.get("Content-Type");

        if (contentType?.includes("application/pdf")) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `financial-clinic-report-${responseId}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success("PDF downloaded successfully!");
        } else {
          const data = await response.json();
          toast.warning(data.message || "PDF generation in progress");
        }
      } else {
        toast.error("Failed to generate PDF");
      }
    } catch (error) {
      console.error("PDF download error:", error);
      toast.error("Failed to download PDF");
    }
  };

  const handleEmailReport = async (responseId: number) => {
    if (!userEmail) {
      toast.error("Email address not available");
      return;
    }

    try {
      toast.info("Sending email report...");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financial-clinic/report/email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            survey_response_id: responseId,
            email: userEmail,
            language: "en",
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Email sent successfully!");
      } else {
        toast.warning(data.message || "Email service being configured");
      }
    } catch (error) {
      console.error("Email error:", error);
      toast.error("Failed to send email");
    }
  };

  const getStatusColor = (statusBand: string) => {
    switch (statusBand.toLowerCase()) {
      case "excellent":
        return "text-green-600";
      case "good":
        return "text-blue-600";
      case "needs improvement":
        return "text-amber-600";
      case "at risk":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-3 sm:p-4 md:p-6">
      <div className="container mx-auto max-w-6xl py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onBack}
              size="sm"
              className="shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
                Score History
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Track your financial health progress over time
                {userEmail && (
                  <span className="block text-xs mt-1 truncate">
                    Logged in as: {userEmail}
                  </span>
                )}
              </p>
            </div>
          </div>

          {onLogout && (
            <Button
              variant="outline"
              onClick={() => {
                setIsSigningOut(true);
                toast.loading("Signing out...", { id: "signout" });
                // Add a small delay to show the message
                setTimeout(() => {
                  onLogout();
                  toast.success("Signed out successfully", { id: "signout" });
                }, 500);
              }}
              size="sm"
              className="w-full sm:w-auto"
              disabled={isSigningOut}
            >
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </Button>
          )}
        </div>

        {/* Current Score Summary */}
        <Card className="mb-6 sm:mb-8 border-none shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center col-span-2 md:col-span-1">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                  {Math.round(latestScore.overall_score)}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Current Score
                </div>
              </div>

              {previousScore && (
                <div className="text-center">
                  <div
                    className={`flex items-center justify-center gap-1 sm:gap-2 text-xl sm:text-2xl font-bold mb-2 ${
                      scoreDiff > 0
                        ? "text-green-600"
                        : scoreDiff < 0
                        ? "text-red-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {scoreDiff > 0 ? (
                      <ChartLineUp className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : scoreDiff < 0 ? (
                      <ChartLineDown className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : null}
                    {scoreDiff > 0 ? "+" : ""}
                    {Math.round(scoreDiff)}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Change from Previous
                  </div>
                </div>
              )}

              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold mb-2">
                  {scoreHistory.length}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Total Assessments
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Score Trend */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">
                Score Trend
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Your financial health score progression over time
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="assessment" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip
                      labelFormatter={(label) => `Assessment ${label}`}
                      formatter={(value, name) => [value, "Score"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{
                        fill: "hsl(var(--primary))",
                        strokeWidth: 2,
                        r: 3,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">
                Current Pillar Analysis
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Breakdown of your latest score by the 6 financial health pillars
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="h-96 sm:h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={histogramDataWithAverage}
                    margin={{ top: 20, right: 10, left: 0, bottom: 50 }}
                  >
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
                      label={{
                        value: "Score (%)",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "Current Score")
                          return [
                            `${Math.round(Number(value))}%`,
                            "Current Score",
                          ];
                        if (name === "Average Score")
                          return [
                            `${Math.round(Number(value))}%`,
                            "Average Score",
                          ];
                        return null;
                      }}
                      labelFormatter={(label) => `Category: ${label}`}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: "12px" }}
                    />
                    <Bar
                      dataKey="score"
                      fill="#3b82f6"
                      name="Current Score"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="average"
                      stroke="#f97316"
                      strokeWidth={3}
                      name="Average Score"
                      dot={{ fill: "#f97316", strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assessment History */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">
              Assessment History
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Detailed view of all your completed assessments
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {scoreHistory.map((response, index) => {
                const prevResponse = scoreHistory[index + 1];
                const diff = prevResponse
                  ? response.overall_score - prevResponse.overall_score
                  : 0;

                return (
                  <div
                    key={response.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                      <div className="text-center shrink-0">
                        <div className="text-xl sm:text-2xl font-bold">
                          {Math.round(response.overall_score)}
                        </div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground">
                          {new Date(response.created_at).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {index === 0 && (
                          <Badge
                            variant="default"
                            className="text-[10px] sm:text-xs"
                          >
                            Latest
                          </Badge>
                        )}

                        {response.risk_tolerance && (
                          <Badge
                            variant="outline"
                            className="text-[10px] sm:text-xs"
                          >
                            {response.risk_tolerance}
                          </Badge>
                        )}

                        {diff !== 0 && (
                          <div
                            className={`flex items-center gap-1 text-xs sm:text-sm ${
                              diff > 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {diff > 0 ? (
                              <ChartLineUp className="w-3 h-3 sm:w-4 sm:h-4" />
                            ) : (
                              <ChartLineDown className="w-3 h-3 sm:w-4 sm:h-4" />
                            )}
                            {diff > 0 ? "+" : ""}
                            {Math.round(diff)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                      <div className="text-left sm:text-right sm:mr-4">
                        <div className="text-xs sm:text-sm font-medium">
                          Assessment #{scoreHistory.length - index}
                        </div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground">
                          {new Date(response.created_at).toLocaleTimeString(
                            "en-US",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadPDF(response.id)}
                          className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                        >
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">PDF</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEmailReport(response.id)}
                          className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                        >
                          <EnvelopeSimple className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Email</span>
                        </Button>
                      </div>
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
