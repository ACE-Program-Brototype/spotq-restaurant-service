import type { SectionErrorDTO } from "@/application/dtos/admin/get-platform-dashboard-analytics.dto.ts";
import type {
	ANALYTICS_SECTION_STATUS,
	AnalyticsPeriod,
	OrderStatusFilter,
	ProductClassification,
} from "@/shared/constants/analytics.constants.ts";

export interface GetRestaurantAnalyticsDashboardInputDTO {
	restaurantId?: string;
	interval?: AnalyticsPeriod;
	day?: number;
	month?: number;
	year?: number;
	status?: OrderStatusFilter;
	page?: number;
	limit?: number;
}

export interface RevenueMetricDTO {
	netSalesRupees: number;
	discountRupees: number;
	totalBillAmountRupees: number;
	growthPercentage: number;
}

export type RevenueSectionResultDTO =
	| ({ status: typeof ANALYTICS_SECTION_STATUS.AVAILABLE } & RevenueMetricDTO)
	| {
			status: typeof ANALYTICS_SECTION_STATUS.UNAVAILABLE;
			error: SectionErrorDTO;
	  };

export interface OrderMetricDTO {
	totalOrderCount: number;
	dineInCount: number;
	takeawayCount: number;
	growthPercentage: number;
}

export type OrderSectionResultDTO =
	| ({ status: typeof ANALYTICS_SECTION_STATUS.AVAILABLE } & OrderMetricDTO)
	| {
			status: typeof ANALYTICS_SECTION_STATUS.UNAVAILABLE;
			error: SectionErrorDTO;
	  };

export interface OperationMetricDTO {
	dinersServedCount: number;
	uniqueCustomersCount: number;
}

export type OperationSectionResultDTO =
	| ({
			status: typeof ANALYTICS_SECTION_STATUS.AVAILABLE;
	  } & OperationMetricDTO)
	| {
			status: typeof ANALYTICS_SECTION_STATUS.UNAVAILABLE;
			error: SectionErrorDTO;
	  };

export interface OrderStatusDistributionDTO {
	status: string;
	count: number;
	percentage: number;
	amountRupees: number;
}

export interface OrderStatusBreakdownDTO {
	totalOrdersTracked: number;
	distribution: OrderStatusDistributionDTO[];
}

export type OrderStatusBreakdownResultDTO =
	| ({
			status: typeof ANALYTICS_SECTION_STATUS.AVAILABLE;
	  } & OrderStatusBreakdownDTO)
	| {
			status: typeof ANALYTICS_SECTION_STATUS.UNAVAILABLE;
			error: SectionErrorDTO;
	  };

export interface ProductItemDTO {
	menuItemId: string;
	name: string;
	quantitySold: number;
	salesRupees: number;
	isAvailable: boolean;
	percentageOfTotalSales?: number;
	classification?: ProductClassification;
}

export interface ProductRankingPaginationDTO {
	totalItems: number;
	totalPages: number;
	currentPage: number;
	limit: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}

export interface ProductSectionAvailableDTO {
	status: typeof ANALYTICS_SECTION_STATUS.AVAILABLE;
	totalProductsCount: number;
	topSelling: {
		items: ProductItemDTO[];
		pagination: ProductRankingPaginationDTO;
	};
	slowMoving: {
		items: ProductItemDTO[];
		pagination: ProductRankingPaginationDTO;
	};
}

export type ProductSectionResultDTO =
	| ProductSectionAvailableDTO
	| {
			status: typeof ANALYTICS_SECTION_STATUS.UNAVAILABLE;
			error: SectionErrorDTO;
	  };

export interface RestaurantAnalyticsDashboardFiltersDTO {
	interval: AnalyticsPeriod;
	day?: number | null;
	month: number;
	year: number;
	status: OrderStatusFilter;
	page: number;
	limit: number;
}

export interface RestaurantAnalyticsDashboardOutputDTO {
	restaurantId: string;
	overview: {
		revenue: RevenueSectionResultDTO;
		orders: OrderSectionResultDTO;
		operations: OperationSectionResultDTO;
	};
	orderStatusBreakdown: OrderStatusBreakdownResultDTO;
	products: ProductSectionResultDTO;
	filters: RestaurantAnalyticsDashboardFiltersDTO;
	generatedAt: string;
}
