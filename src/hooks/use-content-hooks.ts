/**
 * Specialized Localization Hooks
 * 
 * Enhanced hooks that integrate with ContentLoader service for different content types:
 * - usePageContent: For homepage and page-specific content
 * - useSurveyContent: For assessment questions and options
 * - useResultsContent: For results, recommendations, and score interpretations
 * - useUIContent: For general interface elements
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalization } from '@/contexts/LocalizationContext';
import { contentLoader } from '@/lib/content-loader';
import { 
  ContentType, 
  LocalizedContent, 
  SupportedLanguage,
  QuestionOption 
} from '@/lib/types';

// Base hook interface
interface BaseContentHookReturn {
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Page content hook for homepage and other pages
interface UsePageContentReturn extends BaseContentHookReturn {
  content: LocalizedContent[];
  getPageText: (key: string, fallback?: string) => string;
  getPageTitle: (key: string, fallback?: string) => string;
  hasContent: (key: string) => boolean;
  getAllPageContent: () => Record<string, string>;
}

export function usePageContent(pageId?: string): UsePageContentReturn {
  const { language, t } = useLocalization();
  const [content, setContent] = useState<LocalizedContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const pageContent = await contentLoader.loadContentByType('page', language);
      const uiContent = await contentLoader.loadContentByType('ui', language);
      
      // Combine page and UI content for comprehensive coverage
      const combinedContent = [...pageContent, ...uiContent];
      setContent(combinedContent);
      
      console.log(`usePageContent: Loaded ${combinedContent.length} items for ${pageId || 'general'}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load page content';
      setError(errorMessage);
      console.error('usePageContent error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [language, pageId]);

  const refresh = useCallback(async () => {
    contentLoader.invalidateCache('page', language);
    contentLoader.invalidateCache('ui', language);
    await loadContent();
  }, [loadContent, language]);

  const getPageText = useCallback((key: string, fallback?: string): string => {
    const contentId = pageId ? `${pageId}.${key}` : key;
    
    // First try to find in loaded content
    const item = content.find(c => 
      c.content_id === contentId && 
      c.language === language && 
      c.is_active
    );
    
    if (item?.text) {
      return item.text;
    }
    
    // Fallback to localization context
    return fallback || t(key);
  }, [content, language, pageId, t]);

  const getPageTitle = useCallback((key: string, fallback?: string): string => {
    const contentId = pageId ? `${pageId}.${key}` : key;
    
    const item = content.find(c => 
      c.content_id === contentId && 
      c.language === language && 
      c.is_active
    );
    
    return item?.title || getPageText(key, fallback);
  }, [content, language, pageId, getPageText]);

  const hasContent = useCallback((key: string): boolean => {
    const contentId = pageId ? `${pageId}.${key}` : key;
    return content.some(c => 
      c.content_id === contentId && 
      c.language === language && 
      c.is_active
    );
  }, [content, language, pageId]);

  const getAllPageContent = useCallback((): Record<string, string> => {
    const result: Record<string, string> = {};
    
    content
      .filter(c => c.language === language && c.is_active)
      .forEach(item => {
        result[item.content_id] = item.text;
      });
    
    return result;
  }, [content, language]);

  // Load content when language or pageId changes
  useEffect(() => {
    loadContent();
  }, [loadContent]);

  return {
    content,
    isLoading,
    error,
    refresh,
    getPageText,
    getPageTitle,
    hasContent,
    getAllPageContent
  };
}

// Survey content hook for assessment questions
interface UseSurveyContentReturn extends BaseContentHookReturn {
  questions: LocalizedContent[];
  getQuestionText: (questionId: string, fallback?: string) => string;
  getQuestionOptions: (questionId: string) => QuestionOption[];
  getQuestionTitle: (questionId: string, fallback?: string) => string;
  getInstructionText: (key: string, fallback?: string) => string;
  loadQuestionsWithProfile: (profile?: {
    nationality?: string;
    age?: number;
    emirate?: string;
  }) => Promise<void>;
  hasQuestion: (questionId: string) => boolean;
  getQuestionsByFactor: (factor: string) => LocalizedContent[];
}

export function useSurveyContent(): UseSurveyContentReturn {
  const { language } = useLocalization();
  const [questions, setQuestions] = useState<LocalizedContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const questionContent = await contentLoader.loadContentByType('question', language);
      setQuestions(questionContent);
      
      console.log(`useSurveyContent: Loaded ${questionContent.length} questions`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load survey content';
      setError(errorMessage);
      console.error('useSurveyContent error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  const loadQuestionsWithProfile = useCallback(async (profile?: {
    nationality?: string;
    age?: number;
    emirate?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use API client for demographic-filtered questions
      const { apiClient } = await import('@/lib/api-client');
      const filteredQuestions = await apiClient.getQuestionsByLanguage(
        language,
        profile?.nationality,
        profile?.age,
        profile?.emirate
      );
      
      // Convert API response to LocalizedContent format
      const questionContent: LocalizedContent[] = filteredQuestions.map((q: any) => ({
        id: q.id,
        content_type: 'question' as ContentType,
        content_id: q.id,
        language,
        text: q.text,
        title: q.title,
        options: q.options,
        extra_data: q.extra_data,
        version: '1.0',
        is_active: true,
        created_at: new Date().toISOString()
      }));
      
      setQuestions(questionContent);
      console.log(`useSurveyContent: Loaded ${questionContent.length} filtered questions`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load filtered questions';
      setError(errorMessage);
      console.error('useSurveyContent profile loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  const refresh = useCallback(async () => {
    contentLoader.invalidateCache('question', language);
    await loadContent();
  }, [loadContent, language]);

  const getQuestionText = useCallback((questionId: string, fallback?: string): string => {
    const question = questions.find(q => 
      q.content_id === questionId && 
      q.language === language && 
      q.is_active
    );
    
    return question?.text || fallback || questionId;
  }, [questions, language]);

  const getQuestionOptions = useCallback((questionId: string): QuestionOption[] => {
    const question = questions.find(q => 
      q.content_id === questionId && 
      q.language === language && 
      q.is_active
    );
    
    return question?.options || [];
  }, [questions, language]);

  const getQuestionTitle = useCallback((questionId: string, fallback?: string): string => {
    const question = questions.find(q => 
      q.content_id === questionId && 
      q.language === language && 
      q.is_active
    );
    
    return question?.title || getQuestionText(questionId, fallback);
  }, [questions, language, getQuestionText]);

  const getInstructionText = useCallback((key: string, fallback?: string): string => {
    const instruction = questions.find(q => 
      q.content_id === `instruction.${key}` && 
      q.language === language && 
      q.is_active
    );
    
    return instruction?.text || fallback || key;
  }, [questions, language]);

  const hasQuestion = useCallback((questionId: string): boolean => {
    return questions.some(q => 
      q.content_id === questionId && 
      q.language === language && 
      q.is_active
    );
  }, [questions, language]);

  const getQuestionsByFactor = useCallback((factor: string): LocalizedContent[] => {
    return questions.filter(q => 
      q.extra_data?.factor === factor && 
      q.language === language && 
      q.is_active
    );
  }, [questions, language]);

  // Load content when language changes
  useEffect(() => {
    loadContent();
  }, [loadContent]);

  return {
    questions,
    isLoading,
    error,
    refresh,
    getQuestionText,
    getQuestionOptions,
    getQuestionTitle,
    getInstructionText,
    loadQuestionsWithProfile,
    hasQuestion,
    getQuestionsByFactor
  };
}

// Results content hook for scores and recommendations
interface UseResultsContentReturn extends BaseContentHookReturn {
  recommendations: LocalizedContent[];
  getRecommendationText: (recommendationId: string, fallback?: string) => string;
  getPillarName: (pillarKey: string, fallback?: string) => string;
  getScoreInterpretation: (level: string, fallback?: string) => string;
  getScoreDescription: (pillarKey: string, level: string, fallback?: string) => string;
  getActionItem: (recommendationId: string, actionIndex: number, fallback?: string) => string;
  hasRecommendation: (recommendationId: string) => boolean;
  getRecommendationsByPillar: (pillarKey: string) => LocalizedContent[];
  getAllPillarNames: () => Record<string, string>;
}

export function useResultsContent(): UseResultsContentReturn {
  const { language, t } = useLocalization();
  const [recommendations, setRecommendations] = useState<LocalizedContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const recommendationContent = await contentLoader.loadContentByType('recommendation', language);
      const uiContent = await contentLoader.loadContentByType('ui', language);
      
      // Combine recommendations and UI content for comprehensive results coverage
      const combinedContent = [...recommendationContent, ...uiContent];
      setRecommendations(combinedContent);
      
      console.log(`useResultsContent: Loaded ${combinedContent.length} items`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load results content';
      setError(errorMessage);
      console.error('useResultsContent error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  const refresh = useCallback(async () => {
    contentLoader.invalidateCache('recommendation', language);
    contentLoader.invalidateCache('ui', language);
    await loadContent();
  }, [loadContent, language]);

  const getRecommendationText = useCallback((recommendationId: string, fallback?: string): string => {
    const recommendation = recommendations.find(r => 
      r.content_id === recommendationId && 
      r.language === language && 
      r.is_active
    );
    
    return recommendation?.text || fallback || t(recommendationId);
  }, [recommendations, language, t]);

  const getPillarName = useCallback((pillarKey: string, fallback?: string): string => {
    const pillarContentId = `pillar.${pillarKey}`;
    const pillar = recommendations.find(r => 
      r.content_id === pillarContentId && 
      r.language === language && 
      r.is_active
    );
    
    return pillar?.text || fallback || t(pillarKey);
  }, [recommendations, language, t]);

  const getScoreInterpretation = useCallback((level: string, fallback?: string): string => {
    const scoreContentId = `score.${level.toLowerCase()}`;
    const score = recommendations.find(r => 
      r.content_id === scoreContentId && 
      r.language === language && 
      r.is_active
    );
    
    return score?.text || fallback || t(level.toLowerCase());
  }, [recommendations, language, t]);

  const getScoreDescription = useCallback((pillarKey: string, level: string, fallback?: string): string => {
    const descriptionContentId = `score.${pillarKey}.${level.toLowerCase()}`;
    const description = recommendations.find(r => 
      r.content_id === descriptionContentId && 
      r.language === language && 
      r.is_active
    );
    
    return description?.text || fallback || t(`${pillarKey}_${level.toLowerCase()}`);
  }, [recommendations, language, t]);

  const getActionItem = useCallback((recommendationId: string, actionIndex: number, fallback?: string): string => {
    const actionContentId = `${recommendationId}.action.${actionIndex}`;
    const action = recommendations.find(r => 
      r.content_id === actionContentId && 
      r.language === language && 
      r.is_active
    );
    
    return action?.text || fallback || t(`action_${actionIndex}`);
  }, [recommendations, language, t]);

  const hasRecommendation = useCallback((recommendationId: string): boolean => {
    return recommendations.some(r => 
      r.content_id === recommendationId && 
      r.language === language && 
      r.is_active
    );
  }, [recommendations, language]);

  const getRecommendationsByPillar = useCallback((pillarKey: string): LocalizedContent[] => {
    return recommendations.filter(r => 
      r.content_id.startsWith(`recommendation.${pillarKey}`) && 
      r.language === language && 
      r.is_active
    );
  }, [recommendations, language]);

  const getAllPillarNames = useCallback((): Record<string, string> => {
    const pillarNames: Record<string, string> = {};
    
    recommendations
      .filter(r => 
        r.content_id.startsWith('pillar.') && 
        r.language === language && 
        r.is_active
      )
      .forEach(pillar => {
        const pillarKey = pillar.content_id.replace('pillar.', '');
        pillarNames[pillarKey] = pillar.text;
      });
    
    return pillarNames;
  }, [recommendations, language]);

  // Load content when language changes
  useEffect(() => {
    loadContent();
  }, [loadContent]);

  return {
    recommendations,
    isLoading,
    error,
    refresh,
    getRecommendationText,
    getPillarName,
    getScoreInterpretation,
    getScoreDescription,
    getActionItem,
    hasRecommendation,
    getRecommendationsByPillar,
    getAllPillarNames
  };
}

// UI content hook for general interface elements
interface UseUIContentReturn extends BaseContentHookReturn {
  content: LocalizedContent[];
  getUIText: (key: string, fallback?: string) => string;
  getButtonText: (buttonKey: string, fallback?: string) => string;
  getMessageText: (messageKey: string, fallback?: string) => string;
  getNavigationText: (navKey: string, fallback?: string) => string;
  getFormText: (formKey: string, fallback?: string) => string;
  hasUIContent: (key: string) => boolean;
  getAllUIContent: () => Record<string, string>;
  t: (key: string, fallback?: string) => string; // Alias for convenience
}

export function useUIContent(): UseUIContentReturn {
  const { language, t: contextT } = useLocalization();
  const [content, setContent] = useState<LocalizedContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const uiContent = await contentLoader.loadContentByType('ui', language);
      setContent(uiContent);
      
      console.log(`useUIContent: Loaded ${uiContent.length} UI items`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load UI content';
      setError(errorMessage);
      console.error('useUIContent error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  const refresh = useCallback(async () => {
    contentLoader.invalidateCache('ui', language);
    await loadContent();
  }, [loadContent, language]);

  const getUIText = useCallback((key: string, fallback?: string): string => {
    const item = content.find(c => 
      c.content_id === key && 
      c.language === language && 
      c.is_active
    );
    
    return item?.text || fallback || contextT(key);
  }, [content, language, contextT]);

  const getButtonText = useCallback((buttonKey: string, fallback?: string): string => {
    return getUIText(`button.${buttonKey}`, fallback);
  }, [getUIText]);

  const getMessageText = useCallback((messageKey: string, fallback?: string): string => {
    return getUIText(`message.${messageKey}`, fallback);
  }, [getUIText]);

  const getNavigationText = useCallback((navKey: string, fallback?: string): string => {
    return getUIText(`nav.${navKey}`, fallback);
  }, [getUIText]);

  const getFormText = useCallback((formKey: string, fallback?: string): string => {
    return getUIText(`form.${formKey}`, fallback);
  }, [getUIText]);

  const hasUIContent = useCallback((key: string): boolean => {
    return content.some(c => 
      c.content_id === key && 
      c.language === language && 
      c.is_active
    );
  }, [content, language]);

  const getAllUIContent = useCallback((): Record<string, string> => {
    const result: Record<string, string> = {};
    
    content
      .filter(c => c.language === language && c.is_active)
      .forEach(item => {
        result[item.content_id] = item.text;
      });
    
    return result;
  }, [content, language]);

  // Load content when language changes
  useEffect(() => {
    loadContent();
  }, [loadContent]);

  return {
    content,
    isLoading,
    error,
    refresh,
    getUIText,
    getButtonText,
    getMessageText,
    getNavigationText,
    getFormText,
    hasUIContent,
    getAllUIContent,
    t: getUIText // Alias for convenience
  };
}

// Utility hook for preloading content
export function useContentPreloader() {
  const { language } = useLocalization();
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadError, setPreloadError] = useState<string | null>(null);

  const preloadAllContent = useCallback(async () => {
    setIsPreloading(true);
    setPreloadError(null);
    
    try {
      await contentLoader.preloadContent(['ui', 'page', 'question', 'recommendation']);
      console.log('Content preloader: All content types preloaded successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to preload content';
      setPreloadError(errorMessage);
      console.error('Content preloader error:', err);
    } finally {
      setIsPreloading(false);
    }
  }, []);

  const preloadForLanguage = useCallback(async (targetLanguage: SupportedLanguage) => {
    setIsPreloading(true);
    setPreloadError(null);
    
    try {
      // Temporarily switch content loader to target language for preloading
      const contentTypes: ContentType[] = ['ui', 'page', 'question', 'recommendation'];
      const promises = contentTypes.map(type => 
        contentLoader.loadContentByType(type, targetLanguage)
      );
      
      await Promise.all(promises);
      console.log(`Content preloader: Preloaded all content for ${targetLanguage}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to preload language content';
      setPreloadError(errorMessage);
      console.error('Content preloader language error:', err);
    } finally {
      setIsPreloading(false);
    }
  }, []);

  return {
    isPreloading,
    preloadError,
    preloadAllContent,
    preloadForLanguage
  };
}