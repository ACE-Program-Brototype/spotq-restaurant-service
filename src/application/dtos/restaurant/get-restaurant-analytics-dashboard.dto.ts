import type { SectionErrorDto } from "@/application/dtos/admin/get-platform-dashboard-analytics.dto.ts";
import type {
	AnalyticsPeriod,
	OrderStatusFilter,
} from "@/shared/constants/analytics.constants.ts";

export interface GetRestaurantAnalyticsDashboardQueryDto {
	restaurantId: string;
	interval?: AnalyticsPeriod;
	day?: number;
	month?: number;
	year?: number;
	status?: OrderStatusFilter;
	page?: number;
	limit?: number;
}

export interface RevenueMetricDto {
	netSalesRupees: number;
	discountRupees: number;
	totalBillAmountRupees: number;
	growthPercentage: number;
}

export type RevenueSectionResultDto =
	| ({ status: "AVAILABLE" } & RevenueMetricDto)
	| { status: "UNAVAILABLE"; error: SectionErrorDto };

export interface OrderMetricDto {
	totalOrderCount: number;
	dineInCount: number;
	takeawayCount: number;
	growthPercentage: number;
}

export type OrderSectionResultDto =
	| ({ status: "AVAILABLE" } & OrderMetricDto)
	| { status: "UNAVAILABLE"; error: SectionErrorDto };

export interface OperationMetricDto {
	dinersServedCount: number;
	uniqueCustomersCount: number;
}

export type OperationSectionResultDto =
	| ({ status: "AVAILABLE" } & OperationMetricDto)
	| { status: "UNAVAILABLE"; error: SectionErrorDto };

export interface OrderStatusDistributionDto {
	status: string;
	count: number;
	percentage: number;
	amountRupees: number;
}

export interface OrderStatusBreakdownDto {
	totalOrdersTracked: number;
	distribution: OrderStatusDistributionDto[];
}

export type OrderStatusBreakdownResultDto =
	| ({ status: "AVAILABLE" } & OrderStatusBreakdownDto)
	| { status: "UNAVAILABLE"; error: SectionErrorDto };

export interface ProductItemDto {
	menuItemId: string;
	name: string;
	quantitySold: number;
	salesRupees: number;
	isAvailable: boolean;
	percentageOfTotalSales?: number;
	classification?: "ZERO_SALES" | "LOW_VOLUME" | "NORMAL";
}

export interface ProductRankingPaginationDto {
	totalItems: number;
	totalPages: number;
	currentPage: number;
	limit: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}

export interface ProductSectionAvailableDto {
	status: "AVAILABLE";
	totalProductsCount: number;
	topSelling: {
		items: ProductItemDto[];
		pagination: ProductRankingPaginationDto;
	};
	slowMoving: {
		items: ProductItemDto[];
		pagination: ProductRankingPaginationDto;
	};
}

export type ProductSectionResultDto =
	| ProductSectionAvailableDto
	| { status: "UNAVAILABLE"; error: SectionErrorDto };

export interface RestaurantAnalyticsDashboardFiltersDto {
	interval: AnalyticsPeriod;
	day?: number | null;
	month: number;
	year: number;
	status: OrderStatusFilter;
	page: number;
	limit: number;
}

export interface RestaurantAnalyticsDashboardResponseDto {
	restaurantId: string;
	overview: {
		revenue: RevenueSectionResultDto;
		orders: OrderSectionResultDto;
		operations: OperationSectionResultDto;
	};
	orderStatusBreakdown: OrderStatusBreakdownResultDto;
	products: ProductSectionResultDto;
	filters: RestaurantAnalyticsDashboardFiltersDto;
	generatedAt: string;
}
