import type { SendRestaurantEmailOtpDto } from "@/application/dto/restaurant-email-verification.dto";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import type { IOtpStore } from "@/application/ports/services/otp-store.port";
import type { ISendRestaurantEmailOtpUseCase } from "@/application/ports/use-case/restaurant-email-verification/send-email-otp.use-case.port";
import { TYPES } from "@/di/types";
import { OTP_CONFIG } from "@/shared/constants/otp.constants";
import { generateOtp } from "@/utils/otp.util";
import { inject, injectable } from "inversify";

@injectable()
export class SendRestaurantEmailOtpUseCase
	implements ISendRestaurantEmailOtpUseCase
{
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,

		@inject(TYPES.Services.OtpStore)
		private readonly redisOtpStore: IOtpStore,
	) {}

	async execute(dto: SendRestaurantEmailOtpDto) {
		const { email } = dto;

		const restaurantExists =
			await this.restaurantRepository.existsByEmail(email);

		if (restaurantExists) {
			return;
		}

		const otp = generateOtp();

		const otpKey = `restaurant:email-verification:${dto.email}`;

		await this.redisOtpStore.save(otpKey, otp, OTP_CONFIG.EXPIRY_SECONDS);
	}
}
