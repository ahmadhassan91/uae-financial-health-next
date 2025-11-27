"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FinancialClinicScoreHistory } from "@/components/FinancialClinicScoreHistory";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { HomepageHeader } from "@/components/homepage/Header";
import { HomepageFooter } from "@/components/homepage/Footer";
import { getApiUrl, API } from "@/lib/api-config";

interface CategoryScore {
  score: number;
  max_score: number;
  percentage: number;
}

interface AssessmentHistory {
  id: number;
  total_score: number;
  status_band: string;
  status_level: number;
  created_at: string;
  category_scores: Record<string, CategoryScore>;
  questions_answered: number;
}

export default function FinancialClinicHistoryPage() {
  const router = useRouter();
  const {
    isAuthenticated,
    isLoading: authLoading,
    session,
    user,
    logout: authLogout,
  } = useAuth();
  const [assessments, setAssessments] = useState<AssessmentHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated and no email in profile
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // Check if there's an email in localStorage
      const storedProfile = localStorage.getItem("financialClinicProfile");
      if (!storedProfile) {
        router.push("/financial-clinic/login");
      }
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch user's assessment history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);

        // First check if user is authenticated
        if (session && isAuthenticated) {
          const response = await fetch(API.financialClinic.history(), {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.accessToken}`,
            },
          });

          if (!response.ok) {
            if (response.status === 401) {
              toast.error("Session expired. Please login again.");
              authLogout();
              router.push("/financial-clinic/login");
              return;
            }
            throw new Error("Failed to fetch assessment history");
          }

          const data = await response.json();

          // Transform API response to match component interface
          // Handle both array response and empty data
          const dataArray = Array.isArray(data) ? data : [];

          const transformedData = dataArray.map((item: AssessmentHistory) => {
            const categoryScores = item.category_scores || {};

            return {
              id: item.id,
              overall_score: item.total_score || 0,
              // Map Financial Clinic categories to component fields
              budgeting_score: categoryScores["Income Stream"]?.score || 0,
              savings_score:
                (categoryScores["Savings Habit"]?.score || 0) +
                (categoryScores["Emergency Savings"]?.score || 0),
              debt_management_score:
                categoryScores["Debt Management"]?.score || 0,
              financial_planning_score:
                categoryScores["Retirement Planning"]?.score || 0,
              investment_knowledge_score:
                categoryScores["Protecting Your Family"]?.score || 0,
              risk_tolerance: item.status_band || "Unknown",
              created_at: item.created_at,
            };
          });

          setAssessments(transformedData);
        } else {
          // For guest users, first check if there's a current result in localStorage
          const currentResult = localStorage.getItem("financialClinicResult");

          if (currentResult) {
            try {
              const result = JSON.parse(currentResult);
              const categoryScores = result.category_scores || {};

              // Create a single assessment from the current result
              const currentAssessment = {
                id: Date.now(), // Use timestamp as temporary ID
                overall_score: result.total_score || 0,
                budgeting_score: categoryScores["Income Stream"]?.score || 0,
                savings_score:
                  (categoryScores["Savings Habit"]?.score || 0) +
                  (categoryScores["Emergency Savings"]?.score || 0),
                debt_management_score:
                  categoryScores["Debt Management"]?.score || 0,
                financial_planning_score:
                  categoryScores["Retirement Planning"]?.score || 0,
                investment_knowledge_score:
                  categoryScores["Protecting Your Family"]?.score || 0,
                risk_tolerance: result.status_band || "Unknown",
                created_at: new Date().toISOString(),
              };

              setAssessments([currentAssessment]);
              setLoading(false);
              return;
            } catch (error) {
              console.error("Error parsing current result:", error);
            }
          }

          // If no current result, try to fetch using email from profile
          const storedProfile = localStorage.getItem("financialClinicProfile");

          if (storedProfile) {
            try {
              const profile = JSON.parse(storedProfile);
              const email = profile.email;

              if (email) {
                const response = await fetch(
                  API.financialClinic.historyByEmail(email)
                );

                if (response.ok) {
                  const data = await response.json();

                  // Transform API response
                  // Handle both array response and empty data
                  const dataArray = Array.isArray(data) ? data : [];

                  const transformedData = dataArray.map((item: any) => {
                    const categoryScores = item.category_scores || {};

                    return {
                      id: item.id,
                      overall_score: item.total_score || 0,
                      budgeting_score:
                        categoryScores["Income Stream"]?.score || 0,
                      savings_score:
                        (categoryScores["Savings Habit"]?.score || 0) +
                        (categoryScores["Emergency Savings"]?.score || 0),
                      debt_management_score:
                        categoryScores["Debt Management"]?.score || 0,
                      financial_planning_score:
                        categoryScores["Retirement Planning"]?.score || 0,
                      investment_knowledge_score:
                        categoryScores["Protecting Your Family"]?.score || 0,
                      risk_tolerance: item.status_band || "Unknown",
                      created_at: item.created_at,
                    };
                  });

                  setAssessments(transformedData);
                }
              }
            } catch (error) {
              console.error(
                "Error parsing profile or fetching history:",
                error
              );
            }
          }
        }
      } catch (error) {
        console.error("Error fetching history:", error);
        toast.error("Failed to load assessment history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [session, isAuthenticated, router, authLogout]);

  const handleBackToHome = () => {
    // Check if there's a current result in localStorage (user came from results page)
    const hasCurrentResult = localStorage.getItem("financialClinicResult");

    if (hasCurrentResult) {
      // Go back to results page
      router.push("/financial-clinic/results");
    } else {
      // No current result, go to home
      router.push("/financial-clinic");
    }
  };

  const handleLogout = () => {
    authLogout();
    router.push("/financial-clinic/login");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <HomepageHeader />
        <div className="flex-1 bg-gradient-to-br from-background to-secondary/20 p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your assessments...</p>
          </div>
        </div>
        <HomepageFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <HomepageHeader />
      <div className="flex-1">
        <FinancialClinicScoreHistory
          scoreHistory={assessments as any}
          onBack={handleBackToHome}
          onLogout={handleLogout}
          userEmail={user?.email}
        />
      </div>
      <HomepageFooter />
    </div>
  );
}
