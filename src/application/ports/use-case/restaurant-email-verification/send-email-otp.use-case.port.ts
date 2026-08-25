import { SendRestaurantEmailOtpDto } from "@/application/dto/restaurant-email-verification.dto";

export interface ISendRestaurantEmailOtpUseCase {
  execute(dto: SendRestaurantEmailOtpDto): Promise<string>;
}