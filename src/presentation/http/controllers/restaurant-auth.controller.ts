import { env } from "@config/env";
import { messages } from "@shared/constants/message.constants";
import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { InvalidRefreshTokenError } from "@/application/errors/invalid-refresh-token.error";
import type { IOnboardRestaurantUseCase } from "@/application/ports/use-cases/onboard-restaurant.use-case.port.ts";
import type { IRefreshRestaurantAccessTokenUseCase } from "@/application/ports/use-cases/refresh-restaurant-access-token.use-case.port.ts";
import type { IResendRestaurantEmailOtpUseCase } from "@/application/ports/use-cases/resend-email-otp.use-case.port.ts";
import type { ISendRestaurantEmailOtpUseCase } from "@/application/ports/use-cases/send-email-otp.use-case.port.ts";
import type { IVerifyRestaurantEmailOtpUseCase } from "@/application/ports/use-cases/verify-email-otp.use-case.port.ts";
import { TYPES } from "@/config/di/types";
import { HTTP_STATUS } from "@/shared/constants/http.constants";
import { successResponse } from "@/utils/response.model";

@injectable()
export class RestaurantAuthController {
	constructor(
		@inject(TYPES.UseCases.SendRestaurantEmailOtpUseCase)
		private readonly sendRestaurantEmailOtpUseCase: ISendRestaurantEmailOtpUseCase,

		@inject(TYPES.UseCases.ResendRestaurantEmailOtpUseCase)
		private readonly resendRestaurantEmailOtpUseCase: IResendRestaurantEmailOtpUseCase,

		@inject(TYPES.UseCases.VerifyRestaurantEmailOtpUseCase)
		private readonly verifyRestaurantEmailOtpUseCase: IVerifyRestaurantEmailOtpUseCase,

		@inject(TYPES.UseCases.RefreshRestaurantAccessTokenUseCase)
		private readonly refreshRestaurantAccessTokenUseCase: IRefreshRestaurantAccessTokenUseCase,

		@inject(TYPES.UseCases.OnboardRestaurantUseCase)
		private readonly onboardRestaurantUseCase: IOnboardRestaurantUseCase,
	) {}

	private getCookie(req: Request, name: string): string | undefined {
		const cookieHeader = req.headers.cookie;
		if (!cookieHeader) return undefined;

		const cookies = cookieHeader
			.split(";")
			.reduce<Record<string, string>>((acc, rawCookie) => {
				const [key, ...valueParts] = rawCookie.trim().split("=");
				if (!key) return acc;
				const value = valueParts.join("=");
				acc[key] = decodeURIComponent(value ?? "");
				return acc;
			}, {});

		return cookies[name];
	}

	private setRefreshCookie(res: Response, refreshToken: string) {
		res.cookie(env.COOKIE_NAME_REFRESH_TOKEN || "refreshToken", refreshToken, {
			httpOnly: env.COOKIE_HTTP_ONLY,
			secure: env.COOKIE_SECURE,
			sameSite: env.COOKIE_SAME_SITE,
			maxAge: env.COOKIE_MAX_AGE_MS,
			path: env.COOKIE_PATH || "/",
		});
	}

	async sendEmailOtp(req: Request, res: Response): Promise<Response> {
		await this.sendRestaurantEmailOtpUseCase.execute(req.body);

		return successResponse(
			res,
			messages.RESTAURANT_EMAIL_OTP_SENT_SUCCESS,
			HTTP_STATUS.ACCEPTED,
		);
	}

	async resendEmailOtp(req: Request, res: Response): Promise<Response> {
		await this.resendRestaurantEmailOtpUseCase.execute(req.body);

		return successResponse(
			res,
			messages.RESTAURANT_EMAIL_OTP_SENT_SUCCESS,
			HTTP_STATUS.ACCEPTED,
		);
	}

	async verifyEmailOtp(req: Request, res: Response): Promise<Response> {
		const result = await this.verifyRestaurantEmailOtpUseCase.execute(req.body);

		if (result.refreshToken) {
			this.setRefreshCookie(res, result.refreshToken);
		}

		return successResponse(
			res,
			messages.EMAIL_VERIFIED_SUCCESS,
			HTTP_STATUS.SUCCESS,
			{
				nextStep: result.nextStep,
				restaurantId: result.restaurantId,
				accessToken: result.accessToken,
				access_token: result.accessToken,
			},
		);
	}

	async refreshAccessToken(req: Request, res: Response): Promise<Response> {
		if (
			typeof req.body?.refreshToken !== "undefined" ||
			typeof req.query?.refreshToken !== "undefined" ||
			req.headers.authorization
		) {
			throw new InvalidRefreshTokenError();
		}

		const refreshToken =
			this.getCookie(req, env.COOKIE_NAME_REFRESH_TOKEN) ||
			this.getCookie(req, "refreshToken");

		if (!refreshToken) {
			throw new InvalidRefreshTokenError();
		}

		const { accessToken } =
			await this.refreshRestaurantAccessTokenUseCase.execute({
				refreshToken,
			});

		return successResponse(
			res,
			messages.ACCESS_TOKEN_REFRESH_SUCCESS,
			HTTP_STATUS.SUCCESS,
			{
				accessToken,
				access_token: accessToken,
			},
		);
	}

	async onboard(req: Request, res: Response): Promise<Response> {
		const restaurantId =
			(req as Request & { user?: { restaurantId?: string } }).user?.restaurantId ||
			(req.headers["x-restaurant-id"] as string) ||
			(req.headers["x-user-id"] as string) ||
			req.body?.restaurantId;

		if (!restaurantId) {
			return res.status(HTTP_STATUS.UNAUTHORIZED).json({
				success: false,
				message: messages.UNAUTHORIZED_RESTAURANT,
			});
		}

		await this.onboardRestaurantUseCase.execute(req.body, restaurantId);

		return successResponse(
			res,
			messages.RESTAURANT_REGISTRATION_SUCCESS,
			HTTP_STATUS.CREATED,
			{
				restaurantId,
			},
		);
	}
}
