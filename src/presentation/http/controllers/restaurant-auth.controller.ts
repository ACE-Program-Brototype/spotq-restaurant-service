import { env } from "@config/env";
import { messages } from "@shared/constants/message.constants";
import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import type { IOnboardRestaurantUseCase } from "@/application/ports/use-case/onboard-restaurant.use-case.port";
import type { IRefreshRestaurantAccessTokenUseCase } from "@/application/ports/use-case/refresh-restaurant-access-token.use-case.port";
import type { IResendRestaurantEmailOtpUseCase } from "@/application/ports/use-case/resend-email-otp.use-case.port";
import type { ISendRestaurantEmailOtpUseCase } from "@/application/ports/use-case/send-email-otp.use-case.port";
import type { IVerifyRestaurantEmailOtpUseCase } from "@/application/ports/use-case/verify-email-otp.use-case.port";
import { InvalidRefreshTokenError } from "@/application/errors/invalid-refresh-token.error";
import { TYPES } from "@/di/types";
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

	private setRefreshCookies(res: Response, refreshToken: string) {
		res.cookie(env.COOKIE_NAME_REFRESH_TOKEN, refreshToken, {
			httpOnly: env.COOKIE_HTTP_ONLY,
			secure: env.COOKIE_SECURE,
			sameSite: env.COOKIE_SAME_SITE,
			maxAge: env.COOKIE_MAX_AGE_MS,
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

		if (result.accessToken && result.refreshToken) {
			this.setRefreshCookies(res, result.refreshToken);
		}

		return successResponse(
			res,
			messages.EMAIL_VERIFIED_SUCCESS,
			HTTP_STATUS.SUCCESS,
			{
				nextStep: result.nextStep,
				restaurantId: result.restaurantId,
				accessToken: result.accessToken,
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

		const refreshToken = this.getCookie(req, "refreshToken");

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
			HTTP_STATUS.OK,
			{ accessToken },
		);
	}

	async onboard(req: Request, res: Response): Promise<Response> {
		const restaurantId = (req as Request & { user?: { restaurantId?: string } }).user?.restaurantId;

		if (!restaurantId) {
			return res.status(HTTP_STATUS.UNAUTHORIZED).json({
				success: false,
				message: "Unauthorized",
			});
		}

		await this.onboardRestaurantUseCase.execute(req.body, restaurantId);

		return successResponse(
			res,
			messages.RESTAURANT_REGISTRATION_SUCCESS,
			HTTP_STATUS.CREATED,
		);
	}
}
