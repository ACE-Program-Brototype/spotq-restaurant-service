import type {
	AnalyticsPeriod,
	OrderStatusFilter,
} from "@/shared/constants/analytics.constants.ts";

export interface GetRestaurantOrderSummaryQueryDTO {
	interval?: AnalyticsPeriod;
	day?: number;
	month?: number;
	year?: number;
	status?: OrderStatusFilter;
}

export interface GetRestaurantProductAnalyticsQueryDTO {
	interval?: AnalyticsPeriod;
	day?: number;
	month?: number;
	year?: number;
	page?: number;
	limit?: number;
}

export interface OrderStatusDistributionItemDTO {
	status: string;
	count: number;
	percentage: number;
	amountRupees: number;
}

export interface RestaurantOrderAnalyticsSummaryDTO {
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
		distribution: OrderStatusDistributionItemDTO[];
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

export interface ProductPerformanceItemDTO {
	menuItemId: string;
	name: string;
	quantitySold: number;
	salesRupees: number;
	isAvailable?: boolean;
	percentageOfTotalSales?: number;
	classification?: "ZERO_SALES" | "LOW_VOLUME" | "NORMAL";
}

export interface ProductRankingPaginationDTO {
	totalItems: number;
	totalPages: number;
	currentPage: number;
	limit: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}

export interface RestaurantProductAnalyticsDTO {
	restaurantId: string;
	totalProductsSold: number;
	topSelling: {
		items: ProductPerformanceItemDTO[];
		pagination: ProductRankingPaginationDTO;
	};
	slowMoving: {
		items: ProductPerformanceItemDTO[];
		pagination: ProductRankingPaginationDTO;
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
		query?: GetRestaurantOrderSummaryQueryDTO,
		callerUserId?: string,
	): Promise<RestaurantOrderAnalyticsSummaryDTO | null>;

	getProductAnalytics(
		restaurantId: string,
		query?: GetRestaurantProductAnalyticsQueryDTO,
		callerUserId?: string,
	): Promise<RestaurantProductAnalyticsDTO | null>;
}
