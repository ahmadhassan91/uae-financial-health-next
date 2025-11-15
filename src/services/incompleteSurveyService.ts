/**
 * Service for tracking incomplete surveys
 * 
 * Automatically saves survey progress and enables users to resume later
 */

interface IncompleteSurveyData {
  current_step: number;
  total_steps: number;
  responses: Record<string, any>;
  email?: string;
  phone_number?: string;
  company_url?: string;
  profile?: any;
}

interface IncompleteSurveyResponse {
  id: number;
  session_id: string;
  current_step: number;
  total_steps: number;
  responses: Record<string, any>;
  email?: string;
  phone_number?: string;
  company_id?: number;
  company_url?: string;
  started_at: string;
  last_activity: string;
}

class IncompleteSurveyService {
  private apiUrl: string;
  private currentSessionId: string | null = null;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  }

  /**
   * Start tracking an incomplete survey (guest user)
   */
  async startTracking(data: IncompleteSurveyData): Promise<IncompleteSurveyResponse> {
    // Check if we already have an active session to prevent duplicates
    const existingSessionId = this.getCurrentSessionId();
    if (existingSessionId) {
      console.log('🔄 Reusing existing session:', existingSessionId);
      return { session_id: existingSessionId } as IncompleteSurveyResponse;
    }

    try {
      console.log('🚀 Starting incomplete survey tracking:', data);
      
      const response = await fetch(`${this.apiUrl}/surveys/incomplete/start-guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to start survey tracking');
      }

      const result = await response.json();
      this.currentSessionId = result.session_id;
      
      // Store session ID in sessionStorage for recovery
      sessionStorage.setItem('incomplete_survey_session', result.session_id);
      
      console.log('✅ Survey tracking started:', result.session_id);
      return result;
    } catch (error) {
      console.error('❌ Failed to start survey tracking:', error);
      throw error;
    }
  }

  /**
   * Update incomplete survey progress
   */
  async updateProgress(data: Partial<IncompleteSurveyData>): Promise<void> {
    const sessionId = this.getCurrentSessionId();
    if (!sessionId) {
      console.warn('⚠️ No active session to update');
      return;
    }

    console.log('🔄 Attempting to update progress:', {
      sessionId: sessionId,
      currentStep: data.current_step,
      responsesCount: data.responses ? Object.keys(data.responses).length : 0,
      url: `${this.apiUrl}/surveys/incomplete/${sessionId}`
    });

    try {
      const response = await fetch(
        `${this.apiUrl}/surveys/incomplete/${sessionId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ PATCH request failed:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to update survey progress: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Survey progress updated successfully:', {
        sessionId: sessionId,
        currentStep: result.current_step,
        responsesCount: result.responses ? Object.keys(result.responses).length : 0
      });
    } catch (error) {
      console.error('❌ Failed to update survey progress:', error);
      // Don't throw - we don't want to block the user if auto-save fails
    }
  }

  /**
   * Mark survey as completed (remove from incomplete)
   */
  async markCompleted(): Promise<void> {
    const sessionId = this.getCurrentSessionId();
    if (!sessionId) {
      return;
    }

    try {
      await fetch(`${this.apiUrl}/surveys/incomplete/${sessionId}`, {
        method: 'DELETE',
      });

      console.log('✅ Survey marked as completed');
      this.currentSessionId = null;
      sessionStorage.removeItem('incomplete_survey_session');
    } catch (error) {
      console.error('❌ Failed to mark survey as completed:', error);
    }
  }

  /**
   * Get current session ID
   */
  getCurrentSessionId(): string | null {
    return this.currentSessionId || sessionStorage.getItem('incomplete_survey_session');
  }

  /**
   * Clear current session
   */
  clearSession(): void {
    this.currentSessionId = null;
    sessionStorage.removeItem('incomplete_survey_session');
  }
}

export const incompleteSurveyService = new IncompleteSurveyService();
