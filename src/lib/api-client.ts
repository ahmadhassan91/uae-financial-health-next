/**
 * API client for the FastAPI backend
 * Handles authentication, requests, and error handling
 */

// Production Heroku backend URL (with /api/v1 prefix)
const PRODUCTION_API_URL =
  "https://uae-financial-health-api-4188fd6ae86c.herokuapp.com/api/v1";
const DEVELOPMENT_API_URL = "http://localhost:8000/api/v1";

// Determine API base URL based on environment
const getApiBaseUrl = (): string => {
  // Check for explicit environment variable first
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Auto-detect based on environment
  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_API_URL;
  }

  // Check if we're running on Netlify (production deployment)
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost"
  ) {
    return PRODUCTION_API_URL;
  }

  return DEVELOPMENT_API_URL;
};

const API_BASE_URL = getApiBaseUrl();

interface ApiError {
  detail: string;
  status?: number;
  code?: string;
  retryable?: boolean;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryableStatuses: number[];
}

class ApiClient {
  private baseUrl: string;
  private retryConfig: RetryConfig;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;

    // Configure retry settings for production
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000, // 1 second
      maxDelay: 10000, // 10 seconds
      retryableStatuses: [408, 429, 500, 502, 503, 504], // Timeout, rate limit, server errors
    };

    // Log API URL in development for debugging
    if (process.env.NODE_ENV === "development") {
      console.log(`API Client initialized with base URL: ${this.baseUrl}`);
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private calculateRetryDelay(attempt: number): number {
    // Exponential backoff with jitter
    const delay = Math.min(
      this.retryConfig.baseDelay * Math.pow(2, attempt),
      this.retryConfig.maxDelay
    );

    // Add jitter (±25% of delay)
    const jitter = delay * 0.25 * (Math.random() * 2 - 1);
    return Math.max(0, delay + jitter);
  }

  private isRetryableError(error: any, status?: number): boolean {
    // Network errors (no response)
    if (
      !status &&
      (error.name === "TypeError" ||
        error.message.includes("fetch") ||
        error.message.includes("network") ||
        error.message.includes("CORS"))
    ) {
      return true;
    }

    // HTTP status codes that are retryable
    if (status && this.retryConfig.retryableStatuses.includes(status)) {
      return true;
    }

    return false;
  }

  private createEnhancedError(
    error: any,
    status?: number,
    url?: string
  ): ApiError {
    let detail = "An unexpected error occurred";
    let code = "UNKNOWN_ERROR";
    let retryable = false;

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      detail =
        "Network connection failed. Please check your internet connection.";
      code = "NETWORK_ERROR";
      retryable = true;
    } else if (error.message.includes("CORS")) {
      detail =
        "Cross-origin request blocked. This may be a temporary server issue.";
      code = "CORS_ERROR";
      retryable = true;
    } else if (status === 408) {
      detail = "Request timeout. The server took too long to respond.";
      code = "TIMEOUT_ERROR";
      retryable = true;
    } else if (status === 429) {
      detail = "Too many requests. Please wait a moment and try again.";
      code = "RATE_LIMIT_ERROR";
      retryable = true;
    } else if (status && status >= 500) {
      detail = "Server error. Please try again in a few moments.";
      code = "SERVER_ERROR";
      retryable = true;
    } else if (status === 401) {
      detail = "Authentication required. Please log in again.";
      code = "AUTH_ERROR";
      retryable = false;
    } else if (status === 403) {
      detail = "Access denied. You do not have permission for this action.";
      code = "PERMISSION_ERROR";
      retryable = false;
    } else if (error.detail) {
      detail = error.detail;
    } else if (error.message) {
      detail = error.message;
    }

    return {
      detail,
      status,
      code,
      retryable: retryable || this.isRetryableError(error, status),
    };
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.requestWithRetry<T>(endpoint, options);
  }

  private async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 0
  ): Promise<T> {
    // Normalize endpoint to remove trailing slashes (except for root)
    const normalizedEndpoint =
      endpoint === "/" ? endpoint : endpoint.replace(/\/+$/, "");
    const url = `${this.baseUrl}${normalizedEndpoint}`;

    // Get token from localStorage
    const token = this.getToken();

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      // Remove timeout for now - can cause issues in some environments
      // signal: AbortSignal.timeout(30000), // 30 second timeout
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // Handle authentication errors specifically
        if (response.status === 401) {
          console.log("Authentication failed, clearing tokens");
          this.clearAuth();
        }

        const errorData = await response.json().catch(() => ({
          detail: `HTTP ${response.status}: ${response.statusText}`,
        }));

        const enhancedError = this.createEnhancedError(
          errorData,
          response.status,
          url
        );

        // Retry logic for retryable errors
        if (enhancedError.retryable && attempt < this.retryConfig.maxRetries) {
          const delay = this.calculateRetryDelay(attempt);

          if (process.env.NODE_ENV === "development") {
            console.log(
              `Request failed (attempt ${attempt + 1}/${
                this.retryConfig.maxRetries + 1
              }), retrying in ${delay}ms:`,
              enhancedError.detail
            );
          }

          await this.sleep(delay);
          return this.requestWithRetry<T>(endpoint, options, attempt + 1);
        }

        throw enhancedError;
      }

      return await response.json();
    } catch (error: any) {
      // Handle network errors and timeouts
      if (error.name === "AbortError") {
        const timeoutError = this.createEnhancedError(
          { message: "Request timeout" },
          408,
          url
        );

        if (attempt < this.retryConfig.maxRetries) {
          const delay = this.calculateRetryDelay(attempt);

          if (process.env.NODE_ENV === "development") {
            console.log(
              `Request timeout (attempt ${attempt + 1}/${
                this.retryConfig.maxRetries + 1
              }), retrying in ${delay}ms`
            );
          }

          await this.sleep(delay);
          return this.requestWithRetry<T>(endpoint, options, attempt + 1);
        }

        throw timeoutError;
      }

      // Handle other network errors
      const enhancedError = this.createEnhancedError(error, undefined, url);

      if (enhancedError.retryable && attempt < this.retryConfig.maxRetries) {
        const delay = this.calculateRetryDelay(attempt);

        if (process.env.NODE_ENV === "development") {
          console.log(
            `Network error (attempt ${attempt + 1}/${
              this.retryConfig.maxRetries + 1
            }), retrying in ${delay}ms:`,
            enhancedError.detail
          );
        }

        await this.sleep(delay);
        return this.requestWithRetry<T>(endpoint, options, attempt + 1);
      }

      throw enhancedError;
    }
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;

    // Check for admin token first (for admin endpoints)
    const adminToken = localStorage.getItem("admin_access_token");
    if (adminToken) return adminToken;

    // Fall back to regular user token
    return localStorage.getItem("auth_token");
  }

  private getAuthToken(): string | null {
    return this.getToken();
  }

  private setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  }

  private removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }

  // Authentication endpoints
  async register(userData: {
    email: string;
    username: string;
    password: string;
  }): Promise<{
    id: number;
    email: string;
    username: string;
    is_active: boolean;
    is_admin: boolean;
    created_at: string;
  }> {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async simpleAuth(credentials: {
    email: string;
    dateOfBirth: string;
  }): Promise<{
    user_id: number;
    email: string;
    session_id: string;
    survey_history: any[];
    expires_at: string;
  }> {
    return this.request("/auth/simple-login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async postRegister(registrationData: {
    email: string;
    dateOfBirth: string;
    guestSurveyData: any;
    subscribeToUpdates: boolean;
  }): Promise<{
    user_id: number;
    email: string;
    session_id: string;
    survey_history: any[];
    expires_at: string;
  }> {
    return this.request("/auth/post-register", {
      method: "POST",
      body: JSON.stringify(registrationData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<{
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
  }> {
    const response = await this.request<{
      access_token: string;
      refresh_token: string;
      token_type: string;
      expires_in: number;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    // Store the token
    this.setToken(response.access_token);

    return response;
  }

  async getCurrentUser(): Promise<{
    id: number;
    email: string;
    username: string;
    is_active: boolean;
    is_admin: boolean;
    created_at: string;
  }> {
    return this.request("/auth/me");
  }

  async logout(): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>("/auth/logout", {
      method: "POST",
    });

    // Remove token from storage
    this.removeToken();

    return response;
  }

  async refreshToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
  }> {
    const response = await this.request<{
      access_token: string;
      refresh_token: string;
      token_type: string;
      expires_in: number;
    }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    // Update stored token
    this.setToken(response.access_token);

    return response;
  }

  // Customer Profile endpoints
  async createProfile(profileData: {
    first_name: string;
    last_name: string;
    age: number;
    gender: string;
    nationality: string;
    emirate: string;
    city?: string;
    employment_status: string;
    industry?: string;
    position?: string;
    monthly_income: string;
    household_size: number;
    phone_number?: string;
    preferred_language?: string;
  }): Promise<any> {
    return this.request("/customers/profile", {
      method: "POST",
      body: JSON.stringify(profileData),
    });
  }

  async getProfile(): Promise<any> {
    return this.request("/customers/profile");
  }

  async updateProfile(
    profileData: Partial<{
      first_name: string;
      last_name: string;
      age: number;
      gender: string;
      nationality: string;
      emirate: string;
      city: string;
      employment_status: string;
      industry: string;
      position: string;
      monthly_income: string;
      household_size: number;
      phone_number: string;
      preferred_language: string;
    }>
  ): Promise<any> {
    return this.request("/customers/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  async deleteProfile(): Promise<{ message: string }> {
    return this.request("/customers/profile", {
      method: "DELETE",
    });
  }

  // Survey endpoints
  async calculateScorePreview(previewData: {
    responses: Record<string, any>;
    profile?: Record<string, any> | null;
  }): Promise<{
    total_score: number;
    max_possible_score: number;
    pillar_scores: Array<{
      factor: string;
      name: string;
      score: number;
      max_score: number;
      percentage: number;
      weight: number;
    }>;
    weighted_sum: number;
    total_weight: number;
    average_score: number;
  }> {
    return this.request("/surveys/calculate-preview", {
      method: "POST",
      body: JSON.stringify(previewData),
    });
  }

  async submitSurvey(surveyData: {
    responses: Record<string, any>;
    completion_time?: number;
  }): Promise<{
    survey_response: any;
    recommendations: any[];
    score_breakdown: {
      overall_score: number;
      budgeting_score: number;
      savings_score: number;
      debt_management_score: number;
      financial_planning_score: number;
      investment_knowledge_score: number;
      risk_tolerance: string;
      financial_goals: string[] | null;
    };
  }> {
    return this.request("/surveys/submit", {
      method: "POST",
      body: JSON.stringify(surveyData),
    });
  }

  async submitGuestSurvey(surveyData: {
    responses: Record<string, any>;
    completion_time?: number;
  }): Promise<{
    survey_response: any;
    recommendations: any[];
    score_breakdown: {
      overall_score: number;
      budgeting_score: number;
      savings_score: number;
      debt_management_score: number;
      financial_planning_score: number;
      investment_knowledge_score: number;
      risk_tolerance: string;
      financial_goals: string[] | null;
    };
  }> {
    return this.request("/surveys/submit-guest", {
      method: "POST",
      body: JSON.stringify(surveyData),
    });
  }

  // Incomplete survey tracking
  async startIncompleteSurvey(surveyData: {
    current_step: number;
    total_steps: number;
    responses?: Record<string, any>;
    email?: string;
    phone_number?: string;
  }): Promise<{
    id: number;
    session_id: string;
    current_step: number;
    total_steps: number;
    started_at: string;
  }> {
    return this.request("/surveys/incomplete/start", {
      method: "POST",
      body: JSON.stringify(surveyData),
    });
  }

  async startGuestIncompleteSurvey(surveyData: {
    current_step: number;
    total_steps: number;
    responses?: Record<string, any>;
    email?: string;
    phone_number?: string;
  }): Promise<{
    id: number;
    session_id: string;
    current_step: number;
    total_steps: number;
    started_at: string;
  }> {
    return this.request("/surveys/incomplete/start-guest", {
      method: "POST",
      body: JSON.stringify(surveyData),
    });
  }

  async updateIncompleteSurvey(
    sessionId: string,
    surveyData: {
      current_step?: number;
      responses?: Record<string, any>;
      email?: string;
      phone_number?: string;
    }
  ): Promise<any> {
    return this.request(`/surveys/incomplete/${sessionId}`, {
      method: "PUT",
      body: JSON.stringify(surveyData),
    });
  }

  async completeSurveySession(sessionId: string): Promise<{ message: string }> {
    return this.request(`/surveys/incomplete/${sessionId}`, {
      method: "DELETE",
    });
  }

  async getSurveyResults(surveyId: number): Promise<{
    survey_response: any;
    recommendations: any[];
    score_breakdown: any;
  }> {
    return this.request(`/surveys/results/${surveyId}`);
  }

  async getSurveyHistory(skip: number = 0, limit: number = 50): Promise<any[]> {
    return this.request(`/surveys/history?skip=${skip}&limit=${limit}`);
  }

  async getLatestSurvey(): Promise<{
    survey_response: any;
    recommendations: any[];
    score_breakdown: any;
  }> {
    return this.request("/surveys/latest");
  }

  // Company management endpoints (Admin only)
  async getCompanies(skip: number = 0, limit: number = 100): Promise<any[]> {
    return this.request(`/companies/?skip=${skip}&limit=${limit}`);
  }

  async createCompany(companyData: {
    company_name: string;
    company_email: string;
    contact_person: string;
    phone_number?: string;
    question_variation_mapping?: Record<string, number>;
  }): Promise<any> {
    return this.request("/companies/", {
      method: "POST",
      body: JSON.stringify(companyData),
    });
  }

  async updateCompany(companyId: number, updates: any): Promise<any> {
    return this.request(`/companies/${companyId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteCompany(companyId: number): Promise<any> {
    return this.request(`/companies/${companyId}`, {
      method: "DELETE",
    });
  }

  async generateCompanyLink(
    companyId: number,
    config?: {
      prefix?: string;
      expiry_days?: number;
      max_responses?: number;
      custom_branding?: boolean;
    }
  ): Promise<{
    company_id: number;
    url: string;
    expires_at?: string;
    max_responses?: number;
  }> {
    return this.request(`/companies/${companyId}/generate-link`, {
      method: "POST",
      body: JSON.stringify(config || {}),
    });
  }

  async getCompanyAnalytics(companyId: number): Promise<any> {
    return this.request(`/companies/${companyId}/analytics`);
  }

  async getQuestionVariationsSimple(): Promise<{
    variations_by_question: Record<
      string,
      Array<{
        id: number;
        name: string;
        language: string;
        preview: string;
      }>
    >;
    total_variations: number;
    questions_with_variations: number;
  }> {
    return this.request("/admin/simple/question-variations-simple");
  }

  // Incomplete survey admin endpoints
  async getIncompleteSurveys(
    skip: number = 0,
    limit: number = 50,
    abandonedOnly: boolean = false
  ): Promise<any[]> {
    return this.request(
      `/surveys/incomplete/admin/list?skip=${skip}&limit=${limit}&abandoned_only=${abandonedOnly}`
    );
  }

  async getIncompleteSurveyStats(): Promise<{
    total_incomplete: number;
    abandoned_count: number;
    average_completion_rate: number;
    most_common_exit_step: number;
    follow_up_pending: number;
  }> {
    return this.request("/surveys/incomplete/admin/stats");
  }

  async sendFollowUp(followUpData: {
    survey_ids: number[];
    message_template: string;
    send_email?: boolean;
    send_sms?: boolean;
  }): Promise<{
    message: string;
    sent_count: number;
    total_requested: number;
  }> {
    return this.request("/surveys/incomplete/admin/follow-up", {
      method: "POST",
      body: JSON.stringify(followUpData),
    });
  }

  async exportIncompleteSurveys(
    abandonedOnly: boolean = false,
    skip: number = 0,
    limit: number = 1000
  ): Promise<void> {
    const params = new URLSearchParams({
      abandoned_only: abandonedOnly.toString(),
      skip: skip.toString(),
      limit: limit.toString(),
    });

    const token = this.getAuthToken();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(
      `${this.baseUrl}/surveys/incomplete/admin/export?${params}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to export surveys");
    }

    // Get filename from Content-Disposition header or generate one
    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = "incomplete_surveys_export";
    if (contentDisposition) {
      const matches = contentDisposition.match(/filename="(.+)"/);
      if (matches && matches[1]) {
        filename = matches[1];
      }
    } else {
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      filename = `incomplete_surveys_${
        abandonedOnly ? "abandoned" : "all"
      }_${timestamp}.csv`;
    }

    // Create blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // Localization endpoints
  async getUITranslations(
    language: string,
    keys?: string[]
  ): Promise<Record<string, string>> {
    const keysParam = keys ? `?keys=${keys.join(",")}` : "";
    return this.request(`/localization/ui/${language}${keysParam}`);
  }

  async getLocalizedContent(
    language?: string,
    contentType?: string,
    contentId?: string
  ): Promise<any[]> {
    const params = new URLSearchParams();
    if (language) params.append("language", language);
    if (contentType) params.append("content_type", contentType);
    if (contentId) params.append("content_id", contentId);

    const queryString = params.toString();
    return this.request(
      `/localization/content${queryString ? `?${queryString}` : ""}`
    );
  }

  async getQuestionsByLanguage(
    language: string,
    nationality?: string,
    age?: number,
    emirate?: string
  ): Promise<any[]> {
    const params = new URLSearchParams();
    if (nationality) params.append("nationality", nationality);
    if (age) params.append("age", age.toString());
    if (emirate) params.append("emirate", emirate);

    const queryString = params.toString();
    return this.request(
      `/localization/questions/${language}${
        queryString ? `?${queryString}` : ""
      }`
    );
  }

  async createLocalizedContent(contentData: {
    content_type: string;
    content_id: string;
    language: string;
    text: string;
    title?: string;
    options?: any[];
    extra_data?: Record<string, any>;
    version?: string;
  }): Promise<any> {
    return this.request("/api/localization/content", {
      method: "POST",
      body: JSON.stringify(contentData),
    });
  }

  async updateLocalizedContent(
    contentId: number,
    updates: {
      text?: string;
      title?: string;
      options?: any[];
      extra_data?: Record<string, any>;
      is_active?: boolean;
    }
  ): Promise<any> {
    return this.request(`/api/localization/content/${contentId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteLocalizedContent(
    contentId: number
  ): Promise<{ message: string }> {
    return this.request(`/api/localization/content/${contentId}`, {
      method: "DELETE",
    });
  }

  async bulkImportTranslations(
    translations: Record<string, any>,
    language: string,
    contentType: string = "ui"
  ): Promise<{
    imported_count: number;
    total_count: number;
    errors: string[];
  }> {
    return this.request("/api/localization/bulk-import", {
      method: "POST",
      body: JSON.stringify({
        translations,
        language,
        content_type: contentType,
      }),
    });
  }

  async validateContent(
    contentType: string,
    contentId: string,
    language: string,
    text: string
  ): Promise<{
    is_valid: boolean;
    warnings: string[];
    errors: string[];
  }> {
    return this.request("/api/localization/content/validate", {
      method: "POST",
      body: JSON.stringify({
        content_type: contentType,
        content_id: contentId,
        language,
        text,
      }),
    });
  }

  async getSupportedLanguages(): Promise<any[]> {
    return this.request("/api/localization/languages");
  }

  // Health check
  async healthCheck(): Promise<{
    status: string;
    version: string;
    environment: string;
    timestamp: number;
  }> {
    return this.request("/health");
  }

  // Test API connectivity (useful for production deployment validation)
  async testConnectivity(): Promise<{
    success: boolean;
    baseUrl: string;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      const response = await this.healthCheck();
      const responseTime = Date.now() - startTime;

      return {
        success: true,
        baseUrl: this.baseUrl,
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        success: false,
        baseUrl: this.baseUrl,
        responseTime,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get current API base URL (useful for debugging)
  getBaseUrl(): string {
    return this.baseUrl;
  }

  // Configure retry settings (useful for different environments)
  configureRetry(config: Partial<RetryConfig>): void {
    this.retryConfig = {
      ...this.retryConfig,
      ...config,
    };
  }

  // Get current retry configuration
  getRetryConfig(): RetryConfig {
    return { ...this.retryConfig };
  }

  // Check if the client is configured for production
  isProduction(): boolean {
    return (
      this.baseUrl.includes("herokuapp.com") ||
      process.env.NODE_ENV === "production"
    );
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async validateToken(): Promise<boolean> {
    if (!this.getToken()) return false;

    try {
      // Try a simple authenticated endpoint to validate the token
      await this.request("/auth/me");
      return true;
    } catch (error) {
      // Token is invalid, clear it
      this.clearAuth();
      return false;
    }
  }

  clearAuth(): void {
    this.removeToken();
    // Also clear admin token if present
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_access_token");
    }
  }

  async getFinancialClinicHistory(
    skip: number = 0,
    limit: number = 50
  ): Promise<any[]> {
    return this.request(
      `/financial-clinic/history?skip=${skip}&limit=${limit}`
    );
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types for use in components
export type { ApiError, RetryConfig };
