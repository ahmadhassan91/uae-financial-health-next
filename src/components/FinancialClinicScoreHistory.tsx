import React, { useRef } from "react";
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
import { useLocalization } from "@/contexts/LocalizationContext";

interface CategoryScore {
  score: number;
  max_possible: number;
  percentage: number;
  status_level: string;
}

interface FinancialClinicResponse {
  id: number;
  overall_score: number;
  category_scores: {
    "Income Stream": CategoryScore;
    "Savings Habit": CategoryScore;
    "Emergency Savings": CategoryScore;
    "Debt Management": CategoryScore;
    "Retirement Planning": CategoryScore;
    "Protecting Your Family": CategoryScore;
  };
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
  const { t, language, isRTL } = useLocalization();
  const downloadingRef = useRef<Set<number>>(new Set());

  // Helper function to safely get category score percentage
  const getCategoryPercentage = (
    response: FinancialClinicResponse,
    categoryName: string
  ): number => {
    if (!response.category_scores) return 0;
    const categoryScore =
      response.category_scores[
        categoryName as keyof typeof response.category_scores
      ];
    return categoryScore?.percentage || 0;
  };

  // Helper function to translate risk_tolerance or status_band
  const translateRiskTolerance = (value: string): string => {
    if (!value) return "";

    const translations: Record<string, { en: string; ar: string }> = {
      // Risk tolerance values
      low: { en: "Low", ar: "منخفض" },
      moderate: { en: "Moderate", ar: "معتدل" },
      high: { en: "High", ar: "عالي" },
      // Status band values (in case they're stored in risk_tolerance field)
      excellent: { en: "Excellent", ar: "ممتاز" },
      good: { en: "Good", ar: "جيد" },
      "needs improvement": { en: "Needs Improvement", ar: "بحاجة إلى تحسين" },
      "at risk": { en: "At Risk", ar: "في خطر" },
      fair: { en: "Fair", ar: "مقبول" },
    };

    const key = value.toLowerCase().trim();
    const translation = translations[key];

    if (translation) {
      return language === "ar" ? translation.ar : translation.en;
    }

    return value;
  };
  if (!scoreHistory || scoreHistory.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="container mx-auto max-w-4xl py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">{t("score_history")}</h1>
            <p className="text-muted-foreground mb-8">
              {t("no_previous_assessments")}
            </p>
            <Button onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("back_to_assessment")}
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

  // Check if category_scores exists and has data
  if (
    !latestScore.category_scores ||
    Object.keys(latestScore.category_scores).length === 0
  ) {
    console.warn("⚠️ WARNING: category_scores is missing or empty!");
    console.warn(
      "This might be old localStorage data. Try taking a new assessment."
    );
  }

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

  // Prepare histogram data for latest score using category scores from API
  // Prepare data for histogram using category names from API
  const getCategoryName = (categoryKey: string) => {
    const categoryMap: Record<string, string> = {
      "Income Stream": t("income_stream"),
      "Savings Habit": t("savings_habit"),
      "Emergency Savings": t("emergency_savings"),
      "Debt Management": t("debt_management"),
      "Retirement Planning": t("retirement_planning"),
      "Protecting Your Family": t("protecting_your_family"),
    };
    return categoryMap[categoryKey] || categoryKey;
  };

  const histogramData = [
    {
      factor: getCategoryName("Income Stream"),
      score: getCategoryPercentage(latestScore, "Income Stream"),
      fullMark: 100,
    },
    {
      factor: getCategoryName("Savings Habit"),
      score: getCategoryPercentage(latestScore, "Savings Habit"),
      fullMark: 100,
    },
    {
      factor: getCategoryName("Emergency Savings"),
      score: getCategoryPercentage(latestScore, "Emergency Savings"),
      fullMark: 100,
    },
    {
      factor: getCategoryName("Debt Management"),
      score: getCategoryPercentage(latestScore, "Debt Management"),
      fullMark: 100,
    },
    {
      factor: getCategoryName("Retirement Planning"),
      score: getCategoryPercentage(latestScore, "Retirement Planning"),
      fullMark: 100,
    },
    {
      factor: getCategoryName("Protecting Your Family"),
      score: getCategoryPercentage(latestScore, "Protecting Your Family"),
      fullMark: 100,
    },
  ];

  // Calculate average scores across all assessments for comparison
  const averageScores = {
    incomeStream:
      scoreHistory.reduce(
        (sum, s) => sum + getCategoryPercentage(s, "Income Stream"),
        0
      ) / scoreHistory.length,
    savingHabits:
      scoreHistory.reduce(
        (sum, s) => sum + getCategoryPercentage(s, "Savings Habit"),
        0
      ) / scoreHistory.length,
    emergencySavings:
      scoreHistory.reduce(
        (sum, s) => sum + getCategoryPercentage(s, "Emergency Savings"),
        0
      ) / scoreHistory.length,
    debtManagement:
      scoreHistory.reduce(
        (sum, s) => sum + getCategoryPercentage(s, "Debt Management"),
        0
      ) / scoreHistory.length,
    retirementPlanning:
      scoreHistory.reduce(
        (sum, s) => sum + getCategoryPercentage(s, "Retirement Planning"),
        0
      ) / scoreHistory.length,
    familyProtection:
      scoreHistory.reduce(
        (sum, s) => sum + getCategoryPercentage(s, "Protecting Your Family"),
        0
      ) / scoreHistory.length,
  };

  // Add average scores to histogram data
  const histogramDataWithAverage = [
    {
      factor: getCategoryName("Income Stream"),
      score: getCategoryPercentage(latestScore, "Income Stream"),
      average: averageScores.incomeStream,
      fullMark: 100,
    },
    {
      factor: getCategoryName("Savings Habit"),
      score: getCategoryPercentage(latestScore, "Savings Habit"),
      average: averageScores.savingHabits,
      fullMark: 100,
    },
    {
      factor: getCategoryName("Emergency Savings"),
      score: getCategoryPercentage(latestScore, "Emergency Savings"),
      average: averageScores.emergencySavings,
      fullMark: 100,
    },
    {
      factor: getCategoryName("Debt Management"),
      score: getCategoryPercentage(latestScore, "Debt Management"),
      average: averageScores.debtManagement,
      fullMark: 100,
    },
    {
      factor: getCategoryName("Retirement Planning"),
      score: getCategoryPercentage(latestScore, "Retirement Planning"),
      average: averageScores.retirementPlanning,
      fullMark: 100,
    },
    {
      factor: getCategoryName("Protecting Your Family"),
      score: getCategoryPercentage(latestScore, "Protecting Your Family"),
      average: averageScores.familyProtection,
      fullMark: 100,
    },
  ];

  const handleDownloadPDF = async (responseId: number) => {
    // Prevent duplicate downloads
    if (downloadingRef.current.has(responseId)) {
      return;
    }

    try {
      downloadingRef.current.add(responseId);
      toast.info(t("generating_pdf_report"));

      // Check if this is a guest user with a timestamp ID (fake ID from localStorage)
      // Timestamp IDs are > 1000000000000 (year 2001 in milliseconds)
      const isGuestUser = responseId > 1000000000000;

      let requestBody: any;

      if (isGuestUser) {
        // For guest users, send the result and profile from localStorage
        const storedResult = localStorage.getItem("financialClinicResult");
        const storedProfile = localStorage.getItem("financialClinicProfile");

        if (!storedResult) {
          toast.error(t("no_assessment_data_found"));
          return;
        }

        requestBody = {
          result: JSON.parse(storedResult),
          profile: storedProfile ? JSON.parse(storedProfile) : {},
          language: language,
        };
      } else {
        // For authenticated users, use survey_response_id
        requestBody = {
          survey_response_id: responseId,
          language: language,
        };
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financial-clinic/report/pdf`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
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
          toast.success(t("pdf_downloaded_successfully"));
        } else {
          const data = await response.json();
          toast.warning(data.message || t("pdf_generation_in_progress"));
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || t("failed_to_generate_pdf"));
      }
    } catch (error) {
      console.error("PDF download error:", error);
      toast.error(t("failed_to_download_pdf"));
    } finally {
      downloadingRef.current.delete(responseId);
    }
  };

  const handleEmailReport = async (responseId: number) => {
    if (!userEmail) {
      toast.error(t("email_address_not_available"));
      return;
    }

    try {
      toast.info(t("sending_email_report"));

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
            language: language,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(t("email_sent_successfully"));
      } else {
        toast.warning(data.message || t("email_service_being_configured"));
      }
    } catch (error) {
      console.error("Email error:", error);
      toast.error(t("failed_to_send_email"));
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
    <div className="min-h-screen bg-gradient-to-br p-3 sm:p-4 md:p-6">
      <div className="container mx-auto max-w-6xl py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="flex-1 min-w-0">
                <h1
                  className="font-bold"
                  style={{ textAlign: "center", fontSize: "24px" }}
                >
                  {t("score_history")}
                </h1>
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t("track_your_financial_health_progress")}
                  </p>
                  {userEmail && (
                    <span className="block text-xs mt-1 truncate text-center">
                      {t("logged_in_as", { email: userEmail })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div>
            {onLogout && (
              <Button
                variant="outline"
                onClick={onLogout}
                size="sm"
                className="w-full sm:w-auto"
              >
                {t("sign_out")}
              </Button>
            )}
          </div>
        </div>
        {/* Current Score Summary */}
        <Card
          className="mb-6 sm:mb-8"
          style={{ backgroundColor: "#eaf0f3ff", borderRadius: "1px" }}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center col-span-2 md:col-span-1">
                <div className="text-3xl sm:text-4xl font-bold text-[#5E5E5E] mb-2">
                  {Math.round(latestScore.overall_score)}
                </div>
                <div
                  className="text-xs sm:text-sm text-muted-foreground"
                  style={{ color: "#737373" }}
                >
                  {t("current_score")}
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
                    {t("change_from_previous")}
                  </div>
                </div>
              )}

              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-[#5E5E5E] mb-2">
                  {scoreHistory.length}
                </div>
                <div
                  className="text-xs sm:text-sm text-muted-foreground"
                  style={{ color: "#737373" }}
                >
                  {t("total_assessments")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Score Trend */}
          <Card style={{ backgroundColor: "#eaf0f3ff", borderRadius: "1px" }}>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">
                {t("score_trend")}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t("your_financial_health_score_progression")}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="assessment"
                      tick={{ fontSize: 10 }}
                      reversed={isRTL}
                      tickMargin={5}
                      axisLine={{ stroke: "#ccc" }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{
                        fontSize: 9,
                        dx: isRTL ? 10 : 0,
                        dy: isRTL ? 0 : 0,
                      }}
                      orientation={isRTL ? "right" : "left"}
                      tickMargin={5}
                      axisLine={{ stroke: "#ccc" }}
                      label={{
                        value: t("score_percentage"),
                        angle: -90,
                        position: isRTL ? "insideRight" : "insideLeft",
                        style: { fontSize: 10 },
                      }}
                    />
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
          <Card style={{ backgroundColor: "#eaf0f3ff", borderRadius: "1px" }}>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">
                {t("current_pillar_analysis")}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t("breakdown_of_your_latest_score")}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="h-96 sm:h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={histogramDataWithAverage}
                    margin={{
                      top: 20,
                      right: isRTL ? 20 : 10,
                      left: isRTL ? 10 : 0,
                      bottom: 80,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="factor"
                      tick={{
                        fontSize: 9,
                        dx: isRTL ? 25 : 0,
                        dy: isRTL ? 10 : 0,
                      }}
                      angle={isRTL ? -10 : -15}
                      textAnchor={isRTL ? "start" : "end"}
                      height={120}
                      interval={0}
                      tickMargin={15}
                      axisLine={{ stroke: "#ccc" }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{
                        fontSize: 9,
                        dx: isRTL ? 10 : 0,
                        dy: isRTL ? 0 : 0,
                      }}
                      orientation={isRTL ? "right" : "left"}
                      tickMargin={10}
                      axisLine={{ stroke: "#ccc" }}
                      label={{
                        value: t("score_percentage"),
                        angle: -90,
                        position: isRTL ? "insideRight" : "insideLeft",
                      }}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === t("current_score_chart"))
                          return [
                            `${Math.round(Number(value))}%`,
                            t("current_score_chart"),
                          ];
                        if (name === t("average_score"))
                          return [
                            `${Math.round(Number(value))}%`,
                            t("average_score"),
                          ];
                        return null;
                      }}
                      labelFormatter={(label) => `${t("category")}: ${label}`}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: "12px" }}
                    />
                    <Bar
                      dataKey="score"
                      fill="#5E5E5E"
                      name={t("current_score_chart")}
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="average"
                      stroke="#AF8F39"
                      strokeWidth={3}
                      name={t("average_score")}
                      dot={{ fill: "#AF8F39", strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assessment History */}
        <div className="mt-6 sm:mt-8" style={{ marginTop: "100px" }}>
          <div className="mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-[#5E5E5E]">
              {t("assessment_history")}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("detailed_view_of_all_assessments")}
            </p>
          </div>

          <div className="divide-y border-y">
            {scoreHistory.map((response, index) => {
              const prevResponse = scoreHistory[index + 1];
              const diff = prevResponse
                ? response.overall_score - prevResponse.overall_score
                : 0;

              return (
                <div
                  key={response.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 py-3 sm:py-4"
                >
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="text-left shrink-0">
                      <div className="text-xl sm:text-2xl font-bold text-[#bd912e]">
                        {Math.round(response.overall_score)}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">
                        {new Date(response.created_at).toLocaleDateString(
                          "en-US",
                          { day: "2-digit", month: "2-digit", year: "numeric" }
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {index === 0 && (
                        <Badge
                          variant="default"
                          className="text-[10px] sm:text-xs"
                        >
                          {t("latest")}
                        </Badge>
                      )}

                      {response.risk_tolerance && (
                        <Badge
                          variant="outline"
                          className="text-[10px] sm:text-xs"
                        >
                          {translateRiskTolerance(response.risk_tolerance)}
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
                    <div className="text-right sm:mr-4">
                      <div className="text-xs sm:text-sm font-medium">
                        {t("assessment_number", {
                          number: scoreHistory.length - index,
                        })}
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
                        <span className="hidden sm:inline">{t("pdf")}</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEmailReport(response.id)}
                        className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                      >
                        <EnvelopeSimple className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">{t("email")}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* <Button
          variant="outline"
          onClick={onBack}
          size="sm"
          className="shrink-0"
        >
          <div className="w-4 h-4">Back</div>
        </Button> */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Button
            onClick={onBack}
            className="h-auto items-center justify-center gap-2.5 p-2.5 px-4 sm:px-6 bg-[#5E5E5E] hover:bg-[#5E5E5EF]/90 whitespace-nowrap"
            style={{ width: "20%", borderRadius: "1px", marginTop: "5%" }}
          >
            <span className="w-fit mt-[-1.00px] font-normal text-white text-xs sm:text-sm text-center tracking-[0] leading-[18px] whitespace-normal sm:whitespace-nowrap">
              {t("back")}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
