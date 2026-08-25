import type {
	ErrorRequestHandler,
	NextFunction,
	Request,
	Response,
} from "express";
import { logger } from "@/infrastructure/observability/logger.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { AppError } from "@/utils/response.model.ts";

export { AppError };

export const errorHandler: ErrorRequestHandler = (
	err,
	req: Request,
	res: Response,
	_next: NextFunction,
) => {
	const statusCode =
		err instanceof AppError
			? err.statusCode
			: HTTP_STATUS.INTERNAL_SERVER_ERROR;

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
			err instanceof AppError ? err.message : messages.INTERNAL_SERVER_ERROR,
		error: err instanceof AppError ? err.details : undefined,
	});
};
