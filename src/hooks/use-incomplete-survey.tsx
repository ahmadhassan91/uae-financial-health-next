'use client';

/**
 * Hook for managing incomplete survey tracking
 */
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api-client';
import { useSimpleAuth } from './use-simple-auth';

interface IncompleteSurveySession {
  id: number;
  sessionId: string;
  currentStep: number;
  totalSteps: number;
  responses: Record<string, any>;
  startedAt: string;
}

interface UseIncompleteSurveyReturn {
  currentSession: IncompleteSurveySession | null;
  startSession: (totalSteps: number, email?: string, phoneNumber?: string) => Promise<string>;
  updateSession: (currentStep: number, responses: Record<string, any>) => Promise<void>;
  completeSession: () => Promise<void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useIncompleteSurvey(): UseIncompleteSurveyReturn {
  const [currentSession, setCurrentSession] = useState<IncompleteSurveySession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useSimpleAuth();

  // Load existing session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('incomplete_survey_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setCurrentSession(session);
      } catch (err) {
        console.error('Error loading saved session:', err);
        localStorage.removeItem('incomplete_survey_session');
      }
    }
  }, []);

  const startSession = useCallback(async (
    totalSteps: number, 
    email?: string, 
    phoneNumber?: string
  ): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const sessionData = {
        current_step: 0,
        total_steps: totalSteps,
        responses: {},
        email,
        phone_number: phoneNumber
      };

      let response;
      if (isAuthenticated) {
        response = await apiClient.startIncompleteSurvey(sessionData);
      } else {
        response = await apiClient.startGuestIncompleteSurvey(sessionData);
      }

      const session: IncompleteSurveySession = {
        id: response.id,
        sessionId: response.session_id,
        currentStep: response.current_step,
        totalSteps: response.total_steps,
        responses: {},
        startedAt: response.started_at
      };

      setCurrentSession(session);
      localStorage.setItem('incomplete_survey_session', JSON.stringify(session));

      return response.session_id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start session';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const updateSession = useCallback(async (
    currentStep: number, 
    responses: Record<string, any>
  ): Promise<void> => {
    if (!currentSession) {
      throw new Error('No active session to update');
    }

    try {
      setLoading(true);
      setError(null);

      await apiClient.updateIncompleteSurvey(currentSession.sessionId, {
        current_step: currentStep,
        responses
      });

      // Update local session
      const updatedSession = {
        ...currentSession,
        currentStep,
        responses: { ...currentSession.responses, ...responses }
      };

      setCurrentSession(updatedSession);
      localStorage.setItem('incomplete_survey_session', JSON.stringify(updatedSession));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update session';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  const completeSession = useCallback(async (): Promise<void> => {
    if (!currentSession) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await apiClient.completeSurveySession(currentSession.sessionId);

      // Clear local session
      setCurrentSession(null);
      localStorage.removeItem('incomplete_survey_session');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete session';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    currentSession,
    startSession,
    updateSession,
    completeSession,
    loading,
    error,
    clearError
  };
}