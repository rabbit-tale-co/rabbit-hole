// Open source bannable words system
// Uses community-maintained lists from GitHub

export interface BannableWordsConfig {
  enabled: boolean;
  strictMode: boolean; // if true, blocks even partial matches
  customWords: string[];
  whitelist: string[]; // words that should never be blocked
}

// Default configuration
export const DEFAULT_CONFIG: BannableWordsConfig = {
  enabled: true,
  strictMode: false,
  customWords: [],
  whitelist: []
};

// Cache for bannable words lists
let cachedWords: Set<string> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Popular open source bannable words repositories
const BANNABLE_WORDS_SOURCES = [
  'https://raw.githubusercontent.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/master/en',
];

/**
 * Fetches bannable words from open source repositories
 */
async function fetchBannableWords(): Promise<Set<string>> {
  const now = Date.now();

  // Return cached words if still valid
  if (cachedWords && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedWords;
  }

  const words = new Set<string>();

  try {
    // Try to fetch from the first source (most reliable)
    const response = await fetch(BANNABLE_WORDS_SOURCES[0]);
    if (response.ok) {
      const text = await response.text();
      const lines = text.split('\n');

      for (const line of lines) {
        const word = line.trim().toLowerCase();
        if (word && !word.startsWith('#') && !word.startsWith('//')) {
          words.add(word);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to fetch bannable words from primary source:', error);

    // Fallback to local hardcoded list if fetch fails
    const fallbackWords = [
      'spam', 'scam', 'fake', 'hack', 'phish', 'malware', 'virus',
      'bot', 'automated', 'script', 'exploit', 'breach', 'leak'
    ];

    fallbackWords.forEach(word => words.add(word));
  }

  // Add custom words from environment
  const customWords = process.env.BANNABLE_WORDS?.split(',').map(w => w.trim().toLowerCase()) || [];
  customWords.forEach(word => words.add(word));

  cachedWords = words;
  lastFetchTime = now;

  return words;
}

/**
 * Checks if text contains bannable words
 */
export async function containsBannableWords(
  text: string,
  config: BannableWordsConfig = DEFAULT_CONFIG
): Promise<{ hasBannableWords: boolean; foundWords: string[] }> {
  if (!config.enabled || !text) {
    return { hasBannableWords: false, foundWords: [] };
  }

  const bannableWords = await fetchBannableWords();
  const foundWords: string[] = [];
  const normalizedText = text.toLowerCase();

  // Check each bannable word
  for (const word of bannableWords) {
    // Skip if word is in whitelist
    if (config.whitelist.includes(word)) {
      continue;
    }

    let isFound = false;

    if (config.strictMode) {
      // Strict mode: check for exact word boundaries
      const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      isFound = regex.test(normalizedText);
    } else {
      // Normal mode: check for substring matches
      isFound = normalizedText.includes(word);
    }

    if (isFound) {
      foundWords.push(word);
    }
  }

  // Check custom words
  for (const word of config.customWords) {
    const normalizedWord = word.toLowerCase();
    if (config.whitelist.includes(normalizedWord)) {
      continue;
    }

    let isFound = false;
    if (config.strictMode) {
      const regex = new RegExp(`\\b${normalizedWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      isFound = regex.test(normalizedText);
    } else {
      isFound = normalizedText.includes(normalizedWord);
    }

    if (isFound) {
      foundWords.push(normalizedWord);
    }
  }

  return {
    hasBannableWords: foundWords.length > 0,
    foundWords
  };
}

/**
 * Validates text and returns error message if bannable words found
 */
export async function validateText(
  text: string,
  fieldName: string = 'text',
  config: BannableWordsConfig = DEFAULT_CONFIG
): Promise<{ isValid: boolean; error?: string }> {
  const result = await containsBannableWords(text, config);

  if (result.hasBannableWords) {
    return {
      isValid: false,
      error: `${fieldName} contains inappropriate content: ${result.foundWords.join(', ')}`
    };
  }

  return { isValid: true };
}

/**
 * Sanitizes text by replacing bannable words with asterisks
 */
export async function sanitizeText(
  text: string,
  config: BannableWordsConfig = DEFAULT_CONFIG
): Promise<string> {
  if (!config.enabled || !text) {
    return text;
  }

  const bannableWords = await fetchBannableWords();
  let sanitizedText = text;

  // Replace bannable words with asterisks
  for (const word of bannableWords) {
    if (config.whitelist.includes(word)) {
      continue;
    }

    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    sanitizedText = sanitizedText.replace(regex, '*'.repeat(word.length));
  }

  // Replace custom words
  for (const word of config.customWords) {
    if (config.whitelist.includes(word.toLowerCase())) {
      continue;
    }

    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    sanitizedText = sanitizedText.replace(regex, '*'.repeat(word.length));
  }

  return sanitizedText;
}

/**
 * Gets configuration from environment variables
 */
export function getConfigFromEnv(): BannableWordsConfig {
  return {
    enabled: process.env.BANNABLE_WORDS_ENABLED !== 'false',
    strictMode: process.env.BANNABLE_WORDS_STRICT === 'true',
    customWords: process.env.BANNABLE_WORDS_CUSTOM?.split(',').map(w => w.trim()) || [],
    whitelist: process.env.BANNABLE_WORDS_WHITELIST?.split(',').map(w => w.trim()) || []
  };
}
