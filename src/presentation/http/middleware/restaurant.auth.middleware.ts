import type { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { ApiResponse } from "@/shared/response/api-response.ts";
import type { AuthenticatedRestaurant } from "@/types/express.d.ts";

export type { AuthenticatedRestaurant };

function getHeaderValue(
	header: string | string[] | undefined,
): string | undefined {
	if (Array.isArray(header)) {
		return header[0];
	}
	return header;
}

export function restaurantAuthMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	const restaurantId = getHeaderValue(req.headers["x-restaurant-id"]);
	const userId = getHeaderValue(req.headers["x-user-id"]);

	const resolvedId = restaurantId || userId;

	if (!resolvedId) {
		res
			.status(HTTP_STATUS.UNAUTHORIZED)
			.json(
				ApiResponse.error(
					messages.GATEWAY_UNAUTHORIZED || "Unauthorized",
					"UNAUTHORIZED",
					HTTP_STATUS.UNAUTHORIZED,
				),
			);
		return;
	}

	const role = getHeaderValue(req.headers["x-user-role"]);
	const email = getHeaderValue(req.headers["x-user-email"]);

	req.user = {
		restaurantId: resolvedId,
		userId: userId || "",
		email: email || "",
		role: role || "RESTAURANT",
	};

	next();
}
