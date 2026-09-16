import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env, formatJwtKey } from "@/config/env.ts";
import { logger } from "@/infrastructure/observability/logger.ts";
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
	let restaurantId = getHeaderValue(req.headers["x-restaurant-id"]);
	let userId = getHeaderValue(req.headers["x-user-id"]);
	let role = getHeaderValue(req.headers["x-user-role"]);
	let email = getHeaderValue(req.headers["x-user-email"]);

	let resolvedId = restaurantId || userId;

	if (!resolvedId) {
		const authHeader = getHeaderValue(req.headers.authorization);
		if (authHeader?.startsWith("Bearer ")) {
			const token = authHeader.substring(7).trim();
			if (token) {
				try {
					const publicKey = formatJwtKey(env.JWT_ACCESS_PUBLIC_KEY);
					interface JwtPayloadClaims {
						restaurantId?: string;
						sub?: string;
						email?: string;
						role?: string;
					}
					let decoded: JwtPayloadClaims | null = null;

					if (publicKey) {
						decoded = jwt.verify(token, publicKey, {
							algorithms: [env.JWT_ALGORITHM as jwt.Algorithm],
						}) as unknown as JwtPayloadClaims;
					} else {
						decoded = jwt.verify(
							token,
							env.JWT_REFRESH_SECRET,
						) as unknown as JwtPayloadClaims;
					}

					if (decoded) {
						restaurantId = decoded.restaurantId || decoded.sub;
						userId = decoded.sub || "";
						email = decoded.email || "";
						role = decoded.role || "RESTAURANT";
						resolvedId = restaurantId || userId;
					}
				} catch (err) {
					logger.warn(
						{ error: err },
						"Fallback Bearer token verification failed in restaurantAuthMiddleware",
					);
				}
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

	req.userId = resolvedId;
	req.user = {
		restaurantId: resolvedId,
		userId: userId || resolvedId,
		email: email || "",
		role: role || "RESTAURANT",
	};

	next();
}
