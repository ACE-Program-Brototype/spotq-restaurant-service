import type { ISendRestaurantEmailOtpUseCase } from "@/application/ports/use-case/restaurant-email-verification/send-email-otp.use-case.port";
import { TYPES } from "@/di/types";
import type { Request, Response } from "express";
import { inject, injectable } from "inversify";

injectable();
export class RestaurantEmailVerificationController {
	constructor(
		@inject(TYPES.UseCases.SendRestaurantEmailOtpUseCase)
		private readonly sendRestaurantEmailOtpUseCase: ISendRestaurantEmailOtpUseCase,
	) {}

	async sendEmailOtp(req: Request, res: Response): Promise<Response> {

		const dto = req.body;

		await this.sendRestaurantEmailOtpUseCase.execute(dto);

		return res.status(202).json({
			success: true,
			mess:"If this email is eligible for registration, a verification code will be sent."
		});
	}
}
