'use client';

import React from 'react';
import { LocalizationProvider, useLocalization } from '@/contexts/LocalizationContext';

// Test component to verify enhanced localization features
function TestComponent() {
  const {
    language,
    setLanguage,
    t,
    isRTL,
    isLoading,
    contentStats,
    cacheStats,
    loadingState,
    refreshContent,
    preloadContent,
    getCachedContent,
    getTranslationCoverage,
    invalidateCache,
    clearCache
  } = useLocalization();

  const handleRefreshContent = async () => {
    try {
      await refreshContent();
      console.log('Content refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh content:', error);
    }
  };

  const handlePreloadContent = async () => {
    try {
      await preloadContent(['ui', 'question']);
      console.log('Content preloaded successfully');
    } catch (error) {
      console.error('Failed to preload content:', error);
    }
  };

  const handleGetCoverage = () => {
    const coverage = getTranslationCoverage();
    console.log('Translation coverage:', coverage);
  };

  const handleInvalidateCache = () => {
    invalidateCache();
    console.log('Cache invalidated');
  };

  const handleClearCache = () => {
    clearCache();
    console.log('Cache cleared');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Enhanced Localization Test</h1>
      
      {/* Language Controls */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-3">Language Controls</h2>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setLanguage('en')}
            className={`px-4 py-2 rounded ${language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('ar')}
            className={`px-4 py-2 rounded ${language === 'ar' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            العربية
          </button>
        </div>
        <p>Current Language: {language}</p>
        <p>Is RTL: {isRTL ? 'Yes' : 'No'}</p>
        <p>Is Loading: {isLoading ? 'Yes' : 'No'}</p>
      </div>

      {/* Translation Test */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-3">Translation Test</h2>
        <div className="space-y-2">
          <p><strong>welcome_message:</strong> {t('welcome_message')}</p>
          <p><strong>start_survey:</strong> {t('start_survey')}</p>
          <p><strong>financial_health_score:</strong> {t('financial_health_score')}</p>
          <p><strong>missing_key:</strong> {t('missing_key_test')}</p>
          <p><strong>with_params:</strong> {t('welcome_message', { name: 'Test User' })}</p>
        </div>
      </div>

      {/* Loading State */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-3">Loading State</h2>
        <div className="space-y-2">
          <p><strong>Is Loading:</strong> {loadingState.isLoading ? 'Yes' : 'No'}</p>
          <p><strong>Progress:</strong> {loadingState.progress || 0}%</p>
          {loadingState.error && (
            <p className="text-red-500"><strong>Error:</strong> {loadingState.error}</p>
          )}
        </div>
      </div>

      {/* Content Stats */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-3">Content Statistics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Total Items:</strong> {contentStats.totalItems}</p>
            <p><strong>English Items:</strong> {contentStats.englishItems}</p>
            <p><strong>Arabic Items:</strong> {contentStats.arabicItems}</p>
          </div>
          <div>
            <p><strong>Missing Translations:</strong> {contentStats.missingTranslations.length}</p>
            <p><strong>Cache Hit Rate:</strong> {(contentStats.cacheHitRate * 100).toFixed(1)}%</p>
            <p><strong>Loading Errors:</strong> {contentStats.loadingErrors}</p>
          </div>
        </div>
      </div>

      {/* Cache Stats */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-3">Cache Statistics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Cache Size:</strong> {cacheStats.size}</p>
            <p><strong>Hit Rate:</strong> {(cacheStats.hitRate * 100).toFixed(1)}%</p>
          </div>
          <div>
            <p><strong>Miss Rate:</strong> {(cacheStats.missRate * 100).toFixed(1)}%</p>
            <p><strong>Memory Usage:</strong> {(cacheStats.memoryUsage / 1024).toFixed(1)} KB</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-3">Actions</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRefreshContent}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Content
          </button>
          <button
            onClick={handlePreloadContent}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Preload Content
          </button>
          <button
            onClick={handleGetCoverage}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Get Coverage
          </button>
          <button
            onClick={handleInvalidateCache}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Invalidate Cache
          </button>
          <button
            onClick={handleClearCache}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear Cache
          </button>
        </div>
      </div>

      {/* Cached Content Preview */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-3">Cached Content Preview</h2>
        <div className="max-h-40 overflow-y-auto">
          <pre className="text-sm">
            {JSON.stringify(getCachedContent(), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

// Test page component
export default function TestEnhancedLocalization() {
  return (
    <LocalizationProvider defaultLanguage="en">
      <TestComponent />
    </LocalizationProvider>
  );
}