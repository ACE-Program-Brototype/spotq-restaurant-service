import { Router } from "express";
import { prisma } from "@/config/prisma";
import register from "@/config/prom.client";
import redis from "@/config/redis";
import { testQueue } from "@/infrastructure/queue/bullmq.service";
import { HTTP_STATUS } from "@/shared/constants/http.constants";
import { SYSTEM_ROUTES } from "@/shared/constants/route.constants";

const systemRouter = Router();

systemRouter.get(SYSTEM_ROUTES.HEALTH, (_req, res) => {
	res.status(HTTP_STATUS.SUCCESS).json({ status: "ok" });
});

systemRouter.get(SYSTEM_ROUTES.READY, async (_req, res) => {
	try {
		await Promise.all([
			prisma.$queryRaw`SELECT 1`,
			redis.ping(),
			testQueue.waitUntilReady(),
		]);

		res.status(HTTP_STATUS.SUCCESS).json({ status: "ready" });
	} catch {
		res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({ status: "not_ready" });
	}
});

systemRouter.get(SYSTEM_ROUTES.METRICS, async (_req, res) => {
	res.set("Content-Type", register.contentType);
	res.end(await register.metrics());
});

export default systemRouter;
