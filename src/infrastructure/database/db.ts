import { prisma } from "../../config/prisma.js";
import { logger } from "../observability/logger.js";

export async function connectDatabase() {
	await prisma.$connect();
	logger.info("PostgreSQL connected");
}

export async function disconnectDatabase() {
	await prisma.$disconnect();
	logger.info("PostgreSQL disconnected");
}
