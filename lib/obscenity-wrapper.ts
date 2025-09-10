// Enhanced profanity filter using Obscenity library
// Integrates with existing bannable words system

import {
	englishDataset,
	englishRecommendedTransformers,
	RegExpMatcher,
	type RegExpMatcherOptions,
	TextCensor,
} from "obscenity";

export interface ObscenityConfig {
	enabled: boolean;
	useLeetspeakDecoding: boolean;
	customWords: string[];
	whitelist: string[];
	strictMode: boolean;
	ageRating: "all" | "teen" | "mature" | "adult"; // Age-appropriate filtering
}

export const DEFAULT_OBSCENITY_CONFIG: ObscenityConfig = {
	enabled: true,
	useLeetspeakDecoding: true,
	customWords: [],
	whitelist: [],
	strictMode: false,
	ageRating: "adult", // Allow mature content for 16+
};

// Age-appropriate word lists
const MILD_PROFANITY = [
	"fuck",
	"fucking",
	"fucked",
	"fucks",
	"shit",
	"shitting",
	"shitted",
	"shits",
	"damn",
	"damned",
	"damning",
	"hell",
	"hells",
	"ass",
	"asses",
	"asshole",
	"assholes",
	"bitch",
	"bitches",
	"bitching",
	"crap",
	"craps",
	"crappy",
	"piss",
	"pissing",
	"pissed",
	"pisses",
	"dick",
	"dicks",
	"dickhead",
	"dickheads",
	"bastard",
	"bastards",
	"bloody",
	"bloody hell",
];

const NSFW_WORDS = [
	// Explicit sexual content
	"porn",
	"porno",
	"pornography",
	"xxx",
	"sex",
	"sexual",
	"fuck",
	"fucking",
	"fucked",
	"fucks",
	"pussy",
	"pussies",
	"cock",
	"cocks",
	"dick",
	"dicks",
	"penis",
	"penises",
	"vagina",
	"vaginas",
	"boob",
	"boobs",
	"breast",
	"breasts",
	"tits",
	"titties",
	"masturbat",
	"masturbating",
	"masturbated",
	"masturbation",
	"orgasm",
	"orgasms",
	"orgasmic",
	"cum",
	"cums",
	"cumming",
	"came",
	"ejaculat",
	"ejaculating",
	"ejaculated",
	"ejaculation",
	"erotic",
	"erotica",
	"fetish",
	"fetishes",
	"kinky",
	"kink",
	"bdsm",
	"bondage",
	"dominat",
	"submiss",
	"sadist",
	"masochist",
	"prostitut",
	"prostitution",
	"escort",
	"escorts",
	"hooker",
	"hookers",
	"stripper",
	"strippers",
	"stripping",
	"strip club",
	"strip clubs",
	"brothel",
	"brothels",
	"whore",
	"whores",
	"slut",
	"sluts",
	"slutty",
	"nude",
	"nudes",
	"naked",
	"nudity",
	"nudist",
	"nudism",
	"nude",
	"nudes",
	"naked",
	"nudity",
	"nudist",
	"nudism",
	"pornstar",
	"pornstars",
	"adult film",
	"adult films",
	"xxx",
	"x-rated",
	"xrated",
	"adult content",
	"adult entertainment",
	"sex toy",
	"sex toys",
	"vibrator",
	"vibrators",
	"dildo",
	"dildos",
	"condom",
	"condoms",
	"contracept",
	"contraception",
	"viagra",
	"cialis",
	"libido",
	"libidos",
	"arousal",
	"aroused",
	"horny",
	"horniness",
	"lust",
	"lustful",
	"lusting",
	"lusted",
	"desire",
	"desires",
	"desiring",
	"desired",
	"passion",
	"passionate",
	"intimate",
	"intimacy",
	"foreplay",
	"foreplays",
	"climax",
	"climaxes",
	"climaxing",
	"climaxed",
	"pleasure",
	"pleasures",
	"pleasuring",
	"pleasured",
	"satisfaction",
	"satisfying",
	"satisfied",
	"satisfies",
	"ecstasy",
	"ecstasies",
	"ecstatic",
	"bliss",
	"blissful",
	"rapture",
	"raptures",
	"rapturous",
	"euphoria",
	"euphoric",
	"thrill",
	"thrills",
	"thrilling",
	"thrilled",
	"excitement",
	"exciting",
	"excited",
	"stimulation",
	"stimulating",
	"stimulated",
	"stimulates",
	"sensation",
	"sensations",
	"sensual",
	"sensuality",
	"erogenous",
	"erogenous zone",
	"erogenous zones",
	"genital",
	"genitals",
	"private parts",
	"intimate parts",
	"reproductive",
	"reproduction",
	"fertility",
	"fertile",
	"menstrual",
	"menstruation",
	"period",
	"periods",
	"pregnancy",
	"pregnant",
	"pregnant",
	"conception",
	"conceive",
	"abortion",
	"abortions",
	"miscarriage",
	"miscarriages",
	"contraception",
	"contraceptive",
	"contraceptives",
	"birth control",
	"family planning",
	"planned parenthood",
	"std",
	"stds",
	"sti",
	"stis",
	"sexually transmitted",
	"hiv",
	"aids",
	"herpes",
	"gonorrhea",
	"syphilis",
	"chlamydia",
	"safe sex",
	"unsafe sex",
	"protected sex",
	"unprotected sex",
	"one night stand",
	"one night stands",
	"casual sex",
	"hookup",
	"hookups",
	"swinger",
	"swingers",
	"swinging",
	"open relationship",
	"open relationships",
	"polyamory",
	"polyamorous",
	"threesome",
	"threesomes",
	"orgy",
	"orgies",
	"group sex",
	"gangbang",
	"gangbangs",
	"gangbanging",
	"rape",
	"rapes",
	"raping",
	"raped",
	"rapist",
	"rapists",
	"molest",
	"molesting",
	"molested",
	"molestation",
	"molester",
	"molesters",
	"abuse",
	"abusing",
	"abused",
	"abuser",
	"abusers",
	"abusive",
	"harassment",
	"harassing",
	"harassed",
	"harasser",
	"harassers",
	"stalking",
	"stalking",
	"stalked",
	"stalker",
	"stalkers",
	"revenge porn",
	"revenge pornography",
	"non-consensual",
	"nonconsensual",
	"underage",
	"minor",
	"minors",
	"child",
	"children",
	"teen",
	"teens",
	"pedophile",
	"pedophiles",
	"pedophilia",
	"ephebophile",
	"ephebophiles",
	"incest",
	"incestuous",
	"incestuous relationship",
	"incestuous relationships",
	"bestiality",
	"zoophilia",
	"necrophilia",
	"necrophiliac",
	"necrophiliacs",
	"scat",
	"scatology",
	"scatological",
	"coprophilia",
	"coprophiliac",
	"urine",
	"urination",
	"urinating",
	"urinated",
	"piss",
	"pissing",
	"pissed",
	"feces",
	"fecal",
	"defecation",
	"defecating",
	"defecated",
	"poop",
	"pooping",
	"pooped",
	"vomit",
	"vomiting",
	"vomited",
	"puke",
	"puking",
	"puked",
	"barf",
	"barfing",
	"barfed",
	"blood",
	"bleeding",
	"bled",
	"gore",
	"gory",
	"grisly",
	"grisly",
	"torture",
	"torturing",
	"tortured",
	"torturer",
	"torturers",
	"mutilation",
	"mutilating",
	"mutilated",
	"mutilate",
	"mutilates",
	"dismemberment",
	"dismembering",
	"dismembered",
	"dismember",
	"dismembers",
	"cannibalism",
	"cannibal",
	"cannibals",
	"cannibalistic",
	"necrophilia",
	"necrophiliac",
	"necrophiliacs",
	"necrophilic",
	"snuff",
	"snuff film",
	"snuff films",
	"snuff movie",
	"snuff movies",
	"snuff porn",
	"snuff pornography",
	"murder porn",
	"murder pornography",
	"killing",
	"killer",
	"killers",
	"murder",
	"murderer",
	"murderers",
	"suicide",
	"suicidal",
	"self-harm",
	"self-harming",
	"self-harmed",
	"cutting",
	"cutter",
	"cutters",
	"self-mutilation",
	"self-mutilating",
	"eating disorder",
	"eating disorders",
	"anorexia",
	"anorexic",
	"anorexics",
	"bulimia",
	"bulimic",
	"bulimics",
	"binge eating",
	"binge eating disorder",
	"drug",
	"drugs",
	"drug abuse",
	"drug addiction",
	"drug addict",
	"drug addicts",
	"cocaine",
	"coke",
	"heroin",
	"meth",
	"methamphetamine",
	"crystal meth",
	"marijuana",
	"cannabis",
	"weed",
	"pot",
	"hash",
	"hashish",
	"thc",
	"cbd",
	"lsd",
	"acid",
	"mushrooms",
	"magic mushrooms",
	"psilocybin",
	"psilocybin mushrooms",
	"ecstasy",
	"mdma",
	"molly",
	"ketamine",
	"special k",
	"k-hole",
	"ghb",
	"roofie",
	"roofies",
	"date rape drug",
	"date rape drugs",
	"alcohol",
	"alcoholic",
	"alcoholics",
	"alcoholism",
	"drunk",
	"drunken",
	"binge drinking",
	"binge drinker",
	"binge drinkers",
	"alcohol poisoning",
	"tobacco",
	"cigarette",
	"cigarettes",
	"smoking",
	"smoker",
	"smokers",
	"vaping",
	"vape",
	"vapes",
	"vaper",
	"vapers",
	"e-cigarette",
	"e-cigarettes",
	"nicotine",
	"nicotine addiction",
	"nicotine addict",
	"nicotine addicts",
	"gambling",
	"gambler",
	"gamblers",
	"gambling addiction",
	"gambling addict",
	"gambling addicts",
	"casino",
	"casinos",
	"slot machine",
	"slot machines",
	"poker",
	"blackjack",
	"roulette",
	"craps",
	"baccarat",
	"keno",
	"lottery",
	"lotteries",
	"scratch off",
	"scratch offs",
	"scratch ticket",
	"scratch tickets",
	"powerball",
	"mega millions",
	"lotto",
	"lottos",
	"sports betting",
	"sports bet",
	"sports bets",
	"betting",
	"bets",
	"bet",
	"horse racing",
	"dog racing",
	"greyhound racing",
	"cockfighting",
	"cockfights",
	"dogfighting",
	"dogfights",
	"bullfighting",
	"bullfights",
	"bullfight",
	"animal cruelty",
	"animal abuse",
	"animal torture",
	"animal mutilation",
	"cockfighting",
	"cockfights",
	"dogfighting",
	"dogfights",
	"bullfighting",
	"bullfights",
	"bullfight",
	"animal cruelty",
	"animal abuse",
	"animal torture",
	"animal mutilation",
	"cockfighting",
	"cockfights",
	"dogfighting",
	"dogfights",
	"bullfighting",
	"bullfights",
	"bullfight",
	"animal cruelty",
	"animal abuse",
	"animal torture",
	"animal mutilation",
	"cockfighting",
	"cockfights",
	"dogfighting",
	"dogfights",
	"bullfighting",
	"bullfights",
	"bullfight",
	"animal cruelty",
	"animal abuse",
	"animal torture",
	"animal mutilation",
];

// Cache for matcher instances
let cachedMatcher: RegExpMatcher | null = null;
let lastConfigHash: string | null = null;

/**
 * Gets age-appropriate word list based on rating
 */
function getAgeAppropriateWords(ageRating: string): string[] {
	switch (ageRating) {
		case "all":
			return []; // No profanity allowed
		case "teen":
			return []; // No profanity allowed for teens
		case "mature":
			return MILD_PROFANITY; // Allow mild profanity for 16+
		case "adult":
			return [...MILD_PROFANITY, ...NSFW_WORDS]; // Allow everything for adults
		default:
			return MILD_PROFANITY; // Default to mature
	}
}

/**
 * Creates a hash from config to detect changes
 */
function createConfigHash(config: ObscenityConfig): string {
	return JSON.stringify({
		enabled: config.enabled,
		useLeetspeakDecoding: config.useLeetspeakDecoding,
		customWords: config.customWords.sort(),
		whitelist: config.whitelist.sort(),
		strictMode: config.strictMode,
		ageRating: config.ageRating,
	});
}

/**
 * Creates or retrieves cached RegExpMatcher instance
 */
function getMatcher(config: ObscenityConfig): RegExpMatcher | null {
	if (!config.enabled) {
		return null;
	}

	const configHash = createConfigHash(config);

	// Return cached matcher if config hasn't changed
	if (cachedMatcher && lastConfigHash === configHash) {
		return cachedMatcher;
	}

	try {
		// Build the dataset
		const dataset = englishDataset.build();

		// Get age-appropriate words to allow
		const ageAppropriateWords = getAgeAppropriateWords(config.ageRating);

		// Create whitelist combining age-appropriate words and custom whitelist
		const whitelistTerms = [...config.whitelist, ...ageAppropriateWords];

		// Configure transformers
		const transformers = { ...englishRecommendedTransformers };

		// Note: Leetspeak decoding is always enabled for now
		// TODO: Implement proper leetspeak transformer filtering if needed

		const matcherOptions: RegExpMatcherOptions = {
			...dataset,
			...transformers,
			whitelistedTerms: whitelistTerms,
		};

		cachedMatcher = new RegExpMatcher(matcherOptions);
		lastConfigHash = configHash;

		return cachedMatcher;
	} catch (error) {
		console.error("Failed to create Obscenity matcher:", error);
		return null;
	}
}

/**
 * Checks if text contains profanity using Obscenity
 */
export function containsObscenity(
	text: string,
	config: ObscenityConfig = DEFAULT_OBSCENITY_CONFIG,
): { hasObscenity: boolean; foundWords: string[]; matches: unknown[] } {
	if (!config.enabled || !text) {
		return { hasObscenity: false, foundWords: [], matches: [] };
	}

	const matcher = getMatcher(config);
	if (!matcher) {
		return { hasObscenity: false, foundWords: [], matches: [] };
	}

	try {
		const matches = matcher.getAllMatches(text);
		const foundWords = matches.map((match) => {
			// Extract the matched text from the original string
			const matchedText = text.substring(match.startIndex, match.endIndex);
			return matchedText;
		});

		return {
			hasObscenity: matches.length > 0,
			foundWords,
			matches,
		};
	} catch (error) {
		console.error("Error checking obscenity:", error);
		return { hasObscenity: false, foundWords: [], matches: [] };
	}
}

/**
 * Censors text by replacing profanity with asterisks
 */
export function censorObscenity(
	text: string,
	config: ObscenityConfig = DEFAULT_OBSCENITY_CONFIG,
): string {
	if (!config.enabled || !text) {
		return text;
	}

	const matcher = getMatcher(config);
	if (!matcher) {
		return text;
	}

	try {
		const censor = new TextCensor();
		const matches = matcher.getAllMatches(text);
		return censor.applyTo(text, matches);
	} catch (error) {
		console.error("Error censoring text:", error);
		return text;
	}
}

/**
 * Validates text and returns error message if profanity found
 */
export function validateObscenity(
	text: string,
	fieldName: string = "text",
	config: ObscenityConfig = DEFAULT_OBSCENITY_CONFIG,
): { isValid: boolean; error?: string; foundWords?: string[] } {
	const result = containsObscenity(text, config);

	if (result.hasObscenity) {
		return {
			isValid: false,
			error: `${fieldName} contains inappropriate content: ${result.foundWords.join(", ")}`,
			foundWords: result.foundWords,
		};
	}

	return { isValid: true };
}

/**
 * Gets Obscenity configuration from environment variables
 */
export function getObscenityConfigFromEnv(): ObscenityConfig {
	return {
		enabled: process.env.OBSCENITY_ENABLED !== "false",
		useLeetspeakDecoding: process.env.OBSCENITY_LEETSPEAK !== "false",
		customWords:
			process.env.OBSCENITY_CUSTOM_WORDS?.split(",").map((w) => w.trim()) || [],
		whitelist:
			process.env.OBSCENITY_WHITELIST?.split(",").map((w) => w.trim()) || [],
		strictMode: process.env.OBSCENITY_STRICT === "true",
		ageRating:
			(process.env.OBSCENITY_AGE_RATING as
				| "all"
				| "teen"
				| "mature"
				| "adult") || "mature",
	};
}

/**
 * Test function to demonstrate Obscenity capabilities
 */
export function testObscenityDetection(): void {
	const testCases = [
		"You are a fʊcking idiot", // Unicode variant
		"fuck this shit", // Standard profanity
		"fuuuuuuuckkk", // Repeated letters
		"f@ck y0u", // Leetspeak
		"ʃʃὗƈｋ ỹоứ", // Unicode symbols
		"This is a normal sentence", // Clean text
		"Arsenic is a chemical element", // Should not match "arse"
	];

	console.log("Testing Obscenity Detection:");
	console.log("========================");

	testCases.forEach((testCase, index) => {
		const result = containsObscenity(testCase);
		console.log(`${index + 1}. "${testCase}"`);
		console.log(`   Has obscenity: ${result.hasObscenity}`);
		if (result.hasObscenity) {
			console.log(`   Found words: ${result.foundWords.join(", ")}`);
		}
		console.log("");
	});
}
