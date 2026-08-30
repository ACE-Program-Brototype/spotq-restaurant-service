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

	// JWT Configuration
	JWT_ACCESS_SECRET: z
		.string()
		.trim()
		.min(8)
		.default("spotq-restaurant-service-access-secret-jwt-key"),
	JWT_ACCESS_EXPIRES_IN: z.string().trim().default("15m"),
	JWT_REFRESH_SECRET: z
		.string()
		.trim()
		.min(8)
		.default("spotq-restaurant-service-refresh-secret-jwt-key"),
	JWT_REFRESH_EXPIRES_IN: z.string().trim().default("7d"),
	JWT_TEMP_SECRET: z
		.string()
		.trim()
		.min(8)
		.default("spotq-restaurant-service-temp-secret-jwt-key"),
	JWT_TEMP_EXPIRES_IN: z.string().trim().default("15m"),

	// Brevo Email Configuration
	BREVO_API_KEY: z.string().trim().default("mock-brevo-api-key"),
	BREVO_SENDER_EMAIL: z.string().trim().default("noreply@spotq.com"),
	BREVO_SENDER_NAME: z.string().trim().default("SpotQ"),

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
});

export type Env = z.infer<typeof envSchema>;

export const env = Object.freeze(envSchema.parse(process.env));
