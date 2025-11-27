/**
 * API Configuration
 * Centralized API URL management for the application
 */

/**
 * Get the API base URL based on environment
 * Priority:
 * 1. NEXT_PUBLIC_API_URL environment variable (set in .env.local or Netlify)
 * 2. Localhost detection (for local development)
 * 3. Production Heroku backend (fallback)
 */
export function getApiUrl(): string {
  // Priority 1: Use environment variable if defined
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Priority 2: Detect localhost for local development
  if (typeof window !== "undefined" && window.location.origin.includes("localhost")) {
    return "http://localhost:8000/api/v1";
  }

  // Priority 3: Production Heroku backend (fallback)
  return "https://uae-financial-health-filters-68ab0c8434cb.herokuapp.com/api/v1";
}

/**
 * API endpoint builder
 * Constructs full API URLs for consistency
 */
export const API = {
  // Financial Clinic endpoints
  financialClinic: {
    calculate: () => `${getApiUrl()}/financial-clinic/calculate`,
    submit: () => `${getApiUrl()}/financial-clinic/submit`,
    questions: () => `${getApiUrl()}/financial-clinic/questions`,
    history: () => `${getApiUrl()}/financial-clinic/history`,
    historyByEmail: (email: string) => `${getApiUrl()}/financial-clinic/history/${encodeURIComponent(email)}`,
    latest: (email: string) => `${getApiUrl()}/financial-clinic/latest/${encodeURIComponent(email)}`,
    reportPdf: () => `${getApiUrl()}/financial-clinic/report/pdf`,
    reportEmail: () => `${getApiUrl()}/financial-clinic/report/email`,
  },

  // Auth endpoints
  auth: {
    login: () => `${getApiUrl()}/auth/login`,
    logout: () => `${getApiUrl()}/auth/logout`,
    register: () => `${getApiUrl()}/auth/register`,
    verify: () => `${getApiUrl()}/auth/verify`,
  },

  // Consultation endpoints
  consultations: {
    request: () => `${getApiUrl()}/consultations/request`,
  },

  // Company endpoints
  companies: {
    byUrl: (url: string) => `${getApiUrl()}/companies/by-url/${url}`,
  },

  // Consent endpoints
  consent: {
    grant: () => `${getApiUrl()}/consent/grant`,
    status: () => `${getApiUrl()}/consent/status`,
  },
};

export default API;
