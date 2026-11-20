import type {
	OperationSectionResultDTO,
	OrderSectionResultDTO,
	OrderStatusBreakdownResultDTO,
	ProductSectionResultDTO,
	RestaurantAnalyticsDashboardFiltersDTO,
	RestaurantAnalyticsDashboardOutputDTO,
	RevenueSectionResultDTO,
} from "@/application/dtos/restaurant/get-restaurant-analytics-dashboard.dto.ts";

export interface CreateRestaurantAnalyticsDashboardParams {
	restaurantId: string;
	revenue: RevenueSectionResultDTO;
	orders: OrderSectionResultDTO;
	operations: OperationSectionResultDTO;
	orderStatusBreakdown: OrderStatusBreakdownResultDTO;
	products: ProductSectionResultDTO;
	filters: RestaurantAnalyticsDashboardFiltersDTO;
	generatedAt?: string;
}

/**
 * Transforms domain/service aggregation results into the standardized
 * Restaurant Analytics Dashboard response output DTO.
 */
export const RestaurantAnalyticsDashboardMapper = {
	toOutputDTO(
		params: CreateRestaurantAnalyticsDashboardParams,
	): RestaurantAnalyticsDashboardOutputDTO {
		return {
			restaurantId: params.restaurantId,
			overview: {
				revenue: params.revenue,
				orders: params.orders,
				operations: params.operations,
			},
			orderStatusBreakdown: params.orderStatusBreakdown,
			products: params.products,
			filters: params.filters,
			generatedAt: params.generatedAt ?? new Date().toISOString(),
		};
	},
};
