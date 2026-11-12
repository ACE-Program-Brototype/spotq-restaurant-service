import type {
	GetRestaurantAnalyticsDashboardInputDTO,
	RestaurantAnalyticsDashboardOutputDTO,
} from "@/application/dtos/restaurant/get-restaurant-analytics-dashboard.dto.ts";

export interface IGetRestaurantAnalyticsDashboardUseCase {
	execute(
		restaurantId: string,
		input?: GetRestaurantAnalyticsDashboardInputDTO,
	): Promise<RestaurantAnalyticsDashboardOutputDTO>;
}
