'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  SupportedLanguage,
  ContentType,
  LocalizedContent,
  ContentStats,
  CacheStats,
  ContentCache,
  LoadingState
} from '@/lib/types';
import { translations as simpleTranslations } from '@/lib/simple-translations';
import { apiClient } from '@/lib/api-client';

export interface EnhancedLocalizationContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, any>) => string;
  isRTL: boolean;
  formatNumber: (num: number) => string;
  formatDate: (date: Date) => string;
  isLoading: boolean;
  translations: Record<string, string>;
  contentStats: ContentStats;
  cacheStats: CacheStats;
  loadingState: LoadingState;
  refreshContent: (contentType?: ContentType) => Promise<void>;
  preloadContent: (contentTypes: ContentType[]) => Promise<void>;
  getCachedContent: () => Record<string, string>;
  getContentByType: (type: ContentType) => LocalizedContent[];
  invalidateCache: (contentType?: ContentType) => void;
  clearCache: () => void;
  getTranslationCoverage: () => { en: number; ar: number; missing: string[] };
}

const LocalizationContext = createContext<EnhancedLocalizationContextType | undefined>(undefined);

interface LocalizationProviderProps {
  children: ReactNode;
  defaultLanguage?: SupportedLanguage;
}

// Default English translations (fallback)
const DEFAULT_TRANSLATIONS: Record<string, string> = {
  // Navigation and UI
  'welcome_message': 'Welcome to Financial Health Assessment',
  'start_survey': 'Start Assessment',
  'next_question': 'Next Question',
  'previous_question': 'Previous Question',
  'submit_survey': 'Submit Assessment',
  'your_results': 'Your Results',
  'download_pdf': 'Download Report',
  'send_email': 'Send via Email',
  'register_account': 'Create Account',
  'language_selector': 'Select Language',
  'continue_assessment': 'Continue Assessment',
  'begin_assessment_now': 'Begin Assessment Now',
  'access_previous_results': 'Access Previous Results',
  'view_previous_results': 'View Previous Results',

  // Assessment and Scoring
  'financial_health_score': 'Financial Health Score',
  'recommendations': 'Recommendations',
  'budgeting': 'Budgeting',
  'savings': 'Savings',
  'debt_management': 'Debt Management',
  'financial_planning': 'Financial Planning',
  'investment_knowledge': 'Investment Knowledge',
  'income_stream': 'Income Stream',
  'monthly_expenses': 'Monthly Expenses Management',
  'savings_habit': 'Savings Habit',
  'retirement_planning': 'Retirement Planning',
  'protection': 'Protecting Your Assets & Loved Ones',
  'future_planning': 'Planning for Your Future & Siblings',

  // Score Interpretations
  'excellent': 'Excellent',
  'good': 'Good',
  'fair': 'Fair',
  'needs_improvement': 'Needs Improvement',
  'poor': 'Poor',
  'at_risk': 'At Risk',

  // Personal Information
  'personal_information': 'Personal Information',
  'first_name': 'First Name',
  'last_name': 'Last Name',
  'age': 'Age',
  'gender': 'Gender',
  'male': 'Male',
  'female': 'Female',
  'other': 'Other',
  'prefer_not_to_say': 'Prefer not to say',
  'nationality': 'Nationality',
  'emirate': 'Emirate',
  'employment_status': 'Employment Status',
  'employment_sector': 'Employment Sector',
  'monthly_income': 'Monthly Income',
  'income_range': 'Household Monthly Income Range in AED',
  'household_size': 'Household Size',
  'children': 'Children',
  'residence': 'Residence',
  'yes': 'Yes',
  'no': 'No',
  'email': 'Email Address',
  'phone_number': 'Phone Number',

  // Actions
  'save': 'Save',
  'cancel': 'Cancel',
  'edit': 'Edit',
  'delete': 'Delete',
  'confirm': 'Confirm',
  'back': 'Back',
  'continue': 'Continue',
  'complete': 'Complete',
  'skip': 'Skip',

  // Status Messages
  'loading': 'Loading...',
  'error': 'Error',
  'success': 'Success',
  'warning': 'Warning',
  'info': 'Information',

  // Authentication
  'sign_in': 'Sign In',
  'sign_out': 'Sign Out',
  'sign_up': 'Sign Up',
  'welcome_back': 'Welcome back!',
  'date_of_birth': 'Date of Birth',

  // Landing Page
  'financial_health_assessment': 'Financial Health Assessment',
  'trusted_uae_institution': 'A trusted UAE financial institution providing transparent, science-based financial wellness assessment.',
  'get_personalized_insights': 'Get personalized insights to strengthen your financial future.',
  'transparent_scoring': 'Transparent Scoring',
  'privacy_protected': 'Privacy Protected',
  'personalized_insights': 'Personalized Insights',
  'progress_tracking': 'Progress Tracking',
  'science_based_methodology': 'Science-Based Methodology',
  'uae_specific_insights': 'UAE-Specific Insights',
  'ready_to_improve': 'Ready to Improve Your Financial Health?',
  'join_thousands': 'Join thousands of UAE residents who have strengthened their financial future with our comprehensive assessment.',

  // Assessment Flow
  'progress_overview': 'Progress Overview',
  'questions_total': 'questions total',
  'current': 'Current',
  'completed': 'Completed',
  'pending': 'Pending',
  'complete_assessment': 'Complete Assessment',
  'strongly_agree': 'Strongly Agree',
  'agree': 'Agree',
  'neutral': 'Neutral',
  'disagree': 'Disagree',
  'strongly_disagree': 'Strongly Disagree',

  // Results and Reports
  'overall_score': 'Overall Score',
  'pillar_breakdown': 'Pillar Breakdown',
  'detailed_recommendations': 'Detailed Recommendations',
  'action_plan': 'Action Plan',
  'next_steps': 'Next Steps',
  'download_report': 'Download Report',
  'email_report': 'Email Report',
  'share_results': 'Share Results',

  // Error Messages
  'error_loading_questions': 'Error loading questions. Please try again.',
  'error_saving_response': 'Error saving response. Please try again.',
  'error_generating_report': 'Error generating report. Please try again.',
  'network_error': 'Network error. Please check your connection.',

  // Validation Messages
  'field_required': 'This field is required',
  'invalid_email': 'Please enter a valid email address',
  'invalid_date': 'Please enter a valid date',
  'please_select_option': 'Please select an option',

  // Additional UI
  'of': 'of',
};

export function LocalizationProvider({ children, defaultLanguage = 'en' }: LocalizationProviderProps) {
  const [language, setLanguageState] = useState<SupportedLanguage>(defaultLanguage);
  const [translations, setTranslations] = useState<Record<string, string>>(DEFAULT_TRANSLATIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [allContent, setAllContent] = useState<LocalizedContent[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: false });
  const pathname = usePathname();

  // Cache management
  const cacheRef = useRef<ContentCache>({});
  const cacheStatsRef = useRef<CacheStats>({
    size: 0,
    hitRate: 0,
    missRate: 0,
    lastCleared: new Date(),
    memoryUsage: 0
  });

  // Cache configuration
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  const MAX_CACHE_SIZE = 100; // Maximum number of cached items
  const RETRY_ATTEMPTS = 3;
  const RETRY_DELAY = 1000; // 1 second

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred_language') as SupportedLanguage;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Load translations when language changes
  useEffect(() => {
    loadTranslations(language);
  }, [language]);

  // Update document direction and language attributes
  useEffect(() => {
    // Check if we're on an admin route - if so, don't apply RTL
    const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/login');

    const isRTL = language === 'ar' && !isAdminRoute;

    // Only apply RTL if not on admin routes
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;

    // Update CSS custom properties for RTL support (only if not admin)
    if (!isAdminRoute) {
      document.documentElement.style.setProperty('--text-align-start', isRTL ? 'right' : 'left');
      document.documentElement.style.setProperty('--text-align-end', isRTL ? 'left' : 'right');
      document.documentElement.style.setProperty('--margin-start', isRTL ? 'margin-right' : 'margin-left');
      document.documentElement.style.setProperty('--margin-end', isRTL ? 'margin-left' : 'margin-right');
      document.documentElement.style.setProperty('--padding-start', isRTL ? 'padding-right' : 'padding-left');
      document.documentElement.style.setProperty('--padding-end', isRTL ? 'padding-left' : 'padding-right');
    } else {
      // Force LTR for admin routes
      document.documentElement.style.setProperty('--text-align-start', 'left');
      document.documentElement.style.setProperty('--text-align-end', 'right');
      document.documentElement.style.setProperty('--margin-start', 'margin-left');
      document.documentElement.style.setProperty('--margin-end', 'margin-right');
      document.documentElement.style.setProperty('--padding-start', 'padding-left');
      document.documentElement.style.setProperty('--padding-end', 'padding-right');
    }

    // Load Arabic fonts when switching to Arabic (regardless of admin route)
    if (language === 'ar' && !document.querySelector('link[href*="Noto+Sans+Arabic"]')) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, [language, pathname]);

  // Cache management functions
  const getCacheKey = (contentType: ContentType, language: SupportedLanguage): string => {
    return `${contentType}_${language}`;
  };

  const isCacheValid = (cacheEntry: any): boolean => {
    return Date.now() - cacheEntry.timestamp < cacheEntry.ttl;
  };

  const updateCacheStats = (hit: boolean) => {
    const stats = cacheStatsRef.current;
    if (hit) {
      stats.hitRate = (stats.hitRate + 1) / 2; // Simple moving average
    } else {
      stats.missRate = (stats.missRate + 1) / 2;
    }
  };

  const clearExpiredCache = () => {
    const cache = cacheRef.current;
    const now = Date.now();

    Object.keys(cache).forEach(key => {
      if (now - cache[key].timestamp > cache[key].ttl) {
        delete cache[key];
      }
    });

    cacheStatsRef.current.size = Object.keys(cache).length;
  };

  // Enhanced content loading with retry logic
  const loadContentWithRetry = async (
    url: string,
    retries: number = RETRY_ATTEMPTS
  ): Promise<any> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const text = await response.text();
          // Handle empty response
          if (!text || text.trim() === '') {
            return {};
          }
          try {
            return JSON.parse(text);
          } catch (jsonError) {
            console.error('JSON parse error:', jsonError, 'Response text:', text);
            return {};
          }
        }

        if (attempt === retries) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      }
    }
  };

  const loadTranslations = async (lang: SupportedLanguage) => {
    setIsLoading(true);
    setLoadingState({ isLoading: true, progress: 0 });

    try {
      // Check cache first
      const cacheKey = getCacheKey('ui', lang);
      const cachedData = cacheRef.current[cacheKey];

      if (cachedData && isCacheValid(cachedData)) {
        setTranslations({ ...DEFAULT_TRANSLATIONS, ...cachedData.data });
        cachedData.hits++;
        updateCacheStats(true);
        console.log(`Loaded ${Object.keys(cachedData.data).length} translations for ${lang} from cache`);
        return;
      }

      updateCacheStats(false);
      setLoadingState({ isLoading: true, progress: 25 });

      // Load from API with retry logic
      const apiTranslations = await apiClient.getUITranslations(lang);

      setLoadingState({ isLoading: true, progress: 75 });

      // Merge with defaults, API translations take precedence
      const mergedTranslations = { ...DEFAULT_TRANSLATIONS, ...apiTranslations };
      setTranslations(mergedTranslations);

      // Cache the results
      clearExpiredCache();
      if (Object.keys(cacheRef.current).length >= MAX_CACHE_SIZE) {
        // Remove oldest cache entry
        const oldestKey = Object.keys(cacheRef.current)
          .sort((a, b) => cacheRef.current[a].timestamp - cacheRef.current[b].timestamp)[0];
        delete cacheRef.current[oldestKey];
      }

      cacheRef.current[cacheKey] = {
        data: apiTranslations,
        timestamp: Date.now(),
        ttl: CACHE_TTL,
        hits: 1
      };

      cacheStatsRef.current.size = Object.keys(cacheRef.current).length;

      console.log(`Loaded ${Object.keys(apiTranslations).length} translations for ${lang} from API`);

    } catch (error) {
      console.error(`Error loading ${lang} translations:`, error);
      setLoadingState({
        isLoading: false,
        error: `Failed to load ${lang} translations: ${error instanceof Error ? error.message : 'Unknown error'}`
      });

      // Use default translations as fallback instead of empty object
      setTranslations(DEFAULT_TRANSLATIONS);
    } finally {
      setIsLoading(false);
      setLoadingState({ isLoading: false, progress: 100 });
    }
  };

  // Load all content for admin purposes - DISABLED to avoid 403 errors
  const loadAllContent = async (): Promise<LocalizedContent[]> => {
    // Disabled to avoid 403 errors - just return empty array
    return [];
  };

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('preferred_language', lang);
  };

  const t = (key: string, params?: Record<string, any>): string => {
    try {
      // Priority order: API translations > simple static translations > defaults
      let translation = translations[key]; // API translations first

      // Fallback to simple static translations if not found in API
      if (!translation) {
        const languageTranslations = simpleTranslations?.[language] || simpleTranslations?.en || {};
        translation = languageTranslations[key];
      }

      // Final fallback to defaults
      if (!translation) {
        translation = DEFAULT_TRANSLATIONS[key] || key;
      }

      // Simple parameter substitution
      if (params && translation) {
        Object.entries(params).forEach(([paramKey, value]) => {
          translation = translation.replace(`{{${paramKey}}}`, String(value));
        });
      }

      return translation || key;
    } catch (error) {
      console.warn('Translation error for key:', key, error);
      // Fallback to state translations or default
      return translations[key] || DEFAULT_TRANSLATIONS[key] || key;
    }
  };

  // Enhanced API methods
  const refreshContent = useCallback(async (contentType?: ContentType): Promise<void> => {
    if (contentType) {
      // Invalidate specific content type cache
      const cacheKey = getCacheKey(contentType, language);
      delete cacheRef.current[cacheKey];
    } else {
      // Clear all cache
      cacheRef.current = {};
      cacheStatsRef.current.lastCleared = new Date();
    }

    // Reload current language translations
    await loadTranslations(language);
  }, [language]);

  const preloadContent = useCallback(async (contentTypes: ContentType[]): Promise<void> => {
    const promises = contentTypes.map(async (type) => {
      try {
        const cacheKey = getCacheKey(type, language);
        if (!cacheRef.current[cacheKey] || !isCacheValid(cacheRef.current[cacheKey])) {
          const content = await apiClient.getLocalizedContent(language, type);

          // Transform to key-value pairs for caching
          const keyValuePairs: Record<string, string> = {};
          content.forEach((item: LocalizedContent) => {
            keyValuePairs[item.content_id] = item.text;
          });

          cacheRef.current[cacheKey] = {
            data: keyValuePairs,
            timestamp: Date.now(),
            ttl: CACHE_TTL,
            hits: 0
          };
        }
      } catch (error) {
        console.error(`Error preloading ${type} content:`, error);
      }
    });

    await Promise.all(promises);
    cacheStatsRef.current.size = Object.keys(cacheRef.current).length;
  }, [language]);

  const getCachedContent = useCallback((): Record<string, string> => {
    return translations;
  }, [translations]);

  const getContentByType = useCallback((type: ContentType): LocalizedContent[] => {
    return allContent.filter(item => item.content_type === type && item.language === language);
  }, [allContent, language]);

  const invalidateCache = useCallback((contentType?: ContentType): void => {
    if (contentType) {
      const cacheKey = getCacheKey(contentType, language);
      delete cacheRef.current[cacheKey];
    } else {
      cacheRef.current = {};
      cacheStatsRef.current.lastCleared = new Date();
    }
    cacheStatsRef.current.size = Object.keys(cacheRef.current).length;
  }, [language]);

  const clearCache = useCallback((): void => {
    cacheRef.current = {};
    cacheStatsRef.current = {
      size: 0,
      hitRate: 0,
      missRate: 0,
      lastCleared: new Date(),
      memoryUsage: 0
    };
  }, []);

  const getTranslationCoverage = useCallback(() => {
    const enContent = allContent.filter(item => item.language === 'en' && item.is_active);
    const arContent = allContent.filter(item => item.language === 'ar' && item.is_active);

    const enKeys = new Set(enContent.map(item => item.content_id));
    const arKeys = new Set(arContent.map(item => item.content_id));

    const missing = Array.from(enKeys).filter(key => !arKeys.has(key));

    return {
      en: enContent.length,
      ar: arContent.length,
      missing
    };
  }, [allContent]);

  // Calculate content stats
  const contentStats: ContentStats = {
    totalItems: allContent.length,
    englishItems: allContent.filter(item => item.language === 'en' && item.is_active).length,
    arabicItems: allContent.filter(item => item.language === 'ar' && item.is_active).length,
    missingTranslations: getTranslationCoverage().missing,
    lastUpdated: new Date(),
    cacheHitRate: cacheStatsRef.current.hitRate,
    loadingErrors: loadingState.error ? 1 : 0
  };

  // Check if we're on admin route to disable RTL
  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/login');
  const isRTL = language === 'ar' && !isAdminRoute;

  const formatNumber = (num: number): string => {
    if (language === 'ar') {
      // Use Arabic-Indic numerals for Arabic
      return new Intl.NumberFormat('ar-AE').format(num);
    }
    return new Intl.NumberFormat('en-AE').format(num);
  };

  const formatDate = (date: Date): string => {
    if (language === 'ar') {
      return new Intl.DateTimeFormat('ar-AE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    }
    return new Intl.DateTimeFormat('en-AE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Load all content on mount for admin features - DISABLED to avoid 403 errors
  // useEffect(() => {
  //   loadAllContent();
  // }, []);

  const value: EnhancedLocalizationContextType = {
    language,
    setLanguage,
    t,
    isRTL,
    formatNumber,
    formatDate,
    isLoading,
    translations,
    contentStats,
    cacheStats: cacheStatsRef.current,
    loadingState,
    refreshContent,
    preloadContent,
    getCachedContent,
    getContentByType,
    invalidateCache,
    clearCache,
    getTranslationCoverage
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization(): EnhancedLocalizationContextType {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
}

// Backward compatibility export
export type LocalizationContextType = EnhancedLocalizationContextType;