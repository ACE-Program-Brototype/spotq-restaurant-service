import "reflect-metadata";
import type { ILogger } from "@/application/ports/services/logger.interface.ts";
import type {
	IPaymentAnalyticsService,
	PaymentFinanceSummaryDto,
} from "@/application/ports/services/payment-analytics.service.port.ts";
import { GetPlatformDashboardAnalyticsUseCase } from "@/application/use-cases/admin/get-platform-dashboard-analytics.use-case.ts";
import type {
	FunnelStageCount,
	GeographicBreakdownPoint,
	IRestaurantAnalyticsRepository,
	OnboardingTrendPoint,
} from "@/domain/repositories/restaurant-analytics.repository.interface.ts";

describe("GetPlatformDashboardAnalyticsUseCase", () => {
	let useCase: GetPlatformDashboardAnalyticsUseCase;
	let mockRestaurantRepo: jest.Mocked<IRestaurantAnalyticsRepository>;
	let mockPaymentService: jest.Mocked<IPaymentAnalyticsService>;
	let mockLogger: jest.Mocked<ILogger>;

	const defaultTrend: OnboardingTrendPoint[] = [
		{ period: "2026-09", count: 10 },
		{ period: "2026-10", count: 25 },
	];

	const defaultFunnel: FunnelStageCount[] = [
		{ stage: "REGISTERED", count: 50 },
		{ stage: "DOCUMENTS_UPLOADED", count: 40 },
		{ stage: "VERIFIED", count: 35 },
		{ stage: "FIRST_SUBSCRIPTION", count: 30 },
	];

	const defaultGeo: GeographicBreakdownPoint[] = [
		{ city: "Bengaluru", state: "Karnataka", restaurantCount: 20 },
		{ city: "Mumbai", state: "Maharashtra", restaurantCount: 15 },
	];

	const defaultTiers: Record<string, number> = {
		FREE: 15,
		PRO: 10,
		ENTERPRISE: 5,
	};

	const defaultFinanceSummary: PaymentFinanceSummaryDto = {
		currentMrrRupees: 250000,
		currentArrRupees: 3000000,
		activeVenuesCount: 30,
		todayTurnoverRupees: 50000,
	};

	beforeEach(() => {
		mockRestaurantRepo = {
			getTotalRestaurantsCount: jest.fn().mockResolvedValue(50),
			getActiveSubscribedCount: jest.fn().mockResolvedValue(30),
			getSubscriptionTierDistribution: jest.fn().mockResolvedValue(defaultTiers),
			getOnboardingTrend: jest.fn().mockResolvedValue(defaultTrend),
			getOnboardingFunnel: jest.fn().mockResolvedValue(defaultFunnel),
			getGeographicBreakdown: jest.fn().mockResolvedValue(defaultGeo),
		};

		mockPaymentService = {
			getFinanceSummary: jest.fn().mockResolvedValue(defaultFinanceSummary),
		};

		mockLogger = {
			info: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
		};

		useCase = new GetPlatformDashboardAnalyticsUseCase(
			mockRestaurantRepo,
			mockPaymentService,
			mockLogger,
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("1. Successful aggregation of restaurant and payment data", async () => {
		const query = {
			from: "2026-01-01T00:00:00.000Z",
			to: "2026-10-31T23:59:59.999Z",
			billingCycle: "MONTHLY" as const,
			fiscalYear: 2026,
		};

		const result = await useCase.execute(query, "admin-123");

		// Overview assertions
		expect(result.overview.totalRestaurants).toBe(50);
		expect(result.overview.activeSubscribedRestaurants).toBe(30);
		expect(result.overview.mrrRupees).toBe(250000);
		expect(result.overview.totalDinersServedToday).toBe(0);
		expect(result.overview.subscriptionTierDistribution).toEqual(defaultTiers);
		expect(result.overview.onboardingTrend).toEqual(defaultTrend);

		// Revenue assertions
		expect(result.revenue.currentMrrRupees).toBe(250000);
		expect(result.revenue.currentArrRupees).toBe(3000000);
		expect(result.revenue.grossRevenueYearToDateRupees).toBe(0);
		expect(result.revenue.monthlyTimeline).toEqual([]);

		// Growth assertions
		expect(result.growth.funnel).toEqual(defaultFunnel);
		expect(result.growth.geographicBreakdown).toEqual(defaultGeo);

		// Filters & metadata assertions
		expect(result.filters).toEqual({
			from: "2026-01-01T00:00:00.000Z",
			to: "2026-10-31T23:59:59.999Z",
			billingCycle: "MONTHLY",
			fiscalYear: 2026,
		});
		expect(new Date(result.generatedAt).getTime()).not.toBeNaN();
		expect(mockLogger.warn).not.toHaveBeenCalled();
	});

	it("2. Payment Service returning null applies fallbacks and logs warning", async () => {
		mockPaymentService.getFinanceSummary.mockResolvedValue(null);

		const result = await useCase.execute({}, "admin-123");

		expect(result.overview.mrrRupees).toBe(0);
		expect(result.revenue.currentMrrRupees).toBe(0);
		expect(result.revenue.currentArrRupees).toBe(0);
		expect(result.revenue.grossRevenueYearToDateRupees).toBe(0);
		expect(result.overview.totalRestaurants).toBe(50);

		expect(mockLogger.warn).toHaveBeenCalledWith(
			expect.objectContaining({ adminUserId: "admin-123" }),
			expect.stringContaining("Payment service finance summary is unavailable"),
		);
	});

	it("3. Repository failure propagation", async () => {
		const repoError = new Error("Database query execution failed");
		mockRestaurantRepo.getTotalRestaurantsCount.mockRejectedValue(repoError);

		await expect(useCase.execute({}, "admin-123")).rejects.toThrow(
			"Database query execution failed",
		);
	});

	it("4. Correct query-filter forwarding to repository methods", async () => {
		const query = {
			from: "2026-03-01T00:00:00.000Z",
			to: "2026-08-31T23:59:59.999Z",
		};

		await useCase.execute(query, "admin-123");

		expect(mockRestaurantRepo.getTotalRestaurantsCount).toHaveBeenCalledWith(
			"2026-03-01T00:00:00.000Z",
			"2026-08-31T23:59:59.999Z",
		);
		expect(mockRestaurantRepo.getOnboardingTrend).toHaveBeenCalledWith(
			"2026-03-01T00:00:00.000Z",
			"2026-08-31T23:59:59.999Z",
		);
		expect(mockRestaurantRepo.getOnboardingFunnel).toHaveBeenCalledWith(
			"2026-03-01T00:00:00.000Z",
			"2026-08-31T23:59:59.999Z",
		);
		expect(mockRestaurantRepo.getActiveSubscribedCount).toHaveBeenCalledTimes(1);
		expect(mockRestaurantRepo.getSubscriptionTierDistribution).toHaveBeenCalledTimes(1);
		expect(mockRestaurantRepo.getGeographicBreakdown).toHaveBeenCalledTimes(1);
	});

	it("5. Correct admin user ID forwarding to payment service", async () => {
		await useCase.execute({}, "super-admin-uuid-999");

		expect(mockPaymentService.getFinanceSummary).toHaveBeenCalledWith(
			"super-admin-uuid-999",
		);
	});
});

