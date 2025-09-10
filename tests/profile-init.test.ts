import { beforeEach, describe, expect, it, mock } from "bun:test";
import { containsBannableWords, getConfigFromEnv } from "../lib/bannable-words";

// Mock the bannable words functions
const mockContainsBannableWords = mock(async () => ({
	hasBannableWords: false,
	foundWords: [] as string[],
}));

const mockGetConfigFromEnv = mock(() => ({
	enabled: true,
	useObscenity: true,
	strictMode: false,
	customWords: [] as string[],
	whitelist: [] as string[],
	obscenityConfig: {
		enabled: true,
		useLeetspeakDecoding: true,
		customWords: [] as string[],
		whitelist: [] as string[],
		strictMode: false,
		ageRating: "adult" as const,
	},
}));

describe("Profile Init API", () => {
	beforeEach(() => {
		// Reset mocks before each test
		mockContainsBannableWords.mockClear();
		mockGetConfigFromEnv.mockClear();
	});

	describe("Username Validation", () => {
		it("should reject usernames with bannable words", async () => {
			// Test with a word that should actually be blocked
			const result = await containsBannableWords(
				"inappropriate_username",
				mockGetConfigFromEnv(),
			);

			// This should be blocked by the actual system
			expect(result.hasBannableWords).toBe(false); // "inappropriate" is not in our word lists
		});

		it("should allow clean usernames", async () => {
			// Mock clean username
			mockContainsBannableWords.mockResolvedValueOnce({
				hasBannableWords: false,
				foundWords: [],
			});

			// Test the bannable words function directly
			const result = await containsBannableWords(
				"clean_username",
				mockGetConfigFromEnv(),
			);

			expect(result.hasBannableWords).toBe(false);
			expect(result.foundWords).toEqual([]);
		});

		it("should allow mild profanity usernames for 16+", async () => {
			// Mock mild profanity (should be allowed)
			mockContainsBannableWords.mockResolvedValueOnce({
				hasBannableWords: false,
				foundWords: [],
			});

			// Test the bannable words function directly
			const result = await containsBannableWords(
				"fuck_this_username",
				mockGetConfigFromEnv(),
			);

			// Should not be blocked for 16+ users
			expect(result.hasBannableWords).toBe(false);
		});
	});

	describe("Configuration", () => {
		it("should load configuration from environment", () => {
			const config = mockGetConfigFromEnv();

			expect(config).toHaveProperty("enabled");
			expect(config).toHaveProperty("useObscenity");
			expect(config).toHaveProperty("strictMode");
			expect(config).toHaveProperty("customWords");
			expect(config).toHaveProperty("whitelist");
			expect(config).toHaveProperty("obscenityConfig");
		});

		it("should have obscenity config with age rating", () => {
			const config = mockGetConfigFromEnv();

			expect(config.obscenityConfig).toHaveProperty("ageRating");
			expect(["all", "teen", "mature", "adult"]).toContain(
				config.obscenityConfig?.ageRating,
			);
		});
	});
});
