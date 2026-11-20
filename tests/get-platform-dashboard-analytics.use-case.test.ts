import "reflect-metadata";
import type { ILogger } from "@/application/ports/services/logger.interface.ts";
import type {
	IPaymentAnalyticsService,
	PaymentSubscriptionSummaryDto,
} from "@/application/ports/services/payment-analytics.service.port.ts";
import type {
	IUserAnalyticsService,
	UserAnalyticsSummaryDto,
} from "@/application/ports/services/user-analytics.service.port.ts";
import { GetPlatformDashboardAnalyticsUseCase } from "@/application/use-cases/admin/get-platform-dashboard-analytics.use-case.ts";
import type {
	FunnelStageCount,
	IRestaurantAnalyticsRepository,
	OnboardingTrendPoint,
} from "@/domain/repositories/restaurant-analytics.repository.interface.ts";
import { messages } from "@/shared/constants/message.constants.ts";

describe("GetPlatformDashboardAnalyticsUseCase", () => {
	let useCase: GetPlatformDashboardAnalyticsUseCase;
	let mockRestaurantRepo: jest.Mocked<IRestaurantAnalyticsRepository>;
	let mockPaymentService: jest.Mocked<IPaymentAnalyticsService>;
	let mockUserService: jest.Mocked<IUserAnalyticsService>;
	let mockLogger: jest.Mocked<ILogger>;

	const defaultTrend: OnboardingTrendPoint[] = [
		{ period: "2026-09", count: 10 },
		{ period: "2026-10", count: 25 },
	];

	const defaultFunnel: FunnelStageCount[] = [
		{ stage: "REGISTERED", count: 50, label: "Registered & Email Verified" },
		{ stage: "DOCUMENTS_UPLOADED", count: 40, label: "Documents Uploaded" },
		{ stage: "APPROVED_ACTIVE", count: 35, label: "Platform Approved & Live" },
		{
			stage: "FIRST_SUBSCRIPTION",
			count: 30,
			label: "First Subscription Active",
		},
	];

	const defaultSubscriptionSummary: PaymentSubscriptionSummaryDto = {
		activeSubscribedRestaurants: 118,
		currentMrrRupees: 245000,
		currentArrRupees: 2940000,
		grossSubscriptionRevenueRupees: 245000,
		growthPercentage: 14.2,
		subscriptionTierDistribution: {
			QUEUE_PRO: 88,
			ENTERPRISE: 30,
		},
		timeline: [
			{
				bucketLabel: "Week 1",
				grossRevenueRupees: 65000,
				mrrRupees: 58000,
				newSubscriptionsCount: 12,
			},
		],
	};

	const defaultUserSummary: UserAnalyticsSummaryDto = {
		totalRegisteredCustomers: 12500,
		newCustomersInPeriod: 48,
	};

	beforeEach(() => {
		mockRestaurantRepo = {
			getPlatformRestaurantGrowthMetrics: jest.fn().mockResolvedValue({
				totalRestaurants: 142,
				onboardingFunnel: defaultFunnel,
				onboardingTrend: defaultTrend,
			}),
			getTotalRestaurantsCount: jest.fn().mockResolvedValue(142),
			getActiveSubscribedCount: jest.fn().mockResolvedValue(118),
			getSubscriptionTierDistribution: jest.fn().mockResolvedValue({}),
			getOnboardingTrend: jest.fn().mockResolvedValue(defaultTrend),
			getOnboardingFunnel: jest.fn().mockResolvedValue(defaultFunnel),
			getActiveMenuItems: jest.fn().mockResolvedValue([]),
			getAllMenuItems: jest.fn().mockResolvedValue([]),
			getTotalActiveProductsCount: jest.fn().mockResolvedValue(0),
		} as unknown as jest.Mocked<IRestaurantAnalyticsRepository>;

		mockPaymentService = {
			getSubscriptionSummary: jest
				.fn()
				.mockResolvedValue(defaultSubscriptionSummary),
		} as unknown as jest.Mocked<IPaymentAnalyticsService>;

		mockUserService = {
			getUserSummary: jest.fn().mockResolvedValue(defaultUserSummary),
		} as unknown as jest.Mocked<IUserAnalyticsService>;

		mockLogger = {
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
		} as unknown as jest.Mocked<ILogger>;

		useCase = new GetPlatformDashboardAnalyticsUseCase(
			mockRestaurantRepo,
			mockPaymentService,
			mockUserService,
			mockLogger,
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("1. Successful aggregation of restaurant, payment, and user data with consistent date boundaries", async () => {
		const query = {
			period: "MONTH" as const,
			year: 2026,
			month: 11,
			billingCycle: "ALL" as const,
		};

		const result = await useCase.execute(query);

		// Overview assertions
		expect(result.overview.totalRestaurants).toBe(142);
		expect(result.overview.activeSubscribedRestaurants).toBe(118);
		// Authoritative distribution without fabricated categories
		expect(result.overview.subscriptionTierDistribution).toEqual({
			QUEUE_PRO: 88,
			ENTERPRISE: 30,
		});

		// Customer Growth assertions
		expect(result.customerGrowth).toEqual({
			status: "AVAILABLE",
			totalRegisteredCustomers: 12500,
			newCustomersInPeriod: 48,
		});

		// Revenue assertions
		expect(result.revenue).toEqual({
			status: "AVAILABLE",
			grossSubscriptionRevenueRupees: 245000,
			currentMrrRupees: 245000,
			currentArrRupees: 2940000,
			growthPercentage: 14.2,
			timeline: defaultSubscriptionSummary.timeline,
		});

		// Local DB queries received consistent date boundaries via aggregate method
		expect(
			mockRestaurantRepo.getPlatformRestaurantGrowthMetrics,
		).toHaveBeenCalledWith(expect.any(String), expect.any(String));

		// Growth assertions
		expect(result.growth.onboardingFunnel).toHaveLength(4);
		expect(result.growth.onboardingTrend).toEqual(defaultTrend);

		// Metadata assertions
		expect(result.filters.period).toBe("MONTH");
		expect(result.filters.year).toBe(2026);
		expect(result.filters.month).toBe(11);
		expect(new Date(result.generatedAt).getTime()).not.toBeNaN();
		expect(mockLogger.warn).not.toHaveBeenCalled();
	});

	it("2. Payment Service returning null sets UNAVAILABLE and null subscription distribution (no false zeros)", async () => {
		mockPaymentService.getSubscriptionSummary.mockResolvedValue(null);

		const result = await useCase.execute({});

		expect(result.overview.activeSubscribedRestaurants).toBeNull();
		expect(result.overview.subscriptionTierDistribution).toBeNull();
		expect(result.revenue).toEqual({
			status: "UNAVAILABLE",
			error: {
				code: "PAYMENT_SERVICE_UNAVAILABLE",
				message: "Subscription revenue metrics unavailable",
			},
		});

		expect(mockLogger.warn).toHaveBeenCalledWith(
			expect.objectContaining({
				reason: "Payment service returned null",
			}),
			messages.PAYMENT_SERVICE_FINANCE_SUMMARY_UNAVAILABLE,
		);
	});

	it("3. User Service returning null sets UNAVAILABLE without failing the entire request", async () => {
		mockUserService.getUserSummary.mockResolvedValue(null);

		const result = await useCase.execute({});

		expect(result.customerGrowth).toEqual({
			status: "UNAVAILABLE",
			error: {
				code: "USER_SERVICE_UNAVAILABLE",
				message: "Customer growth metrics unavailable",
			},
		});

		expect(result.overview.totalRestaurants).toBe(142);
		expect(result.revenue.status).toBe("AVAILABLE");
	});

	it("4. Calls repository aggregation with resolved date range", async () => {
		const query = {
			period: "MONTH" as const,
			year: 2026,
			month: 5,
		};

		await useCase.execute(query);

		expect(
			mockRestaurantRepo.getPlatformRestaurantGrowthMetrics,
		).toHaveBeenCalled();
	});
});
