import { NextRequest, NextResponse } from 'next/server';
import { containsBannableWords, getConfigFromEnv } from '@/lib/bannable-words';

export interface BannableWordsMiddlewareOptions {
  fields: string[]; // fields to check
  strictMode?: boolean;
  customWords?: string[];
  whitelist?: string[];
}

/**
 * Middleware to check for bannable words in request body
 */
export function withBannableWordsCheck(options: BannableWordsMiddlewareOptions) {
  return function(handler: (req: NextRequest) => Promise<NextResponse>) {
    return async function(req: NextRequest): Promise<NextResponse> {
      // Only check POST, PUT, PATCH requests
      if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
        return handler(req);
      }

      try {
        const body = await req.json();
        const config = getConfigFromEnv();

        // Override config with middleware options
        const middlewareConfig = {
          ...config,
          strictMode: options.strictMode ?? config.strictMode,
          customWords: [...config.customWords, ...(options.customWords || [])],
          whitelist: [...config.whitelist, ...(options.whitelist || [])]
        };

        // Check each specified field
        for (const field of options.fields) {
          const value = body[field];
          if (typeof value === 'string' && value.trim()) {
            const result = await containsBannableWords(value, middlewareConfig);

            if (result.hasBannableWords) {
              return NextResponse.json(
                {
                  error: `Content contains inappropriate words: ${result.foundWords.join(', ')}`,
                  field,
                  foundWords: result.foundWords
                },
                { status: 400 }
              );
            }
          }
        }

        // If all checks pass, continue to handler
        return handler(req);
      } catch (error) {
        console.error('Bannable words middleware error:', error);
        return NextResponse.json(
          { error: 'Invalid request body' },
          { status: 400 }
        );
      }
    };
  };
}

/**
 * Quick middleware for common fields
 */
export const withProfileBannableWordsCheck = withBannableWordsCheck({
  fields: ['username', 'display_name', 'bio']
});

export const withPostBannableWordsCheck = withBannableWordsCheck({
  fields: ['content']
});

export const withCommentBannableWordsCheck = withBannableWordsCheck({
  fields: ['content']
});

/**
 * Utility function to check bannable words in any text
 */
export async function checkBannableWordsInRequest(
  req: NextRequest,
  fields: string[]
): Promise<{ isValid: boolean; error?: string; foundWords?: string[] }> {
  try {
    const body = await req.json();
    const config = getConfigFromEnv();

    for (const field of fields) {
      const value = body[field];
      if (typeof value === 'string' && value.trim()) {
        const result = await containsBannableWords(value, config);

        if (result.hasBannableWords) {
          return {
            isValid: false,
            error: `Content contains inappropriate words: ${result.foundWords.join(', ')}`,
            foundWords: result.foundWords
          };
        }
      }
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid request body'
    };
  }
}
