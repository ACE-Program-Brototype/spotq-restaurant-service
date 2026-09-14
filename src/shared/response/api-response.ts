import type { Response } from "express";
import {
	HTTP_STATUS,
	type HttpStatusCode,
} from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";

export interface ApiResponseSuccess<T = unknown> {
	success: true;
	message: string;
	data: T;
	statusCode: number;
}

export interface ApiResponsePaginatedSuccess<T = unknown> {
	success: true;
	message: string;
	data: T[];
	pagination: unknown;
	statusCode: number;
}

export interface ApiResponseError {
	success: false;
	message: string;
	code: string;
	error?: unknown;
	statusCode: number;
}

export const ApiResponse = {
	ok<T>(
		data: T,
		message: string = messages.SUCCESS,
		statusCode: HttpStatusCode = HTTP_STATUS.OK,
	): ApiResponseSuccess<T> {
		return {
			success: true,
			message,
			data,
			statusCode,
		};
	},

	okPaginated<T>(
		data: T[],
		pagination: unknown,
		message: string = messages.SUCCESS,
		statusCode: HttpStatusCode = HTTP_STATUS.OK,
	): ApiResponsePaginatedSuccess<T> {
		return {
			success: true,
			message,
			data,
			pagination,
			statusCode,
		};
	},

	error(
		message: string,
		code = "INTERNAL_SERVER_ERROR",
		statusCode: HttpStatusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
		error?: unknown,
	): ApiResponseError {
		return {
			success: false,
			message,
			code,
			error,
			statusCode,
		};
	},
};

export function sendSuccessResponse<T>(
	res: Response,
	data: T,
	message: string = messages.SUCCESS,
	statusCode: HttpStatusCode = HTTP_STATUS.OK,
): Response {
	return res.status(statusCode).json(ApiResponse.ok(data, message, statusCode));
}

export function sendPaginatedSuccessResponse<T>(
	res: Response,
	data: T[],
	pagination: unknown,
	message: string = messages.SUCCESS,
	statusCode: HttpStatusCode = HTTP_STATUS.OK,
): Response {
	return res
		.status(statusCode)
		.json(ApiResponse.okPaginated(data, pagination, message, statusCode));
}
