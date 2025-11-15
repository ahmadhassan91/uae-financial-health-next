import { SurveyResponse, SubScore, CustomerProfile, FinancialFactor, ScoreInterpretation, PillarScore } from './types';
import { apiClient } from './api-client';

// Note: Score calculation is now handled by the backend API
// This file now only contains helper functions for score interpretation and advice generation

export async function calculateScoreV2(
  responses: SurveyResponse[], 
  profile: CustomerProfile | null
): Promise<{ totalScore: number; subScores: SubScore[]; pillarScores: PillarScore[]; maxPossibleScore: number }> {
  // Convert responses to the format expected by the backend
  const responseMap: Record<string, number> = {};
  responses.forEach(r => {
    responseMap[r.questionId] = r.value;
  });

  // Prepare profile data for backend
  const profileData = profile ? { children: profile.children } : null;

  try {
    const result = await apiClient.calculateScorePreview({
      responses: responseMap,
      profile: profileData
    });

    // Convert backend response to frontend format
    const subScores: SubScore[] = result.pillar_scores.map((pillar: any) => ({
      factor: pillar.factor as FinancialFactor,
      name: pillar.name,
      score: pillar.score,
      maxScore: pillar.max_score,
      percentage: pillar.percentage,
      description: getFactorDescription(pillar.factor as FinancialFactor, pillar.score),
      interpretation: getScoreInterpretation(pillar.score)
    }));

    const pillarScores: PillarScore[] = result.pillar_scores.map((pillar: any) => ({
      pillar: pillar.factor as FinancialFactor,
      score: pillar.score,
      maxScore: pillar.max_score,
      percentage: pillar.percentage,
      interpretation: getScoreInterpretation(pillar.score)
    }));

    return {
      totalScore: result.total_score,
      subScores,
      pillarScores,
      maxPossibleScore: result.max_possible_score
    };
  } catch (error) {
    console.error('Error calculating score preview:', error);
    // Fallback to basic calculation if API fails
    return {
      totalScore: 0,
      subScores: [],
      pillarScores: [],
      maxPossibleScore: 75
    };
  }
}

function getScoreInterpretation(score: number): ScoreInterpretation {
  if (score >= 4.0) return 'Excellent';
  if (score >= 3.0) return 'Good';
  if (score >= 2.0) return 'Needs Improvement';
  return 'At Risk';
}

function getFactorDescription(factor: FinancialFactor, score: number): string {
  const level = getScoreInterpretation(score);
  
  const descriptions: Record<FinancialFactor, string> = {
    income_stream: `${level} income stability and diversification`,
    monthly_expenses: `${level} expense management and budgeting`,
    savings_habit: `${level} saving behavior and emergency preparedness`,
    debt_management: `${level} debt control and payment history`,
    retirement_planning: `${level} retirement preparation`,
    protection: `${level} insurance and risk protection`,
    future_planning: `${level} financial planning and goal setting`
  };
  
  return descriptions[factor];
}

export function generateAdviceV2(subScores: SubScore[], totalScore: number): string[] {
  const advice: string[] = [];
  
  // Get overall interpretation
  const overallInterpretation = getOverallInterpretation(totalScore);
  
  // Add general advice based on overall score
  advice.push(getOverallAdvice(overallInterpretation));
  
  // Add specific advice for lowest scoring pillars
  const sortedScores = [...subScores].sort((a, b) => a.score - b.score);
  const lowScores = sortedScores.filter(s => s.score < 3.0).slice(0, 3);
  
  lowScores.forEach(subScore => {
    const specificAdvice = getPillarAdvice(subScore.factor, subScore.score);
    if (specificAdvice) {
      advice.push(specificAdvice);
    }
  });
  
  // If no specific advice needed, add maintenance advice
  if (lowScores.length === 0) {
    advice.push("Your financial health is strong! Continue monitoring and optimizing your strategies for long-term success.");
  }
  
  return advice;
}

function getOverallInterpretation(totalScore: number): ScoreInterpretation {
  if (totalScore >= 60) return 'Excellent';
  if (totalScore >= 45) return 'Good';
  if (totalScore >= 30) return 'Needs Improvement';
  return 'At Risk';
}

function getOverallAdvice(interpretation: ScoreInterpretation): string {
  const adviceMap: Record<ScoreInterpretation, string> = {
    'Excellent': 'You have strong financial habits, clear goals, and good resilience. Maintain and optimize your strategies.',
    'Good': "You're on the right track, but there's room for improvement in some areas. Focus on weak spots like debt, savings, or planning.",
    'Needs Improvement': 'Financial health is unstable. You should address debt, budgeting, and savings urgently.',
    'At Risk': 'High financial vulnerability. Immediate corrective actions are needed to stabilize your finances.'
  };
  
  return adviceMap[interpretation];
}

function getPillarAdvice(factor: FinancialFactor, score: number): string {
  const adviceMap: Record<FinancialFactor, string[]> = {
    income_stream: [
      "Consider developing multiple income streams through side businesses or investments",
      "Focus on improving job security and skill development for stable income",
      "Explore passive income opportunities like dividends or rental properties"
    ],
    monthly_expenses: [
      "Create and stick to a detailed monthly budget using budgeting apps",
      "Review and eliminate unnecessary expenses regularly",
      "Implement the 50/30/20 rule: 50% needs, 30% wants, 20% savings"
    ],
    savings_habit: [
      "Start with saving at least 20% of your monthly income",
      "Build an emergency fund covering 6+ months of expenses",
      "Optimize your savings by using high-yield accounts and investments"
    ],
    debt_management: [
      "Focus on paying all bills and loan installments on time consistently",
      "Keep debt repayments below 30% of monthly income",
      "Monitor and actively work to improve your credit score"
    ],
    retirement_planning: [
      "Start or enhance your retirement savings plan immediately",
      "Consider pension funds and long-term investment options",
      "Plan for securing stable income during retirement years"
    ],
    protection: [
      "Ensure you have adequate insurance coverage for health, life, motor, and property",
      "Review your insurance needs annually and adjust coverage accordingly",
      "Consider takaful options that align with your values and requirements"
    ],
    future_planning: [
      "Develop a written financial plan with clear 3-5 year goals",
      "If you have children, plan adequately for their education and future needs",
      "Review and update your financial plans regularly based on life changes"
    ]
  };
  
  const options = adviceMap[factor];
  // Return deterministic advice based on score level
  const index = Math.floor((5 - score) * options.length / 4);
  return options[Math.min(index, options.length - 1)];
}