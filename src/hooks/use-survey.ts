import { useState, useEffect, useCallback, useMemo } from 'react';
import { SurveyResponse, ScoreCalculation, Question, PillarScore, SubScore } from '../lib/types';
import { calculateScoreV2, generateAdviceV2 } from '../lib/scoring-engine';
import { generateSampleData } from '../lib/sample-data';
import { apiClient } from '../lib/api-client';
import { useCustomerProfile } from './use-customer-profile';
import { useIncompleteSurvey } from './use-incomplete-survey';

export function useSurvey() {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [scoreHistory, setScoreHistory] = useState<ScoreCalculation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { profile, saveProfile, updateProfile } = useCustomerProfile();
  const {
    currentSession,
    startSession,
    updateSession,
    completeSession
  } = useIncompleteSurvey();

  // Add sample data for demo purposes if no real data exists and user is in guest mode
  const effectiveScoreHistory = useMemo(() => {
    // If we have actual survey data, use it
    if (scoreHistory.length > 0) {
      return scoreHistory;
    }

    // If no data and user is not authenticated, show sample data for demo
    if (!apiClient.isAuthenticated()) {
      return generateSampleData();
    }

    // Authenticated user with no data - show empty array
    return [];
  }, [scoreHistory]);

  const loadSurveyHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is truly authenticated (not just has a stale admin token)
      const hasSimpleAuthSession = localStorage.getItem('simple_auth_session');
      const hasApiToken = localStorage.getItem('auth_token');

      // Only use API if user has simple auth session or valid API token
      const isValidAuth = !!(hasSimpleAuthSession || hasApiToken);

      console.log('Survey history auth check:');
      console.log('- Simple auth session:', !!hasSimpleAuthSession);
      console.log('- API token:', !!hasApiToken);
      console.log('- Using API:', isValidAuth);

      if (isValidAuth) {
        // Scenario 1: AUTHENTICATED USER - load from API
        console.log('Loading survey history for authenticated user');
        const history = await apiClient.getSurveyHistory();

        // Convert API response to frontend format
        const convertedHistory: ScoreCalculation[] = history.map((item: {
          id: number;
          user_id: number;
          responses: Record<string, number>;
          overall_score: number;
          created_at: string;
        }) => {
          // Map scores to pillar format - using default scores since API doesn't provide pillar breakdown yet
          const pillarScores: PillarScore[] = [
            {
              pillar: 'income_stream',
              score: Math.round((item.overall_score * 0.2) / 3), // Scale to 5-point scale
              maxScore: 5,
              percentage: Math.round(((item.overall_score * 0.2) / 3 / 5) * 100),
              interpretation: item.overall_score > 60 ? 'Good' : item.overall_score > 40 ? 'Needs Improvement' : 'At Risk'
            },
            {
              pillar: 'savings_habit',
              score: Math.round((item.overall_score * 0.2) / 3), // Scale to 5-point scale
              maxScore: 5,
              percentage: Math.round(((item.overall_score * 0.2) / 3 / 5) * 100),
              interpretation: item.overall_score > 60 ? 'Good' : item.overall_score > 40 ? 'Needs Improvement' : 'At Risk'
            },
            {
              pillar: 'debt_management',
              score: Math.round((item.overall_score * 0.2) / 3), // Scale to 5-point scale
              maxScore: 5,
              percentage: Math.round(((item.overall_score * 0.2) / 3 / 5) * 100),
              interpretation: item.overall_score > 60 ? 'Good' : item.overall_score > 40 ? 'Needs Improvement' : 'At Risk'
            },
            {
              pillar: 'retirement_planning',
              score: Math.round((item.overall_score * 0.2) / 3), // Scale to 5-point scale
              maxScore: 5,
              percentage: Math.round(((item.overall_score * 0.2) / 3 / 5) * 100),
              interpretation: item.overall_score > 60 ? 'Good' : item.overall_score > 40 ? 'Needs Improvement' : 'At Risk'
            },
            {
              pillar: 'future_planning',
              score: Math.round((item.overall_score * 0.2) / 3), // Scale to 5-point scale
              maxScore: 5,
              percentage: Math.round(((item.overall_score * 0.2) / 3 / 5) * 100),
              interpretation: item.overall_score > 60 ? 'Good' : item.overall_score > 40 ? 'Needs Improvement' : 'At Risk'
            }
          ];

          // Convert to sub scores (legacy format)
          const subScores: SubScore[] = pillarScores.map(pillar => ({
            factor: pillar.pillar,
            name: pillar.pillar.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            score: pillar.score,
            maxScore: pillar.maxScore,
            percentage: pillar.percentage,
            description: `${pillar.pillar.replace('_', ' ')} assessment`,
            interpretation: pillar.interpretation
          }));

          return {
            id: item.id?.toString() || '',
            userId: item.user_id?.toString() || '',
            profile: profile!,
            responses: Object.entries(item.responses).map(([questionId, value]) => ({
              questionId,
              value: value as number
            })),
            totalScore: item.overall_score,
            maxPossibleScore: 75,
            subScores,
            pillarScores,
            advice: ['Historical survey data - detailed recommendations available after new assessment'],
            createdAt: new Date(item.created_at),
            surveyResponseId: item.id,
            modelVersion: 'v2' as const
          };
        });

        setScoreHistory(convertedHistory);
      } else {
        // Scenario 2: GUEST USER - load from localStorage only
        console.log('Loading survey history for guest user (localStorage)');
        const localHistory = localStorage.getItem('survey-history');
        if (localHistory) {
          try {
            const parsedHistory = JSON.parse(localHistory);
            // Ensure dates are properly parsed
            const restoredHistory = parsedHistory.map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt)
            }));
            setScoreHistory(restoredHistory);
            console.log(`Loaded ${restoredHistory.length} surveys from localStorage`);
          } catch (parseError) {
            console.error('Error parsing localStorage survey history:', parseError);
            setScoreHistory([]);
          }
        } else {
          console.log('No survey history found in localStorage');
          setScoreHistory([]);
        }
      }
    } catch (err) {
      console.error('Failed to load survey history:', err);

      // Since we validate authentication first, any error here is likely a real API issue
      // Fall back to localStorage as a safety net
      console.log('API error occurred, falling back to localStorage');
      try {
        const localHistory = localStorage.getItem('survey-history');
        if (localHistory) {
          const parsedHistory = JSON.parse(localHistory);
          const restoredHistory = parsedHistory.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt)
          }));
          setScoreHistory(restoredHistory);
          console.log(`Fallback: Loaded ${restoredHistory.length} surveys from localStorage`);
        } else {
          setScoreHistory([]);
        }
      } catch (fallbackErr) {
        console.error('Fallback to localStorage also failed:', fallbackErr);
        setScoreHistory([]);
        setError(err instanceof Error ? err.message : 'Failed to load survey history');
      }
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // Load survey history on mount
  useEffect(() => {
    loadSurveyHistory();
  }, [loadSurveyHistory]);

  const updateResponse = async (questionId: string, value: number) => {
    setResponses(current => {
      const filtered = current.filter(r => r.questionId !== questionId);
      const newResponses = [...filtered, { questionId, value }];

      // Update incomplete survey session if exists
      if (currentSession) {
        const responsesObject = newResponses.reduce((acc, response) => {
          acc[response.questionId] = response.value;
          return acc;
        }, {} as Record<string, number>);

        // Update session asynchronously (don't await to avoid blocking UI)
        updateSession(currentStep, responsesObject).catch(console.error);
      }

      return newResponses;
    });
  };

  const submitSurvey = async () => {
    try {
      setLoading(true);
      setError(null);

      const responsesObject = responses.reduce((acc, response) => {
        acc[response.questionId] = response.value;
        return acc;
      }, {} as Record<string, number>);

      // Check if user is truly authenticated (not just has a stale admin token)
      // Only use authenticated endpoint if user has simple auth session or valid API token
      const hasSimpleAuthSession = localStorage.getItem('simple_auth_session');
      const hasApiToken = localStorage.getItem('auth_token');
      const hasAdminToken = localStorage.getItem('admin_access_token');

      console.log('Survey submission auth check:');
      console.log('- Simple auth session:', !!hasSimpleAuthSession);
      console.log('- API token:', !!hasApiToken);
      console.log('- Admin token:', !!hasAdminToken);

      // Only use authenticated endpoint if user has simple auth or API token (not admin token)
      const isValidAuth = !!(hasSimpleAuthSession || hasApiToken);

      console.log('Using authenticated endpoint:', isValidAuth);

      let apiResult;

      if (isValidAuth) {
        // Scenario 1: AUTHENTICATED USER - submit to authenticated endpoint
        if (!profile) {
          throw new Error('Profile is required to submit survey. Please complete your profile first.');
        }
        console.log('Submitting survey for authenticated user');
        apiResult = await apiClient.submitSurvey({
          responses: responsesObject,
          completion_time: undefined
        });
      } else {
        // Scenario 2: GUEST USER - submit to guest endpoint
        console.log('Submitting survey for guest user');
        apiResult = await apiClient.submitGuestSurvey({
          responses: responsesObject,
          completion_time: undefined
        });
      }

      // Get proper pillar scores using the new scoring API
      const scorePreview = await apiClient.calculateScorePreview({
        responses: responsesObject,
        profile: profile ? { children: profile.children } : null
      });

      // Convert backend pillar scores to frontend format
      const pillarScores: PillarScore[] = scorePreview.pillar_scores.map(pillar => ({
        pillar: pillar.factor as any,
        score: pillar.score,
        maxScore: pillar.max_score,
        percentage: pillar.percentage,
        interpretation: pillar.score >= 4 ? 'Excellent' :
          pillar.score >= 3 ? 'Good' :
            pillar.score >= 2 ? 'Needs Improvement' : 'At Risk'
      }));

      // Convert to sub scores (legacy format)
      const subScores: SubScore[] = pillarScores.map(pillar => ({
        factor: pillar.pillar,
        name: pillar.pillar.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        score: pillar.score,
        maxScore: pillar.maxScore,
        percentage: pillar.percentage,
        description: `${pillar.pillar.replace('_', ' ')} assessment result`,
        interpretation: pillar.interpretation
      }));

      const newCalculation: ScoreCalculation = {
        id: apiResult.survey_response.id ? apiResult.survey_response.id.toString() : Date.now().toString(),
        userId: apiResult.survey_response.user_id ? apiResult.survey_response.user_id.toString() : 'guest-user',
        profile,
        responses,
        totalScore: scorePreview.total_score || 0,
        maxPossibleScore: scorePreview.max_possible_score || 75,
        subScores,
        pillarScores,
        advice: apiResult.recommendations ? apiResult.recommendations.map((rec: { description: string }) => rec.description) : [],
        createdAt: apiResult.survey_response.created_at ? new Date(apiResult.survey_response.created_at) : new Date(),
        modelVersion: 'v2',
        surveyResponseId: apiResult.survey_response.id
      };

      setScoreHistory((current) => {
        const updatedHistory = [newCalculation, ...current];
        // Save to localStorage for guest users (when not authenticated)
        if (!apiClient.isAuthenticated()) {
          localStorage.setItem('survey-history', JSON.stringify(updatedHistory));
        }
        return updatedHistory;
      });

      // Complete the incomplete survey session if it exists
      if (currentSession) {
        completeSession().catch(console.error);
      }

      return newCalculation;
    } catch (err) {
      console.error('Survey submission error:', err);

      let errorMessage = 'Failed to submit survey';

      if (err instanceof Error) {
        errorMessage = err.message;

        // Provide more specific error messages
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
        } else if (err.message.includes('NetworkError')) {
          errorMessage = 'Network error occurred. Please try again.';
        } else if (err.message.includes('Profile is required')) {
          errorMessage = 'Please complete your profile before submitting the survey.';
        }
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetSurvey = () => {
    setCurrentStep(0);
    setResponses([]);
  };

  const getResponse = (questionId: string) => {
    return responses.find(r => r.questionId === questionId)?.value;
  };

  const isAllRequiredAnswered = (questions: Question[], hasChildren: boolean = false) => {
    return questions.every(question => {
      // Skip Q16 if user doesn't have children
      if (question.conditional && !hasChildren) return true;

      const response = getResponse(question.id);
      return !question.required || response !== undefined;
    });
  };

  // Function to start tracking incomplete survey
  const startSurveyTracking = async (totalSteps: number, email?: string, phoneNumber?: string) => {
    try {
      await startSession(totalSteps, email, phoneNumber);
    } catch (error) {
      console.error('Failed to start survey tracking:', error);
    }
  };

  return {
    currentStep,
    setCurrentStep,
    responses,
    updateResponse,
    profile,
    updateProfile,
    submitSurvey,
    resetSurvey,
    getResponse,
    scoreHistory: effectiveScoreHistory,
    isAllRequiredAnswered,
    saveProfile, // Expose saveProfile for creating/updating profiles
    startSurveyTracking, // New function to start tracking
    currentSession // Expose current session info
  };
}