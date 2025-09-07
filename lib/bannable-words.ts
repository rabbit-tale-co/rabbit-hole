// Enhanced bannable words system
// Combines open source lists with Obscenity library for advanced detection

import {
  containsObscenity,
  censorObscenity,
  getObscenityConfigFromEnv,
  type ObscenityConfig
} from './obscenity-wrapper';

export interface BannableWordsConfig {
  enabled: boolean;
  strictMode: boolean; // if true, blocks even partial matches
  customWords: string[];
  whitelist: string[]; // words that should never be blocked
  useObscenity: boolean; // if true, uses Obscenity for enhanced detection
  obscenityConfig?: ObscenityConfig; // Obscenity-specific configuration
}

// Default configuration
export const DEFAULT_CONFIG: BannableWordsConfig = {
  enabled: true,
  strictMode: false,
  customWords: [],
  whitelist: [],
  useObscenity: true, // Enable Obscenity by default
  obscenityConfig: getObscenityConfigFromEnv()
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
      'bot', 'automated', 'script', 'exploit', 'breach', 'leak',
      // Additional NSFW words for 16+ filtering
      'adult film', 'adult films', 'fetish', 'fetishes', 'stripper', 'strippers',
      'brothel', 'brothels', 'naked', 'nudity', 'nudist', 'nudism',
      'pornstar', 'pornstars', 'escort', 'escorts', 'hooker', 'hookers',
      'whore', 'whores', 'slut', 'sluts', 'slutty'
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
 * Checks if text contains bannable words using both traditional and Obscenity detection
 */
export async function containsBannableWords(
  text: string,
  config: BannableWordsConfig = DEFAULT_CONFIG
): Promise<{ hasBannableWords: boolean; foundWords: string[]; detectionMethod?: string }> {
  if (!config.enabled || !text) {
    return { hasBannableWords: false, foundWords: [] };
  }

  const foundWords: string[] = [];
  const detectionMethod = 'traditional';

  // First, try Obscenity detection if enabled
  if (config.useObscenity && config.obscenityConfig) {
    try {
      const obscenityResult = containsObscenity(text, config.obscenityConfig);
      if (obscenityResult.hasObscenity) {
        return {
          hasBannableWords: true,
          foundWords: obscenityResult.foundWords,
          detectionMethod: 'obscenity'
        };
      }
    } catch (error) {
      console.warn('Obscenity detection failed, falling back to traditional method:', error);
    }
  }

  // Fallback to traditional method
  const bannableWords = await fetchBannableWords();
  const normalizedText = text.toLowerCase();

  // Get age-appropriate words to allow
  const ageAppropriateWords = (config.obscenityConfig?.ageRating === 'mature' || config.obscenityConfig?.ageRating === 'adult') ? [
    'fuck', 'fucking', 'fucked', 'fucks',
    'shit', 'shitting', 'shitted', 'shits', 'bullshit',
    'damn', 'damned', 'damning',
    'hell', 'hells',
    'ass', 'asses', 'asshole', 'assholes',
    'bitch', 'bitches', 'bitching',
    'crap', 'craps', 'crappy',
    'piss', 'pissing', 'pissed', 'pisses',
    'dick', 'dicks', 'dickhead', 'dickheads',
    'bastard', 'bastards',
    'bloody', 'bloody hell',
    // Add common variants
    'f@ck', 'f@c', 'f0ck', 'f0c', 'fucc', 'fuc',
    'sh1t', 'sh1', 'sh!t', 'sh!', 'shiit', 'shii',
    'd@mn', 'd@m', 'd0mn', 'd0m',
    'h3ll', 'h3l', 'he11', 'he1',
    'a55', 'a5s', 'a$$', 'a$s',
    'b1tch', 'b1t', 'b!tch', 'b!t',
    'd1ck', 'd1c', 'd!ck', 'd!c',
    // Add mature content for adult rating
    ...(config.obscenityConfig?.ageRating === 'adult' ? [
      'porn', 'pornography', 'xxx', 'sex', 'sexual',
      'pussy', 'pussies', 'cock', 'cocks', 'penis', 'penises',
      'vagina', 'vaginas', 'boob', 'boobs', 'breast', 'breasts', 'tits', 'titties',
      'masturbation', 'orgasm', 'orgasms', 'cum', 'cums', 'cumming',
      'erotic', 'erotica', 'fetish', 'fetishes', 'kinky', 'kink',
      'bdsm', 'bondage', 'prostitution', 'escort', 'escorts', 'hooker', 'hookers',
      'stripper', 'strippers', 'brothel', 'brothels', 'whore', 'whores', 'slut', 'sluts',
      'nude', 'nudes', 'naked', 'nudity', 'nudist', 'nudism',
      'pornstar', 'pornstars', 'adult film', 'adult films'
    ] : [])
  ] : [];

  // Add false positive whitelist
  const falsePositiveWhitelist = [
    'arsenic', 'arsenical', 'arsenate', 'arsenite',
    'class', 'classic', 'classical', 'classify', 'classification',
    'glass', 'glasses', 'glassy',
    'mass', 'massive', 'massacre', 'massage',
    'pass', 'passage', 'passenger', 'passport',
    'grass', 'grassy',
    'brass', 'brassy',
    'assassin', 'assassinate', 'assassination',
    'assemble', 'assembly', 'assemblage',
    'assess', 'assessment', 'assessor',
    'assert', 'assertion', 'assertive',
    'assign', 'assignment', 'assigned',
    'assist', 'assistance', 'assistant',
    'associate', 'association', 'associated',
    'assume', 'assumption', 'assuming',
    'assure', 'assurance', 'assured',
    'assort', 'assorted', 'assortment',
    'assume', 'assumption', 'assuming',
    'assume', 'assumption', 'assuming'
  ];

  // Combine whitelist with age-appropriate words and false positive whitelist
  const allowedWords = new Set([
    ...config.whitelist,
    ...ageAppropriateWords,
    ...falsePositiveWhitelist
  ]);

  // Check each bannable word
  for (const word of bannableWords) {
    // Skip if word is in whitelist or age-appropriate
    if (allowedWords.has(word)) {
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
    if (allowedWords.has(normalizedWord)) {
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
    foundWords,
    detectionMethod
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
 * Uses Obscenity's advanced censoring if enabled
 */
export async function sanitizeText(
  text: string,
  config: BannableWordsConfig = DEFAULT_CONFIG
): Promise<string> {
  if (!config.enabled || !text) {
    return text;
  }

  // Use Obscenity censoring if enabled
  if (config.useObscenity && config.obscenityConfig) {
    try {
      const censoredText = censorObscenity(text, config.obscenityConfig);
      return censoredText;
    } catch (error) {
      console.warn('Obscenity censoring failed, falling back to traditional method:', error);
    }
  }

  // Fallback to traditional method
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
    whitelist: process.env.BANNABLE_WORDS_WHITELIST?.split(',').map(w => w.trim()) || [],
    useObscenity: process.env.BANNABLE_WORDS_USE_OBSCENITY !== 'false', // Default to true
    obscenityConfig: getObscenityConfigFromEnv()
  };
}
