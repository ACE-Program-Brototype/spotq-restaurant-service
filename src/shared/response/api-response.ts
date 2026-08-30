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
