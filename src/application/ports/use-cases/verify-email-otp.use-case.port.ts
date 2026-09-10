import type {
	VerifyRestaurantEmailOtpDto,
	VerifyRestaurantEmailOtpResponseDto,
} from "@/application/dtos/restaurant/restaurant-email-verification.dto.ts";

export interface IVerifyRestaurantEmailOtpUseCase {
	execute(
		dto: VerifyRestaurantEmailOtpDto,
	): Promise<VerifyRestaurantEmailOtpResponseDto>;
}
