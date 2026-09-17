import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
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
	const headerRestaurantId = getHeaderValue(req.headers["x-restaurant-id"]);
	const headerUserId = getHeaderValue(req.headers["x-user-id"]);
	const paramId = getHeaderValue(req.params?.id || req.params?.restaurantId);

	let resolvedId = headerRestaurantId || headerUserId || paramId;
	let userId = headerUserId;
	let email = getHeaderValue(req.headers["x-user-email"]);
	let role = getHeaderValue(req.headers["x-user-role"]);

	if (!resolvedId && req.headers.authorization) {
		const authHeader = getHeaderValue(req.headers.authorization);
		if (authHeader?.startsWith("Bearer ")) {
			const token = authHeader.substring(7).trim();
			try {
				const decoded = jwt.decode(token) as {
					restaurantId?: string;
					email?: string;
					role?: string;
					sub?: string;
					id?: string;
				} | null;
				const tokenId = decoded?.restaurantId || decoded?.sub || decoded?.id;
				if (tokenId) {
					resolvedId = tokenId;
					if (!userId && decoded?.sub) userId = decoded.sub;
					if (!email && decoded?.email) email = decoded.email;
					if (!role && decoded?.role) role = decoded.role;
				}
			} catch {
				// Ignore decode error; check below will handle unauthorized
			}
		}
	}

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

	req.user = {
		restaurantId: resolvedId,
		userId: userId || resolvedId,
		email: email || "",
		role: role || "RESTAURANT",
	};
	req.userId = resolvedId;

	next();
}
