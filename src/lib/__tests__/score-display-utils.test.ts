/**
 * Unit tests for score display utilities
 * Tests the consistency and correctness of score calculation functions
 */

import {
  calculatePillarPercentage,
  formatPillarScore,
  formatPercentage,
  getPillarDisplayData,
  isValidPillarScore
} from '../score-display-utils';
import { PillarScore } from '../types';

describe('Score Display Utilities', () => {
  describe('calculatePillarPercentage', () => {
    it('should use backend percentage when available', () => {
      const pillarScore: PillarScore = {
        pillar: 'financial_planning',
        score: 3.75,
        maxScore: 5,
        percentage: 85
      };

      expect(calculatePillarPercentage(pillarScore)).toBe(85);
    });

    it('should calculate percentage from score/maxScore when backend percentage is missing', () => {
      const pillarScore: PillarScore = {
        pillar: 'financial_planning',
        score: 3.75,
        maxScore: 5
      };

      expect(calculatePillarPercentage(pillarScore)).toBe(75);
    });

    it('should use fallback maxScore of 5 when undefined', () => {
      const pillarScore: PillarScore = {
        pillar: 'financial_planning',
        score: 3,
        maxScore: undefined as any
      };

      expect(calculatePillarPercentage(pillarScore)).toBe(60);
    });

    it('should handle zero scores correctly', () => {
      const pillarScore: PillarScore = {
        pillar: 'financial_planning',
        score: 0,
        maxScore: 5
      };

      expect(calculatePillarPercentage(pillarScore)).toBe(0);
    });

    it('should handle perfect scores correctly', () => {
      const pillarScore: PillarScore = {
        pillar: 'financial_planning',
        score: 5,
        maxScore: 5
      };

      expect(calculatePillarPercentage(pillarScore)).toBe(100);
    });

    it('should clamp percentages to 0-100 range', () => {
      const pillarScoreNegative: PillarScore = {
        pillar: 'financial_planning',
        score: 0,
        maxScore: 5,
        percentage: -10
      };

      const pillarScoreOver100: PillarScore = {
        pillar: 'financial_planning',
        score: 0,
        maxScore: 5,
        percentage: 150
      };

      expect(calculatePillarPercentage(pillarScoreNegative)).toBe(0);
      expect(calculatePillarPercentage(pillarScoreOver100)).toBe(100);
    });

    it('should handle missing score with fallback to 0', () => {
      const pillarScore: PillarScore = {
        pillar: 'financial_planning',
        score: undefined as any,
        maxScore: 5
      };

      expect(calculatePillarPercentage(pillarScore)).toBe(0);
    });
  });

  describe('formatPillarScore', () => {
    it('should format score correctly with one decimal place', () => {
      const pillarScore: PillarScore = {
        pillar: 'financial_planning',
        score: 3.75,
        maxScore: 5
      };

      expect(formatPillarScore(pillarScore)).toBe('3.8/5');
    });

    it('should handle integer scores', () => {
      const pillarScore: PillarScore = {
        pillar: 'financial_planning',
        score: 4,
        maxScore: 5
      };

      expect(formatPillarScore(pillarScore)).toBe('4.0/5');
    });

    it('should use fallback values for missing data', () => {
      const pillarScore: PillarScore = {
        pillar: 'financial_planning',
        score: undefined as any,
        maxScore: undefined as any
      };

      expect(formatPillarScore(pillarScore)).toBe('0.0/5');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage with no decimal places', () => {
      expect(formatPercentage(75.6)).toBe('76%');
      expect(formatPercentage(75.4)).toBe('75%');
      expect(formatPercentage(75)).toBe('75%');
    });

    it('should handle edge cases', () => {
      expect(formatPercentage(0)).toBe('0%');
      expect(formatPercentage(100)).toBe('100%');
      expect(formatPercentage(99.9)).toBe('100%');
      expect(formatPercentage(0.1)).toBe('0%');
    });
  });

  describe('getPillarDisplayData', () => {
    it('should return complete display data object', () => {
      const pillarScore: PillarScore = {
        pillar: 'financial_planning',
        score: 3.75,
        maxScore: 5,
        percentage: 85
      };

      const displayData = getPillarDisplayData(pillarScore, 'Financial Planning');

      expect(displayData).toEqual({
        factor: 'Financial Planning',
        score: 85,
        rawScore: 3.75,
        maxScore: 5,
        formattedScore: '3.8/5',
        formattedPercentage: '85%',
        fullMark: 100
      });
    });

    it('should use pillar key as factor name when name not provided', () => {
      const pillarScore: PillarScore = {
        pillar: 'financial_planning',
        score: 3.75,
        maxScore: 5
      };

      const displayData = getPillarDisplayData(pillarScore);

      expect(displayData.factor).toBe('financial_planning');
    });

    it('should calculate percentage when not provided by backend', () => {
      const pillarScore: PillarScore = {
        pillar: 'financial_planning',
        score: 3.75,
        maxScore: 5
      };

      const displayData = getPillarDisplayData(pillarScore);

      expect(displayData.score).toBe(75);
      expect(displayData.formattedPercentage).toBe('75%');
    });
  });

  describe('isValidPillarScore', () => {
    it('should validate correct pillar score objects', () => {
      const validPillarScore: PillarScore = {
        pillar: 'financial_planning',
        score: 3.75,
        maxScore: 5
      };

      expect(isValidPillarScore(validPillarScore)).toBe(true);
    });

    it('should reject null and undefined values', () => {
      expect(isValidPillarScore(null)).toBe(false);
      expect(isValidPillarScore(undefined)).toBe(false);
    });

    it('should reject non-object values', () => {
      expect(isValidPillarScore('string')).toBe(false);
      expect(isValidPillarScore(123)).toBe(false);
      expect(isValidPillarScore([])).toBe(false);
    });

    it('should reject objects missing required properties', () => {
      expect(isValidPillarScore({})).toBe(false);
      expect(isValidPillarScore({ pillar: 'test' })).toBe(false);
      expect(isValidPillarScore({ score: 3.75 })).toBe(false);
    });

    it('should reject objects with invalid property types', () => {
      expect(isValidPillarScore({
        pillar: 123,
        score: 3.75,
        maxScore: 5
      })).toBe(false);

      expect(isValidPillarScore({
        pillar: 'test',
        score: 'invalid',
        maxScore: 5
      })).toBe(false);

      expect(isValidPillarScore({
        pillar: 'test',
        score: NaN,
        maxScore: 5
      })).toBe(false);
    });

    it('should accept objects with optional properties', () => {
      const pillarScoreWithPercentage: PillarScore = {
        pillar: 'financial_planning',
        score: 3.75,
        maxScore: 5,
        percentage: 75
      };

      expect(isValidPillarScore(pillarScoreWithPercentage)).toBe(true);
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle the original bug case (3.75/5 should be 75% not 15%)', () => {
      const pillarScore: PillarScore = {
        pillar: 'financial_planning',
        score: 3.75,
        maxScore: 5
      };

      const percentage = calculatePillarPercentage(pillarScore);
      expect(percentage).toBe(75);
      expect(percentage).not.toBe(15); // The original bug
    });

    it('should maintain consistency across all utility functions', () => {
      const pillarScore: PillarScore = {
        pillar: 'financial_planning',
        score: 3.75,
        maxScore: 5,
        percentage: 85
      };

      const percentage = calculatePillarPercentage(pillarScore);
      const displayData = getPillarDisplayData(pillarScore);
      const formattedScore = formatPillarScore(pillarScore);
      const formattedPercentage = formatPercentage(percentage);

      // All should be consistent
      expect(displayData.score).toBe(percentage);
      expect(displayData.formattedPercentage).toBe(formattedPercentage);
      expect(displayData.formattedScore).toBe(formattedScore);
    });

    it('should handle all 7 financial pillars consistently', () => {
      const pillars = [
        'financial_planning',
        'emergency_fund',
        'debt_management',
        'investment_knowledge',
        'retirement_planning',
        'insurance_coverage',
        'financial_behavior'
      ];

      pillars.forEach(pillar => {
        const pillarScore: PillarScore = {
          pillar,
          score: 3.75,
          maxScore: 5
        };

        expect(isValidPillarScore(pillarScore)).toBe(true);
        expect(calculatePillarPercentage(pillarScore)).toBe(75);
        
        const displayData = getPillarDisplayData(pillarScore);
        expect(displayData.score).toBe(75);
        expect(displayData.rawScore).toBe(3.75);
        expect(displayData.maxScore).toBe(5);
      });
    });
  });
});