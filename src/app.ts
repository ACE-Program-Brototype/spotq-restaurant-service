import express from "express";
import { errorHandler } from "@/presentation/middleware/error.middleware.ts";
import { httpLogger } from "@/presentation/middleware/log.middleware.ts";
import { metricsMiddleware } from "@/presentation/middleware/metrics.middleware.ts";
import { notFoundHandler } from "@/presentation/middleware/notfound.middleware.ts";
import systemRouter from "@/presentation/routes/system.routes.ts";
import { APP_ENV, APP_NAME } from "@/shared/constants/app.constants.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { successResponse } from "@/utils/response.model.ts";

const app = express();

app.use(express.json());

app.use(httpLogger);
app.use(metricsMiddleware);

app.get("/", (_req, res) => {
	successResponse(
		res,
		{
			service: APP_NAME,
			status: "running",
			environment: APP_ENV,
		},
		"Service is running",
		HTTP_STATUS.SUCCESS,
	);
});

app.use("/", systemRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
