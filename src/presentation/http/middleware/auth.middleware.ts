import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { HTTP_STATUS } from "@/shared/constants/http.constants";
import { messages } from "@/shared/constants/message.constants";
import { ApiResponse } from "@/shared/response/api-response";

export interface AuthenticatedRequest extends Request {
	user?: jwt.JwtPayload | string;
}

export const authenticate = (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): void => {
	const authHeader = req.headers.authorization;
	const token = authHeader?.startsWith("Bearer ")
		? authHeader.split(" ")[1]
		: req.cookies?.accessToken;

	if (!token) {
		res
			.status(HTTP_STATUS.UNAUTHORIZED)
			.json(
				ApiResponse.error(
					messages.UNAUTHORIZED,
					"UNAUTHORIZED",
					HTTP_STATUS.UNAUTHORIZED,
				),
			);
		return;
	}

	try {
		const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
		req.user = decoded;
		next();
	} catch {
		res
			.status(HTTP_STATUS.UNAUTHORIZED)
			.json(
				ApiResponse.error(
					messages.UNAUTHORIZED,
					"UNAUTHORIZED",
					HTTP_STATUS.UNAUTHORIZED,
				),
			);
		return;
	}
};
