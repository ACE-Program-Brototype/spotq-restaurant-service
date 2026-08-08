import { Router } from "express";
import { prisma } from "../../config/prisma.js";
import register from "../../config/prom.client.js";
import redis from "../../config/redis.js";
import { testQueue } from "../../infrastructure/queue/bullmq.service.js";
import { HTTP_STATUS } from "../../shared/constants/http.constants.js";

const systemRouter = Router();

systemRouter.get("/health", (_req, res) => {
	res.status(HTTP_STATUS.SUCCESS).json({ status: "ok" });
});

systemRouter.get("/ready", async (_req, res) => {
	try {
		await Promise.all([
			prisma.$queryRaw`SELECT 1`,
			redis.ping(),
			testQueue.waitUntilReady(),
		]);

		res.status(HTTP_STATUS.SUCCESS).json({ status: "ready" });
	} catch {
		res.status(503).json({ status: "not_ready" });
	}
});

systemRouter.get("/metrics", async (_req, res) => {
	res.set("Content-Type", register.contentType);
	res.end(await register.metrics());
});

export default systemRouter;
