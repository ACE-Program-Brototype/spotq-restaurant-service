import express from "express";
import { APP_NAME } from "./shared/constants/app.constants.js";
import { HTTP_STATUS } from "./shared/constants/http.constants.js";
import { httpLogger } from "./presentation/middleware/log.middleware.js";
import { errorHandler } from "./presentation/middleware/error.middleware.js";
import { notFoundHandler } from "./presentation/middleware/notfound.middleware.js";

const app = express();

app.use(express.json());


app.use(httpLogger)

app.get("/", (_req, res) => {
	res.status(HTTP_STATUS.SUCCESS).json({
		service: APP_NAME,
		status: "running",
		environment: process.env.DOPPLER_ENVIRONMENT,
	});
});

app.use(notFoundHandler)
app.use(errorHandler)

export default app;
