import type { Response } from "express";

export type SuccessResposne<T = unknown> = {
	success: true;
	message: string;
	data: T;
};

export type SuccessResponse<T = unknown> = SuccessResposne<T>;

export class AppError extends Error {
	constructor(
		public override readonly message: string,
		public readonly statusCode: number,
		public readonly details?: unknown,
	) {
		super(message);
		this.name = "AppError";
		Object.setPrototypeOf(this, AppError.prototype);
	}
}

export const successResponse = <T>(
	res: Response,
	data: T,
	message = "Success",
	status = 200,
): Response => {
	return res.status(status).json({
		success: true,
		message,
		data,
	});
};

export const errorResponse = (message: string, status = 500): never => {
	throw new AppError(message, status);
};

export const makeSuccessResponse = <T>(
	data: T,
	message = "Success",
): SuccessResponse<T> => ({
	success: true,
	message,
	data,
});
