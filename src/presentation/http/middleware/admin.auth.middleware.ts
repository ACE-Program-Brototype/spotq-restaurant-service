import type { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "@/shared/constants/http.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { ApiResponse } from "@/shared/response/api-response.ts";

export interface AuthenticatedAdmin {
	userId: string;
	email: string;
	role: string;
}

export interface AuthenticatedAdminRequest extends Request {
	user?: AuthenticatedAdmin;
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

const ALLOWED_ADMIN_ROLES = new Set(["admin", "super_admin", "superadmin"]);

export function adminAuthMiddleware(
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

	if (!normalizedRole || !ALLOWED_ADMIN_ROLES.has(normalizedRole)) {
		res
			.status(HTTP_STATUS.FORBIDDEN)
			.json(
				ApiResponse.error(
					messages.ADMIN_FORBIDDEN,
					"FORBIDDEN",
					HTTP_STATUS.FORBIDDEN,
				),
			);
		return;
	}

	const email = getHeaderValue(req.headers["x-user-email"]);

	(req as AuthenticatedAdminRequest).user = {
		userId,
		email: email || "",
		role: role || "ADMIN",
	};
	(req as AuthenticatedAdminRequest).userId = userId;

	next();
}
