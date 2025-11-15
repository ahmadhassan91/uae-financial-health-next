'use client';

import React from 'react';
import { ScoreHistory } from '@/components/ScoreHistory';
import { ScoreCalculation } from '@/lib/types';

export default function TestScoreHistoryPage() {
  // Mock score history data
  const mockScoreHistory: ScoreCalculation[] = [
    {
      totalScore: 72,
      pillarScores: [
        { pillar: 'income_stream', score: 4.2 },
        { pillar: 'monthly_expenses', score: 3.8 },
        { pillar: 'savings_habit', score: 4.5 },
        { pillar: 'debt_management', score: 3.9 },
        { pillar: 'retirement_planning', score: 4.1 },
        { pillar: 'protection', score: 3.7 }
      ],
      advice: [
        'Consider increasing your emergency fund',
        'Review your investment portfolio',
        'Look into additional income streams'
      ],
      createdAt: new Date().toISOString(),
      surveyResponseId: 'test-1'
    },
    {
      totalScore: 68,
      pillarScores: [
        { pillar: 'income_stream', score: 4.0 },
        { pillar: 'monthly_expenses', score: 3.6 },
        { pillar: 'savings_habit', score: 4.3 },
        { pillar: 'debt_management', score: 3.7 },
        { pillar: 'retirement_planning', score: 3.9 },
        { pillar: 'protection', score: 3.5 }
      ],
      advice: [
        'Focus on expense management',
        'Increase retirement contributions'
      ],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      surveyResponseId: 'test-2'
    },
    {
      totalScore: 65,
      pillarScores: [
        { pillar: 'income_stream', score: 3.8 },
        { pillar: 'monthly_expenses', score: 3.4 },
        { pillar: 'savings_habit', score: 4.1 },
        { pillar: 'debt_management', score: 3.5 },
        { pillar: 'retirement_planning', score: 3.7 },
        { pillar: 'protection', score: 3.3 }
      ],
      advice: [
        'Build emergency fund',
        'Review insurance coverage'
      ],
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
      surveyResponseId: 'test-3'
    }
  ];

  const handleBack = () => {
    console.log('Back button clicked');
  };

  const handleLogout = () => {
    console.log('Logout button clicked');
  };

  return (
    <ScoreHistory 
      scoreHistory={mockScoreHistory}
      onBack={handleBack}
      onLogout={handleLogout}
      userEmail="test@example.com"
    />
  );
}