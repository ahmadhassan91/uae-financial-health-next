/**
 * Utility functions for consistent score display across components
 */

import { PillarScore } from './types';

/**
 * Calculate pillar percentage with proper fallback handling
 * Uses backend percentage if available, otherwise calculates from score/maxScore
 */
export function calculatePillarPercentage(pillarScore: PillarScore): number {
  // Use backend percentage if available (preferred)
  if (pillarScore.percentage !== undefined && pillarScore.percentage !== null) {
    return Math.max(0, Math.min(100, pillarScore.percentage));
  }
  
  // Fallback to calculation with proper maxScore (5 for Likert scale)
  const score = pillarScore.score || 0;
  const maxScore = pillarScore.maxScore || 5; // Correct fallback for Likert scale
  
  return Math.max(0, Math.min(100, (score / maxScore) * 100));
}

/**
 * Format pillar score for display (e.g., "3.75/5")
 */
export function formatPillarScore(pillarScore: PillarScore): string {
  const score = pillarScore.score || 0;
  const maxScore = pillarScore.maxScore || 5;
  return `${score.toFixed(1)}/${maxScore}`;
}

/**
 * Format percentage for display (e.g., "75%")
 */
export function formatPercentage(percentage: number): string {
  return `${Math.round(percentage)}%`;
}

/**
 * Get pillar display data for charts and components
 */
export function getPillarDisplayData(pillarScore: PillarScore, pillarName?: string) {
  return {
    factor: pillarName || pillarScore.pillar,
    score: calculatePillarPercentage(pillarScore),
    rawScore: pillarScore.score || 0,
    maxScore: pillarScore.maxScore || 5,
    formattedScore: formatPillarScore(pillarScore),
    formattedPercentage: formatPercentage(calculatePillarPercentage(pillarScore)),
    fullMark: 100
  };
}

/**
 * Validate pillar score data
 */
export function isValidPillarScore(pillarScore: any): pillarScore is PillarScore {
  if (!pillarScore || typeof pillarScore !== 'object') {
    return false;
  }
  
  return (
    typeof pillarScore.pillar === 'string' &&
    typeof pillarScore.score === 'number' &&
    !isNaN(pillarScore.score)
  );
}