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
});

export type Env = z.infer<typeof envSchema>;

export const env = Object.freeze(envSchema.parse(process.env));
