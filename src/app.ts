import express from "express";
import { errorHandler } from "@/presentation/middleware/error.middleware.js";
import { httpLogger } from "@/presentation/middleware/log.middleware.js";
import { metricsMiddleware } from "@/presentation/middleware/metrics.middleware.js";
import { notFoundHandler } from "@/presentation/middleware/notfound.middleware.js";
import systemRouter from "@/presentation/routes/system.routes.js";
import { APP_ENV, APP_NAME } from "@/shared/constants/app.constants.js";
import { HTTP_STATUS } from "@/shared/constants/http.constants.js";

const app = express();

app.use(express.json());

app.use(httpLogger);
app.use(metricsMiddleware);

app.get("/", (_req, res) => {
	res.status(HTTP_STATUS.SUCCESS).json({
		service: APP_NAME,
		status: "running",
		environment: APP_ENV,
	});
});

app.use("/", systemRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
