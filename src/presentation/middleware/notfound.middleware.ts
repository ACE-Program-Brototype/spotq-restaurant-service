import type { NextFunction, Request, Response } from "express";
import { logger } from "@/infrastructure/observability/logger";
import { HTTP_STATUS } from "@/shared/constants/http.constants";
import { messages } from "@/shared/constants/message.constants";
import { AppError } from "@/presentation/middleware/error.middleware";

export const notFoundHandler = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	logger.warn(
		{
			event: "http.not_found",

			requestId: res.locals.requestId,

			method: req.method,

			url: req.originalUrl,

			ip: req.ip,
		},
		messages.REQ_ROUTE_NOT_FOUND,
	);

	next(
		new AppError(`Route '${req.originalUrl}' not found`, HTTP_STATUS.NOT_FOUND),
	);
};
