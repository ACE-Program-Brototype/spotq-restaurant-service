import type {
	AnalyticsPeriod,
	OrderStatusFilter,
} from "@/shared/constants/analytics.constants.ts";

export interface GetRestaurantOrderSummaryQueryDto {
	interval?: AnalyticsPeriod;
	day?: number;
	month?: number;
	year?: number;
	status?: OrderStatusFilter;
}

export interface GetRestaurantProductAnalyticsQueryDto {
	interval?: AnalyticsPeriod;
	day?: number;
	month?: number;
	year?: number;
	page?: number;
	limit?: number;
}

export interface OrderStatusDistributionItemDto {
	status: string;
	count: number;
	percentage: number;
	amountRupees: number;
}

export interface RestaurantOrderAnalyticsSummaryDto {
	restaurantId: string;
	revenue: {
		netSalesRupees: number;
		discountRupees: number;
		totalBillAmountRupees: number;
		growthPercentage: number;
	};
	orders: {
		totalOrderCount: number;
		dineInCount: number;
		takeawayCount: number;
		growthPercentage: number;
	};
	operations: {
		dinersServedCount: number;
		uniqueCustomersCount: number;
	};
	orderStatusBreakdown: {
		totalOrdersTracked: number;
		distribution: OrderStatusDistributionItemDto[];
	};
	filters?: {
		interval: string;
		day?: number;
		month?: number;
		year?: number;
		status: string;
	};
	generatedAt?: string;
}

export interface ProductPerformanceItemDto {
	menuItemId: string;
	name: string;
	quantitySold: number;
	salesRupees: number;
	isAvailable?: boolean;
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

export interface RestaurantProductAnalyticsDto {
	restaurantId: string;
	totalProductsSold: number;
	topSelling: {
		items: ProductPerformanceItemDto[];
		pagination: ProductRankingPaginationDto;
	};
	slowMoving: {
		items: ProductPerformanceItemDto[];
		pagination: ProductRankingPaginationDto;
	};
	filters?: {
		interval: string;
		day?: number;
		month?: number;
		year?: number;
		page: number;
		limit: number;
	};
	generatedAt?: string;
}

export interface IOrderAnalyticsService {
	getOrderSummary(
		restaurantId: string,
		query?: GetRestaurantOrderSummaryQueryDto,
		callerUserId?: string,
	): Promise<RestaurantOrderAnalyticsSummaryDto | null>;

	getProductAnalytics(
		restaurantId: string,
		query?: GetRestaurantProductAnalyticsQueryDto,
		callerUserId?: string,
	): Promise<RestaurantProductAnalyticsDto | null>;
}
