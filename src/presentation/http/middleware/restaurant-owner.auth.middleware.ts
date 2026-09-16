import type { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { ApiResponse } from "@/shared/response/api-response.ts";
import type { AuthenticatedStaff } from "@/types/express.d.ts";

export interface AuthenticatedOwnerRequest extends Request {
	user?: AuthenticatedStaff;
	userId?: string;
}

function getStringValue(
	value: string | string[] | undefined,
): string | undefined {
	if (Array.isArray(value)) {
		return value[0];
	}
	return value;
}

const ALLOWED_OWNER_ROLES = ["restaurant_owner", "owner"];

export function restaurantOwnerAuthMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	const headerRestaurantId = getStringValue(req.headers["x-restaurant-id"]);
	const headerUserId = getStringValue(req.headers["x-user-id"]);
	const restaurantId = headerRestaurantId || headerUserId;

	if (!restaurantId) {
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

	const role = getStringValue(req.headers["x-user-role"]);
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

	const paramRestaurantId = getStringValue(req.params?.restaurantId)?.trim();
	if (paramRestaurantId && paramRestaurantId !== restaurantId.trim()) {
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

	const userId = headerUserId || restaurantId;
	const email = getStringValue(req.headers["x-user-email"]) || "";

	req.user = {
		userId,
		restaurantId,
		email,
		role: role || "RESTAURANT_OWNER",
	};
	req.userId = userId;

	next();
}
