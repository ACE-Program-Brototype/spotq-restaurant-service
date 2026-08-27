import type { RegisterRestaurantDto } from "@/application/dto/restaurant-registration.dto";

export interface IRegisterRestaurantUseCase {
	execute(dto: RegisterRestaurantDto, verificationToken: string): Promise<void>;
}
