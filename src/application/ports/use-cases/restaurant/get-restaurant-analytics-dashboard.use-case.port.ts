import type {
	GetRestaurantAnalyticsDashboardQueryDto,
	RestaurantAnalyticsDashboardResponseDto,
} from "@/application/dtos/restaurant/get-restaurant-analytics-dashboard.dto.ts";

export interface IGetRestaurantAnalyticsDashboardUseCase {
	execute(
		query: GetRestaurantAnalyticsDashboardQueryDto,
		callerUserId?: string,
	): Promise<RestaurantAnalyticsDashboardResponseDto>;
}
