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

const ALLOWED_OWNER_ROLES = [
	"restaurant_owner",
	"owner",
	"restaurant",
	"restaurant_admin",
	"admin",
];

export function restaurantOwnerAuthMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	const headerRestaurantId = getStringValue(req.headers["x-restaurant-id"]);
	const headerUserId = getStringValue(req.headers["x-user-id"]);
	const paramRestaurantId = getStringValue(
		req.params?.restaurantId || req.params?.id,
	)?.trim();

	const resolvedId = headerRestaurantId || headerUserId;
	const email = getStringValue(req.headers["x-user-email"]);
	const role = getStringValue(req.headers["x-user-role"]);

	if (!resolvedId) {
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

	const normalizedRole = role?.toLowerCase().trim();
	if (normalizedRole && !ALLOWED_OWNER_ROLES.includes(normalizedRole)) {
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

	if (paramRestaurantId && paramRestaurantId !== resolvedId.trim()) {
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

	const userId = headerUserId || resolvedId;

	req.user = {
		userId,
		restaurantId: resolvedId,
		email: email || "",
		role: role || "RESTAURANT_OWNER",
	};
	req.userId = userId;

	next();
}

