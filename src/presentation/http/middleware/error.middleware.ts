import type {
	ErrorRequestHandler,
	NextFunction,
	Request,
	Response,
} from "express";
import { ZodError } from "zod";
import { DomainError } from "@/domain/errors/domain.error.ts";
import { PersistenceError } from "@/infrastructure/errors/persistence.error.ts";
import { logger } from "@/infrastructure/observability/logger.ts";
import {
	DOMAIN_ERROR_STATUS_MAP,
	getStatusCodeForDomainError,
} from "@/shared/constants/domain-error-map.constants.ts";
import { ERROR_CODES } from "@/shared/constants/error-code.constants.ts";
import {
	HTTP_STATUS,
	type HttpStatusCode,
} from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { ApiResponse } from "@/shared/response/api-response.ts";
import { AppError } from "@/utils/response.model.ts";

export { AppError };

function serializeError(error: unknown): unknown {
	if (error instanceof Error) {
		return {
			name: error.name,
			message: error.message,
			stack: error.stack,
			...(error as unknown as Record<string, unknown>),
		};
	}
	return error;
}

export const errorHandler: ErrorRequestHandler = (
	err: Error | DomainError | AppError | ZodError | PersistenceError | unknown,
	req: Request,
	res: Response,
	_next: NextFunction,
): void => {
	let statusCode: HttpStatusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
	let code: string = ERROR_CODES.INTERNAL_SERVER_ERROR;
	let message: string = messages.INTERNAL_SERVER_ERROR;
	let errorDetails: unknown;

	if (err instanceof DomainError) {
		statusCode = getStatusCodeForDomainError(err.code);
		code = err.code;
		message = err.message;
		errorDetails = err.details;
	} else if (err instanceof PersistenceError) {
		statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
		code = ERROR_CODES.INTERNAL_SERVER_ERROR;
		message = messages.INTERNAL_SERVER_ERROR;
		errorDetails = undefined;
	} else if (err instanceof ZodError) {
		statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
		code = ERROR_CODES.VALIDATION_ERROR;
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
		const mappedStatus = DOMAIN_ERROR_STATUS_MAP[err.name];
		const customStatusCode = (err as { statusCode?: unknown }).statusCode;
		if (mappedStatus) {
			statusCode = mappedStatus;
			code = err.name;
			message = err.message;
		} else if (typeof customStatusCode === "number") {
			statusCode = customStatusCode as HttpStatusCode;
			code = err.name || "BAD_REQUEST";
			message = err.message;
		} else {
			statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
			code = ERROR_CODES.INTERNAL_SERVER_ERROR;
			message = messages.INTERNAL_SERVER_ERROR;
			errorDetails = undefined;
		}
	}

	const errorObj = err instanceof Error ? err : new Error(String(err));
	const isServerError = statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR;

	const path = req?.originalUrl || req?.url || "";
	const http = req?.method
		? {
				method: req.method,
				path,
				status_code: statusCode,
			}
		: undefined;

	const logPayload = {
		...(http ? { http } : {}),
		error: {
			name: errorObj.name,
			code,
			message: errorObj.message,
			...(isServerError && errorObj.stack ? { stack: errorObj.stack } : {}),
			...(err instanceof PersistenceError && err.originalError
				? { originalError: serializeError(err.originalError) }
				: {}),
		},
	};

	const logMessage = isServerError
		? messages.UNHANDLED_APP_ERROR
		: errorObj.message;

	if (isServerError) {
		logger.error(logPayload, logMessage);
	} else {
		logger.warn(logPayload, logMessage);
	}

	res
		.status(statusCode)
		.json(ApiResponse.error(message, code, statusCode, errorDetails));
};
