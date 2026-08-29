import type {
	ErrorRequestHandler,
	NextFunction,
	Request,
	Response,
} from "express";
import { logger } from "@/infrastructure/observability/logger.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { errorStatusMap } from "../errors/ error-status.map";

export const errorHandler: ErrorRequestHandler = (
	err,
	req: Request,
	res: Response,
	_next: NextFunction,
) => {
	const statusCode =
		errorStatusMap.get(err.constructor) ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;

	logger.error(
		{
			event: "application.error",
			requestId: res.locals.requestId,
			method: req.method,
			url: req.originalUrl,
			statusCode,
			error: {
				name: err.name,
				message: err.message,
				stack: err.stack,
			},
		},
		messages.UNHANDLED_APP_ERROR,
	);

	res.status(statusCode).json({
		success: false,
		requestId: res.locals.requestId,
		message:
			statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR
				? messages.INTERNAL_SERVER_ERROR
				: err.message,
	});
};
