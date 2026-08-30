import { Router } from "express";
import { prisma } from "@/config/prisma.ts";
import register from "@/config/prom.client.ts";
import redis from "@/config/redis.ts";
import { emailQueue } from "@/infrastructure/queue/bullmq.service.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { SYSTEM_ROUTES } from "@/shared/constants/route.constants.ts";
import { successResponse } from "@/utils/response.model.ts";

const systemRouter = Router();

systemRouter.get(SYSTEM_ROUTES.HEALTH, (_req, res) => {
	successResponse(res, messages.SERVICE_HEALTHY, HTTP_STATUS.SUCCESS, {
		status: "ok",
	});
});

systemRouter.get(SYSTEM_ROUTES.READY, async (_req, res) => {
	try {
		await Promise.all([
			prisma.$queryRaw`SELECT 1`,
			redis.ping(),
			emailQueue.waitUntilReady(),
		]);

		successResponse(res, messages.SERVICE_READY, HTTP_STATUS.SUCCESS, {
			status: "ready",
		});
	} catch {
		throw new Error(messages.SERVICE_UNAVAILABLE);
	}
});

systemRouter.get(SYSTEM_ROUTES.METRICS, async (_req, res) => {
	res.set("Content-Type", register.contentType);
	res.end(await register.metrics());
});

export default systemRouter;
