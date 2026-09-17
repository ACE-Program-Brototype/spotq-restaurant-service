import type { RestaurantStatusOutput } from "@/application/dtos/restaurant-status.dto.ts";

export interface IGetRestaurantStatusUseCase {
	execute(restaurantId: string): Promise<RestaurantStatusOutput | null>;
}
