import type { NextFunction, Request, Response } from "express";
import redis from "@/config/redis.ts";
import { RateLimitExceededError } from "@/domain/errors/staff.errors.ts";

export const createEmailRateLimiter = (
	prefix: string,
	maxAttempts: number,
	windowSeconds: number,
	errorMessage?: string,
) => {
	return async (
		req: Request,
		_res: Response,
		next: NextFunction,
	): Promise<void> => {
		const email =
			typeof req.body?.email === "string"
				? req.body.email.trim().toLowerCase()
				: null;

		if (!email) {
			next();
			return;
		}

		const key = `ratelimit:${prefix}:${email}`;

		const current = await redis.incr(key);

		if (current === 1) {
			await redis.expire(key, windowSeconds);
		}

		if (current > maxAttempts) {
			const ttl = await redis.ttl(key);
			const errorMsg =
				errorMessage ||
				`Too many requests. Please try again after ${Math.ceil(ttl > 0 ? ttl / 60 : windowSeconds / 60)} minutes`;
			throw new RateLimitExceededError(errorMsg);
		}

		next();
	};
};

export const forgotPasswordRateLimiter = createEmailRateLimiter(
	"forgot-password",
	3,
	24 * 60 * 60, // 24 hours
	"Too many forgot password requests for this email. Maximum 3 attempts per 24 hours.",
);

export const resendOtpRateLimiter = createEmailRateLimiter(
	"resend-otp",
	3,
	60 * 60, // 1 hour
	"Too many OTP resend requests. Maximum 3 attempts per 1 hour.",
);
