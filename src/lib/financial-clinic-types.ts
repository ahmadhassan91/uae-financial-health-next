/**
 * TypeScript types for Financial Clinic Survey System
 * 
 * This file defines all interfaces and types for the Financial Clinic
 * survey, which uses a 0-100 scoring system with 6 categories.
 */

// ==================== Question Types ====================

export interface FinancialClinicOption {
  value: number; // 1-5 (5 = best answer)
  label_en: string;
  label_ar: string;
}

export interface FinancialClinicQuestion {
  id: string; // e.g., "fc_q1"
  number: number; // 1-15
  category: string; // "Income Stream", "Savings Habit", etc.
  weight: number; // Percentage weight (e.g., 5 for 5%)
  text_en: string;
  text_ar: string;
  options: FinancialClinicOption[];
  conditional: boolean; // No longer used (Q16 removed)
}

// ==================== Profile Types ====================

export interface FinancialClinicProfile {
  // Required fields
  name: string;
  date_of_birth: string; // Format: DD/MM/YYYY
  gender: "Male" | "Female";
  nationality: "Emirati" | "Non-Emirati";
  children: number; // 0-5+
  employment_status: "Employed" | "Self-Employed" | "Unemployed";
  income_range: string; // "Below 5K", "5K-10K", etc.
  emirate: string; // "Dubai", "Abu Dhabi", etc.
  email: string;
  
  // Optional fields
  mobile_number?: string;
}

// ==================== Response Types ====================

export interface FinancialClinicAnswers {
  [questionId: string]: number; // question_id -> answer value (1-5)
}

// ==================== Result Types ====================

export interface CategoryScore {
  score: number; // Contribution to total (0-20)
  max_possible: number; // Max for this category (15, 20, etc.)
  percentage: number; // Category performance (0-100%)
  status_level: "at_risk" | "good" | "excellent";
}

export interface FinancialClinicCategoryScores {
  "Income Stream": CategoryScore;
  "Savings Habit": CategoryScore;
  "Emergency Savings": CategoryScore;
  "Debt Management": CategoryScore;
  "Retirement Planning": CategoryScore;
  "Protecting Your Family": CategoryScore;
}

export interface FinancialClinicInsight {
  category: string;
  status_level: "at_risk" | "good" | "excellent";
  text: string;
  priority: number;
}

export interface ProductRecommendation {
  id: number;
  name: string;
  category: string;
  description: string;
  priority: number;
}

export interface FinancialClinicResult {
  total_score: number; // 0-100
  status_band: "Excellent" | "Good" | "Needs Improvement" | "At Risk";
  category_scores: FinancialClinicCategoryScores;
  insights: FinancialClinicInsight[]; // Max 5
  products: ProductRecommendation[]; // Max 3
  questions_answered: number;
  total_questions: number;
  survey_response_id?: number | null; // Added for database persistence
}

// ==================== API Request/Response Types ====================

export interface FinancialClinicCalculateRequest {
  answers: FinancialClinicAnswers;
  profile: FinancialClinicProfile;
}

export interface FinancialClinicCalculateResponse extends FinancialClinicResult {}

// ==================== Survey State Types ====================

export interface FinancialClinicSurveyState {
  currentQuestion: number;
  answers: FinancialClinicAnswers;
  profile: FinancialClinicProfile | null;
  result: FinancialClinicResult | null;
  loading: boolean;
  error: string | null;
}

// ==================== Category Information ====================

export const FINANCIAL_CLINIC_CATEGORIES = [
  "Income Stream",
  "Savings Habit",
  "Emergency Savings",
  "Debt Management",
  "Retirement Planning",
  "Protecting Your Family"
] as const;

export type FinancialClinicCategory = typeof FINANCIAL_CLINIC_CATEGORIES[number];

// ==================== Status Band Colors ====================

export const STATUS_BAND_COLORS: Record<FinancialClinicResult["status_band"], string> = {
  "Excellent": "#10b981", // green-500
  "Good": "#3b82f6", // blue-500
  "Needs Improvement": "#f59e0b", // amber-500
  "At Risk": "#ef4444" // red-500
};

// ==================== Category Status Colors ====================

export const CATEGORY_STATUS_COLORS: Record<CategoryScore["status_level"], string> = {
  "excellent": "#10b981",
  "good": "#3b82f6",
  "at_risk": "#ef4444"
};

// ==================== Helper Type Guards ====================

export function isFinancialClinicResult(obj: any): obj is FinancialClinicResult {
  return (
    obj &&
    typeof obj.total_score === "number" &&
    typeof obj.status_band === "string" &&
    obj.category_scores &&
    Array.isArray(obj.insights) &&
    Array.isArray(obj.products)
  );
}

export function hasChildren(profile: FinancialClinicProfile): boolean {
  return profile.children > 0;
}
