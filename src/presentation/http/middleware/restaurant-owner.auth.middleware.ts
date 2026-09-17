import type { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { ApiResponse } from "@/shared/response/api-response.ts";
import type { AuthenticatedOwner } from "@/types/express.d.ts";

export type { AuthenticatedOwner };

export interface AuthenticatedOwnerRequest extends Request {
	user?: AuthenticatedOwner;
	userId?: string;
}

const ALLOWED_OWNER_ROLES = new Set([
	"restaurant_owner",
	"restaurant_admin",
	"restaurant",
	"owner",
	"admin",
]);

function getHeaderValue(
	header: string | string[] | undefined,
): string | undefined {
	if (Array.isArray(header)) {
		return header[0];
	}
	return header;
}

export function restaurantOwnerAuthMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	const headerUserId = getHeaderValue(req.headers["x-user-id"]);
	const headerRestaurantId = getHeaderValue(req.headers["x-restaurant-id"]);
	const userId = headerUserId || headerRestaurantId;

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

	if (!normalizedRole || !ALLOWED_OWNER_ROLES.has(normalizedRole)) {
		res
			.status(HTTP_STATUS.FORBIDDEN)
			.json(
				ApiResponse.error(
					messages.OWNER_FORBIDDEN,
					"FORBIDDEN",
					HTTP_STATUS.FORBIDDEN,
				),
			);
		return;
	}

	const paramRestaurantId = getHeaderValue(
		req.params?.restaurantId || req.params?.id,
	)?.trim();

	if (
		paramRestaurantId &&
		headerRestaurantId &&
		paramRestaurantId !== headerRestaurantId.trim()
	) {
		res
			.status(HTTP_STATUS.FORBIDDEN)
			.json(
				ApiResponse.error(
					messages.RESTAURANT_ACCESS_FORBIDDEN,
					"FORBIDDEN",
					HTTP_STATUS.FORBIDDEN,
				),
			);
		return;
	}

	const email = getHeaderValue(req.headers["x-user-email"]);
	const restaurantId = headerRestaurantId || userId;

	req.user = {
		userId,
		restaurantId: restaurantId || "",
		email: email || "",
		role: role || "RESTAURANT_OWNER",
	};
	req.userId = userId;

	next();
}
