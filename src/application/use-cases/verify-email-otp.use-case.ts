import { TYPES } from "@/di/types";
import type { IVerifyRestaurantEmailOtpUseCase } from "../ports/use-case/verify-email-otp.use-case.port";
import { inject, injectable } from "inversify";
import type { IOtpStore } from "../ports/services/otp-store.port";
import type { VerifyRestaurantEmailOtpDto } from "../dto/restaurant-email-verification.dto";
import {
	getRestaurantEmailOtpAttemptsKey,
	getRestaurantEmailOtpKey,
} from "@/utils/otp.util";
import { AppError } from "@/utils/response.model";
import { HTTP_STATUS } from "@/shared/constants/http.constants";
import { OTP_CONFIG } from "@/shared/constants/otp.constants";
import type { IOtpService } from "../ports/services/otp.service.port";

@injectable()
export class VerifyRestaurantEmailOtpUseCase
	implements IVerifyRestaurantEmailOtpUseCase
{
	constructor(
		@inject(TYPES.Services.OtpStore)
		private readonly redisOtpStore: IOtpStore,

		@inject(TYPES.Services.OtpService)
		private readonly otpService: IOtpService,
	) {}

	async execute(dto: VerifyRestaurantEmailOtpDto): Promise<void> {
		const { email, otp } = dto;

		const otpKey = getRestaurantEmailOtpKey(email);

		const storedOtp = await this.redisOtpStore.get(otpKey);

		if (!storedOtp) {
			throw new AppError("Invalid or expired OTP", HTTP_STATUS.BAD_REQUEST);
		}

		if (storedOtp === otp) {
			const attemptsKey = getRestaurantEmailOtpAttemptsKey(email);

			await this.redisOtpStore.delete(otpKey);
			await this.redisOtpStore.delete(attemptsKey);

			return;
		}

		const attempts = await this.otpService.incrementAttempt(email);

		if (attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
			await this.redisOtpStore.delete(otpKey);
			await this.otpService.resetAttempts(email);

			throw new AppError(
				"Maximum OTP verification attempts exceeded",
				HTTP_STATUS.TOO_MANY_REQUESTS,
			);
		}

		throw new AppError("Invalid or expired OTP", HTTP_STATUS.BAD_REQUEST);
	}
}
