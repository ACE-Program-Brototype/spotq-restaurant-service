import type { Request, Response } from "express";
import { inject, injectable } from "inversify";

import type { ISendRestaurantEmailOtpUseCase } from "@/application/ports/use-case/send-email-otp.use-case.port";
import type { IResendRestaurantEmailOtpUseCase } from "@/application/ports/use-case/resend-email-otp.use-case.port";
import type { IVerifyRestaurantEmailOtpUseCase } from "@/application/ports/use-case/verify-email-otp.use-case.port";
import type { IOnboardRestaurantUseCase } from "@/application/ports/use-case/onboard-restaurant.use-case.port";

import { InvalidVerificationTokenError } from "@/application/errors/invalid-verification-token.error";
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

		@inject(TYPES.UseCases.OnboardRestaurantUseCase)
		private readonly onboardRestaurantUseCase: IOnboardRestaurantUseCase,
	) {}

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
		const result =
			await this.verifyRestaurantEmailOtpUseCase.execute(req.body);

		return successResponse(
			res,
			"Email verified successfully.",
			HTTP_STATUS.SUCCESS,
			result,
		);
	}

	async onboard(req: Request, res: Response): Promise<Response> {
		const authorizationHeader = req.headers.authorization;

		if (!authorizationHeader?.startsWith("Bearer ")) {
			throw new InvalidVerificationTokenError();
		}

		const verificationToken = authorizationHeader.substring(7);

		await this.onboardRestaurantUseCase.execute(
			req.body,
			verificationToken,
		);

		return successResponse(
			res,
			"Restaurant registered successfully",
			HTTP_STATUS.CREATED,
		);
	}
}