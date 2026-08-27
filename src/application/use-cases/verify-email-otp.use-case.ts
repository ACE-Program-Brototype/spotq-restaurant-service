import { TYPES } from "@/di/types";
import type { IVerifyRestaurantEmailOtpUseCase } from "../ports/use-case/verify-email-otp.use-case.port";
import { inject, injectable } from "inversify";
import type { IOtpStore } from "../ports/services/otp-store.port";
import type { VerifyRestaurantEmailOtpDto } from "../dto/restaurant-email-verification.dto";
import { getRestaurantEmailOtpKey } from "@/utils/otp.util";
import { AppError } from "@/utils/response.model";
import { HTTP_STATUS } from "@/shared/constants/http.constants";

@injectable()
export class VerifyRestaurantEmailOtpUseCase implements IVerifyRestaurantEmailOtpUseCase {
  constructor(
    @inject(TYPES.Services.OtpStore)
    private readonly redisOtpStore: IOtpStore,
  ) {}

  async execute(dto: VerifyRestaurantEmailOtpDto): Promise<void> {
    const { email, otp } = dto;

    const otpKey = getRestaurantEmailOtpKey(email);

    const storedOtp = await this.redisOtpStore.get(otpKey);

    if (!storedOtp) {
      throw new AppError("Invalid or expired OTP", HTTP_STATUS.BAD_REQUEST);
    }

    if (storedOtp !== otp) {
      throw new AppError("Invalid or expired OTP", HTTP_STATUS.BAD_REQUEST);
    }

    await this.redisOtpStore.delete(otpKey);
  }
}
