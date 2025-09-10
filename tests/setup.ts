// Test setup file
import { afterAll, beforeAll } from "bun:test";

// Set up test environment variables
beforeAll(() => {
	// Set test environment variables
	process.env.BANNABLE_WORDS_ENABLED = "true";
	process.env.BANNABLE_WORDS_USE_OBSCENITY = "true";
	process.env.OBSCENITY_ENABLED = "true";
	process.env.OBSCENITY_AGE_RATING = "adult";
	process.env.OBSCENITY_LEETSPEAK = "true";
	process.env.OBSCENITY_STRICT = "false";
});

// Clean up after tests
afterAll(() => {
	// Clean up any test data if needed
});
