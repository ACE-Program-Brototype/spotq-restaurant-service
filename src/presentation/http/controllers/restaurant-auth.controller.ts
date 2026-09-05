import { env } from "@config/env";
import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { InvalidRefreshTokenError } from "@/application/errors/invalid-refresh-token.error";
import { InvalidVerificationTokenError } from "@/application/errors/invalid-verification-token.error";
import type { IOnboardRestaurantUseCase } from "@/application/ports/use-case/onboard-restaurant.use-case.port";
import type { IRefreshRestaurantAccessTokenUseCase } from "@/application/ports/use-case/refresh-restaurant-access-token.use-case.port";
import type { IResendRestaurantEmailOtpUseCase } from "@/application/ports/use-case/resend-email-otp.use-case.port";
import type { ISendRestaurantEmailOtpUseCase } from "@/application/ports/use-case/send-email-otp.use-case.port";
import type { IVerifyRestaurantEmailOtpUseCase } from "@/application/ports/use-case/verify-email-otp.use-case.port";
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
		res.cookie("refreshToken", refreshToken, {
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
			"If this email is eligible for registration, a verification code will be sent.",
			HTTP_STATUS.ACCEPTED,
		);
	}

	async resendEmailOtp(req: Request, res: Response): Promise<Response> {
		await this.resendRestaurantEmailOtpUseCase.execute(req.body);

		return successResponse(
			res,
			"If this email is eligible for registration, a verification code will be sent.",
			HTTP_STATUS.ACCEPTED,
		);
	}

	async verifyEmailOtp(req: Request, res: Response): Promise<Response> {
		const result = await this.verifyRestaurantEmailOtpUseCase.execute(req.body);

		if (result.nextStep === "DASHBOARD") {
			const { accessToken, refreshToken, ...dashboardResult } = result;

			if (!accessToken || !refreshToken) {
				return successResponse(
					res,
					"Email verified successfully.",
					HTTP_STATUS.SUCCESS,
					{ nextStep: dashboardResult.nextStep },
				);
			}

			this.setRefreshCookies(res, refreshToken);

			return successResponse(
				res,
				"Email verified successfully.",
				HTTP_STATUS.SUCCESS,
				{
					nextStep: dashboardResult.nextStep,
					accessToken,
				},
			);
		}

		return successResponse(
			res,
			"Email verified successfully.",
			HTTP_STATUS.SUCCESS,
			result,
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
			"Access token refreshed successfully.",
			HTTP_STATUS.SUCCESS,
			{ accessToken },
		);
	}

	async onboard(req: Request, res: Response): Promise<Response> {
		const authorizationHeader = req.headers.authorization;

		if (!authorizationHeader?.startsWith("Bearer ")) {
			throw new InvalidVerificationTokenError();
		}

		const verificationToken = authorizationHeader.substring(7);

		await this.onboardRestaurantUseCase.execute(req.body, verificationToken);

		return successResponse(
			res,
			"Restaurant registered successfully",
			HTTP_STATUS.CREATED,
		);
	}
}
