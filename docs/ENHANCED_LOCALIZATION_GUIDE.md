# Enhanced Localization System Guide

## Overview

The enhanced LocalizationContext provides comprehensive localization capabilities with dynamic content loading, intelligent caching, and robust fallback strategies.

## Key Features

### 1. Dynamic Content Loading
- Loads content from backend API with retry logic
- Supports multiple content types (ui, question, recommendation, page, email)
- Automatic fallback to default translations when API fails

### 2. Intelligent Caching
- Memory-based caching with configurable TTL (Time To Live)
- Cache invalidation and cleanup mechanisms
- Cache statistics and performance monitoring
- Automatic cache size management

### 3. Fallback Strategies
- Primary: Use requested language content
- Secondary: Fall back to English if Arabic translation missing
- Tertiary: Use hardcoded default translations
- Emergency: Display content key for debugging

### 4. Performance Optimizations
- Content preloading for anticipated needs
- Lazy loading for non-critical content
- Exponential backoff retry strategy
- Memory usage monitoring and optimization

## Usage Examples

### Basic Translation
```typescript
import { useLocalization } from '@/contexts/LocalizationContext';

function MyComponent() {
  const { t, language, isRTL } = useLocalization();
  
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <h1>{t('welcome_message')}</h1>
      <p>{t('description', { name: 'User' })}</p>
    </div>
  );
}
```

### Advanced Content Management
```typescript
import { useLocalization } from '@/contexts/LocalizationContext';

function AdminComponent() {
  const { 
    contentStats, 
    refreshContent, 
    preloadContent,
    getTranslationCoverage,
    invalidateCache 
  } = useLocalization();
  
  const handleRefresh = async () => {
    await refreshContent('ui'); // Refresh specific content type
  };
  
  const coverage = getTranslationCoverage();
  console.log(`Missing translations: ${coverage.missing.length}`);
}
```

### Specialized Content Hooks
```typescript
import { usePageContent, useSurveyContent, useResultsContent } from '@/hooks/use-localized-content';

// For page-specific content
function HomePage() {
  const { getPageText } = usePageContent('homepage');
  return <h1>{getPageText('title')}</h1>;
}

// For survey questions
function SurveyComponent() {
  const { questions, getQuestionText } = useSurveyContent();
  return <p>{getQuestionText('q1')}</p>;
}

// For results and recommendations
function ResultsComponent() {
  const { getRecommendationText, getPillarName } = useResultsContent();
  return <p>{getRecommendationText('rec1')}</p>;
}
```

### Content Loader Service
```typescript
import { contentLoader } from '@/lib/content-loader';

// Preload content for better performance
await contentLoader.preloadContent(['ui', 'question'], ['en', 'ar']);

// Get cache statistics
const stats = contentLoader.getCacheStats();
console.log(`Cache hit rate: ${stats.hitRate * 100}%`);

// Invalidate specific cache
contentLoader.invalidateCache('ui', 'ar');
```

## API Integration

The enhanced system integrates with the following backend endpoints:

- `GET /api/localization/ui/{language}` - Get UI translations
- `GET /api/localization/content` - Get all localized content
- `GET /api/localization/questions/{language}` - Get survey questions
- `POST /api/localization/content` - Create new content
- `PUT /api/localization/content/{id}` - Update content
- `DELETE /api/localization/content/{id}` - Delete content

## Configuration

### Cache Configuration
```typescript
const contentLoader = new ContentLoader({
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxCacheSize: 100,
  retryAttempts: 3,
  retryDelay: 1000,
  enablePrefetch: true
});
```

### Provider Configuration
```typescript
<LocalizationProvider defaultLanguage="en">
  <App />
</LocalizationProvider>
```

## Monitoring and Analytics

### Content Statistics
- Total content items
- Items per language
- Missing translations
- Cache performance metrics
- Loading error tracking

### Cache Statistics
- Cache size and memory usage
- Hit/miss rates
- Last cleared timestamp
- Performance metrics

## Error Handling

The system provides comprehensive error handling:

1. **Network Errors**: Automatic retry with exponential backoff
2. **Missing Translations**: Graceful fallback to English or defaults
3. **API Failures**: Use cached content when available
4. **Cache Overflow**: Automatic cleanup of expired entries

## Testing

Use the test page at `/test-enhanced-localization` to verify:
- Language switching
- Translation loading
- Cache performance
- Error handling
- Content statistics

## Migration from Basic Localization

The enhanced system is backward compatible. Existing components using `useLocalization()` will continue to work without changes, but can now access additional features:

```typescript
// Old usage (still works)
const { t, language, isRTL } = useLocalization();

// New features available
const { 
  contentStats, 
  refreshContent, 
  preloadContent,
  cacheStats 
} = useLocalization();
```

## Best Practices

1. **Preload Critical Content**: Use `preloadContent()` for content needed immediately
2. **Monitor Cache Performance**: Check `cacheStats` to optimize cache configuration
3. **Handle Loading States**: Use `loadingState` to show appropriate UI feedback
4. **Implement Fallbacks**: Always provide fallback text for missing translations
5. **Use Specialized Hooks**: Use content-specific hooks for better organization
6. **Cache Management**: Invalidate cache when content is updated via admin panel

## Troubleshooting

### Common Issues

1. **Translations Not Loading**: Check network connectivity and API endpoints
2. **Cache Not Working**: Verify cache configuration and TTL settings
3. **Memory Issues**: Monitor cache size and implement cleanup strategies
4. **Performance Problems**: Use preloading and optimize cache hit rates

### Debug Information

Enable debug logging by setting localStorage:
```javascript
localStorage.setItem('localization_debug', 'true');
```

This will log detailed information about:
- Content loading attempts
- Cache hits/misses
- Fallback usage
- Error details