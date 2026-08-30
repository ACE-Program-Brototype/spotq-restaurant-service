import type {
	ErrorRequestHandler,
	NextFunction,
	Request,
	Response,
} from "express";
import { ZodError } from "zod";
import { env } from "@/config/env.ts";
import { DomainError } from "@/domain/errors/domain.error.ts";
import { logger } from "@/infrastructure/observability/logger.ts";
import { getStatusCodeForDomainError } from "@/shared/constants/domain-error-map.constants.ts";
import {
	HTTP_STATUS,
	type HttpStatusCode,
} from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { ApiResponse } from "@/shared/response/api-response.ts";
import { AppError } from "@/utils/response.model.ts";

export { AppError };

export const errorHandler: ErrorRequestHandler = (
	err: Error | DomainError | AppError | ZodError | unknown,
	req: Request,
	res: Response,
	_next: NextFunction,
): void => {
	let statusCode: HttpStatusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
	let code = "INTERNAL_SERVER_ERROR";
	let message: string = messages.INTERNAL_SERVER_ERROR;
	let errorDetails: unknown;

	if (err instanceof DomainError) {
		statusCode = getStatusCodeForDomainError(err.code);
		code = err.code;
		message = err.message;
		errorDetails = err.details;
	} else if (err instanceof ZodError) {
		statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
		code = "VALIDATION_ERROR";
		message = messages.VALIDATION_ERROR;
		errorDetails = err.issues.map((issue) => ({
			field: issue.path.length > 0 ? issue.path.join(".") : "body",
			message: issue.message,
		}));
	} else if (err instanceof AppError) {
		statusCode =
			(err.statusCode as HttpStatusCode) || HTTP_STATUS.INTERNAL_SERVER_ERROR;
		code = "APP_ERROR";
		message = err.message;
		errorDetails = err.details;
	} else if (err instanceof Error) {
		statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
		code = "INTERNAL_SERVER_ERROR";
		message =
			env.APP_ENV === "production"
				? messages.INTERNAL_SERVER_ERROR
				: err.message || messages.INTERNAL_SERVER_ERROR;
		errorDetails =
			env.APP_ENV === "production" ? undefined : { stack: err.stack };
	}

	const errorObj = err instanceof Error ? err : new Error(String(err));

	logger.error(
		{
			event: "application.error",
			requestId: res.locals.requestId,
			method: req.method,
			url: req.originalUrl,
			statusCode,
			correlationId: res.locals.correlationId,
			code,
			error: {
				name: errorObj.name,
				message: errorObj.message,
				stack: errorObj.stack,
			},
		},
		messages.UNHANDLED_APP_ERROR,
	);

	res
		.status(statusCode)
		.json(ApiResponse.error(message, code, statusCode, errorDetails));
};
