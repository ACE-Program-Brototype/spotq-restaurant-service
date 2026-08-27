import type { VerifyRestaurantEmailOtpDto } from "@/application/dto/restaurant-email-verification.dto";

export interface IVerifyRestaurantEmailOtpUseCase {
  execute(dto: VerifyRestaurantEmailOtpDto): Promise<void>;
}