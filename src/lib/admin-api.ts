/**
* Admin Analytics API Service
* Handles all API calls to the Financial Clinic admin endpoints
*/

const getBackendUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  // Protocol enforcement for production
  if (typeof window !== "undefined" && window.location.protocol === "https:" && url.startsWith("http://")) {
    const urlObj = new URL(url, window.location.origin);
    if (urlObj.hostname === window.location.hostname) {
      url = url.replace("http://", "https://");
    }
  }

  return url;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("admin_access_token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export interface Company {
  id: number;
  name: string;
  unique_url: string;
}

export interface FilterOptions {
  ageGroups: string[];
  genders: string[];
  nationalities: string[];
  emirates: string[];
  employmentStatuses: string[];
  incomeRanges: string[];
  childrenOptions: string[];
  companies: Company[];
}

export interface DemographicFilters {
  ageGroups?: string[];
  genders?: string[];
  nationalities?: string[];
  emirates?: string[];
  employmentStatuses?: string[];
  incomeRanges?: string[];
  children?: string[];
  companies?: string[];
  unique_users_only?: boolean;
}

export interface DateRangeParams {
  dateRange?: "7d" | "30d" | "90d" | "1y" | "ytd" | "all";
  startDate?: string;
  endDate?: string;
}

export interface OverviewMetrics {
  total_submissions: number;
  average_score: number;
  excellent_count: number;
  good_count: number;
  needs_improvement_count: number;
  at_risk_count: number;
  unique_completions: number;
  cases_completed_percentage: number;
  unique_completion_percentage: number;
  today_submissions: number;
}

export interface ScoreDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface CategoryPerformance {
  category: string;
  average_score: number;
  max_possible: number;
  percentage: number;
}

export interface TimeSeriesData {
  period: string;
  submissions: number;
  average_score: number;
}

export interface NationalityBreakdown {
  nationality: string;
  total: number;
  excellent: number;
  good: number;
  needs_improvement: number;
  at_risk: number;
  average_score: number;
}

export interface AgeBreakdown {
  age_group: string;
  total: number;
  average_score: number;
  percentage: number;
}

export interface CompanyAnalytics {
  company: string;
  total_submissions: number;
  average_score: number;
  excellent: number;
  good: number;
  needs_improvement: number;
  at_risk: number;
}

export interface ScoreAnalyticsRow {
  question_number: number;
  question_text: string;
  category: string;
  emirati_avg: number | null;
  non_emirati_avg: number | null;
  emirati_count: number;
  non_emirati_count: number;
}

export interface ScoreAnalyticsResponse {
  questions: ScoreAnalyticsRow[];
  total_questions: number;
  question_set_type: "default" | "company_variation";
  variation_set_name: string | null;
  filtered: boolean;
}

// Build query params from filters and date range
const buildQueryParams = (
  filters?: DemographicFilters,
  dateParams?: DateRangeParams,
  extraParams?: Record<string, any>
): string => {
  const params = new URLSearchParams();

  // Add date range parameters
  if (dateParams?.dateRange) {
    params.append("date_range", dateParams.dateRange);
  }
  if (dateParams?.startDate) {
    params.append("start_date", dateParams.startDate);
  }
  if (dateParams?.endDate) {
    params.append("end_date", dateParams.endDate);
  }

  // Add demographic filters (comma-separated for multi-select)
  if (filters?.ageGroups && filters.ageGroups.length > 0) {
    params.append("age_groups", filters.ageGroups.join(","));
  }
  if (filters?.genders && filters.genders.length > 0) {
    params.append("genders", filters.genders.join(","));
  }
  if (filters?.nationalities && filters.nationalities.length > 0) {
    params.append("nationalities", filters.nationalities.join(","));
  }
  if (filters?.emirates && filters.emirates.length > 0) {
    params.append("emirates", filters.emirates.join(","));
  }
  if (filters?.employmentStatuses && filters.employmentStatuses.length > 0) {
    params.append("employment_statuses", filters.employmentStatuses.join(","));
  }
  if (filters?.incomeRanges && filters.incomeRanges.length > 0) {
    params.append("income_ranges", filters.incomeRanges.join(","));
  }
  if (filters?.children && filters.children.length > 0) {
    params.append("children", filters.children.join(","));
  }
  if (filters?.companies && filters.companies.length > 0) {
    params.append("companies", filters.companies.join(","));
  }

  // Add unique users filter
  if (filters?.unique_users_only) {
    params.append("unique_users_only", "true");
  }

  // Add any extra parameters
  if (extraParams) {
    Object.entries(extraParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }

  return params.toString();
};

export const adminApi = {
  /**
   * Get available filter options
   */
  async getFilterOptions(): Promise<FilterOptions> {
    const response = await fetch(
      `${getBackendUrl()}/admin/simple/filter-options`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error("Failed to fetch filter options");
    const data = await response.json();

    // Convert snake_case backend response to camelCase
    return {
      ageGroups: data.age_groups || [],
      genders: data.genders || [],
      nationalities: data.nationalities || [],
      emirates: data.emirates || [],
      employmentStatuses: data.employment_statuses || [],
      incomeRanges: data.income_ranges || [],
      childrenOptions: data.children_options || [],
      companies: data.companies || [],
    };
  },

  /**
   * Get overview metrics (KPIs)
   */
  async getOverviewMetrics(
    filters?: DemographicFilters,
    dateParams?: DateRangeParams
  ): Promise<OverviewMetrics> {
    const queryString = buildQueryParams(filters, dateParams);
    const response = await fetch(
      `${getBackendUrl()}/admin/simple/overview-metrics?${queryString}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error("Failed to fetch overview metrics");
    return response.json();
  },

  /**
   * Get score distribution by status bands
   */
  async getScoreDistribution(
    filters?: DemographicFilters,
    dateParams?: DateRangeParams
  ): Promise<ScoreDistribution[]> {
    const queryString = buildQueryParams(filters, dateParams);
    const response = await fetch(
      `${getBackendUrl()}/admin/simple/score-distribution?${queryString}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error("Failed to fetch score distribution");
    const data = await response.json();

    // Transform backend response
    const total = data.total || 0;
    const distribution = data.distribution || [];

    return distribution.map((item: any) => ({
      status: item.status_band,
      count: item.count,
      percentage: total > 0 ? (item.count / total) * 100 : 0,
    }));
  },

  /**
   * Get category performance (6 categories)
   */
  async getCategoryPerformance(
    filters?: DemographicFilters,
    dateParams?: DateRangeParams
  ): Promise<CategoryPerformance[]> {
    const queryString = buildQueryParams(filters, dateParams);
    const response = await fetch(
      `${getBackendUrl()}/admin/simple/category-performance?${queryString}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error("Failed to fetch category performance");
    const data = await response.json();

    // Transform backend response
    const categories = data.categories || [];

    return categories.map((item: any) => ({
      category: item.category,
      average_score: item.average_score || 0, // Changed from avg_score
      max_possible: item.max_possible || 100, // Get from API response
      percentage: item.percentage || 0, // Changed to use API percentage
    }));
  },

  /**
   * Get time series data (submissions over time)
   */
  async getTimeSeries(
    groupBy: "day" | "week" | "month" | "quarter" | "year" = "day",
    filters?: DemographicFilters,
    dateParams?: DateRangeParams
  ): Promise<TimeSeriesData[]> {
    const queryString = buildQueryParams(filters, dateParams, {
      group_by: groupBy,
    });
    const response = await fetch(
      `${getBackendUrl()}/admin/simple/time-series?${queryString}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error("Failed to fetch time series data");
    const data = await response.json();

    // Transform backend response
    const timeSeries = data.time_series || [];

    return timeSeries.map((item: any) => ({
      period: item.period,
      submissions: item.count || 0,
      average_score: item.avg_score || 0,
    }));
  },

  /**
   * Get nationality breakdown (Emirati vs Non-Emirati)
   */
  async getNationalityBreakdown(
    filters?: DemographicFilters,
    dateParams?: DateRangeParams
  ): Promise<NationalityBreakdown[]> {
    const queryString = buildQueryParams(filters, dateParams);
    const response = await fetch(
      `${getBackendUrl()}/admin/simple/nationality-breakdown?${queryString}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error("Failed to fetch nationality breakdown");
    const data = await response.json();

    // Transform backend response to array format
    const result: NationalityBreakdown[] = [];

    if (data.emirati && data.emirati.count > 0) {
      result.push({
        nationality: "Emirati",
        total: data.emirati.count,
        excellent: 0, // TODO: Backend should provide this
        good: 0,
        needs_improvement: 0,
        at_risk: 0,
        average_score: data.emirati.avg_score || 0,
      });
    }

    if (data.non_emirati && data.non_emirati.count > 0) {
      result.push({
        nationality: "Non-Emirati",
        total: data.non_emirati.count,
        excellent: 0,
        good: 0,
        needs_improvement: 0,
        at_risk: 0,
        average_score: data.non_emirati.avg_score || 0,
      });
    }

    return result;
  },

  /**
   * Get age breakdown
   */
  async getAgeBreakdown(
    filters?: DemographicFilters,
    dateParams?: DateRangeParams
  ): Promise<AgeBreakdown[]> {
    const queryString = buildQueryParams(filters, dateParams);
    const response = await fetch(
      `${getBackendUrl()}/admin/simple/age-breakdown?${queryString}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error("Failed to fetch age breakdown");
    const data = await response.json();

    // Transform backend response
    const ageGroups = data.age_groups || [];
    const total = data.total || 0;

    return ageGroups.map((item: any) => ({
      age_group: item.age_group,
      total: item.count,
      average_score: item.avg_score || 0,
      percentage: total > 0 ? (item.count / total) * 100 : 0,
    }));
  },

  /**
   * Get companies analytics
   */
  async getCompaniesAnalytics(
    filters?: DemographicFilters,
    dateParams?: DateRangeParams
  ): Promise<CompanyAnalytics[]> {
    const queryString = buildQueryParams(filters, dateParams);
    const response = await fetch(
      `${getBackendUrl()}/admin/simple/companies-analytics?${queryString}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error("Failed to fetch companies analytics");
    const data = await response.json();

    // Transform backend response
    const companies = data.companies || [];

    return companies.map((item: any) => ({
      company: item.company_name || item.company || "Unknown",
      total_submissions: item.total_responses || 0,
      average_score: item.average_score || item.avg_score || 0,
      excellent: item.excellent_count || 0,
      good: item.good_count || 0,
      needs_improvement: item.needs_improvement_count || 0,
      at_risk: item.at_risk_count || 0,
    }));
  },

  /**
   * Get score analytics table (question-level breakdown)
   */
  async getScoreAnalyticsTable(
    filters?: DemographicFilters,
    dateParams?: DateRangeParams
  ): Promise<ScoreAnalyticsResponse> {
    const queryString = buildQueryParams(filters, dateParams);
    const response = await fetch(
      `${getBackendUrl()}/admin/simple/score-analytics-table?${queryString}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error("Failed to fetch score analytics table");
    const data = await response.json();

    // Backend now returns object with metadata
    if (Array.isArray(data)) {
      // Legacy format - wrap in new format
      return {
        questions: data.map((item: any) => ({
          question_number: item.question_number || 0,
          question_text: item.question_text || "",
          category: item.category || "Unknown",
          emirati_avg: item.emirati_avg ?? null,
          non_emirati_avg: item.non_emirati_avg ?? null,
          emirati_count: item.emirati_count || 0,
          non_emirati_count: item.non_emirati_count || 0,
        })),
        total_questions: data.length,
        question_set_type: "default",
        variation_set_name: null,
        filtered: false,
      };
    }

    // New format with metadata
    return {
      questions: (data.questions || []).map((item: any) => ({
        question_number: item.question_number || 0,
        question_text: item.question_text || "",
        category: item.category || "Unknown",
        emirati_avg: item.emirati_avg ?? null,
        non_emirati_avg: item.non_emirati_avg ?? null,
        emirati_count: item.emirati_count || 0,
        non_emirati_count: item.non_emirati_count || 0,
      })),
      total_questions: data.total_questions || 0,
      question_set_type: data.question_set_type || "default",
      variation_set_name: data.variation_set_name || null,
      filtered: data.filtered || false,
    };
  },

  /**
   * Export data as CSV
   */
  async exportCSV(
    filters?: DemographicFilters,
    dateParams?: DateRangeParams
  ): Promise<Blob> {
    const queryString = buildQueryParams(filters, dateParams);
    const response = await fetch(
      `${getBackendUrl()}/admin/simple/export-csv?${queryString}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error("Failed to export CSV");
    return response.blob();
  },

  /**
   * Export data as Excel
   */
  async exportExcel(
    filters?: DemographicFilters,
    dateParams?: DateRangeParams
  ): Promise<Blob> {
    const queryString = buildQueryParams(filters, dateParams);
    const response = await fetch(
      `${getBackendUrl()}/admin/simple/export-excel?${queryString}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error("Failed to export Excel");
    return response.blob();
  },

  /**
   * Get employment status breakdown
   */
  async getEmploymentBreakdown(
    filters?: DemographicFilters,
    dateParams?: DateRangeParams
  ): Promise<{ status: string; count: number }[]> {
    const queryString = buildQueryParams(filters, dateParams);
    const response = await fetch(
      `${getBackendUrl()}/admin/simple/employment-breakdown?${queryString}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error("Failed to fetch employment breakdown");
    const data = await response.json();
    return data.breakdown || [];
  },

  /**
   * Get emirate breakdown
   */
  async getEmirateBreakdown(
    filters?: DemographicFilters,
    dateParams?: DateRangeParams
  ): Promise<{ emirate: string; count: number }[]> {
    const queryString = buildQueryParams(filters, dateParams);
    const response = await fetch(
      `${getBackendUrl()}/admin/simple/emirate-breakdown?${queryString}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error("Failed to fetch emirate breakdown");
    const data = await response.json();
    return data.breakdown || [];
  },

  /**
   * Get children count breakdown
   */
  async getChildrenBreakdown(
    filters?: DemographicFilters,
    dateParams?: DateRangeParams
  ): Promise<{ count_label: string; count: number; average_score: number }[]> {
    const queryString = buildQueryParams(filters, dateParams);
    const response = await fetch(
      `${getBackendUrl()}/admin/simple/children-breakdown?${queryString}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error("Failed to fetch children breakdown");
    const data = await response.json();
    return data.breakdown || [];
  },

  /**
   * Get income range breakdown
   */
  async getIncomeRangeBreakdown(
    filters?: DemographicFilters,
    dateParams?: DateRangeParams
  ): Promise<{ range: string; count: number; average_score: number }[]> {
    const queryString = buildQueryParams(filters, dateParams);
    const response = await fetch(
      `${getBackendUrl()}/admin/simple/income-breakdown?${queryString}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error("Failed to fetch income breakdown");
    const data = await response.json();
    return data.breakdown || [];
  },

  /**
   * Get gender breakdown
   */
  async getGenderBreakdown(
    filters?: DemographicFilters,
    dateParams?: DateRangeParams
  ): Promise<{ gender: string; count: number; percentage: number }[]> {
    const queryString = buildQueryParams(filters, dateParams);
    const response = await fetch(
      `${getBackendUrl()}/admin/simple/gender-breakdown?${queryString}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error("Failed to fetch gender breakdown");
    const data = await response.json();
    return data.breakdown || [];
  },

  // Companies Details API methods
  async uploadCompaniesCSV(file: File): Promise<{
    message: string;
    companies_uploaded: number;
    companies: any[];
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(
      `${getBackendUrl()}/companies-details/upload-csv`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
        },
        body: formData,
      }
    );
    
    if (!response.ok) throw new Error("Failed to upload CSV");
    return await response.json();
  },

  async getUploadedCompanies(search?: string): Promise<{
    companies: any[];
    total: number;
  }> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    
    const response = await fetch(
      `${getBackendUrl()}/companies-details/companies?${params}`,
      { headers: getAuthHeaders() }
    );
    
    if (!response.ok) throw new Error("Failed to fetch companies");
    return await response.json();
  },

  async searchCompanies(query: string, limit: number = 10): Promise<any[]> {
    const response = await fetch(
      `${getBackendUrl()}/companies-details/search-companies?q=${encodeURIComponent(query)}&limit=${limit}`,
      { headers: getAuthHeaders() }
    );
    
    if (!response.ok) throw new Error("Failed to search companies");
    return await response.json();
  },

  async createCustomerProfile(profileData: {
    company_id: number;
    full_name: string;
    date_of_birth: string;
    gender: string;
    nationality: string;
    emirate: string;
    children: string;
    employment_status: string;
    household_income: string;
    email: string;
    mobile_number: string;
  }): Promise<any> {
    const formData = new FormData();
    Object.entries(profileData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    const response = await fetch(
      `${getBackendUrl()}/companies-details/customer-profile`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_access_token")}`,
        },
        body: formData,
      }
    );
    
    if (!response.ok) throw new Error("Failed to create customer profile");
    return await response.json();
  },

  async getCustomerProfiles(companyId?: number): Promise<any[]> {
    const params = new URLSearchParams();
    if (companyId) params.append('company_id', companyId.toString());
    
    const response = await fetch(
      `${getBackendUrl()}/companies-details/customer-profiles?${params}`,
      { headers: getAuthHeaders() }
    );
    
    if (!response.ok) throw new Error("Failed to fetch customer profiles");
    return await response.json();
  },
};
