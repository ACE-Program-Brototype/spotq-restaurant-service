import { PrismaClient } from "@prisma/client";
import { logger } from "@/infrastructure/observability/logger.ts";

function getDatabaseUrl(): string | undefined {
	const rawUrl = process.env.DATABASE_URL;
	if (!rawUrl) return undefined;
	try {
		const parsed = new URL(rawUrl);
		if (!parsed.searchParams.has("connection_limit")) {
			parsed.searchParams.set("connection_limit", "3");
		}
		if (!parsed.searchParams.has("pool_timeout")) {
			parsed.searchParams.set("pool_timeout", "10");
		}
		return parsed.toString();
	} catch {
		return rawUrl;
	}
}

export const prisma = new PrismaClient({
	datasources: {
		db: {
			url: getDatabaseUrl(),
		},
	},
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
