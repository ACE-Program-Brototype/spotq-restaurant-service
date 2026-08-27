import type { ISendRestaurantEmailOtpUseCase } from "@/application/ports/use-case/send-email-otp.use-case.port";
import type { IVerifyRestaurantEmailOtpUseCase } from "@/application/ports/use-case/verify-email-otp.use-case.port";
import { TYPES } from "@/di/types";
import type { Request, Response } from "express";
import { inject, injectable } from "inversify";

injectable();
export class RestaurantEmailVerificationController {
	constructor(
		@inject(TYPES.UseCases.SendRestaurantEmailOtpUseCase)
		private readonly sendRestaurantEmailOtpUseCase: ISendRestaurantEmailOtpUseCase,

		@inject(TYPES.UseCases.VerifyRestaurantEmailOtpUseCase)
		private readonly verifyRestaurantEmailOtpUseCase: IVerifyRestaurantEmailOtpUseCase
	) {}

	async sendEmailOtp(req: Request, res: Response): Promise<Response> {
		const dto = req.body;

		await this.sendRestaurantEmailOtpUseCase.execute(dto);

		return res.status(202).json({
			success: true,
			mess: "If this email is eligible for registration, a verification code will be sent.",
		});
	}

	async verifyEmailOtp(
		req: Request,
		res: Response,
	): Promise<Response> {

		const dto = req.body;

		await this.verifyRestaurantEmailOtpUseCase.execute(dto);

		return res.status(200).json({
			success: true,
			message: "Email verified successfully.",
		});
	}
}
