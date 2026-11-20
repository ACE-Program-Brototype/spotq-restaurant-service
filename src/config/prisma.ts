import fs from "node:fs";
import path from "node:path";
import { env } from "@/config/env.ts";
import { logger } from "@/infrastructure/observability/logger.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg, { type PoolConfig } from "pg";

/**
 * PostgreSQL Timestamp Type Parsers
 * Standardize timestamp parsing to UTC Date objects:
 * - OID 1114: TIMESTAMP (without time zone) -> parse as UTC ISO
 * - OID 1184: TIMESTAMPTZ (with time zone) -> parse directly into Date
 */
pg.types.setTypeParser(
	1114,
	(stringValue: string) => new Date(`${stringValue}Z`),
);
pg.types.setTypeParser(1184, (stringValue: string) => new Date(stringValue));

let ssl:
	| (PoolConfig["ssl"] & { rejectUnauthorized?: boolean; ca?: string })
	| undefined;

const poolUrl = new URL(env.DATABASE_URL);
const isSslRequested =
	poolUrl.searchParams.get("sslmode") === "require" ||
	poolUrl.searchParams.get("sslmode") === "prefer" ||
	poolUrl.searchParams.get("sslmode") === "verify-full" ||
	poolUrl.searchParams.get("sslmode") === "verify-ca";

if (env.DATABASE_SSL_ENABLED || isSslRequested) {
	let caContent: string | undefined;
	const envCaCert = env.DATABASE_CA_CERT;

	if (envCaCert) {
		if (envCaCert.includes("BEGIN CERTIFICATE")) {
			caContent = envCaCert.replace(/\\n/g, "\n");
		} else {
			try {
				caContent = fs.readFileSync(envCaCert, "utf8");
			} catch (error) {
				logger.warn(
					{ err: error },
					`Failed to read database CA certificate from env path: ${envCaCert}`,
				);
			}
		}
	} else {
		const defaultCertPath = path.resolve(process.cwd(), ".certs", "ca.pem");
		try {
			if (fs.existsSync(defaultCertPath)) {
				caContent = fs.readFileSync(defaultCertPath, "utf8");
			}
		} catch (_error) {}
	}

	if (caContent) {
		ssl = {
			rejectUnauthorized: true,
			ca: caContent,
		};
	} else {
		ssl = {
			rejectUnauthorized: false,
		};
	}
}

poolUrl.searchParams.delete("sslmode");

export const pool = new pg.Pool({
	connectionString: poolUrl.toString(),
	ssl,
	max: env.DATABASE_POOL_MAX,
	idleTimeoutMillis: env.DATABASE_POOL_IDLE_TIMEOUT_MS,
	connectionTimeoutMillis: env.DATABASE_POOL_CONNECTION_TIMEOUT_MS,
});

pool.on("error", (err) => {
	logger.error(
		{
			error: {
				name: err.name,
				message: err.message,
				stack: err.stack,
			},
		},
		"Unexpected idle PostgreSQL pool error",
	);
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
	adapter,
	log: [
		{ emit: "event", level: "error" },
		{ emit: "event", level: "warn" },
	],
});

prisma.$on("error" as never, (e: { message: string; target?: string }) => {
	logger.error(
		{
			error: {
				name: "PrismaClientError",
				message: e.message,
			},
			context: {
				...(e.target ? { target: e.target } : {}),
			},
		},
		"Prisma database error",
	);
});

prisma.$on("warn" as never, (e: { message: string }) => {
	logger.warn(
		{
			error: {
				name: "PrismaClientWarning",
				message: e.message,
			},
		},
		"Prisma database warning",
	);
});
