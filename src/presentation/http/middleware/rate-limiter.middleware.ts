import type { NextFunction, Request, Response } from "express";
import redis from "@/config/redis.ts";
import { RateLimitExceededError } from "@/domain/errors/staff.errors.ts";

export interface RateLimiterOptions {
	prefix: string;
	maxAttempts: number;
	windowSeconds: number;
	errorMessage?: string;
	keyGenerator?: (req: Request) => string;
}

export const getClientIp = (req: Request): string => {
	const forwarded = req.headers["x-forwarded-for"];
	if (typeof forwarded === "string") {
		return forwarded.split(",")[0].trim();
	}
	if (Array.isArray(forwarded) && forwarded.length > 0) {
		return forwarded[0].trim();
	}
	return req.ip || req.socket.remoteAddress || "127.0.0.1";
};

export const emailOrIpKeyGenerator = (req: Request): string => {
	const email =
		typeof req.body?.email === "string"
			? req.body.email.trim().toLowerCase()
			: null;
	const ip = getClientIp(req);
	return email ? `${email}:${ip}` : ip;
};

export const emailKeyGenerator = (req: Request): string => {
	const email =
		typeof req.body?.email === "string"
			? req.body.email.trim().toLowerCase()
			: null;
	return email || getClientIp(req);
};

export const createRateLimiter = (options: RateLimiterOptions) => {
	const { prefix, maxAttempts, windowSeconds, errorMessage, keyGenerator } =
		options;

	return async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		const identifier = keyGenerator ? keyGenerator(req) : getClientIp(req);

		if (!identifier) {
			next();
			return;
		}

		const key = `ratelimit:${prefix}:${identifier}`;

		const current = await redis.incr(key);

		if (current === 1) {
			await redis.expire(key, windowSeconds);
		}

		const ttl = await redis.ttl(key);
		const remaining = Math.max(0, maxAttempts - current);

		res.setHeader("X-RateLimit-Limit", maxAttempts);
		res.setHeader("X-RateLimit-Remaining", remaining);
		if (ttl > 0) {
			res.setHeader("X-RateLimit-Reset", Math.ceil(Date.now() / 1000) + ttl);
		}

		if (current > maxAttempts) {
			if (ttl > 0) {
				res.setHeader("Retry-After", ttl);
			}
			const minutes = Math.ceil(ttl > 0 ? ttl / 60 : windowSeconds / 60);
			const errorMsg =
				errorMessage ||
				`Too many requests. Please try again after ${minutes} minute${minutes > 1 ? "s" : ""}.`;
			throw new RateLimitExceededError(errorMsg);
		}

		next();
	};
};

// 1. Login: Max 5 attempts per 15 minutes
export const loginRateLimiter = createRateLimiter({
	prefix: "login",
	maxAttempts: 5,
	windowSeconds: 15 * 60, // 15 minutes
	errorMessage: "Too many login attempts. Please try again after 15 minutes.",
	keyGenerator: emailOrIpKeyGenerator,
});

// 2. Forgot Password: Max 3 attempts per 24 hours per email
export const forgotPasswordRateLimiter = createRateLimiter({
	prefix: "forgot-password",
	maxAttempts: 3,
	windowSeconds: 24 * 60 * 60, // 24 hours
	errorMessage:
		"Too many forgot password requests for this email. Maximum 3 attempts per 24 hours.",
	keyGenerator: emailKeyGenerator,
});

// 3. Verify OTP: Max 5 attempts per 15 minutes (protects against OTP brute forcing)
export const verifyOtpRateLimiter = createRateLimiter({
	prefix: "verify-otp",
	maxAttempts: 5,
	windowSeconds: 15 * 60, // 15 minutes
	errorMessage:
		"Too many failed OTP verification attempts. Please try again after 15 minutes.",
	keyGenerator: emailOrIpKeyGenerator,
});

// 4. Resend OTP: Max 3 attempts per 1 hour per email
export const resendOtpRateLimiter = createRateLimiter({
	prefix: "resend-otp",
	maxAttempts: 3,
	windowSeconds: 60 * 60, // 1 hour
	errorMessage: "Too many OTP resend requests. Maximum 3 attempts per 1 hour.",
	keyGenerator: emailKeyGenerator,
});

// 5. Reset Password: Max 5 attempts per 15 minutes
export const resetPasswordRateLimiter = createRateLimiter({
	prefix: "reset-password",
	maxAttempts: 5,
	windowSeconds: 15 * 60, // 15 minutes
	errorMessage:
		"Too many password reset attempts. Please try again after 15 minutes.",
	keyGenerator: getClientIp,
});

// 6. Refresh Token: Max 30 requests per minute
export const refreshTokenRateLimiter = createRateLimiter({
	prefix: "refresh-token",
	maxAttempts: 30,
	windowSeconds: 60, // 1 minute
	errorMessage:
		"Too many token refresh requests. Please try again after 1 minute.",
	keyGenerator: getClientIp,
});
