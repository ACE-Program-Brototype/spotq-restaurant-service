import express from "express";
import { errorHandler } from "@/presentation/middleware/error.middleware";
import { httpLogger } from "@/presentation/middleware/log.middleware";
import { metricsMiddleware } from "@/presentation/middleware/metrics.middleware";
import { notFoundHandler } from "@/presentation/middleware/notfound.middleware";
import systemRouter from "@/presentation/routes/system.routes";
import { APP_ENV, APP_NAME } from "@/shared/constants/app.constants";
import { HTTP_STATUS } from "@/shared/constants/http.constants";

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
