import { z } from "zod";

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

	JWT_ACCESS_SECRET: z.string().trim().min(64),

	JWT_ACCESS_PRIVATE_KEY: z.string().trim().min(1),

	JWT_ACCESS_PUBLIC_KEY: z.string().trim().min(1),

	JWT_ACCESS_TOKEN_KEY_ID: z.string().trim().min(1),

	JWT_ALGORITHM: z.string().trim().min(1).default("RS256"),

	JWT_REFRESH_SECRET: z.string().trim().min(64),

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
			.default(7 * 24 * 60 * 60 * 1000), // 7 days in ms
	),
	COOKIE_DOMAIN: z.string().trim().optional(),

	// Rate Limiting Configuration
	RATE_LIMIT_LOGIN_MAX_ATTEMPTS: z.coerce.number().positive().default(5),
	RATE_LIMIT_LOGIN_WINDOW_SECONDS: z.coerce
		.number()
		.positive()
		.default(15 * 60),

	RATE_LIMIT_FORGOT_PASSWORD_MAX_ATTEMPTS: z.coerce
		.number()
		.positive()
		.default(3),
	RATE_LIMIT_FORGOT_PASSWORD_WINDOW_SECONDS: z.coerce
		.number()
		.positive()
		.default(24 * 60 * 60),

	RATE_LIMIT_VERIFY_OTP_MAX_ATTEMPTS: z.coerce.number().positive().default(5),
	RATE_LIMIT_VERIFY_OTP_WINDOW_SECONDS: z.coerce
		.number()
		.positive()
		.default(15 * 60),

	RATE_LIMIT_RESEND_OTP_MAX_ATTEMPTS: z.coerce.number().positive().default(3),
	RATE_LIMIT_RESEND_OTP_WINDOW_SECONDS: z.coerce
		.number()
		.positive()
		.default(60 * 60),

	RATE_LIMIT_RESET_PASSWORD_MAX_ATTEMPTS: z.coerce
		.number()
		.positive()
		.default(5),
	RATE_LIMIT_RESET_PASSWORD_WINDOW_SECONDS: z.coerce
		.number()
		.positive()
		.default(15 * 60),

	RATE_LIMIT_REFRESH_TOKEN_MAX_ATTEMPTS: z.coerce
		.number()
		.positive()
		.default(30),
	RATE_LIMIT_REFRESH_TOKEN_WINDOW_SECONDS: z.coerce
		.number()
		.positive()
		.default(60),
});

export type Env = z.infer<typeof envSchema>;

export const env = Object.freeze(envSchema.parse(process.env));
