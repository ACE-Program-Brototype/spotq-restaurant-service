import type { SendRestaurantEmailOtpDto } from "@/application/dto/restaurant-email-verification.dto";
import type { Queue } from "bullmq";
import type { IOtpStore } from "@/application/ports/services/otp-store.port";
import type { IResendRestaurantEmailOtpUseCase } from "@/application/ports/use-case/resend-email-otp.use-case.port";
import { TYPES } from "@/di/types";
import { OTP_CONFIG } from "@/shared/constants/otp.constants";
import { generateOtp, getRestaurantEmailOtpKey } from "@/utils/otp.util";
import { inject, injectable } from "inversify";
import { JOB_NAMES } from "@/shared/constants/queue.constants";
import type { IOtpService } from "../ports/services/otp.service.port";
import { OtpCooldownActiveError } from "../errors/otp-cooldown-active.error";
import { IOtpHashService } from "../ports/services/otp-hash.service.port";

@injectable()
export class ResendRestaurantEmailOtpUseCase
	implements IResendRestaurantEmailOtpUseCase
{
	constructor(

		@inject(TYPES.Services.OtpStore)
		private readonly otpStore: IOtpStore,

		@inject(TYPES.Services.OtpService)
		private readonly otpService: IOtpService,

		@inject(TYPES.Queue.Email)
		private readonly emailQueue: Queue,

		@inject(TYPES.Services.OtpHashService)
		private readonly otpHashService: IOtpHashService,
	) {}

	async execute(dto: SendRestaurantEmailOtpDto): Promise<void> {
		const { email } = dto;

		const isRateLimited = await this.otpService.checkResendRateLimit(email);

		if (isRateLimited) {
			throw new OtpCooldownActiveError();
		}

		const otp = generateOtp();

		const otpHash = await this.otpHashService.hash(otp);

		const otpKey = getRestaurantEmailOtpKey(email);

		await this.otpStore.save(otpKey, otpHash, OTP_CONFIG.EXPIRY_SECONDS);

		await this.otpService.resetAttempts(email);

		await this.emailQueue.add(JOB_NAMES.EMAIL.VERIFICATION_OTP, {
			toEmail: email,
			otp,
		});
	}
}
