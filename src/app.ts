import express from "express";
import { HTTP_STATUS } from "./shared/constants/http.constants.js";
import { APP_NAME } from "./shared/constants/app.constants.js";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
    res.status(HTTP_STATUS.SUCCESS).json({
        service: APP_NAME,
        status: "running",
    });
});

export default app;