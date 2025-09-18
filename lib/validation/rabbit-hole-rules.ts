/**
 * Validation utilities for rabbit hole rules
 */

export interface RuleValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates an array of rules
 * @param rules Array of rule strings
 * @returns Validation result with errors if any
 */
export function validateRules(rules: string[]): RuleValidationResult {
  const errors: string[] = [];

  // Check array length
  if (rules.length > 10) {
    errors.push("Maximum 10 rules allowed");
  }

  // Check each rule
  rules.forEach((rule, index) => {
    const trimmedRule = rule.trim();

    if (trimmedRule.length === 0) {
      errors.push(`Rule ${index + 1} cannot be empty`);
    } else if (trimmedRule.length > 100) {
      errors.push(`Rule ${index + 1} cannot exceed 100 characters`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitizes rules array by filtering out empty rules and trimming whitespace
 * @param rules Array of rule strings
 * @returns Cleaned rules array
 */
export function sanitizeRules(rules: string[]): string[] {
  return rules
    .map(rule => rule.trim())
    .filter(rule => rule.length > 0)
    .slice(0, 10); // Max 10 rules
}
