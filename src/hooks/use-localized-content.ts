'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocalization } from '@/contexts/LocalizationContext';
import { apiClient } from '@/lib/api-client';
import { ContentType, LocalizedContent, SupportedLanguage } from '@/lib/types';

interface UseLocalizedContentOptions {
  contentType: ContentType;
  autoLoad?: boolean;
  cacheKey?: string;
}

interface UseLocalizedContentReturn {
  content: LocalizedContent[];
  isLoading: boolean;
  error: string | null;
  loadContent: () => Promise<void>;
  refreshContent: () => Promise<void>;
  getContentById: (contentId: string) => LocalizedContent | undefined;
  getContentText: (contentId: string, fallback?: string) => string;
}

export function useLocalizedContent({
  contentType,
  autoLoad = true,
  cacheKey
}: UseLocalizedContentOptions): UseLocalizedContentReturn {
  const { language, t } = useLocalization();
  const [content, setContent] = useState<LocalizedContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.getLocalizedContent(language, contentType);
      setContent(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load content';
      setError(errorMessage);
      console.error(`Error loading ${contentType} content:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [language, contentType]);

  const refreshContent = useCallback(async () => {
    await loadContent();
  }, [loadContent]);

  const getContentById = useCallback((contentId: string): LocalizedContent | undefined => {
    return content.find(item => item.content_id === contentId && item.is_active);
  }, [content]);

  const getContentText = useCallback((contentId: string, fallback?: string): string => {
    const item = getContentById(contentId);
    return item?.text || fallback || t(contentId);
  }, [getContentById, t]);

  // Auto-load content when language or contentType changes
  useEffect(() => {
    if (autoLoad) {
      loadContent();
    }
  }, [autoLoad, loadContent]);

  return {
    content,
    isLoading,
    error,
    loadContent,
    refreshContent,
    getContentById,
    getContentText
  };
}

// Specialized hooks for different content types

export function usePageContent(pageId?: string) {
  const { content, isLoading, error, getContentText } = useLocalizedContent({
    contentType: 'page',
    autoLoad: true
  });

  const getPageText = useCallback((key: string, fallback?: string) => {
    const contentId = pageId ? `${pageId}.${key}` : key;
    return getContentText(contentId, fallback);
  }, [pageId, getContentText]);

  return {
    content,
    isLoading,
    error,
    getPageText,
    t: getPageText // Alias for convenience
  };
}

export function useSurveyContent() {
  const { language } = useLocalization();
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadQuestions = useCallback(async (
    nationality?: string,
    age?: number,
    emirate?: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.getQuestionsByLanguage(language, nationality, age, emirate);
      setQuestions(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load survey questions';
      setError(errorMessage);
      console.error('Error loading survey questions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  const getQuestionText = useCallback((questionId: string, fallback?: string): string => {
    const question = questions.find(q => q.id === questionId);
    return question?.text || fallback || questionId;
  }, [questions]);

  const getQuestionOptions = useCallback((questionId: string): any[] => {
    const question = questions.find(q => q.id === questionId);
    return question?.options || [];
  }, [questions]);

  // Auto-load questions when language changes
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  return {
    questions,
    isLoading,
    error,
    loadQuestions,
    getQuestionText,
    getQuestionOptions
  };
}

export function useResultsContent() {
  const { content, isLoading, error, getContentText } = useLocalizedContent({
    contentType: 'recommendation',
    autoLoad: true
  });

  const getRecommendationText = useCallback((recommendationId: string, fallback?: string) => {
    return getContentText(recommendationId, fallback);
  }, [getContentText]);

  const getPillarName = useCallback((pillarKey: string, fallback?: string) => {
    return getContentText(`pillar.${pillarKey}`, fallback);
  }, [getContentText]);

  const getScoreInterpretation = useCallback((level: string, fallback?: string) => {
    return getContentText(`score.${level.toLowerCase()}`, fallback);
  }, [getContentText]);

  return {
    content,
    isLoading,
    error,
    getRecommendationText,
    getPillarName,
    getScoreInterpretation
  };
}

export function useUIContent() {
  const { content, isLoading, error, getContentText } = useLocalizedContent({
    contentType: 'ui',
    autoLoad: true
  });

  const getUIText = useCallback((key: string, fallback?: string) => {
    return getContentText(key, fallback);
  }, [getContentText]);

  return {
    content,
    isLoading,
    error,
    getUIText,
    t: getUIText // Alias for convenience
  };
}

// Content management hook for admin use
export function useContentManagement() {
  const { language } = useLocalization();
  const [allContent, setAllContent] = useState<LocalizedContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAllContent = useCallback(async (
    filterLanguage?: string,
    filterContentType?: string,
    filterContentId?: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.getLocalizedContent(
        filterLanguage,
        filterContentType,
        filterContentId
      );
      setAllContent(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load content';
      setError(errorMessage);
      console.error('Error loading all content:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createContent = useCallback(async (contentData: {
    content_type: string;
    content_id: string;
    language: string;
    text: string;
    title?: string;
    options?: any[];
    extra_data?: Record<string, any>;
    version?: string;
  }) => {
    try {
      const newContent = await apiClient.createLocalizedContent(contentData);
      setAllContent(prev => [...prev, newContent]);
      return newContent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create content';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateContent = useCallback(async (
    contentId: number,
    updates: {
      text?: string;
      title?: string;
      options?: any[];
      extra_data?: Record<string, any>;
      is_active?: boolean;
    }
  ) => {
    try {
      const updatedContent = await apiClient.updateLocalizedContent(contentId, updates);
      setAllContent(prev => 
        prev.map(item => item.id === contentId ? updatedContent : item)
      );
      return updatedContent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update content';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteContent = useCallback(async (contentId: number) => {
    try {
      await apiClient.deleteLocalizedContent(contentId);
      setAllContent(prev => prev.filter(item => item.id !== contentId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete content';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const bulkImport = useCallback(async (
    translations: Record<string, any>,
    targetLanguage: string,
    contentType: string = 'ui'
  ) => {
    try {
      const result = await apiClient.bulkImportTranslations(
        translations,
        targetLanguage,
        contentType
      );
      
      // Reload content after bulk import
      await loadAllContent();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk import';
      setError(errorMessage);
      throw err;
    }
  }, [loadAllContent]);

  const validateContent = useCallback(async (
    contentType: string,
    contentId: string,
    targetLanguage: string,
    text: string
  ) => {
    try {
      return await apiClient.validateContent(contentType, contentId, targetLanguage, text);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate content';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Auto-load all content on mount
  useEffect(() => {
    loadAllContent();
  }, [loadAllContent]);

  return {
    allContent,
    isLoading,
    error,
    loadAllContent,
    createContent,
    updateContent,
    deleteContent,
    bulkImport,
    validateContent
  };
}