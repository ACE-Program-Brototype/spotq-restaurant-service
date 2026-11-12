import { PrismaClient } from "@prisma/client";

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
});
