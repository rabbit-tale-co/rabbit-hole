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
  .superRefine(async (username, ctx) => {
    if (!username) return;

    const config = getConfigFromEnv();
    const result = await validateText(username, 'username', config);

    if (!result.isValid) {
      ctx.addIssue({
        code: "custom",
        message: result.error || "Username contains inappropriate content"
      });
    }
  });

/**
 * Enhanced bio validation with bannable words check
 */
export const BIO_WITH_BANNABLE_CHECK = z
  .string()
  .max(500)
  .nullable()
  .optional()
  .superRefine(async (bio, ctx) => {
    if (!bio) return;

    const config = getConfigFromEnv();
    const result = await validateText(bio, 'bio', config);

    if (!result.isValid) {
      ctx.addIssue({
        code: "custom",
        message: result.error || "Bio contains inappropriate content"
      });
    }
  });

/**
 * Enhanced display name validation with bannable words check
 */
export const DISPLAY_NAME_WITH_BANNABLE_CHECK = z
  .string()
  .min(1)
  .max(50)
  .superRefine(async (displayName, ctx) => {
    if (!displayName) return;

    const config = getConfigFromEnv();
    const result = await validateText(displayName, 'display name', config);

    if (!result.isValid) {
      ctx.addIssue({
        code: "custom",
        message: result.error || "Display name contains inappropriate content"
      });
    }
  });

/**
 * Enhanced post content validation with bannable words check
 */
export const POST_CONTENT_WITH_BANNABLE_CHECK = z
  .string()
  .min(1)
  .max(2000)
  .superRefine(async (content, ctx) => {
    if (!content) return;

    const config = getConfigFromEnv();
    const result = await validateText(content, 'post content', config);

    if (!result.isValid) {
      ctx.addIssue({
        code: "custom",
        message: result.error || "Post content contains inappropriate content"
      });
    }
  });

/**
 * Enhanced comment validation with bannable words check
 */
export const COMMENT_WITH_BANNABLE_CHECK = z
  .string()
  .min(1)
  .max(500)
  .superRefine(async (comment, ctx) => {
    if (!comment) return;

    const config = getConfigFromEnv();
    const result = await validateText(comment, 'comment', config);

    if (!result.isValid) {
      ctx.addIssue({
        code: "custom",
        message: result.error || "Comment contains inappropriate content"
      });
    }
  });

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
    .superRefine(async (text, ctx) => {
      if (!text) return;

      const config = getConfigFromEnv();
      const result = await validateText(text, fieldName, config);

      if (!result.isValid) {
        ctx.addIssue({
          code: "custom",
          message: result.error || `${fieldName} contains inappropriate content`
        });
      }
    });
}
