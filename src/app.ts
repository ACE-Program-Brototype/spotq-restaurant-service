import "reflect-metadata";
import cookieParser from "cookie-parser";
import express from "express";
import { errorHandler } from "@/presentation/middleware/error.middleware.ts";
import { httpLogger } from "@/presentation/middleware/log.middleware.ts";
import { metricsMiddleware } from "@/presentation/middleware/metrics.middleware.ts";
import { notFoundHandler } from "@/presentation/middleware/notfound.middleware.ts";
import staffRouter from "@/presentation/routes/staff.routes.ts";
import systemRouter from "@/presentation/routes/system.routes.ts";
import { APP_ENV, APP_NAME } from "@/shared/constants/app.constants.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { STAFF_ROUTES } from "@/shared/constants/route.constants.ts";
import { sendSuccessResponse } from "@/shared/response/api-response.ts";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(httpLogger);
app.use(metricsMiddleware);

app.get("/", (_req, res) => {
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

// 404 & Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
