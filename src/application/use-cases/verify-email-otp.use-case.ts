import { TYPES } from "@/di/types";
import type { IRestaurantRepository } from "@/application/ports/repositories/restaurant.repository.port";
import type { IVerifyRestaurantEmailOtpUseCase } from "../ports/use-case/verify-email-otp.use-case.port";
import { inject, injectable } from "inversify";
import type { IOtpStore } from "../ports/services/otp-store.port";
import type { VerifyRestaurantEmailOtpDto } from "../dto/restaurant-email-verification.dto";
import { getRestaurantEmailOtpKey } from "@/utils/otp.util";
import { AppError } from "@/utils/response.model";
import { HTTP_STATUS } from "@/shared/constants/http.constants";
import { OTP_CONFIG } from "@/shared/constants/otp.constants";
import type { IOtpService } from "../ports/services/otp.service.port";
import type { IEmailVerificationService } from "../ports/services/email-verification.service.port";
import type { IAuthTokenService } from "../ports/services/auth-token.service.port";

@injectable()
export class VerifyRestaurantEmailOtpUseCase implements IVerifyRestaurantEmailOtpUseCase {
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
	private readonly authTokenService: IAuthTokenService
  ) {}

  async execute(dto: VerifyRestaurantEmailOtpDto) {
    const { email, otp } = dto;

    const otpKey = getRestaurantEmailOtpKey(email);

    const storedOtp = await this.redisOtpStore.get(otpKey);

    if (!storedOtp) {
      throw new AppError("Invalid or expired OTP", HTTP_STATUS.BAD_REQUEST);
    }

    if (storedOtp !== otp) {
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
      throw new AppError(
        "Restaurant account is blocked",
        HTTP_STATUS.FORBIDDEN,
      );
    }

    // need to verify restaurant status before moving to dashboard.

	const tokenPair = this.authTokenService.generateTokenPair({
		email,
		restaurantId: restaurant.id
	});

    return {
      nextStep: "DASHBOARD" as const,
	  ...tokenPair
    };
  }
}
