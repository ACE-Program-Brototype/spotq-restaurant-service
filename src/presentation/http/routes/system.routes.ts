import { Router } from "express";
import { container } from "@/config/di/container.ts";
import { TYPES } from "@/config/di/types.ts";
import register from "@/config/prom.client.ts";
import type { IHealthCheckable } from "@/infrastructure/health/health-check.service.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { SYSTEM_ROUTES } from "@/shared/constants/route.constants.ts";
import { sendSuccessResponse } from "@/shared/response/api-response.ts";

const systemRouter = Router();

const healthCheckService = container.get<IHealthCheckable>(
	TYPES.HealthCheckService,
);

systemRouter.get(SYSTEM_ROUTES.HEALTH, async (_req, res) => {
	const health = await healthCheckService.checkHealth();
	const statusCode =
		health.status === "ok" ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE;

	sendSuccessResponse(res, health, messages.SERVICE_HEALTHY, statusCode);
});

systemRouter.get(SYSTEM_ROUTES.READY, async (_req, res) => {
	const isReady = await healthCheckService.isReady();
	if (!isReady) {
		throw new Error(messages.SERVICE_UNAVAILABLE);
	}

	sendSuccessResponse(res, { status: "ready" }, messages.SERVICE_READY);
});

systemRouter.get(SYSTEM_ROUTES.METRICS, async (_req, res) => {
	res.set("Content-Type", register.contentType);
	res.end(await register.metrics());
});

export default systemRouter;
