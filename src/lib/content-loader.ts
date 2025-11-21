/**
 * ContentLoader Service
 *
 * Handles dynamic loading and caching of localized content with intelligent
 * caching, TTL management, retry logic, and error handling.
 */

import {
  SupportedLanguage,
  ContentType,
  LocalizedContent,
  CacheStats,
  LoadingState,
} from "@/lib/types";
import { apiClient } from "@/lib/api-client";

interface CacheEntry {
  data: LocalizedContent[];
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
}

interface ContentCache {
  [key: string]: CacheEntry;
}

interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

interface ContentLoaderConfig {
  baseUrl: string;
  cacheTTL: number;
  maxCacheSize: number;
  retryConfig: RetryConfig;
  enablePrefetch: boolean;
  memoryThreshold: number; // MB
}

interface LoadingProgress {
  contentType: ContentType;
  language: SupportedLanguage;
  progress: number;
  status: "loading" | "complete" | "error";
  error?: string;
}

export class ContentLoader {
  private cache: ContentCache = {};
  private config: ContentLoaderConfig;
  private loadingStates: Map<string, LoadingProgress> = new Map();
  private prefetchQueue: Set<string> = new Set();
  private cacheStats: CacheStats;

  constructor(config?: Partial<ContentLoaderConfig>) {
    this.config = {
      baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
      cacheTTL: 5 * 60 * 1000, // 5 minutes
      maxCacheSize: 100,
      retryConfig: {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
      },
      enablePrefetch: true,
      memoryThreshold: 50, // 50MB
      ...config,
    };

    this.cacheStats = {
      size: 0,
      hitRate: 0,
      missRate: 0,
      lastCleared: new Date(),
      memoryUsage: 0,
    };

    // Initialize cleanup interval
    this.startCleanupInterval();
  }

  /**
   * Load content by type and language with intelligent caching
   */
  async loadContentByType(
    type: ContentType,
    language: SupportedLanguage
  ): Promise<LocalizedContent[]> {
    const cacheKey = this.getCacheKey(type, language);

    // Check cache first
    const cachedEntry = this.cache[cacheKey];
    if (cachedEntry && this.isCacheValid(cachedEntry)) {
      cachedEntry.hits++;
      cachedEntry.lastAccessed = Date.now();
      this.updateCacheStats(true);

      console.log(
        `ContentLoader: Cache hit for ${type}/${language} (${cachedEntry.data.length} items)`
      );
      return cachedEntry.data;
    }

    // Load from API
    this.updateCacheStats(false);
    return this.loadFromAPI(type, language);
  }

  /**
   * Preload content for multiple types
   */
  async preloadContent(types: ContentType[]): Promise<void> {
    if (!this.config.enablePrefetch) {
      console.log("ContentLoader: Prefetch disabled");
      return;
    }

    const languages: SupportedLanguage[] = ["en", "ar"];
    const prefetchPromises: Promise<void>[] = [];

    for (const type of types) {
      for (const language of languages) {
        const cacheKey = this.getCacheKey(type, language);

        // Skip if already cached or in queue
        if (this.cache[cacheKey] || this.prefetchQueue.has(cacheKey)) {
          continue;
        }

        this.prefetchQueue.add(cacheKey);

        const prefetchPromise = this.loadContentByType(type, language)
          .then(() => {
            this.prefetchQueue.delete(cacheKey);
            console.log(`ContentLoader: Prefetched ${type}/${language}`);
          })
          .catch((error) => {
            this.prefetchQueue.delete(cacheKey);
            console.warn(
              `ContentLoader: Prefetch failed for ${type}/${language}:`,
              error
            );
          });

        prefetchPromises.push(prefetchPromise);
      }
    }

    await Promise.allSettled(prefetchPromises);
    console.log(
      `ContentLoader: Preload completed for ${types.length} content types`
    );
  }

  /**
   * Load specific content items by IDs
   */
  async loadContentByIds(
    contentIds: string[],
    language: SupportedLanguage
  ): Promise<LocalizedContent[]> {
    try {
      const url = `${this.config.baseUrl}/localization/content`;
      const params = new URLSearchParams({
        language,
        content_ids: contentIds.join(","),
      });

      const response = await this.fetchWithRetry(`${url}?${params}`);
      const content: LocalizedContent[] = await response.json();

      console.log(
        `ContentLoader: Loaded ${content.length} items by IDs for ${language}`
      );
      return content;
    } catch (error) {
      console.error(`ContentLoader: Error loading content by IDs:`, error);
      throw error;
    }
  }

  /**
   * Get UI translations as key-value pairs
   */
  async getUITranslations(
    language: SupportedLanguage,
    keys?: string[]
  ): Promise<Record<string, string>> {
    try {
      const keysParam = keys ? `?keys=${keys.join(",")}` : "";
      const translations: Record<string, string> =
        await apiClient.getUITranslations(language, keys);

      console.log(
        `ContentLoader: Loaded ${
          Object.keys(translations).length
        } UI translations for ${language}`
      );
      return translations;
    } catch (error) {
      console.error(`ContentLoader: Error loading UI translations:`, error);
      throw error;
    }
  }

  /**
   * Invalidate cache for specific content type or all cache
   */
  invalidateCache(type?: ContentType, language?: SupportedLanguage): void {
    if (type && language) {
      const cacheKey = this.getCacheKey(type, language);
      delete this.cache[cacheKey];
      console.log(`ContentLoader: Invalidated cache for ${type}/${language}`);
    } else if (type) {
      // Invalidate all languages for this type
      const keysToDelete = Object.keys(this.cache).filter((key) =>
        key.startsWith(`${type}_`)
      );
      keysToDelete.forEach((key) => delete this.cache[key]);
      console.log(`ContentLoader: Invalidated cache for type ${type}`);
    } else {
      // Clear all cache
      this.cache = {};
      this.cacheStats.lastCleared = new Date();
      console.log("ContentLoader: Cleared all cache");
    }

    this.updateCacheSize();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    this.updateMemoryUsage();
    return { ...this.cacheStats };
  }

  /**
   * Get current loading states
   */
  getLoadingStates(): LoadingProgress[] {
    return Array.from(this.loadingStates.values());
  }

  /**
   * Check if content is currently loading
   */
  isLoading(type: ContentType, language: SupportedLanguage): boolean {
    const key = this.getCacheKey(type, language);
    const state = this.loadingStates.get(key);
    return state?.status === "loading" || false;
  }

  /**
   * Private method to load content from API with retry logic
   */
  private async loadFromAPI(
    type: ContentType,
    language: SupportedLanguage
  ): Promise<LocalizedContent[]> {
    const cacheKey = this.getCacheKey(type, language);

    // Set loading state
    this.loadingStates.set(cacheKey, {
      contentType: type,
      language,
      progress: 0,
      status: "loading",
    });

    try {
      const url = `${this.config.baseUrl}/localization/content`;
      const params = new URLSearchParams({
        content_type: type,
        language,
      });

      // Update progress
      this.updateLoadingProgress(cacheKey, 25);

      const response = await this.fetchWithRetry(`${url}?${params}`);

      // Update progress
      this.updateLoadingProgress(cacheKey, 75);

      const content: LocalizedContent[] = await response.json();

      // Cache the results
      this.cacheContent(cacheKey, content);

      // Update progress to complete
      this.loadingStates.set(cacheKey, {
        contentType: type,
        language,
        progress: 100,
        status: "complete",
      });

      console.log(
        `ContentLoader: Loaded ${content.length} items for ${type}/${language} from API`
      );
      return content;
    } catch (error) {
      // Set error state
      this.loadingStates.set(cacheKey, {
        contentType: type,
        language,
        progress: 0,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });

      console.error(`ContentLoader: Error loading ${type}/${language}:`, error);
      throw error;
    }
  }

  /**
   * Fetch with retry logic and exponential backoff
   */
  private async fetchWithRetry(url: string): Promise<Response> {
    const { maxAttempts, baseDelay, maxDelay, backoffMultiplier } =
      this.config.retryConfig;
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          return response;
        }

        // If it's the last attempt, throw the error
        if (attempt === maxAttempts) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // For non-2xx responses, wait and retry
        lastError = new Error(
          `HTTP ${response.status}: ${response.statusText}`
        );
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Network error");

        // If it's the last attempt, throw the error
        if (attempt === maxAttempts) {
          throw lastError;
        }
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffMultiplier, attempt - 1),
        maxDelay
      );

      console.warn(
        `ContentLoader: Attempt ${attempt} failed, retrying in ${delay}ms...`
      );
      await this.sleep(delay);
    }

    throw lastError!;
  }

  /**
   * Cache content with TTL and size management
   */
  private cacheContent(cacheKey: string, content: LocalizedContent[]): void {
    // Check memory threshold
    if (this.isMemoryThresholdExceeded()) {
      this.performMemoryCleanup();
    }

    // Remove oldest entries if cache is full
    if (Object.keys(this.cache).length >= this.config.maxCacheSize) {
      this.evictOldestEntries(1);
    }

    // Cache the content
    this.cache[cacheKey] = {
      data: content,
      timestamp: Date.now(),
      ttl: this.config.cacheTTL,
      hits: 1,
      lastAccessed: Date.now(),
    };

    this.updateCacheSize();
  }

  /**
   * Check if cache entry is valid (not expired)
   */
  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Generate cache key
   */
  private getCacheKey(type: ContentType, language: SupportedLanguage): string {
    return `${type}_${language}`;
  }

  /**
   * Update loading progress
   */
  private updateLoadingProgress(cacheKey: string, progress: number): void {
    const currentState = this.loadingStates.get(cacheKey);
    if (currentState) {
      currentState.progress = progress;
      this.loadingStates.set(cacheKey, currentState);
    }
  }

  /**
   * Update cache statistics
   */
  private updateCacheStats(hit: boolean): void {
    if (hit) {
      this.cacheStats.hitRate = this.cacheStats.hitRate * 0.9 + 1 * 0.1; // Moving average
    } else {
      this.cacheStats.missRate = this.cacheStats.missRate * 0.9 + 1 * 0.1; // Moving average
    }
  }

  /**
   * Update cache size in stats
   */
  private updateCacheSize(): void {
    this.cacheStats.size = Object.keys(this.cache).length;
  }

  /**
   * Estimate memory usage
   */
  private updateMemoryUsage(): void {
    let totalSize = 0;

    Object.values(this.cache).forEach((entry) => {
      // Rough estimation of memory usage
      totalSize += JSON.stringify(entry.data).length * 2; // UTF-16 characters
    });

    this.cacheStats.memoryUsage = Math.round(totalSize / (1024 * 1024)); // Convert to MB
  }

  /**
   * Check if memory threshold is exceeded
   */
  private isMemoryThresholdExceeded(): boolean {
    this.updateMemoryUsage();
    return this.cacheStats.memoryUsage > this.config.memoryThreshold;
  }

  /**
   * Perform memory cleanup by removing least recently used entries
   */
  private performMemoryCleanup(): void {
    const entriesToRemove = Math.ceil(Object.keys(this.cache).length * 0.25); // Remove 25%
    this.evictOldestEntries(entriesToRemove);
    console.log(
      `ContentLoader: Performed memory cleanup, removed ${entriesToRemove} entries`
    );
  }

  /**
   * Evict oldest cache entries
   */
  private evictOldestEntries(count: number): void {
    const entries = Object.entries(this.cache)
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)
      .slice(0, count);

    entries.forEach(([key]) => {
      delete this.cache[key];
    });

    this.updateCacheSize();
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 60000); // Run every minute
  }

  /**
   * Remove expired cache entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let removedCount = 0;

    Object.keys(this.cache).forEach((key) => {
      const entry = this.cache[key];
      if (now - entry.timestamp > entry.ttl) {
        delete this.cache[key];
        removedCount++;
      }
    });

    if (removedCount > 0) {
      this.updateCacheSize();
      console.log(
        `ContentLoader: Cleaned up ${removedCount} expired cache entries`
      );
    }
  }

  /**
   * Utility method for sleeping
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Destroy the content loader and cleanup resources
   */
  destroy(): void {
    this.cache = {};
    this.loadingStates.clear();
    this.prefetchQueue.clear();
    console.log("ContentLoader: Destroyed and cleaned up resources");
  }
}

// Export singleton instance
export const contentLoader = new ContentLoader();

// Export types for use in components
export type { ContentLoaderConfig, LoadingProgress };
