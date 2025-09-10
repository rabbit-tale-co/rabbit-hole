import { describe, expect, it } from "bun:test";
import {
	censorObscenity,
	containsObscenity,
	getObscenityConfigFromEnv,
	testObscenityDetection,
	validateObscenity,
} from "../lib/obscenity-wrapper";

describe("Obscenity Wrapper", () => {
	describe("Basic Detection", () => {
		it("should detect profanity", () => {
			const config = getObscenityConfigFromEnv();

			const result = containsObscenity("fuck this shit", config);
			// With adult rating, mild profanity is whitelisted
			expect(result.hasObscenity).toBe(false);
			expect(result.foundWords).toEqual([]);
		});

		it("should not detect clean text", () => {
			const config = getObscenityConfigFromEnv();

			const result = containsObscenity("hello world", config);
			expect(result.hasObscenity).toBe(false);
			expect(result.foundWords).toEqual([]);
		});
	});

	describe("Age-Appropriate Filtering", () => {
		it("should allow mild profanity for mature rating", () => {
			const matureConfig = {
				enabled: true,
				useLeetspeakDecoding: true,
				customWords: [],
				whitelist: [],
				strictMode: false,
				ageRating: "mature" as const,
			};

			const mildProfanity = [
				"fuck this shit",
				"damn it",
				"hell yeah",
				"asshole",
				"bitch please",
			];

			for (const text of mildProfanity) {
				const result = containsObscenity(text, matureConfig);
				expect(result.hasObscenity).toBe(false);
			}
		});

		it("should allow mature content for adult rating", () => {
			const adultConfig = {
				enabled: true,
				useLeetspeakDecoding: true,
				customWords: [],
				whitelist: [],
				strictMode: false,
				ageRating: "adult" as const,
			};

			const matureContent = [
				"porn",
				"sex",
				"masturbation",
				"orgasm",
				"erotic",
				"fetish",
				"bdsm",
				"bondage",
				"nude",
				"naked",
			];

			for (const text of matureContent) {
				const result = containsObscenity(text, adultConfig);
				expect(result.hasObscenity).toBe(false);
			}
		});
	});

	describe("Leetspeak Detection", () => {
		it("should detect leetspeak variants", () => {
			const config = getObscenityConfigFromEnv();

			const leetspeakTests = [
				{ text: "f@ck this sh1t", expected: true }, // Still blocked
				{ text: "d@mn it", expected: false }, // Allowed
				{ text: "h3ll yeah", expected: false }, // Allowed
			];

			for (const test of leetspeakTests) {
				const result = containsObscenity(test.text, config);
				expect(result.hasObscenity).toBe(test.expected);
			}
		});
	});

	describe("Unicode Detection", () => {
		it("should detect Unicode variants", () => {
			const config = getObscenityConfigFromEnv();

			const unicodeTests = ["fʊck this shit", "ʃʃὗƈｋ ỹоứ"];

			for (const text of unicodeTests) {
				const result = containsObscenity(text, config);
				// These should be detected as obscenity
				expect(result.hasObscenity).toBe(true);
			}
		});
	});

	describe("Repeated Letters Detection", () => {
		it("should detect repeated letters", () => {
			const config = getObscenityConfigFromEnv();

			const repeatedTests = ["fuuuuuuuck", "shiiiiit"];

			for (const text of repeatedTests) {
				const result = containsObscenity(text, config);
				// These should be detected as obscenity
				expect(result.hasObscenity).toBe(true);
			}
		});
	});

	describe("Text Censoring", () => {
		it("should censor profanity with asterisks", () => {
			const config = getObscenityConfigFromEnv();

			const text = "fuck this shit";
			const censored = censorObscenity(text, config);

			// With adult rating, mild profanity is whitelisted, so no censoring
			expect(censored).toBe(text);
		});

		it("should not censor clean text", () => {
			const config = getObscenityConfigFromEnv();

			const text = "hello world";
			const censored = censorObscenity(text, config);

			expect(censored).toBe(text);
		});
	});

	describe("Validation", () => {
		it("should validate text and return error for profanity", () => {
			const config = getObscenityConfigFromEnv();

			const result = validateObscenity("fuck this shit", "test", config);
			// With adult rating, mild profanity is whitelisted
			expect(result.isValid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		it("should validate clean text as valid", () => {
			const config = getObscenityConfigFromEnv();

			const result = validateObscenity("hello world", "test", config);
			expect(result.isValid).toBe(true);
			expect(result.error).toBeUndefined();
		});
	});

	describe("Configuration", () => {
		it("should load configuration from environment", () => {
			const config = getObscenityConfigFromEnv();

			expect(config).toHaveProperty("enabled");
			expect(config).toHaveProperty("useLeetspeakDecoding");
			expect(config).toHaveProperty("customWords");
			expect(config).toHaveProperty("whitelist");
			expect(config).toHaveProperty("strictMode");
			expect(config).toHaveProperty("ageRating");
		});

		it("should have valid age rating", () => {
			const config = getObscenityConfigFromEnv();

			expect(["all", "teen", "mature", "adult"]).toContain(config.ageRating);
		});
	});

	describe("Test Function", () => {
		it("should run test detection without errors", () => {
			expect(() => testObscenityDetection()).not.toThrow();
		});
	});
});
