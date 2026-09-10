import { inject, injectable } from "inversify";
import type { VerifyRestaurantEmailOtpDto } from "@/application/dto/restaurant-email-verification.dto";
import { InvalidVerificationTokenError } from "@/application/errors/invalid-verification-token.error";
import { OtpVerificationAttemptsExceededError } from "@/application/errors/otp-verification-attempts-exceeded.error";
import { RestaurantAccountBlockedError } from "@/application/errors/restaurant-account-blocked.error";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import type { IAuthTokenService } from "@/application/ports/services/auth-token.service.port";
import type { IEmailVerificationService } from "@/application/ports/services/email-verification.service.port";
import type { IOtpService } from "@/application/ports/services/otp.service.port";
import type { IOtpHashService } from "@/application/ports/services/otp-hash.service.port";
import type { IOtpStore } from "@/application/ports/services/otp-store.port";
import type { IVerifyRestaurantEmailOtpUseCase } from "@/application/ports/use-case/verify-email-otp.use-case.port";
import { TYPES } from "@/di/types";
import { OTP_CONFIG } from "@/shared/constants/otp.constants";
import { getRestaurantEmailOtpKey } from "@/utils/otp.util";

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

		@inject(TYPES.Services.EmailVerification)
		private readonly emailVerificationService: IEmailVerificationService,

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
			throw new InvalidVerificationTokenError();
		}

		const isValid = await this.otpHashService.compare(otp, storedOtp);

		if (!isValid) {
			const attempts = await this.otpService.incrementAttempt(email);

			if (attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
				await this.redisOtpStore.delete(otpKey);
				await this.otpService.resetAttempts(email);

				throw new OtpVerificationAttemptsExceededError();
			}

			throw new InvalidVerificationTokenError();
		}

		await this.redisOtpStore.delete(otpKey);
		await this.otpService.resetAttempts(email);

		const restaurant = await this.restaurantRepository.findByEmail(email);

		if (!restaurant) {
			const verificationToken =
				await this.emailVerificationService.createVerificationToken(email);

			return {
				nextStep: "ONBOARDING" as const,
				verificationToken,
			};
		}

		if (restaurant.isBlocked) {
			throw new RestaurantAccountBlockedError();
		}

		// need to verify restaurant status before moving to dashboard.

		const tokenPair = this.authTokenService.generateTokenPair({
			email,
			restaurantId: restaurant.id,
		});

		return {
			nextStep: "DASHBOARD" as const,
			...tokenPair,
		};
	}
}
