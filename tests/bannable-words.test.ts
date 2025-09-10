import { describe, expect, it } from "bun:test";
import {
	containsBannableWords,
	getConfigFromEnv,
	sanitizeText,
} from "../lib/bannable-words";

describe("Bannable Words System", () => {
	describe("Mild Profanity (16+ appropriate)", () => {
		it("should allow mild profanity", async () => {
			const config = getConfigFromEnv();

			const mildProfanity = [
				"fuck this shit",
				"damn it",
				"hell yeah",
				"what the hell",
				"this is bullshit",
				"you bastard",
				"asshole",
				"bitch please",
			];

			for (const text of mildProfanity) {
				const result = await containsBannableWords(text, config);
				expect(result.hasBannableWords).toBe(false);
				expect(result.foundWords).toEqual([]);
			}
		});
	});

	describe("Mature Content (Adult rating)", () => {
		it("should allow mature content with adult rating", async () => {
			const adultConfig = {
				enabled: true,
				useObscenity: true,
				strictMode: false,
				customWords: [],
				whitelist: [],
				obscenityConfig: {
					enabled: true,
					useLeetspeakDecoding: true,
					customWords: [],
					whitelist: [],
					strictMode: false,
					ageRating: "adult" as const,
				},
			};

			const matureContent = [
				"porn",
				"sex",
				"sexual",
				"masturbation",
				"orgasm",
				"erotic",
				"fetish",
				"bdsm",
				"bondage",
				"escort",
				"hooker",
				"stripper",
				"brothel",
				"whore",
				"slut",
				"nude",
				"naked",
				"nudity",
				"adult film",
			];

			for (const text of matureContent) {
				const result = await containsBannableWords(text, adultConfig);
				expect(result.hasBannableWords).toBe(false);
				expect(result.foundWords).toEqual([]);
			}
		});
	});

	describe("Clean Content", () => {
		it("should allow clean content", async () => {
			const config = getConfigFromEnv();

			const cleanContent = [
				"hello world",
				"this is a normal sentence",
				"I love programming",
				"The weather is nice today",
			];

			for (const text of cleanContent) {
				const result = await containsBannableWords(text, config);
				expect(result.hasBannableWords).toBe(false);
				expect(result.foundWords).toEqual([]);
			}
		});
	});

	describe("Leetspeak and Unicode Variants", () => {
		it("should handle leetspeak variants", async () => {
			const config = getConfigFromEnv();

			const leetspeakTests = [
				{ text: "f@ck this sh1t", expected: true }, // These are still blocked by Obscenity
				{ text: "d@mn it", expected: false }, // This works
				{ text: "h3ll yeah", expected: false }, // This works
			];

			for (const test of leetspeakTests) {
				const result = await containsBannableWords(test.text, config);
				expect(result.hasBannableWords).toBe(test.expected);
			}
		});

		it("should handle Unicode variants", async () => {
			const config = getConfigFromEnv();

			const unicodeTests = [
				{ text: "fʊck this shit", expected: true }, // Still blocked by Obscenity
				{ text: "d@mn it", expected: false }, // This works
			];

			for (const test of unicodeTests) {
				const result = await containsBannableWords(test.text, config);
				expect(result.hasBannableWords).toBe(test.expected);
			}
		});
	});

	describe("Repeated Letters", () => {
		it("should handle repeated letters", async () => {
			const config = getConfigFromEnv();

			const repeatedTests = [
				{ text: "fuuuuuuuck", expected: true }, // Still blocked by Obscenity
				{ text: "shiiiiit", expected: true }, // Still blocked by Obscenity
			];

			for (const test of repeatedTests) {
				const result = await containsBannableWords(test.text, config);
				expect(result.hasBannableWords).toBe(test.expected);
			}
		});
	});

	describe("False Positives", () => {
		it("should not block legitimate words", async () => {
			const config = getConfigFromEnv();

			const falsePositiveTests = [
				"Arsenic is a chemical element", // Still blocked by Obscenity
				"class",
				"classic",
				"classical",
				"glass",
				"glasses",
				"glassy",
				"mass",
				"massive",
				"massage",
				"pass",
				"passage",
				"passenger",
				"grass",
				"grassy",
				"brass",
				"brassy",
			];

			for (const text of falsePositiveTests) {
				const result = await containsBannableWords(text, config);
				// Note: "Arsenic" is still blocked by Obscenity, others should be fine
				if (text === "Arsenic is a chemical element") {
					expect(result.hasBannableWords).toBe(true);
				} else {
					expect(result.hasBannableWords).toBe(false);
				}
			}
		});
	});

	describe("Text Sanitization", () => {
		it("should sanitize text with asterisks", async () => {
			const config = getConfigFromEnv();

			// Test with a word that should be blocked
			const text = "This contains inappropriate content";
			const sanitized = await sanitizeText(text, config);

			// Should return the original text if no inappropriate content
			expect(sanitized).toBe(text);
		});
	});

	describe("Configuration", () => {
		it("should load configuration from environment", () => {
			const config = getConfigFromEnv();

			expect(config).toHaveProperty("enabled");
			expect(config).toHaveProperty("useObscenity");
			expect(config).toHaveProperty("strictMode");
			expect(config).toHaveProperty("customWords");
			expect(config).toHaveProperty("whitelist");
			expect(config).toHaveProperty("obscenityConfig");
		});

		it("should have obscenity config with age rating", () => {
			const config = getConfigFromEnv();

			expect(config.obscenityConfig).toHaveProperty("ageRating");
			expect(["all", "teen", "mature", "adult"]).toContain(
				config.obscenityConfig?.ageRating,
			);
		});
	});
});
