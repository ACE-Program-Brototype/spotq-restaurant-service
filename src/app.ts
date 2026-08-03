import express from "express";
import { APP_NAME } from "./shared/constants/app.constants.js";
import { HTTP_STATUS } from "./shared/constants/http.constants.js";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
	res.status(HTTP_STATUS.SUCCESS).json({
		service: APP_NAME,
		status: "running",
        environment: process.env.DOPPLER_ENVIRONMENT
	});
});

export default app;
