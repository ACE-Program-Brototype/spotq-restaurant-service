import "reflect-metadata";
import express from "express";
import { errorHandler } from "@/presentation/http/middleware/error.middleware";
import { httpLogger } from "@/presentation/http/middleware/log.middleware";
import { metricsMiddleware } from "@/presentation/http/middleware/metrics.middleware";
import { notFoundHandler } from "@/presentation/http/middleware/notfound.middleware";
import systemRouter from "@/presentation/http/routes/system.routes";
import { APP_ENV, APP_NAME } from "@/shared/constants/app.constants.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { successResponse } from "@/utils/response.model.ts";
import { restaurantRouter } from "./presentation/http/routes/restaurant.routes";

const app = express();

app.use(express.json());

app.use(httpLogger);
app.use(metricsMiddleware);

app.get("/", (_req, res) => {
	successResponse(res, "Service is running", HTTP_STATUS.SUCCESS, {
		service: APP_NAME,
		status: "running",
		environment: APP_ENV,
	});
});

app.use("/", systemRouter);

app.use("/", restaurantRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
