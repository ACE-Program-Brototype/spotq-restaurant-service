import type { NextFunction, Request, Response } from "express";
import { type ZodSchema, z } from "zod";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { ApiResponse } from "@/shared/response/api-response.ts";

export function validateRequestBody(schema: ZodSchema) {
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
