'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScoreResult } from '@/components/legacy/ScoreResult';
import { LandingPage } from '@/components/legacy/LandingPage';
import { useSurvey } from '@/hooks/legacy/use-survey';
import { ScoreCalculation } from '@/lib/types';

export default function ResultsPage() {
  const router = useRouter();
  const [currentScore, setCurrentScore] = useState<ScoreCalculation | null>(null);
  const { resetSurvey } = useSurvey();

  useEffect(() => {
    try {
      // Get the score from localStorage
      const storedScore = localStorage.getItem('currentScore');
      if (storedScore) {
        const parsedScore = JSON.parse(storedScore);
        // Validate required fields - only check for totalScore
        if (!parsedScore || (parsedScore.totalScore === undefined || parsedScore.totalScore === null)) {
          console.error('Invalid score data:', parsedScore);
          router.push('/survey');
          return;
        }
        setCurrentScore(parsedScore);
      }
    } catch (error) {
      console.error('Error loading score:', error);
      router.push('/survey');
    }
  }, [router]);

  const handleRetakeSurvey = () => {
    resetSurvey();
    setCurrentScore(null);
    localStorage.removeItem('currentScore');
    router.push('/profile');
  };

  const handleViewHistory = () => {
    router.push('/history');
  };

  const handleStartSurvey = () => {
    router.push('/consent');
  };

  const handleAdminAccess = () => {
    router.push('/admin');
  };

  // If no score, show message to complete survey first
  if (!currentScore) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="container mx-auto max-w-4xl py-8 text-center">
          <h1 className="text-3xl font-bold mb-4">No Results Available</h1>
          <p className="text-muted-foreground mb-8">
            You need to complete the financial health assessment first to see your results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleStartSurvey} size="lg" className="flex items-center gap-2">
              Start Assessment
            </Button>
            <Button onClick={() => router.push('/')} variant="outline" size="lg">
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScoreResult
      scoreCalculation={currentScore}
      onRetake={handleRetakeSurvey}
      onViewHistory={handleViewHistory}
    />
  );
}
