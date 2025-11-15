/**
 * PDPL-Compliant Consent Management Service
 * Handles consent storage, retrieval, and backend synchronization
 */

import { v4 as uuidv4 } from 'uuid';

export interface ConsentData {
  profiling: boolean;
  dataProcessing: boolean;
  marketing?: boolean;
  timestamp: string;
  language: string;
  sessionId: string;
  userId?: number;
}

export interface ConsentResponse {
  id: number;
  consent_type: string;
  granted: boolean;
  granted_at: string;
  consent_version: string;
  consent_language: string;
  is_active: boolean;
  expires_at?: string;
}

export interface ConsentStatusResponse {
  has_profiling_consent: boolean;
  has_data_processing_consent: boolean;
  has_marketing_consent: boolean;
  consents: ConsentResponse[];
}

class ConsentService {
  private readonly API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  private readonly CONSENT_VERSION = '1.0';
  private sessionId: string;

  constructor() {
    // Generate or retrieve session ID
    if (typeof window !== 'undefined') {
      this.sessionId = this.getOrCreateSessionId();
    } else {
      this.sessionId = uuidv4();
    }
  }

  /**
   * Get or create a unique session ID for tracking consent
   */
  private getOrCreateSessionId(): string {
    const stored = localStorage.getItem('consentSessionId');
    if (stored) {
      return stored;
    }
    
    const newSessionId = uuidv4();
    localStorage.setItem('consentSessionId', newSessionId);
    return newSessionId;
  }

  /**
   * Check if user has granted consent (from localStorage first, then API)
   */
  async hasConsent(): Promise<boolean> {
    // Check localStorage first for quick response
    const localConsent = this.getLocalConsent();
    if (localConsent?.profiling && localConsent?.dataProcessing) {
      return true;
    }

    // Verify with backend
    try {
      const status = await this.getConsentStatus();
      return status.has_profiling_consent && status.has_data_processing_consent;
    } catch (error) {
      console.error('Error checking consent status:', error);
      return false;
    }
  }

  /**
   * Get consent data from localStorage
   */
  getLocalConsent(): ConsentData | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem('userConsent');
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing consent data:', error);
      return null;
    }
  }

  /**
   * Grant consent and sync with backend
   */
  async grantConsent(
    language: string,
    userId?: number
  ): Promise<{ success: boolean; error?: string }> {
    const consentData: ConsentData = {
      profiling: true,
      dataProcessing: true,
      timestamp: new Date().toISOString(),
      language,
      sessionId: this.sessionId,
      userId
    };

    // Store in localStorage immediately
    localStorage.setItem('userConsent', JSON.stringify(consentData));

    // Sync with backend
    try {
      // Grant profiling consent
      await this.grantConsentToBackend('profiling', language);
      
      // Grant data processing consent
      await this.grantConsentToBackend('data_processing', language);

      return { success: true };
    } catch (error: any) {
      console.error('Error granting consent to backend:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to save consent to server' 
      };
    }
  }

  /**
   * Grant specific consent type to backend
   */
  private async grantConsentToBackend(
    consentType: string,
    language: string
  ): Promise<ConsentResponse> {
    const response = await fetch(`${this.API_URL}/consent/grant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        consent_type: consentType,
        consent_version: this.CONSENT_VERSION,
        consent_language: language,
        session_id: this.sessionId,
        source_page: typeof window !== 'undefined' ? window.location.pathname : undefined
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to grant consent');
    }

    return response.json();
  }

  /**
   * Get consent status from backend
   */
  async getConsentStatus(): Promise<ConsentStatusResponse> {
    const url = new URL(`${this.API_URL}/consent/status`);
    url.searchParams.append('session_id', this.sessionId);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to get consent status');
    }

    return response.json();
  }

  /**
   * Withdraw consent (requires authentication)
   */
  async withdrawConsent(
    consentType: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(
        `${this.API_URL}/consent/withdraw/${consentType}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            consent_type: consentType,
            reason
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to withdraw consent');
      }

      // Update localStorage
      const localConsent = this.getLocalConsent();
      if (localConsent) {
        if (consentType === 'profiling') {
          localConsent.profiling = false;
        } else if (consentType === 'data_processing') {
          localConsent.dataProcessing = false;
        }
        localStorage.setItem('userConsent', JSON.stringify(localConsent));
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error withdrawing consent:', error);
      return {
        success: false,
        error: error.message || 'Failed to withdraw consent'
      };
    }
  }

  /**
   * Get consent history (requires authentication)
   */
  async getConsentHistory(): Promise<any> {
    const response = await fetch(`${this.API_URL}/consent/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to get consent history');
    }

    return response.json();
  }

  /**
   * Clear local consent data (for testing/logout)
   */
  clearLocalConsent(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userConsent');
      localStorage.removeItem('consentSessionId');
    }
  }

  /**
   * Check if consent is expired (2 years from grant date)
   */
  isConsentExpired(): boolean {
    const localConsent = this.getLocalConsent();
    if (!localConsent) return true;

    const grantDate = new Date(localConsent.timestamp);
    const expiryDate = new Date(grantDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 2); // PDPL: 2 year expiry

    return new Date() > expiryDate;
  }
}

// Export singleton instance
export const consentService = new ConsentService();

// Export class for testing
export default ConsentService;
