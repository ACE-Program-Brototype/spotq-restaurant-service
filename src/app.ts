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
import cookieParser from "cookie-parser";
import { messages } from "@/shared/constants/message.constants.ts";
import { STAFF_ROUTES } from "@/shared/constants/route.constants.ts";
import { sendSuccessResponse } from "@/shared/response/api-response.ts";
import staffRouter from "@presentation/http/routes/staff.routes";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(httpLogger);
app.use(metricsMiddleware);

app.get("/", (_req, res) => {
	successResponse(res, "Service is running", HTTP_STATUS.SUCCESS, {
		service: APP_NAME,
		status: "running",
		environment: APP_ENV,
	});
	sendSuccessResponse(
		res,
		{
			service: APP_NAME,
			status: "running",
			environment: APP_ENV,
		},
		messages.SERVICE_RUNNING,
		HTTP_STATUS.OK,
	);
});

// Mount routes
app.use(STAFF_ROUTES.BASE, staffRouter);

app.use("/", systemRouter);

app.use("/", restaurantRouter);

// 404 & Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
