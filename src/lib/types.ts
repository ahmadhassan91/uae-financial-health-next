export interface User {
  id: string;
  email?: string;
  name?: string;
  createdAt: Date;
}

export interface UserInfo {
  avatarUrl: string;
  email: string;
  id: string;
  isOwner: boolean;
  login: string;
}

declare global {
  interface Window {
    spark: {
      llmPrompt: (strings: string[], ...values: unknown[]) => string;
      llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>;
      user: () => Promise<UserInfo>;
      kv: {
        keys: () => Promise<string[]>;
        get: <T>(key: string) => Promise<T | undefined>;
        set: <T>(key: string, value: T) => Promise<void>;
        delete: (key: string) => Promise<void>;
      };
    };
  }
}

// v2 Types for Financial Health Check
export type ModelVersion = 'v2';

export type FinancialFactor = 
  | 'income_stream'
  | 'monthly_expenses'
  | 'savings_habit' 
  | 'debt_management'
  | 'retirement_planning'
  | 'protection'
  | 'future_planning';

export interface CustomerProfile {
  name: string;
  age: number;
  gender: 'Male' | 'Female';
  nationality: string;
  children: 'Yes' | 'No';
  employmentStatus: string;
  employmentSector: string;
  incomeRange: string;
  emailAddress: string;
  residence: string;
}

export interface Question {
  id: string;
  questionNumber: number;
  text: string;
  type: 'likert';
  options: LikertOption[];
  required: boolean;
  factor: FinancialFactor;
  weight: number; // percentage (e.g., 10 for 10%)
  conditional?: boolean; // true for Q16
}

export interface LikertOption {
  value: number; // 5, 4, 3, 2, 1
  label: string;
}

export interface SurveyResponse {
  questionId: string;
  value: number; // 1-5 Likert scale
}

export interface ScoreCalculation {
  id: string;
  userId: string;
  profile: CustomerProfile;
  responses: SurveyResponse[];
  totalScore: number;
  maxPossibleScore: number; // 75 or 80 depending on Q16
  pillarScores: PillarScore[];
  subScores: SubScore[]; // Keep for backward compatibility
  advice: string[];
  createdAt: Date;
  modelVersion: ModelVersion;
  surveyResponseId?: number; // For report generation
}

export interface PillarScore {
  pillar: FinancialFactor;
  score: number; // calculated based on questions
  maxScore: number; // max possible for this pillar
  percentage: number; // score/maxScore * 100
  interpretation: ScoreInterpretation;
}

export interface SubScore {
  factor: FinancialFactor;
  name: string;
  score: number; // 1-5 scale
  maxScore: number; // always 5
  percentage: number; // score/maxScore * 100
  description: string;
  interpretation: ScoreInterpretation;
}

export type ScoreInterpretation = 'Excellent' | 'Good' | 'Needs Improvement' | 'At Risk';

export interface ConsentRecord {
  userId: string;
  consentType: 'profiling' | 'data_processing' | 'marketing';
  granted: boolean;
  timestamp: Date;
  ipAddress?: string;
}

// Enhanced Localization Types
export type SupportedLanguage = 'en' | 'ar';
export type ContentType = 'ui' | 'question' | 'recommendation' | 'page' | 'email';

export interface LocalizedContent {
  id: number;
  content_type: ContentType;
  content_id: string;
  language: SupportedLanguage;
  title?: string;
  text: string;
  options?: QuestionOption[];
  extra_data?: Record<string, any>;
  version: string;
  is_active: boolean;
  usage_count?: number;
  last_used?: Date;
  created_at: string;
  updated_at?: string;
  tags?: string[];
  context?: string;
}

export interface QuestionOption {
  value: number | string;
  label: string;
  description?: string;
}

export interface ContentStats {
  totalItems: number;
  englishItems: number;
  arabicItems: number;
  missingTranslations: string[];
  lastUpdated: Date;
  cacheHitRate: number;
  loadingErrors: number;
}

export interface CacheStats {
  size: number;
  hitRate: number;
  missRate: number;
  lastCleared: Date;
  memoryUsage: number;
}

export interface ContentFilters {
  contentType?: ContentType;
  language?: SupportedLanguage;
  isActive?: boolean;
  searchTerm?: string;
  tags?: string[];
}

export interface ContentCache {
  [key: string]: {
    data: Record<string, string>;
    timestamp: number;
    ttl: number;
    hits: number;
  };
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
  progress?: number;
}