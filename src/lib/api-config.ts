/**
 * API Configuration
 * Centralized API URL management for the application
 */

// Development fallback URL (only used when NEXT_PUBLIC_API_URL is not set)
const DEVELOPMENT_API_URL = "http://localhost:8000/api/v1";

/**
 * Get the API base URL based on environment
 * Priority:
 * 1. NEXT_PUBLIC_API_URL environment variable (set in .env.local or Netlify)
 * 2. Localhost fallback (for local development only)
 */
export function getApiUrl(): string {
  let url = "";

  // Priority 1: Use environment variable if defined (required for production)
  if (process.env.NEXT_PUBLIC_API_URL) {
    url = process.env.NEXT_PUBLIC_API_URL;
  } else if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    // Priority 2: Fallback to localhost for development only
    url = DEVELOPMENT_API_URL;
  } else {
    // Warn if no API URL is configured in production
    if (process.env.NODE_ENV === "production") {
      console.warn("NEXT_PUBLIC_API_URL not configured for production");
    }
    url = DEVELOPMENT_API_URL;
  }

  // Protocol enforcement for production
  if (typeof window !== "undefined" && window.location.protocol === "https:" && url.startsWith("http://")) {
    const urlObj = new URL(url, window.location.origin);
    if (urlObj.hostname === window.location.hostname) {
      url = url.replace("http://", "https://");
    }
  }

  return url;
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
