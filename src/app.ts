import "reflect-metadata";
import jwksRouter from "@presentation/http/routes/jwks.routes";
import staffRouter from "@presentation/http/routes/staff.routes";
import { storageRouter } from "@presentation/http/routes/storage.routes";
import cookieParser from "cookie-parser";
import express from "express";
import { errorHandler } from "@/presentation/http/middleware/error.middleware";
import { httpLogger } from "@/presentation/http/middleware/log.middleware";
import { metricsMiddleware } from "@/presentation/http/middleware/metrics.middleware";
import { notFoundHandler } from "@/presentation/http/middleware/notfound.middleware";
import systemRouter from "@/presentation/http/routes/system.routes";
import { APP_ENV, APP_NAME } from "@/shared/constants/app.constants.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { STAFF_ROUTES } from "@/shared/constants/route.constants.ts";
import { sendSuccessResponse } from "@/shared/response/api-response.ts";
import { restaurantRouter } from "./presentation/http/routes/restaurant.routes";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(httpLogger);
app.use(metricsMiddleware);

// JWKS Endpoint
app.use("/.well-known", jwksRouter);

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
app.use("/", restaurantRouter);
app.use("/", storageRouter);

// 404 & Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
