import { prisma } from "@/config/prisma.js";
import { logger } from "@/infrastructure/observability/logger.js";

export async function connectDatabase() {
	await prisma.$connect();
	logger.info("PostgreSQL connected");
}

export async function disconnectDatabase() {
	await prisma.$disconnect();
	logger.info("PostgreSQL disconnected");
}
