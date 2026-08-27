import type { SendRestaurantEmailOtpDto } from "@/application/dto/restaurant-email-verification.dto";

export interface IResendRestaurantEmailOtpUseCase {
	execute(dto: SendRestaurantEmailOtpDto): Promise<void>;
}
