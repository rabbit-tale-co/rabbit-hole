import { z } from "zod";
import { validateText, getConfigFromEnv } from "./bannable-words";

/**
 * Custom Zod refinement for bannable words validation
 */
export function createBannableWordsRefinement(fieldName: string = 'text') {
  return z.string().refine(
    async (text) => {
      if (!text) return true; // Allow empty strings

      const config = getConfigFromEnv();
      const result = await validateText(text, fieldName, config);
      return result.isValid;
    },
    {
      message: `${fieldName} contains inappropriate content`
    }
  );
}

/**
 * Enhanced username validation with bannable words check
 */
export const USERNAME_WITH_BANNABLE_CHECK = z
  .string()
  .min(3)
  .max(20)
  .regex(/^[a-z0-9_]+$/)
  .refine(
    async (username) => {
      if (!username) return true;

      const config = getConfigFromEnv();
      const result = await validateText(username, 'username', config);
      return result.isValid;
    },
    {
      message: "Username contains inappropriate content"
    }
  );

/**
 * Enhanced bio validation with bannable words check
 */
export const BIO_WITH_BANNABLE_CHECK = z
  .string()
  .max(500)
  .nullable()
  .optional()
  .refine(
    async (bio) => {
      if (!bio) return true;

      const config = getConfigFromEnv();
      const result = await validateText(bio, 'bio', config);
      return result.isValid;
    },
    {
      message: "Bio contains inappropriate content"
    }
  );

/**
 * Enhanced display name validation with bannable words check
 */
export const DISPLAY_NAME_WITH_BANNABLE_CHECK = z
  .string()
  .min(1)
  .max(50)
  .refine(
    async (displayName) => {
      if (!displayName) return true;

      const config = getConfigFromEnv();
      const result = await validateText(displayName, 'display name', config);
      return result.isValid;
    },
    {
      message: "Display name contains inappropriate content"
    }
  );

/**
 * Enhanced post content validation with bannable words check
 */
export const POST_CONTENT_WITH_BANNABLE_CHECK = z
  .string()
  .min(1)
  .max(2000)
  .refine(
    async (content) => {
      if (!content) return true;

      const config = getConfigFromEnv();
      const result = await validateText(content, 'post content', config);
      return result.isValid;
    },
    {
      message: "Post content contains inappropriate content"
    }
  );

/**
 * Enhanced comment validation with bannable words check
 */
export const COMMENT_WITH_BANNABLE_CHECK = z
  .string()
  .min(1)
  .max(500)
  .refine(
    async (comment) => {
      if (!comment) return true;

      const config = getConfigFromEnv();
      const result = await validateText(comment, 'comment', config);
      return result.isValid;
    },
    {
      message: "Comment contains inappropriate content"
    }
  );

/**
 * Generic text validation with bannable words check
 */
export function createTextWithBannableCheck(
  minLength: number = 1,
  maxLength: number = 1000,
  fieldName: string = 'text'
) {
  return z
    .string()
    .min(minLength)
    .max(maxLength)
    .refine(
      async (text) => {
        if (!text) return true;

        const config = getConfigFromEnv();
        const result = await validateText(text, fieldName, config);
        return result.isValid;
    },
    {
      message: `${fieldName} contains inappropriate content`
    }
  );
}
