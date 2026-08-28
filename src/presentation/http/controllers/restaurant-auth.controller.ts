import type { Request, Response } from "express";
import { inject, injectable } from "inversify";

import type { ISendRestaurantEmailOtpUseCase } from "@/application/ports/use-case/send-email-otp.use-case.port";
import type { IResendRestaurantEmailOtpUseCase } from "@/application/ports/use-case/resend-email-otp.use-case.port";
import type { IVerifyRestaurantEmailOtpUseCase } from "@/application/ports/use-case/verify-email-otp.use-case.port";
import type { IRegisterRestaurantUseCase } from "@/application/ports/use-case/register-restaurant.use-case.port";

import { TYPES } from "@/di/types";
import { HTTP_STATUS } from "@/shared/constants/http.constants";
import { AppError } from "@/utils/response.model";

@injectable()
export class RestaurantAuthController {
	constructor(
		@inject(TYPES.UseCases.SendRestaurantEmailOtpUseCase)
		private readonly sendRestaurantEmailOtpUseCase: ISendRestaurantEmailOtpUseCase,

		@inject(TYPES.UseCases.ResendRestaurantEmailOtpUseCase)
		private readonly resendRestaurantEmailOtpUseCase: IResendRestaurantEmailOtpUseCase,

		@inject(TYPES.UseCases.VerifyRestaurantEmailOtpUseCase)
		private readonly verifyRestaurantEmailOtpUseCase: IVerifyRestaurantEmailOtpUseCase,

		@inject(TYPES.UseCases.RegisterRestaurantUseCase)
		private readonly registerRestaurantUseCase: IRegisterRestaurantUseCase,
	) {}

	async sendEmailOtp(req: Request, res: Response): Promise<Response> {
		await this.sendRestaurantEmailOtpUseCase.execute(req.body);

		return res.status(HTTP_STATUS.ACCEPTED).json({
			success: true,
			message:
				"If this email is eligible for registration, a verification code will be sent.",
		});
	}

	async resendEmailOtp(req: Request, res: Response): Promise<Response> {
		await this.resendRestaurantEmailOtpUseCase.execute(req.body);

		return res.status(HTTP_STATUS.ACCEPTED).json({
			success: true,
			message:
				"If this email is eligible for registration, a verification code will be sent.",
		});
	}

	async verifyEmailOtp(req: Request, res: Response): Promise<Response> {
		const verificationToken =
			await this.verifyRestaurantEmailOtpUseCase.execute(req.body);

		return res.status(HTTP_STATUS.SUCCESS).json({
			success: true,
			message: "Email verified successfully.",
			data: {
				verificationToken,
			},
		});
	}

	async register(req: Request, res: Response): Promise<Response> {
		const authorizationHeader = req.headers.authorization;

		if (!authorizationHeader?.startsWith("Bearer ")) {
			throw new AppError(
				"Verification token is required",
				HTTP_STATUS.UNAUTHORIZED,
			);
		}

		const verificationToken = authorizationHeader.substring(7);

		await this.registerRestaurantUseCase.execute(
			req.body,
			verificationToken,
		);

		return res.status(HTTP_STATUS.CREATED).json({
			success: true,
			message: "Restaurant registered successfully",
		});
	}
}