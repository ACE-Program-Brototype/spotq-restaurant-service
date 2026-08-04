import type {
	ErrorRequestHandler,
	Request,
	Response,
	NextFunction,
} from "express";

import { HTTP_STATUS } from "../../shared/constants/http.constants.js";
import { logger } from "../../infrastructure/logger/logger.js";
import { messages } from "../../shared/constants/message.constants.js";

export class AppError extends Error {
	constructor(
		public readonly message: string,
		public readonly statusCode: number,
	) {
		super(message);

		this.name = this.constructor.name;

		Object.setPrototypeOf(this, AppError.prototype);
	}
}

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
		messages.UNHANDLED_APP_ERROR
	);

	res.status(statusCode).json({
		success: false,

		requestId: res.locals.requestId,

		message:
			err instanceof AppError
				? err.message
				: messages.INTERNAL_SERVER_ERROR
	});
};