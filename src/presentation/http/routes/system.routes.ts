import { Router } from "express";
import { prisma } from "@/config/prisma.ts";
import register from "@/config/prom.client.ts";
import redis from "@/config/redis.ts";
import { emailQueue } from "@/infrastructure/queue/bullmq.service.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { SYSTEM_ROUTES } from "@/shared/constants/route.constants.ts";
import { successResponse } from "@/utils/response.model.ts";

const systemRouter = Router();

systemRouter.get(SYSTEM_ROUTES.HEALTH, (_req, res) => {
	successResponse(res, { status: "ok" }, messages.SERVICE_HEALTHY);
});

systemRouter.get(SYSTEM_ROUTES.READY, async (_req, res) => {
	try {
		await Promise.all([
			prisma.$queryRaw`SELECT 1`,
			redis.ping(),
			emailQueue.waitUntilReady(),
		]);

		successResponse(res, { status: "ready" }, messages.SERVICE_READY);
	} catch {
		throw new Error(messages.SERVICE_UNAVAILABLE);
	}
});

systemRouter.get(SYSTEM_ROUTES.METRICS, async (_req, res) => {
	res.set("Content-Type", register.contentType);
	res.end(await register.metrics());
});

export default systemRouter;
