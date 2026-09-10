import { inject, injectable } from "inversify";
import type { VerifyRestaurantEmailOtpDto } from "@/application/dtos/restaurant/restaurant-email-verification.dto.ts";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import type { IAuthTokenService } from "@/application/ports/services/auth-token.service.port";
import type { IOtpHashService } from "@/application/ports/services/otp-hash.service.port";
import type { IOtpStore } from "@/application/ports/services/otp-store.port";
import type { IOtpService } from "@/application/ports/services/otp.service.port";
import type { IVerifyRestaurantEmailOtpUseCase } from "@/application/ports/use-cases/verify-email-otp.use-case.port.ts";
import { TYPES } from "@/config/di/types";
import { OTP_CONFIG } from "@/shared/constants/otp.constants";
import { getRestaurantEmailOtpKey } from "@/utils/otp.util";
import { InvalidOtpError } from "../errors/invalid-otp.error";
import { OtpVerificationAttemptsExceededError } from "../errors/otp-verification-attempts-exceeded.error";
import { RestaurantAccountBlockedError } from "../errors/restaurant-account-blocked.error";

@injectable()
export class VerifyRestaurantEmailOtpUseCase
	implements IVerifyRestaurantEmailOtpUseCase
{
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepository: IRestaurantRepository,

		@inject(TYPES.Services.OtpStore)
		private readonly redisOtpStore: IOtpStore,

		@inject(TYPES.Services.OtpService)
		private readonly otpService: IOtpService,

		@inject(TYPES.Services.AuthTokenService)
		private readonly authTokenService: IAuthTokenService,

		@inject(TYPES.Services.OtpHashService)
		private readonly otpHashService: IOtpHashService,
	) {}

	async execute(dto: VerifyRestaurantEmailOtpDto) {
		const { email, otp } = dto;

		const otpKey = getRestaurantEmailOtpKey(email);

		const storedOtp = await this.redisOtpStore.get(otpKey);

		if (!storedOtp) {
			throw new InvalidOtpError();
		}

		const isValid = await this.otpHashService.compare(otp, storedOtp);

		if (!isValid) {
			const attempts = await this.otpService.incrementAttempt(email);

			if (attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
				await this.redisOtpStore.delete(otpKey);
				await this.otpService.resetAttempts(email);

				throw new OtpVerificationAttemptsExceededError();
			}

			throw new InvalidOtpError();
		}

		await this.redisOtpStore.delete(otpKey);
		await this.otpService.resetAttempts(email);

		let restaurant = await this.restaurantRepository.findByEmail(email);

		if (!restaurant) {
			restaurant = await this.restaurantRepository.createRestaurant({
				restaurantName: "Pending Registration",
				email,
				phone: "0000000000",
				ownerName: "Pending Owner",
				ownerEmail: email,
				emailVerifiedAt: new Date(),
			});
		}

		if (restaurant.isBlocked) {
			throw new RestaurantAccountBlockedError();
		}

		const tokenPair = this.authTokenService.generateTokenPair({
			email: restaurant.email,
			restaurantId: restaurant.id,
		});

		const nextStep =
			restaurant.onboardingStatus === "PENDING" || restaurant.status === "PENDING"
				? ("ONBOARDING" as const)
				: ("DASHBOARD" as const);

		return {
			nextStep,
			restaurantId: restaurant.id,
			accessToken: tokenPair.accessToken,
			refreshToken: tokenPair.refreshToken,
		};
	}
}
