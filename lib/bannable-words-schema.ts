import { z } from "zod";
import { validateText } from "./bannable-words";

/**
 * Zod schema refinement for username validation with bannable words check
 */
export const USERNAME_WITH_BANNABLE_CHECK = z
	.string()
	.min(3, "Username must be at least 3 characters")
	.max(30, "Username must be no more than 30 characters")
	.regex(
		/^[a-zA-Z0-9_-]+$/,
		"Username can only contain letters, numbers, underscores, and hyphens",
	)
	.refine(
		async (value) => {
			const result = await validateText(value, "username");
			return result.isValid;
		},
		{
			message: "Username contains inappropriate content",
		},
	);

/**
 * Zod schema refinement for display name validation with bannable words check
 */
export const DISPLAY_NAME_WITH_BANNABLE_CHECK = z
	.string()
	.min(1, "Display name is required")
	.max(50, "Display name must be no more than 50 characters")
	.refine(
		async (value) => {
			console.log(`[SCHEMA] Validating display name: "${value}"`);
			const result = await validateText(value, "display name");
			console.log(`[SCHEMA] Display name validation result:`, result);
			return result.isValid;
		},
		{
			message: "Display name contains inappropriate content",
		},
	);

/**
 * Zod schema refinement for bio validation with bannable words check
 */
export const BIO_WITH_BANNABLE_CHECK = z
	.string()
	.max(500, "Bio must be no more than 500 characters")
	.refine(
		async (value) => {
			if (!value || value.trim().length === 0) {
				return true; // Empty bio is allowed
			}
			const result = await validateText(value, "bio");
			return result.isValid;
		},
		{
			message: "Bio contains inappropriate content",
		},
	);

/**
 * Zod schema refinement for general text validation with bannable words check
 */
export const TEXT_WITH_BANNABLE_CHECK = z.string().refine(
	async (value) => {
		const result = await validateText(value, "text");
		return result.isValid;
	},
	{
		message: "Text contains inappropriate content",
	},
);

/**
 * Zod schema refinement for post content validation with bannable words check
 */
export const POST_CONTENT_WITH_BANNABLE_CHECK = z
	.string()
	.min(1, "Content is required")
	.max(2000, "Content must be no more than 2000 characters")
	.refine(
		async (value) => {
			const result = await validateText(value, "post content");
			return result.isValid;
		},
		{
			message: "Post content contains inappropriate content",
		},
	);

/**
 * Zod schema refinement for comment validation with bannable words check
 */
export const COMMENT_WITH_BANNABLE_CHECK = z
	.string()
	.min(1, "Comment is required")
	.max(500, "Comment must be no more than 500 characters")
	.refine(
		async (value) => {
			const result = await validateText(value, "comment");
			return result.isValid;
		},
		{
			message: "Comment contains inappropriate content",
		},
	);
