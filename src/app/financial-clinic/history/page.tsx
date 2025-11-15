'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FinancialClinicScoreHistory } from '@/components/FinancialClinicScoreHistory';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  const { isAuthenticated, isLoading: authLoading, session, user, logout: authLogout } = useAuth();
  const [assessments, setAssessments] = useState<AssessmentHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/financial-clinic/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch user's assessment history
  useEffect(() => {
    if (!session || !isAuthenticated) {
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/financial-clinic/history`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.accessToken}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            toast.error('Session expired. Please login again.');
            authLogout();
            router.push('/financial-clinic/login');
            return;
          }
          throw new Error('Failed to fetch assessment history');
        }

        const data = await response.json();
        
        // Transform API response to match component interface
        const transformedData = data.map((item: AssessmentHistory) => {
          const categoryScores = item.category_scores || {};
          
          return {
            id: item.id,
            overall_score: item.total_score || 0,
            // Map Financial Clinic categories to component fields
            budgeting_score: (categoryScores['Income Stream']?.score || 0),
            savings_score: (categoryScores['Savings Habit']?.score || 0) + (categoryScores['Emergency Savings']?.score || 0),
            debt_management_score: categoryScores['Debt Management']?.score || 0,
            financial_planning_score: categoryScores['Retirement Planning']?.score || 0,
            investment_knowledge_score: categoryScores['Protecting Your Family']?.score || 0,
            risk_tolerance: item.status_band || 'Unknown',
            created_at: item.created_at,
          };
        });
        
        setAssessments(transformedData);
      } catch (error) {
        console.error('Error fetching history:', error);
        toast.error('Failed to load assessment history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [session, isAuthenticated, router, authLogout]);

  const handleBackToHome = () => {
    router.push('/financial-clinic');
  };

  const handleLogout = () => {
    authLogout();
    router.push('/financial-clinic/login');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <FinancialClinicScoreHistory
      scoreHistory={assessments as any}
      onBack={handleBackToHome}
      onLogout={handleLogout}
      userEmail={user?.email}
    />
  );
}
