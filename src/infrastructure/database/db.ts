import { prisma } from "@/config/prisma.ts";
import { logger } from "@/infrastructure/observability/logger.ts";

export async function connectDatabase() {
	await prisma.$connect();
	logger.info("PostgreSQL connected");
}

export async function disconnectDatabase() {
	await prisma.$disconnect();
	logger.info("PostgreSQL disconnected");
}
