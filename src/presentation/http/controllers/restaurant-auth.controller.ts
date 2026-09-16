import { env } from "@config/env";
import { messages } from "@shared/constants/message.constants";
import type { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { InvalidRefreshTokenError } from "@/application/errors/invalid-refresh-token.error";
import type { IGetRestaurantProfileUseCase } from "@/application/ports/use-cases/get-restaurant-profile.use-case.port.ts";
import type { IGetRestaurantVerificationStatusUseCase } from "@/application/ports/use-cases/get-verification-status.use-case.port.ts";
import type { IOnboardRestaurantUseCase } from "@/application/ports/use-cases/onboard-restaurant.use-case.port.ts";
import type { IRefreshRestaurantAccessTokenUseCase } from "@/application/ports/use-cases/refresh-restaurant-access-token.use-case.port.ts";
import type { IResendRestaurantEmailOtpUseCase } from "@/application/ports/use-cases/resend-email-otp.use-case.port.ts";
import type { ISendRestaurantEmailOtpUseCase } from "@/application/ports/use-cases/send-email-otp.use-case.port.ts";
import type { IUpdateRestaurantProfileUseCase } from "@/application/ports/use-cases/update-restaurant-profile.use-case.port.ts";
import type { IVerifyRestaurantEmailOtpUseCase } from "@/application/ports/use-cases/verify-email-otp.use-case.port.ts";
import { TYPES } from "@/config/di/types";
import { HTTP_STATUS } from "@/shared/constants/http.constants";
import { ApiResponse, sendSuccessResponse } from "@/shared/response/api-response";
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

		@inject(TYPES.UseCases.OnboardRestaurantUseCase)
		private readonly onboardRestaurantUseCase: IOnboardRestaurantUseCase,

		@inject(TYPES.UseCases.GetRestaurantVerificationStatusUseCase)
		private readonly getRestaurantVerificationStatusUseCase: IGetRestaurantVerificationStatusUseCase,

		@inject(TYPES.UseCases.RefreshRestaurantAccessTokenUseCase)
		private readonly refreshRestaurantAccessTokenUseCase: IRefreshRestaurantAccessTokenUseCase,

		@inject(TYPES.UseCases.GetRestaurantProfileUseCase)
		private readonly getRestaurantProfileUseCase: IGetRestaurantProfileUseCase,

		@inject(TYPES.UseCases.UpdateRestaurantProfileUseCase)
		private readonly updateRestaurantProfileUseCase: IUpdateRestaurantProfileUseCase,
	) {}

	async sendEmailOtp(req: Request, res: Response): Promise<Response> {
		const result = await this.sendRestaurantEmailOtpUseCase.execute(req.body);
		return sendSuccessResponse(
			res,
			result,
			messages.RESTAURANT_EMAIL_OTP_SENT_SUCCESS,
			HTTP_STATUS.OK,
		);
	}

	async resendEmailOtp(req: Request, res: Response): Promise<Response> {
		const result = await this.resendRestaurantEmailOtpUseCase.execute(req.body);
		return sendSuccessResponse(
			res,
			result,
			messages.OTP_RESENT_SUCCESS,
			HTTP_STATUS.OK,
		);
	}

	async verifyEmailOtp(req: Request, res: Response): Promise<Response> {
		const result = await this.verifyRestaurantEmailOtpUseCase.execute(
			req.body,
		);
		return sendSuccessResponse(
			res,
			result,
			messages.EMAIL_VERIFIED_SUCCESS,
			HTTP_STATUS.OK,
		);
	}

	async refreshAccessToken(req: Request, res: Response): Promise<Response> {
		const refreshTokenFromCookie =
			req.cookies?.[env.COOKIE_NAME_REFRESH_TOKEN];
		const refreshToken = refreshTokenFromCookie || req.body?.refreshToken;

		if (!refreshToken) {
			throw new InvalidRefreshTokenError();
		}

		const result = await this.refreshRestaurantAccessTokenUseCase.execute({
			refreshToken,
		});

		return sendSuccessResponse(
			res,
			result,
			messages.ACCESS_TOKEN_REFRESH_SUCCESS,
			HTTP_STATUS.OK,
		);
	}

	async onboard(req: Request, res: Response): Promise<Response> {
		const userObj =
			req.user && typeof req.user === "object" ? req.user : undefined;
		const restaurantId =
			(userObj as { restaurantId?: string } | undefined)?.restaurantId ||
			(typeof req.userId === "string" ? req.userId : undefined);

		if (!restaurantId) {
			return res
				.status(HTTP_STATUS.UNAUTHORIZED)
				.json(
					ApiResponse.error(
						messages.GATEWAY_UNAUTHORIZED || "Unauthorized",
						"UNAUTHORIZED",
						HTTP_STATUS.UNAUTHORIZED,
					),
				);
		}

		await this.onboardRestaurantUseCase.execute(req.body, restaurantId);

		return successResponse(
			res,
			messages.RESTAURANT_REGISTRATION_SUCCESS,
			HTTP_STATUS.CREATED,
		);
	}

	async getVerificationStatus(req: Request, res: Response): Promise<Response> {
		const userObj =
			req.user && typeof req.user === "object" ? req.user : undefined;
		const restaurantId =
			(userObj as { restaurantId?: string } | undefined)?.restaurantId ||
			(typeof req.userId === "string" ? req.userId : undefined);

		if (!restaurantId) {
			return res
				.status(HTTP_STATUS.UNAUTHORIZED)
				.json(
					ApiResponse.error(
						messages.GATEWAY_UNAUTHORIZED || "Unauthorized",
						"UNAUTHORIZED",
						HTTP_STATUS.UNAUTHORIZED,
					),
				);
		}

		const result =
			await this.getRestaurantVerificationStatusUseCase.execute(restaurantId);

		return sendSuccessResponse(
			res,
			result,
			messages.RESTAURANT_VERIFICATION_STATUS_FETCH_SUCCESS,
			HTTP_STATUS.OK,
		);
	}

	async getProfile(req: Request, res: Response): Promise<Response> {
		const userObj =
			req.user && typeof req.user === "object" ? req.user : undefined;
		const restaurantId =
			(userObj as { restaurantId?: string } | undefined)?.restaurantId ||
			(typeof req.userId === "string" ? req.userId : undefined);

		if (!restaurantId) {
			return res
				.status(HTTP_STATUS.UNAUTHORIZED)
				.json(
					ApiResponse.error(
						messages.GATEWAY_UNAUTHORIZED || "Unauthorized",
						"UNAUTHORIZED",
						HTTP_STATUS.UNAUTHORIZED,
					),
				);
		}

		const result = await this.getRestaurantProfileUseCase.execute(restaurantId);

		return sendSuccessResponse(
			res,
			result,
			messages.RESTAURANT_PROFILE_FETCH_SUCCESS,
			HTTP_STATUS.OK,
		);
	}

	async updateProfile(req: Request, res: Response): Promise<Response> {
		const userObj =
			req.user && typeof req.user === "object" ? req.user : undefined;
		const restaurantId =
			(userObj as { restaurantId?: string } | undefined)?.restaurantId ||
			(typeof req.userId === "string" ? req.userId : undefined);

		if (!restaurantId) {
			return res
				.status(HTTP_STATUS.UNAUTHORIZED)
				.json(
					ApiResponse.error(
						messages.GATEWAY_UNAUTHORIZED || "Unauthorized",
						"UNAUTHORIZED",
						HTTP_STATUS.UNAUTHORIZED,
					),
				);
		}

		const result = await this.updateRestaurantProfileUseCase.execute(
			restaurantId,
			req.body,
		);

		return sendSuccessResponse(
			res,
			result,
			messages.RESTAURANT_PROFILE_UPDATED_SUCCESS,
			HTTP_STATUS.OK,
		);
	}
}
