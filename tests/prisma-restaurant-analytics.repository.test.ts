import { PrismaRestaurantAnalyticsRepository } from "@/infrastructure/database/repositories/prisma-restaurant-analytics.repository.ts";
import type { PrismaClient } from "@prisma/client";

describe("PrismaRestaurantAnalyticsRepository", () => {
	let mockPrisma: {
		restaurant: {
			count: jest.Mock;
			groupBy: jest.Mock;
		};
		$queryRaw: jest.Mock;
	};
	let repository: PrismaRestaurantAnalyticsRepository;

	beforeEach(() => {
		jest.clearAllMocks();
		mockPrisma = {
			restaurant: {
				count: jest.fn(),
				groupBy: jest.fn(),
			},
			$queryRaw: jest.fn(),
		};
		repository = new PrismaRestaurantAnalyticsRepository(
			mockPrisma as unknown as PrismaClient,
		);
	});

	describe("getTotalRestaurantsCount", () => {
		it("should query restaurant.count without filters when dates are omitted", async () => {
			mockPrisma.restaurant.count.mockResolvedValueOnce(42);

			const count = await repository.getTotalRestaurantsCount();

			expect(mockPrisma.restaurant.count).toHaveBeenCalledWith({ where: {} });
			expect(count).toBe(42);
		});

		it("should apply gte and lte date filters when from and to are provided", async () => {
			mockPrisma.restaurant.count.mockResolvedValueOnce(15);
			const from = "2026-01-01T00:00:00.000Z";
			const to = "2026-06-01T00:00:00.000Z";

			const count = await repository.getTotalRestaurantsCount(from, to);

			expect(mockPrisma.restaurant.count).toHaveBeenCalledWith({
				where: {
					createdAt: {
						gte: new Date(from),
						lte: new Date(to),
					},
				},
			});
			expect(count).toBe(15);
		});
	});

	describe("getActiveSubscribedCount", () => {
		it("should count restaurants where isSubscriptionActive is true", async () => {
			mockPrisma.restaurant.count.mockResolvedValueOnce(30);

			const count = await repository.getActiveSubscribedCount();

			expect(mockPrisma.restaurant.count).toHaveBeenCalledWith({
				where: { isSubscriptionActive: true },
			});
			expect(count).toBe(30);
		});
	});

	describe("getSubscriptionTierDistribution", () => {
		it("should group by subscriptionPlanCode and map counts to Record", async () => {
			mockPrisma.restaurant.groupBy.mockResolvedValueOnce([
				{ subscriptionPlanCode: "FREE_TRIAL", _count: { id: 10 } },
				{ subscriptionPlanCode: "QUEUE_PRO", _count: { id: 25 } },
				{ subscriptionPlanCode: null, _count: { id: 5 } },
			]);

			const result = await repository.getSubscriptionTierDistribution();

			expect(mockPrisma.restaurant.groupBy).toHaveBeenCalledWith({
				by: ["subscriptionPlanCode"],
				_count: { id: true },
			});
			expect(result).toEqual({
				FREE_TRIAL: 10,
				QUEUE_PRO: 25,
				UNASSIGNED: 5,
			});
		});
	});

	describe("getOnboardingTrend", () => {
		it("should execute SQL aggregation and return monthly buckets", async () => {
			const mockRows = [
				{ period: "2026-01", count: 8 },
				{ period: "2026-02", count: 12 },
			];
			mockPrisma.$queryRaw.mockResolvedValueOnce(mockRows);

			const result = await repository.getOnboardingTrend();

			expect(mockPrisma.$queryRaw).toHaveBeenCalled();
			expect(result).toEqual(mockRows);
		});
	});

	describe("getOnboardingFunnel", () => {
		it("should execute SQL aggregation and return all 4 funnel stages", async () => {
			mockPrisma.$queryRaw.mockResolvedValueOnce([
				{
					registered: 100,
					documents_uploaded: 80,
					verified: 60,
					first_subscription: 50,
				},
			]);

			const result = await repository.getOnboardingFunnel();

			expect(mockPrisma.$queryRaw).toHaveBeenCalled();
			expect(result).toEqual([
				{ stage: "REGISTERED", count: 100 },
				{ stage: "DOCUMENTS_UPLOADED", count: 80 },
				{ stage: "VERIFIED", count: 60 },
				{ stage: "FIRST_SUBSCRIPTION", count: 50 },
			]);
		});

		it("should handle empty database result gracefully with 0 counts", async () => {
			mockPrisma.$queryRaw.mockResolvedValueOnce([]);

			const result = await repository.getOnboardingFunnel();

			expect(result).toEqual([
				{ stage: "REGISTERED", count: 0 },
				{ stage: "DOCUMENTS_UPLOADED", count: 0 },
				{ stage: "VERIFIED", count: 0 },
				{ stage: "FIRST_SUBSCRIPTION", count: 0 },
			]);
		});
	});

	describe("getGeographicBreakdown", () => {
		it("should execute SQL aggregation and return city/state counts", async () => {
			const mockGeo = [
				{ city: "Kochi", state: "Kerala", restaurantCount: 45 },
				{ city: "Bengaluru", state: "Karnataka", restaurantCount: 30 },
			];
			mockPrisma.$queryRaw.mockResolvedValueOnce(mockGeo);

			const result = await repository.getGeographicBreakdown();

			expect(mockPrisma.$queryRaw).toHaveBeenCalled();
			expect(result).toEqual(mockGeo);
		});
	});
});

