import type { NextFunction, Request, Response } from "express";
import { ALLOWED_OWNER_ROLES } from "@/shared/constants/auth.constants.ts";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { ApiResponse } from "@/shared/response/api-response.ts";
import type { AuthenticatedOwner } from "@/types/express.d.ts";

export type { AuthenticatedOwner };

export interface AuthenticatedOwnerRequest extends Request {
	user?: AuthenticatedOwner;
	userId?: string;
}

/**
 * Extracts a normalized single string value from a potential array of header values.
 */
function getHeaderValue(
	header: string | string[] | undefined,
): string | undefined {
	if (Array.isArray(header)) {
		return header[0];
	}
	return header;
}

/**
 * Authentication and authorization middleware verifying that requests originating
 * from the API gateway carry a valid restaurant owner identity.
 */
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
	const normalizedRole = role?.toLowerCase();

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
