import { Router } from "express";
import { prisma } from "@/config/prisma.js";
import register from "@/config/prom.client.js";
import redis from "@/config/redis.js";
import { testQueue } from "@/infrastructure/queue/bullmq.service.js";
import { messages } from "@/shared/constants/message.constants.js";
import { SYSTEM_ROUTES } from "@/shared/constants/route.constants.js";
import { successResponse } from "@/utils/response.model.js";

const systemRouter = Router();

systemRouter.get(SYSTEM_ROUTES.HEALTH, (_req, res) => {
	successResponse(res, { status: "ok" }, messages.SERVICE_HEALTHY);
});

systemRouter.get(SYSTEM_ROUTES.READY, async (_req, res) => {
	try {
		await Promise.all([
			prisma.$queryRaw`SELECT 1`,
			redis.ping(),
			testQueue.waitUntilReady(),
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
