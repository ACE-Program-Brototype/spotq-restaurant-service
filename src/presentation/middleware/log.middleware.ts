import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { logger } from "../../infrastructure/observability/logger.js";
import { messages } from "../../shared/constants/message.constants.js";

export function httpLogger(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	const start = process.hrtime.bigint();

	const requestId = randomUUID();

	res.locals.requestId = requestId;

	logger.info(
		{
			event: "http.request",

			requestId,

			method: req.method,

			url: req.originalUrl,

			ip: req.ip,

			userAgent: req.get("user-agent"),

			contentLength: req.get("content-length"),

			contentType: req.get("content-type"),

			operation: `${req.method} ${req.route?.path ?? req.path}`,
		},
		messages.INCOMMING_HTTP_REQ,
	);

	res.on("finish", () => {
		const duration = Number(process.hrtime.bigint() - start) / 1_000_000;

		logger.info(
			{
				event: "http.response",

				requestId,

				method: req.method,

				url: req.originalUrl,

				statusCode: res.statusCode,

				responseTime: Number(duration.toFixed(2)),

				responseSize: res.getHeader("content-length"),

				operation: `${req.method} ${req.route?.path ?? req.path}`,
			},
			messages.OUTGOING_HTTP_RES,
		);
	});

	next();
}
