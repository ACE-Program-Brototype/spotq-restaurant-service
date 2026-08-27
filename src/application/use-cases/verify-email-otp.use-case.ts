import { TYPES } from "@/di/types";
import type { IVerifyRestaurantEmailOtpUseCase } from "../ports/use-case/verify-email-otp.use-case.port";
import { inject, injectable } from "inversify";
import type { IOtpStore } from "../ports/services/otp-store.port";
import type { VerifyRestaurantEmailOtpDto } from "../dto/restaurant-email-verification.dto";
import { getRestaurantEmailOtpKey } from "@/utils/otp.util";


@injectable()
export class VerifyRestaurantEmailOtpUseCase
  implements IVerifyRestaurantEmailOtpUseCase
{
  constructor(
    @inject(TYPES.Services.OtpStore)
    private readonly redisOtpStore: IOtpStore,
  ) {}

  async execute(
    dto: VerifyRestaurantEmailOtpDto,
  ): Promise<void> {

    const { email,otp } = dto;

    const otpKey = getRestaurantEmailOtpKey(email);

    const storedOtp =
      await this.redisOtpStore.get(otpKey);

    if (!storedOtp) {
      throw new Error("Invalid or expired OTP");
    }

    if (storedOtp !== otp) {
      throw new Error("Invalid or expired OTP");
    }

    await this.redisOtpStore.delete(otpKey);
  }
}