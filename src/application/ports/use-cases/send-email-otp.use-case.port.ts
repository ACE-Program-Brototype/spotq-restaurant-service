import type { SendRestaurantEmailOtpDto } from "@/application/dtos/restaurant/restaurant-email-verification.dto.ts";

export interface ISendRestaurantEmailOtpUseCase {
	execute(dto: SendRestaurantEmailOtpDto): Promise<void>;
}
