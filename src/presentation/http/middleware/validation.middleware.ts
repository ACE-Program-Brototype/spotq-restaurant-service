import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { z } from "zod";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { ApiResponse } from "@/shared/response/api-response.ts";

export const validate = (schema: ZodType) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		const result = schema.safeParse(req.body);

		if (!result.success) {
			res
				.status(HTTP_STATUS.BAD_REQUEST)
				.json(
					ApiResponse.error(
						messages.VALIDATION_ERROR,
						"VALIDATION_ERROR",
						HTTP_STATUS.BAD_REQUEST,
						result.error.flatten(),
					),
				);

			return;
		}

		req.body = result.data;

		next();
	};
};

export const validateRequestParams = (schema: ZodType) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		const result = schema.safeParse(req.params);

		if (!result.success) {
			res
				.status(HTTP_STATUS.BAD_REQUEST)
				.json(
					ApiResponse.error(
						messages.VALIDATION_ERROR,
						"VALIDATION_ERROR",
						HTTP_STATUS.BAD_REQUEST,
						result.error.flatten(),
					),
				);

			return;
		}

		req.params = result.data;

		next();
	};
};

export function validateRequestBody(schema: ZodType) {
	return async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			req.body = await schema.parseAsync(req.body ?? {});
			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				const formattedErrors = error.issues.map((issue) => ({
					field: issue.path.length > 0 ? issue.path.join(".") : "body",
					message: issue.message,
				}));

				res
					.status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
					.json(
						ApiResponse.error(
							messages.VALIDATION_ERROR,
							"VALIDATION_ERROR",
							HTTP_STATUS.UNPROCESSABLE_ENTITY,
							formattedErrors,
						),
					);
				return;
			}
			next(error);
		}
	};
}

export function validateRequestQuery(schema: ZodType) {
	return async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const parsed = await schema.parseAsync(req.query ?? {});
			res.locals.query = parsed;
			if (req.query && typeof req.query === "object") {
				for (const key of Object.keys(req.query)) {
					delete (req.query as Record<string, unknown>)[key];
				}
				Object.assign(req.query, parsed);
			}
			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				const formattedErrors = error.issues.map((issue) => ({
					field: issue.path.length > 0 ? issue.path.join(".") : "query",
					message: issue.message,
				}));

				res
					.status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
					.json(
						ApiResponse.error(
							messages.VALIDATION_ERROR,
							"VALIDATION_ERROR",
							HTTP_STATUS.UNPROCESSABLE_ENTITY,
							formattedErrors,
						),
					);
				return;
			}
			next(error);
		}
	};
}
