import { redis } from '@/lib/redis';

const DEEPL_API_KEY = process.env.DEEPL_API_KEY || '';
const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY || '';
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';
const GOOGLE_TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

const TRANSLATION_CACHE_TTL = 30 * 24 * 60 * 60; // 30 days in seconds

export interface TranslationOptions {
  sourceLang?: string;
  targetLang?: string;
  useCache?: boolean;
}

export interface TranslationResult {
  text: string;
  sourceLang: string;
  targetLang: string;
  provider: 'deepl' | 'google' | 'cache';
}

export interface BatchTranslationResult {
  results: TranslationResult[];
  errors: { index: number; error: string }[];
}

/**
 * Generate cache key for translation
 */
function generateCacheKey(text: string, sourceLang: string, targetLang: string): string {
  const crypto = require('crypto');
  const hash = crypto.createHash('md5').update(text).digest('hex');
  return `translation:${sourceLang}:${targetLang}:${hash}`;
}

/**
 * Get cached translation
 */
async function getCachedTranslation(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string | null> {
  const cacheKey = generateCacheKey(text, sourceLang, targetLang);
  const cached = await redis.get(cacheKey);
  return cached;
}

/**
 * Set cached translation
 */
async function setCachedTranslation(
  text: string,
  sourceLang: string,
  targetLang: string,
  translatedText: string
): Promise<void> {
  const cacheKey = generateCacheKey(text, sourceLang, targetLang);
  await redis.setex(cacheKey, TRANSLATION_CACHE_TTL, translatedText);
}

/**
 * Translate text using DeepL API
 */
async function translateWithDeepL(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<{ text: string; detectedSourceLang: string } | null> {
  if (!DEEPL_API_KEY) {
    console.warn('DeepL API key not configured');
    return null;
  }

  try {
    const response = await fetch(DEEPL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [text],
        source_lang: sourceLang === 'auto' ? undefined : sourceLang.toUpperCase(),
        target_lang: targetLang.toUpperCase(),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('DeepL API error:', error);
      return null;
    }

    const data = await response.json();
    if (data.translations && data.translations.length > 0) {
      return {
        text: data.translations[0].text,
        detectedSourceLang: data.translations[0].detected_source_language?.toLowerCase() || sourceLang,
      };
    }

    return null;
  } catch (error) {
    console.error('DeepL translation error:', error);
    return null;
  }
}

/**
 * Translate text using Google Translate API
 */
async function translateWithGoogle(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<{ text: string; detectedSourceLang: string } | null> {
  if (!GOOGLE_TRANSLATE_API_KEY) {
    console.warn('Google Translate API key not configured');
    return null;
  }

  try {
    const url = new URL(GOOGLE_TRANSLATE_API_URL);
    url.searchParams.append('key', GOOGLE_TRANSLATE_API_KEY);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang === 'auto' ? undefined : sourceLang,
        target: targetLang,
        format: 'text',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Google Translate API error:', error);
      return null;
    }

    const data = await response.json();
    if (data.data?.translations && data.data.translations.length > 0) {
      return {
        text: data.data.translations[0].translatedText,
        detectedSourceLang: data.data.translations[0].detectedSourceLanguage || sourceLang,
      };
    }

    return null;
  } catch (error) {
    console.error('Google translation error:', error);
    return null;
  }
}

/**
 * Translate single text
 */
export async function translate(
  text: string,
  options: TranslationOptions = {}
): Promise<TranslationResult> {
  const { sourceLang = 'auto', targetLang = 'zh', useCache = true } = options;

  if (!text || text.trim().length === 0) {
    return {
      text: '',
      sourceLang,
      targetLang,
      provider: 'cache',
    };
  }

  // Check cache first
  if (useCache) {
    const cached = await getCachedTranslation(text, sourceLang, targetLang);
    if (cached) {
      return {
        text: cached,
        sourceLang,
        targetLang,
        provider: 'cache',
      };
    }
  }

  // Try DeepL first
  let result = await translateWithDeepL(text, sourceLang, targetLang);
  let provider: 'deepl' | 'google' = 'deepl';

  // Fallback to Google if DeepL fails
  if (!result) {
    result = await translateWithGoogle(text, sourceLang, targetLang);
    provider = 'google';
  }

  if (!result) {
    throw new Error('Translation failed: both providers unavailable');
  }

  // Cache the result
  if (useCache) {
    await setCachedTranslation(text, sourceLang, targetLang, result.text);
  }

  return {
    text: result.text,
    sourceLang: result.detectedSourceLang,
    targetLang,
    provider,
  };
}

/**
 * Translate multiple texts in batch
 */
export async function translateBatch(
  texts: string[],
  options: TranslationOptions = {}
): Promise<BatchTranslationResult> {
  const results: TranslationResult[] = [];
  const errors: { index: number; error: string }[] = [];

  // Process in parallel with rate limiting
  const batchSize = 5;
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchPromises = batch.map(async (text, batchIndex) => {
      const index = i + batchIndex;
      try {
        const result = await translate(text, options);
        return { index, result, error: null };
      } catch (error) {
        return {
          index,
          result: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);

    for (const { index, result, error } of batchResults) {
      if (result) {
        results[index] = result;
      } else if (error) {
        errors.push({ index, error });
      }
    }
  }

  return { results, errors };
}

/**
 * Detect language of text
 * Note: Uses DeepL's auto-detection or returns 'auto'
 */
export async function detectLanguage(text: string): Promise<string> {
  try {
    const result = await translate(text, { sourceLang: 'auto', targetLang: 'en' });
    return result.sourceLang;
  } catch {
    return 'auto';
  }
}

/**
 * Clear translation cache
 */
export async function clearTranslationCache(pattern?: string): Promise<void> {
  if (pattern) {
    const keys = await redis.keys(`translation:*${pattern}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } else {
    const keys = await redis.keys('translation:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

/**
 * Get translation cache stats
 */
export async function getCacheStats(): Promise<{ count: number; keys: string[] }> {
  const keys = await redis.keys('translation:*');
  return { count: keys.length, keys: keys.slice(0, 100) };
}
