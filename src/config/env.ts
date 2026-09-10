import crypto from "node:crypto";
import { z } from "zod";

let testKeyPair: { privateKey: string; publicKey: string } | null = null;

const getTestKeyPair = (): { privateKey: string; publicKey: string } => {
	if (!testKeyPair) {
		const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
			modulusLength: 2048,
			publicKeyEncoding: { type: "spki", format: "pem" },
			privateKeyEncoding: { type: "pkcs8", format: "pem" },
		});
		testKeyPair = { privateKey, publicKey };
	}
	return testKeyPair;
};

const urlValidator = (name: string, allowedProtocols: string[]) =>
	z
		.string()
		.trim()
		.refine(
			(value) => {
				try {
					const url = new URL(value);
					return allowedProtocols.includes(url.protocol);
				} catch {
					return false;
				}
			},
			{
				message: `${name} must be a valid URL using one of: ${allowedProtocols.join(", ")}`,
			},
		);

const envSchema = z.object({
	PORT: z
		.string()
		.trim()
		.regex(/^\d+$/, "PORT must be an integer between 1 and 65535")
		.transform(Number)
		.refine((port) => port >= 1 && port <= 65535, {
			message: "PORT must be an integer between 1 and 65535",
		}),
	DATABASE_URL: urlValidator("DATABASE_URL", ["postgres:", "postgresql:"]),
	REDIS_URL: urlValidator("REDIS_URL", ["redis:", "rediss:"]),
	APP_ENV: z.preprocess(
		(value) => (typeof value === "string" ? value.trim() : value),
		z.string().min(1).default("development"),
	),
	LOG_LEVEL: z.preprocess(
		(value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
		z
			.enum(["trace", "debug", "info", "warn", "error", "fatal"])
			.default("info"),
	),
	AWS_ACCESS_KEY_ID: z.string().trim().min(1),

	AWS_SECRET_ACCESS_KEY: z.string().trim().min(1),

	AWS_REGION: z.string().trim().min(1),

	AWS_S3_BUCKET: z.string().trim().min(1),

	BREVO_API_KEY: z.string().trim().min(1),

	BREVO_SENDER_EMAIL: z.string().trim().email(),

	BREVO_SENDER_NAME: z.string().trim().min(1),

	OTP_TTL_SECONDS: z.coerce.number().positive().default(300),

	OTP_MAX_ATTEMPTS: z.coerce.number().positive().default(5),

	JWT_PRIVATE_KEY: z.preprocess(
		(val) => {
			if (typeof val === "string" && val.trim().length > 0) {
				return val.replace(/\\n/g, "\n").trim();
			}
			return getTestKeyPair().privateKey;
		},
		z.string().min(1),
	),

	JWT_PUBLIC_KEY: z.preprocess(
		(val) => {
			if (typeof val === "string" && val.trim().length > 0) {
				return val.replace(/\\n/g, "\n").trim();
			}
			return getTestKeyPair().publicKey;
		},
		z.string().min(1),
	),

	JWT_KEY_ID: z.string().trim().default("spotq-main-key"),
	JWT_KEY_TYPE: z.string().trim().default("RSA"),
	JWT_KEY_USE: z.string().trim().default("sig"),
	JWT_ALGORITHM: z.enum(["RS256", "RS384", "RS512"]).default("RS256"),

	JWT_ACCESS_SECRET: z.preprocess(
		(val) => (typeof val === "string" && val.trim().length >= 16 ? val.trim() : "default_access_secret_for_signing_jwt_tokens_min_32_chars"),
		z.string().trim().min(16),
	),

	JWT_REFRESH_SECRET: z.preprocess(
		(val) => (typeof val === "string" && val.trim().length >= 16 ? val.trim() : "default_refresh_secret_for_signing_jwt_tokens_min_32_chars"),
		z.string().trim().min(16),
	),

	BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(14),

	JWT_ACCESS_EXPIRES_IN: z.string().trim().default("15m"),

	JWT_REFRESH_EXPIRES_IN: z.string().trim().default("7d"),

	JWT_TEMP_SECRET: z
		.string()
		.trim()
		.min(8)
		.default("spotq-restaurant-service-temp-secret-jwt-key"),

	JWT_TEMP_EXPIRES_IN: z.string().trim().default("15m"),

	// Cookie Configuration from Environment
	COOKIE_NAME_REFRESH_TOKEN: z.string().trim().default("refreshToken"),
	COOKIE_NAME_TEMP_TOKEN: z.string().trim().default("tempToken"),
	COOKIE_HTTP_ONLY: z.preprocess((val) => {
		if (typeof val === "string") return val.toLowerCase() === "true";
		if (typeof val === "boolean") return val;
		return true;
	}, z.boolean().default(true)),
	COOKIE_SECURE: z.preprocess((val) => {
		if (typeof val === "string") return val.toLowerCase() === "true";
		if (typeof val === "boolean") return val;
		return process.env.APP_ENV === "production";
	}, z.boolean().default(false)),
	COOKIE_SAME_SITE: z.preprocess(
		(val) => (typeof val === "string" ? val.trim().toLowerCase() : val),
		z.enum(["strict", "lax", "none"]).default("strict"),
	),
	COOKIE_PATH: z.string().trim().default("/"),
	COOKIE_MAX_AGE_MS: z.preprocess(
		(val) => (typeof val === "string" ? Number(val) : val),
		z
			.number()
			.positive()
			.default(7 * 24 * 60 * 60 * 1000),
	),
	COOKIE_DOMAIN: z.string().trim().optional(),
	BULLMQ_WORKER_CONCURRENCY: z.coerce.number().positive().default(5),
	SUBSCRIPTION_EXPIRY_CHECK_INTERVAL_MS: z.coerce
		.number()
		.positive()
		.default(60 * 60 * 1000),
});

export type Env = z.infer<typeof envSchema>;

export const env = Object.freeze(envSchema.parse(process.env));
