import "reflect-metadata";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { ILogger } from "@/application/ports/services/logger.interface.ts";
import type {
	IOrderAnalyticsService,
	RestaurantOrderAnalyticsSummaryDto,
	RestaurantProductAnalyticsDto,
} from "@/application/ports/services/order-analytics.service.port.ts";
import { GetRestaurantAnalyticsDashboardUseCase } from "@/application/use-cases/restaurant/get-restaurant-analytics-dashboard.use-case.ts";
import type {
	ActiveMenuItemInfo,
	IRestaurantAnalyticsRepository,
} from "@/domain/repositories/restaurant-analytics.repository.interface.ts";

describe("GetRestaurantAnalyticsDashboardUseCase", () => {
	let useCase: GetRestaurantAnalyticsDashboardUseCase;
	let mockRepo: jest.Mocked<IRestaurantAnalyticsRepository>;
	let mockOrderService: jest.Mocked<IOrderAnalyticsService>;
	let mockLogger: jest.Mocked<ILogger>;

	const restaurantId = "rest-uuid-1111-2222";

	const mockMenuItems: ActiveMenuItemInfo[] = [
		{ id: "dish-1", name: "Butter Chicken", isAvailable: true },
		{ id: "dish-2", name: "Paneer Butter Masala", isAvailable: true },
		{ id: "dish-3", name: "Garlic Naan", isAvailable: false },
	];

	const defaultOrderSummary: RestaurantOrderAnalyticsSummaryDto = {
		restaurantId,
		revenue: {
			netSalesRupees: 185000,
			discountRupees: 15000,
			totalBillAmountRupees: 200000,
			growthPercentage: 12.5,
		},
		orders: {
			totalOrderCount: 450,
			dineInCount: 320,
			takeawayCount: 130,
			growthPercentage: 8.2,
		},
		operations: {
			dinersServedCount: 920,
			uniqueCustomersCount: 380,
		},
		orderStatusBreakdown: {
			totalOrdersTracked: 450,
			distribution: [
				{
					status: "COMPLETED",
					count: 420,
					percentage: 93.33,
					amountRupees: 190000,
				},
				{
					status: "CANCELLED",
					count: 30,
					percentage: 6.67,
					amountRupees: 10000,
				},
			],
		},
	};

	const defaultProductAnalytics: RestaurantProductAnalyticsDto = {
		restaurantId,
		totalProductsSold: 2,
		topSelling: {
			items: [
				{
					menuItemId: "dish-1",
					name: "Butter Chicken",
					quantitySold: 120,
					salesRupees: 48000,
					percentageOfTotalSales: 24.0,
					classification: "NORMAL",
				},
			],
			pagination: {
				totalItems: 1,
				totalPages: 1,
				currentPage: 1,
				limit: 10,
				hasNextPage: false,
				hasPrevPage: false,
			},
		},
		slowMoving: {
			items: [
				{
					menuItemId: "dish-2",
					name: "Paneer Butter Masala",
					quantitySold: 10,
					salesRupees: 3000,
					percentageOfTotalSales: 1.5,
					classification: "LOW_VOLUME",
				},
			],
			pagination: {
				totalItems: 1,
				totalPages: 1,
				currentPage: 1,
				limit: 10,
				hasNextPage: false,
				hasPrevPage: false,
			},
		},
	};

	beforeEach(() => {
		mockRepo = {
			getTotalRestaurantsCount: jest
				.fn<IRestaurantAnalyticsRepository["getTotalRestaurantsCount"]>()
				.mockResolvedValue(0),
			getActiveSubscribedCount: jest
				.fn<IRestaurantAnalyticsRepository["getActiveSubscribedCount"]>()
				.mockResolvedValue(0),
			getSubscriptionTierDistribution: jest
				.fn<IRestaurantAnalyticsRepository["getSubscriptionTierDistribution"]>()
				.mockResolvedValue({}),
			getOnboardingTrend: jest
				.fn<IRestaurantAnalyticsRepository["getOnboardingTrend"]>()
				.mockResolvedValue([]),
			getOnboardingFunnel: jest
				.fn<IRestaurantAnalyticsRepository["getOnboardingFunnel"]>()
				.mockResolvedValue([]),
			getGeographicBreakdown: jest
				.fn<IRestaurantAnalyticsRepository["getGeographicBreakdown"]>()
				.mockResolvedValue([]),
			getActiveMenuItems: jest
				.fn<IRestaurantAnalyticsRepository["getActiveMenuItems"]>()
				.mockResolvedValue(mockMenuItems),
			getAllMenuItems: jest
				.fn<IRestaurantAnalyticsRepository["getAllMenuItems"]>()
				.mockResolvedValue(mockMenuItems),
			getTotalActiveProductsCount: jest
				.fn<IRestaurantAnalyticsRepository["getTotalActiveProductsCount"]>()
				.mockResolvedValue(2),
		};

		mockOrderService = {
			getOrderSummary: jest
				.fn<IOrderAnalyticsService["getOrderSummary"]>()
				.mockResolvedValue(defaultOrderSummary),
			getProductAnalytics: jest
				.fn<IOrderAnalyticsService["getProductAnalytics"]>()
				.mockResolvedValue(defaultProductAnalytics),
		};

		mockLogger = {
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
		} as unknown as jest.Mocked<ILogger>;

		useCase = new GetRestaurantAnalyticsDashboardUseCase(
			mockRepo,
			mockOrderService,
			mockLogger,
		);
	});

	it("1. Successful aggregation of restaurant order, revenue, operations, and product analytics", async () => {
		const result = await useCase.execute(
			{
				restaurantId,
				interval: "MONTH",
				year: 2026,
				month: 11,
				status: "ALL",
				page: 1,
				limit: 10,
			},
			"owner-user-123",
		);

		expect(result.restaurantId).toBe(restaurantId);
		expect(result.overview.revenue).toEqual({
			status: "AVAILABLE",
			netSalesRupees: 185000,
			discountRupees: 15000,
			totalBillAmountRupees: 200000,
			growthPercentage: 12.5,
		});
		expect(result.overview.orders).toEqual({
			status: "AVAILABLE",
			totalOrderCount: 450,
			dineInCount: 320,
			takeawayCount: 130,
			growthPercentage: 8.2,
		});
		expect(result.overview.operations).toEqual({
			status: "AVAILABLE",
			dinersServedCount: 920,
			uniqueCustomersCount: 380,
		});
		expect(result.orderStatusBreakdown).toEqual({
			status: "AVAILABLE",
			totalOrdersTracked: 450,
			distribution: defaultOrderSummary.orderStatusBreakdown.distribution,
		});

		expect(result.products.status).toBe("AVAILABLE");
		if (result.products.status === "AVAILABLE") {
			expect(result.products.totalProductsCount).toBe(2);
			expect(result.products.topSelling.items).toHaveLength(1);
			expect(result.products.topSelling.items[0].isAvailable).toBe(true);
			expect(result.products.slowMoving.items[0].isAvailable).toBe(true);
		}
	});

	it("2. Zero-sales classification: when totalProductsSold == 0, active catalog becomes ZERO_SALES", async () => {
		mockOrderService.getProductAnalytics.mockResolvedValueOnce({
			restaurantId,
			totalProductsSold: 0,
			topSelling: {
				items: [],
				pagination: {
					totalItems: 0,
					totalPages: 0,
					currentPage: 1,
					limit: 10,
					hasNextPage: false,
					hasPrevPage: false,
				},
			},
			slowMoving: {
				items: [],
				pagination: {
					totalItems: 0,
					totalPages: 0,
					currentPage: 1,
					limit: 10,
					hasNextPage: false,
					hasPrevPage: false,
				},
			},
		});

		const result = await useCase.execute({
			restaurantId,
			interval: "DAY",
			page: 1,
			limit: 10,
		});

		expect(result.products.status).toBe("AVAILABLE");
		if (result.products.status === "AVAILABLE") {
			expect(result.products.topSelling.items).toEqual([]);
			// Only active items (isAvailable === true) in catalog
			expect(result.products.slowMoving.items).toHaveLength(2);
			expect(result.products.slowMoving.items[0]).toEqual({
				menuItemId: "dish-1",
				name: "Butter Chicken",
				quantitySold: 0,
				salesRupees: 0,
				isAvailable: true,
				classification: "ZERO_SALES",
			});
			expect(result.products.slowMoving.items[1]).toEqual({
				menuItemId: "dish-2",
				name: "Paneer Butter Masala",
				quantitySold: 0,
				salesRupees: 0,
				isAvailable: true,
				classification: "ZERO_SALES",
			});
			expect(result.products.slowMoving.pagination.totalItems).toBe(2);
		}
	});

	it("3. Order Service failure sets sections to UNAVAILABLE with error codes", async () => {
		mockOrderService.getOrderSummary.mockResolvedValueOnce(null);
		mockOrderService.getProductAnalytics.mockResolvedValueOnce(null);

		const result = await useCase.execute({ restaurantId });

		expect(result.overview.revenue).toEqual({
			status: "UNAVAILABLE",
			error: {
				code: "ORDER_SERVICE_UNAVAILABLE",
				message: "Revenue metrics unavailable",
			},
		});
		expect(result.overview.orders).toEqual({
			status: "UNAVAILABLE",
			error: {
				code: "ORDER_SERVICE_UNAVAILABLE",
				message: "Order metrics unavailable",
			},
		});
		expect(result.orderStatusBreakdown).toEqual({
			status: "UNAVAILABLE",
			error: {
				code: "ORDER_SERVICE_UNAVAILABLE",
				message: "Order status breakdown unavailable",
			},
		});
		expect(result.products).toEqual({
			status: "UNAVAILABLE",
			error: {
				code: "ORDER_SERVICE_UNAVAILABLE",
				message: "Product performance metrics unavailable",
			},
		});

		expect(mockLogger.warn).toHaveBeenCalledTimes(2);
	});

	it("4. Live menu availability decoration: inactive item correctly decorated as isAvailable: false", async () => {
		mockOrderService.getProductAnalytics.mockResolvedValueOnce({
			restaurantId,
			totalProductsSold: 1,
			topSelling: {
				items: [
					{
						menuItemId: "dish-3", // dish-3 is isAvailable: false in local menu
						name: "Garlic Naan",
						quantitySold: 80,
						salesRupees: 4000,
					},
				],
				pagination: {
					totalItems: 1,
					totalPages: 1,
					currentPage: 1,
					limit: 10,
					hasNextPage: false,
					hasPrevPage: false,
				},
			},
			slowMoving: {
				items: [],
				pagination: {
					totalItems: 0,
					totalPages: 0,
					currentPage: 1,
					limit: 10,
					hasNextPage: false,
					hasPrevPage: false,
				},
			},
		});

		const result = await useCase.execute({ restaurantId });

		if (result.products.status === "AVAILABLE") {
			expect(result.products.topSelling.items[0].isAvailable).toBe(false);
		}
	});
});
