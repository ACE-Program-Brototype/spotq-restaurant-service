import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "@config/env.ts";

function getHeaderValue(header: string | string[] | undefined): string | undefined {
	if (Array.isArray(header)) {
		return header[0];
	}
	return header;
}

export function customerOptionalAuthMiddleware(
	req: Request,
	_res: Response,
	next: NextFunction,
): void {
	const headerUserId = getHeaderValue(req.headers["x-user-id"]);
	const headerEmail = getHeaderValue(req.headers["x-user-email"]);
	const headerRole = getHeaderValue(req.headers["x-user-role"]);
	if (headerUserId) {
		req.userId = headerUserId;
		req.user = {
			userId: headerUserId,
			email: headerEmail ?? "",
			role: headerRole ?? "CUSTOMER",
		};
		next();
		return;
	}

	// No token provided -> Continue as guest
	const authHeader = getHeaderValue(req.headers.authorization);
	if (!authHeader?.startsWith("Bearer ")) {
		next();
		return;
	}

	const token = authHeader.substring(7).trim();
	if (!token) {
		next();
		return;
	}

	try {
		const publicKey = env.JWT_PUBLIC_KEY || env.JWT_ACCESS_PUBLIC_KEY;
		const algorithm = (env.JWT_ALGORITHM || "RS256") as jwt.Algorithm;
		let decoded: jwt.JwtPayload;
		if (publicKey) {
			decoded = jwt.verify(token, publicKey, {
				algorithms: [algorithm],
			}) as jwt.JwtPayload;
		} else {
			decoded = jwt.decode(token) as jwt.JwtPayload;
		}
		const resolvedUserId = (decoded?.sub ?? decoded?.id ?? decoded?.userId) as string | undefined;
		if (resolvedUserId) {
			req.userId = resolvedUserId;
			req.user = {
				userId: resolvedUserId,
				email: (decoded?.email as string) ?? "",
				role: (decoded?.role as string) ?? "CUSTOMER",
			};
		}
	} catch {
		req.userId = undefined;
		req.user = undefined;
	}

	next();
}
