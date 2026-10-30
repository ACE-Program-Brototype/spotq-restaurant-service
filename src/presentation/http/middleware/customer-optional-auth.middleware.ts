import { AUTH_ROLES, CUSTOMER_ROLE } from "@shared/constants/auth.constants";
import type { NextFunction, Request, Response } from "express";

function getHeaderValue(
	header: string | string[] | undefined,
): string | undefined {
	return Array.isArray(header) ? header[0] : header;
}

/**
 * Middleware used to get customer data in req from headers
 *
 * @param req Request
 * @param _res Response Not Used
 * @param next NextFunction
 * @returns void
 */
export function customerOptionalAuthMiddleware(
	req: Request,
	_res: Response,
	next: NextFunction,
): void {
	const userId = getHeaderValue(req.headers["x-user-id"]);
	if (!userId) {
		next();
		return;
	}

	const role = getHeaderValue(req.headers["x-user-role"]) || CUSTOMER_ROLE;
	const email = getHeaderValue(req.headers["x-user-email"]) || "";

	req.user = {
		userId,
		email,
		role: role.toUpperCase(),
	};
	req.userId = userId;

	next();
}
