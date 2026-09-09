import type { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { ApiResponse } from "@/shared/response/api-response.ts";
import type { AuthenticatedStaff } from "@/types/express.d.ts";

export type { AuthenticatedStaff };

export interface AuthenticatedRequest extends Request {
	user?: AuthenticatedStaff;
	userId?: string;
}

function getHeaderValue(
	header: string | string[] | undefined,
): string | undefined {
	if (Array.isArray(header)) {
		return header[0];
	}
	return header;
}

export function staffAuthMiddleware(
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): void {
	const userId = getHeaderValue(req.headers["x-user-id"]);

	if (!userId) {
		res
			.status(HTTP_STATUS.UNAUTHORIZED)
			.json(
				ApiResponse.error(
					messages.GATEWAY_UNAUTHORIZED,
					"UNAUTHORIZED",
					HTTP_STATUS.UNAUTHORIZED,
				),
			);
		return;
	}

	const role = getHeaderValue(req.headers["x-user-role"]);
	const normalizedRole = role?.toLowerCase();

	if (normalizedRole !== "staff") {
		res
			.status(HTTP_STATUS.FORBIDDEN)
			.json(
				ApiResponse.error(
					messages.STAFF_FORBIDDEN,
					"FORBIDDEN",
					HTTP_STATUS.FORBIDDEN,
				),
			);
		return;
	}

	const email = getHeaderValue(req.headers["x-user-email"]);
	const restaurantId = getHeaderValue(req.headers["x-restaurant-id"]);

	req.user = {
		userId,
		restaurantId: restaurantId || "",
		email: email || "",
		role: role || "STAFF",
	};
	req.userId = userId;

	next();
}

export const authMiddleware = staffAuthMiddleware;
