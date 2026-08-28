import type { SendRestaurantEmailOtpDto } from "@/application/dto/restaurant-email-verification.dto";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import type { IOtpStore } from "@/application/ports/services/otp-store.port";
import type { ISendRestaurantEmailOtpUseCase } from "@/application/ports/use-case/send-email-otp.use-case.port";
import { TYPES } from "@/di/types";
import { OTP_CONFIG } from "@/shared/constants/otp.constants";
import { JOB_NAMES } from "@/shared/constants/queue.constants";
import { generateOtp, getRestaurantEmailOtpKey } from "@/utils/otp.util";
import type { Queue } from "bullmq";
import { inject, injectable } from "inversify";
import type { IOtpService } from "../ports/services/otp.service.port";
import { AppError } from "@/utils/response.model";
import { HTTP_STATUS } from "@/shared/constants/http.constants";

@injectable()
export class SendRestaurantEmailOtpUseCase
	implements ISendRestaurantEmailOtpUseCase
{
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		readonly _restaurantRepository: IRestaurantRepository,

		@inject(TYPES.Services.OtpStore)
		private readonly redisOtpStore: IOtpStore,

		@inject(TYPES.Services.OtpService)
		private readonly otpService: IOtpService,

		@inject(TYPES.Queue.Email)
		private readonly emailQueue: Queue,
	) {}

	async execute(dto: SendRestaurantEmailOtpDto) {
		const { email } = dto;

		const cooldownActive = await this.otpService.checkCooldown(email);

		if (cooldownActive) {
			throw new AppError(
				"Please wait before requesting another OTP",
				HTTP_STATUS.TOO_MANY_REQUESTS,
			);
		}

		const otp = generateOtp();

		const otpKey = getRestaurantEmailOtpKey(email);

		await this.redisOtpStore.save(otpKey, otp, OTP_CONFIG.EXPIRY_SECONDS);

		await this.otpService.resetAttempts(email);

		await this.emailQueue.add(JOB_NAMES.EMAIL.VERIFICATION_OTP, {
			toEmail: email,
			otp,
		});
	}
}
