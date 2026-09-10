import "reflect-metadata";
import staffRouter from "@presentation/http/routes/staff.routes";
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
import { getJwks } from "@/utils/jwks.util.ts";
import { restaurantRouter } from "./presentation/http/routes/restaurant.routes";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(httpLogger);
app.use(metricsMiddleware);

// Standard JWKS endpoint for API Gateway / Envoy JWT verification
app.get("/.well-known/jwks.json", (_req, res) => {
	res.json(getJwks());
});

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

// 404 & Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
