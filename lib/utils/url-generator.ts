/**
 * URL generation utilities for rabbit holes
 */

/**
 * Generates a URL-friendly slug from a name
 * @param name The name to convert to URL
 * @returns URL-friendly string (lowercase, alphanumeric, hyphens)
 */
export function generateUrlFromName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Validates if a URL is in correct format
 * @param url The URL to validate
 * @returns Validation result
 */
export function validateUrl(url: string): { isValid: boolean; error?: string } {
  // Check length
  if (url.length < 3) {
    return { isValid: false, error: "URL must be at least 3 characters long" };
  }

  if (url.length > 50) {
    return { isValid: false, error: "URL must be no more than 50 characters long" };
  }

  // Check format (only lowercase letters, numbers, and hyphens)
  if (!/^[a-z0-9-]+$/.test(url)) {
    return { isValid: false, error: "URL can only contain lowercase letters, numbers, and hyphens" };
  }

  // Check it doesn't start or end with hyphen
  if (url.startsWith('-') || url.endsWith('-')) {
    return { isValid: false, error: "URL cannot start or end with a hyphen" };
  }

  // Check it doesn't have consecutive hyphens
  if (url.includes('--')) {
    return { isValid: false, error: "URL cannot have consecutive hyphens" };
  }

  return { isValid: true };
}

/**
 * Generates a unique URL by appending a number if needed
 * @param baseUrl The base URL
 * @param existingUrls Array of existing URLs to check against
 * @returns Unique URL
 */
export function generateUniqueUrl(baseUrl: string, existingUrls: string[]): string {
  let url = baseUrl;
  let counter = 1;

  while (existingUrls.includes(url)) {
    url = `${baseUrl}-${counter}`;
    counter++;
  }

  return url;
}

/**
 * Generates a URL from name with smart handling of duplicates
 * @param name The name to convert to URL
 * @param existingUrls Array of existing URLs to check against
 * @returns URL-friendly string that's unique
 */
export function generateUrlFromNameWithUniqueness(name: string, existingUrls: string[] = []): string {
  const baseUrl = generateUrlFromName(name);
  return generateUniqueUrl(baseUrl, existingUrls);
}

/**
 * Suggests URL alternatives if the original is taken
 * @param originalUrl The original URL that was taken
 * @param existingUrls Array of existing URLs
 * @returns Array of suggested URLs
 */
export function suggestUrlAlternatives(originalUrl: string, existingUrls: string[]): string[] {
  const suggestions: string[] = [];

  // Try adding numbers
  for (let i = 1; i <= 5; i++) {
    const suggestion = `${originalUrl}-${i}`;
    if (!existingUrls.includes(suggestion)) {
      suggestions.push(suggestion);
    }
  }

  // Try adding descriptive suffixes
  const suffixes = ['new', 'official', 'main', 'primary'];
  for (const suffix of suffixes) {
    const suggestion = `${originalUrl}-${suffix}`;
    if (!existingUrls.includes(suggestion)) {
      suggestions.push(suggestion);
    }
  }

  return suggestions.slice(0, 3); // Return max 3 suggestions
}
