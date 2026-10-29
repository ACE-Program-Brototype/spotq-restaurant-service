import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "@config/env.ts";

interface CustomerJwtPayload extends jwt.JwtPayload {
	sub?: string;
	id?: string;
	userId?: string;
	email?: string;
	role?: string;
}

function getHeaderValue(
	header: string | string[] | undefined,
): string | undefined {
	return Array.isArray(header) ? header[0] : header;
}

export function customerOptionalAuthMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	const authHeader = getHeaderValue(req.headers.authorization);

	// No Authorization header means the request can continue as a guest.
	if (!authHeader) {
		req.userId = undefined;
		req.user = undefined;
		next();
		return;
	}

	// If Authorization is provided, it must contain a Bearer token.
	if (!authHeader.startsWith("Bearer ")) {
		res.status(401).json({
			success: false,
			message: "Invalid authorization format",
			statusCode: 401,
		});
		return;
	}

	const token = authHeader.slice(7).trim();

	if (!token) {
		res.status(401).json({
			success: false,
			message: "Access token is required",
			statusCode: 401,
		});
		return;
	}

	const publicKey = env.JWT_PUBLIC_KEY || env.JWT_ACCESS_PUBLIC_KEY;

	// Never decode a token and treat its claims as authenticated.
	if (!publicKey) {
		next(new Error("JWT public key is not configured"));
		return;
	}

	try {
		const algorithm = (env.JWT_ALGORITHM || "RS256") as jwt.Algorithm;

		const decoded = jwt.verify(token, publicKey, {
			algorithms: [algorithm],
		}) as CustomerJwtPayload;

		const userId = decoded.sub ?? decoded.id ?? decoded.userId;

		if (!userId || typeof userId !== "string") {
			res.status(401).json({
				success: false,
				message: "Invalid access token",
				statusCode: 401,
			});
			return;
		}

		req.userId = userId;
		req.user = {
			userId,
			email: typeof decoded.email === "string" ? decoded.email : "",
			role: typeof decoded.role === "string" ? decoded.role : "CUSTOMER",
		};

		next();
	} catch (error: unknown) {
		if (
			error instanceof jwt.TokenExpiredError ||
			error instanceof jwt.JsonWebTokenError ||
			error instanceof jwt.NotBeforeError
		) {
			res.status(401).json({
				success: false,
				message: "Invalid or expired access token",
				statusCode: 401,
			});
			return;
		}

		next(error);
	}
}