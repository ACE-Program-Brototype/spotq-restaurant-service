import type { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { ApiResponse } from "@/shared/response/api-response.ts";
import type { AuthenticatedStaff } from "@/types/express.d.ts";

export interface AuthenticatedOwnerRequest extends Request {
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

const ALLOWED_OWNER_ROLES = ["restaurant_owner", "owner"];

export function restaurantOwnerAuthMiddleware(
	req: Request,
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
	const normalizedRole = role?.toLowerCase().trim();

	if (!normalizedRole || !ALLOWED_OWNER_ROLES.includes(normalizedRole)) {
		res
			.status(HTTP_STATUS.FORBIDDEN)
			.json(
				ApiResponse.error(
					messages.YOU_DO_NOT_HAVE_PERMISSION,
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
		role: role || "RESTAURANT_OWNER",
	};
	req.userId = userId;

	next();
}
