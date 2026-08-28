import type { VerifyRestaurantEmailOtpDto, VerifyRestaurantEmailOtpResponseDto } from "@/application/dto/restaurant-email-verification.dto";

export interface IVerifyRestaurantEmailOtpUseCase {
	execute(dto: VerifyRestaurantEmailOtpDto): Promise<VerifyRestaurantEmailOtpResponseDto>;
}
