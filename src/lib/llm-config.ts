// AI Feature Configuration and Rate Limiting

interface RateLimitData {
  callsToday: number;
  lastCallDate: string;
}

const RATE_LIMIT_STORAGE_KEY = 'ai_rate_limit';
const RATE_LIMIT_PER_DAY = 10;
const CACHE_PREFIX = 'ai_cache_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Check if an API key is available
 */
export function hasOpenAIKey(): boolean {
  return Boolean(import.meta.env.VITE_OPENAI_API_KEY);
}

/**
 * Get rate limit status
 */
export function getRateLimitStatus(): { remaining: number; canMakeCall: boolean } {
  if (!hasOpenAIKey()) {
    return { remaining: 0, canMakeCall: false };
  }

  const data = getRateLimitData();
  const now = new Date();
  const today = now.toDateString();

  // Reset if it's a new day
  if (data.lastCallDate !== today) {
    data.callsToday = 0;
    data.lastCallDate = today;
    saveRateLimitData(data);
  }

  const remaining = Math.max(0, RATE_LIMIT_PER_DAY - data.callsToday);
  return { remaining, canMakeCall: remaining > 0 };
}

/**
 * Increment the rate limit counter
 */
export function incrementRateLimit(): void {
  const data = getRateLimitData();
  const now = new Date();
  const today = now.toDateString();

  // Reset if it's a new day
  if (data.lastCallDate !== today) {
    data.callsToday = 0;
    data.lastCallDate = today;
  }

  data.callsToday++;
  saveRateLimitData(data);
}

/**
 * Cache LLM results
 */
export function cacheLLMResult(key: string, result: unknown): void {
  const cacheKey = `${CACHE_PREFIX}${key}`;
  const data = {
    result,
    timestamp: Date.now(),
  };
  try {
    localStorage.setItem(cacheKey, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to cache LLM result:', error);
  }
}

/**
 * Get cached LLM result
 */
export function getCachedLLMResult<T>(key: string): T | null {
  const cacheKey = `${CACHE_PREFIX}${key}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const data = JSON.parse(cached);
    const age = Date.now() - data.timestamp;

    if (age > CACHE_TTL_MS) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return data.result as T;
  } catch (error) {
    console.warn('Failed to retrieve cached LLM result:', error);
    return null;
  }
}

/**
 * Generate a cache key from inputs
 */
export function generateCacheKey(prefix: string, inputs: Record<string, unknown>): string {
  const inputString = JSON.stringify(inputs);
  return `${prefix}_${btoa(inputString)}`;
}

/**
 * Clear all AI cache
 */
export function clearAICache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear AI cache:', error);
  }
}

/**
 * Get rate limit data from storage
 */
function getRateLimitData(): RateLimitData {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to parse rate limit data:', error);
  }

  return { callsToday: 0, lastCallDate: '' };
}

/**
 * Save rate limit data to storage
 */
function saveRateLimitData(data: RateLimitData): void {
  try {
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save rate limit data:', error);
  }
}
