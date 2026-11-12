import type { Prisma, PrismaClient } from "@prisma/client";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types.ts";
import type {
	ActiveMenuItemInfo,
	FunnelStageCount,
	GeographicBreakdownPoint,
	IRestaurantAnalyticsRepository,
	OnboardingTrendPoint,
	PlatformRestaurantGrowthData,
} from "@/domain/repositories/restaurant-analytics.repository.interface.ts";
import { REPORTING_TIMEZONE } from "@/shared/constants/analytics.constants.ts";

@injectable()
export class PrismaRestaurantAnalyticsRepository
	implements IRestaurantAnalyticsRepository
{
	constructor(
		@inject(TYPES.PrismaClient)
		private readonly prisma: PrismaClient,
	) {}

	private buildDateFilter(
		from?: string,
		to?: string,
	): Prisma.RestaurantWhereInput {
		if (!from && !to) {
			return {};
		}
		const createdAt: Prisma.DateTimeFilter = {};
		if (from) {
			createdAt.gte = new Date(from);
		}
		if (to) {
			createdAt.lte = new Date(to);
		}
		return { createdAt };
	}

	/**
	 * Aggregates platform-wide restaurant growth metrics concurrently.
	 * Optimizes database roundtrips by deriving total registered restaurants
	 * directly from the onboarding funnel's COUNT(*) aggregation.
	 */
	async getPlatformRestaurantGrowthMetrics(
		from?: string,
		to?: string,
	): Promise<PlatformRestaurantGrowthData> {
		const [onboardingFunnel, onboardingTrend, geographicBreakdown] =
			await Promise.all([
				this.getOnboardingFunnel(from, to),
				this.getOnboardingTrend(from, to),
				this.getGeographicBreakdown(),
			]);

		const totalRestaurants =
			onboardingFunnel.find((stage) => stage.stage === "REGISTERED")?.count ??
			0;

		return {
			totalRestaurants,
			onboardingFunnel,
			onboardingTrend,
			geographicBreakdown,
		};
	}

	async getTotalRestaurantsCount(from?: string, to?: string): Promise<number> {
		const where = this.buildDateFilter(from, to);
		return await this.prisma.restaurant.count({ where });
	}

	async getActiveSubscribedCount(): Promise<number> {
		return await this.prisma.restaurant.count({
			where: { isSubscriptionActive: true },
		});
	}

	async getSubscriptionTierDistribution(): Promise<Record<string, number>> {
		const groups = await this.prisma.restaurant.groupBy({
			by: ["subscriptionPlanCode"],
			_count: {
				id: true,
			},
		});

		const distribution: Record<string, number> = {};
		for (const group of groups) {
			const key = group.subscriptionPlanCode ?? "UNASSIGNED";
			distribution[key] = group._count.id;
		}

		return distribution;
	}

	/**
	 * Computes monthly onboarding trends aggregated by reporting timezone.
	 *
	 * Security Note:
	 * Uses Prisma's tagged template literal `$queryRaw` which transforms all
	 * interpolated variables (${fromDate}, ${toDate}, ${REPORTING_TIMEZONE})
	 * into parameterized PostgreSQL bind variables ($1, $2, etc.), preventing SQL injection.
	 *
	 * Technical Rationale:
	 * Raw SQL is required because Prisma's ORM groupBy does not support SQL date truncation
	 * or timezone conversion (TO_CHAR(created_at AT TIME ZONE ..., 'YYYY-MM')).
	 */
	async getOnboardingTrend(
		from?: string,
		to?: string,
	): Promise<OnboardingTrendPoint[]> {
		const fromDate = from ? new Date(from) : null;
		const toDate = to ? new Date(to) : null;

		const results = await this.prisma.$queryRaw<OnboardingTrendPoint[]>`
			SELECT
				TO_CHAR(created_at AT TIME ZONE ${REPORTING_TIMEZONE}, 'YYYY-MM') AS period,
				COUNT(*)::int AS count
			FROM restaurants
			WHERE (${fromDate}::timestamptz IS NULL OR created_at >= ${fromDate}::timestamptz)
			  AND (${toDate}::timestamptz IS NULL OR created_at <= ${toDate}::timestamptz)
			GROUP BY period
			ORDER BY period ASC;
		`;

		return results;
	}

	/**
	 * Aggregates restaurant onboarding lifecycle stages into a single-pass funnel.
	 *
	 * Security Note:
	 * Uses Prisma's parameterized `$queryRaw` tagged template literal to ensure all
	 * date filters are safely bound as typed parameters.
	 *
	 * Technical Rationale:
	 * A single conditional aggregation query (COUNT(CASE WHEN ...)) executes all 4 stages
	 * in 1 database roundtrip instead of 4 sequential or separate Prisma count queries.
	 */
	async getOnboardingFunnel(
		from?: string,
		to?: string,
	): Promise<FunnelStageCount[]> {
		const fromDate = from ? new Date(from) : null;
		const toDate = to ? new Date(to) : null;

		const results = await this.prisma.$queryRaw<
			Array<{
				registered: number;
				documents_uploaded: number;
				approved_active: number;
				first_subscription: number;
			}>
		>`
			SELECT
				COUNT(*)::int AS registered,
				COUNT(CASE WHEN onboarding_status = 'COMPLETED' THEN 1 END)::int AS documents_uploaded,
				COUNT(CASE WHEN status IN ('APPROVED', 'ACTIVE') THEN 1 END)::int AS approved_active,
				COUNT(CASE WHEN subscription_plan_code IS NOT NULL OR is_subscription_active = TRUE THEN 1 END)::int AS first_subscription
			FROM restaurants
			WHERE (${fromDate}::timestamptz IS NULL OR created_at >= ${fromDate}::timestamptz)
			  AND (${toDate}::timestamptz IS NULL OR created_at <= ${toDate}::timestamptz);
		`;

		const data = results[0] ?? {
			registered: 0,
			documents_uploaded: 0,
			approved_active: 0,
			first_subscription: 0,
		};

		return [
			{
				stage: "REGISTERED",
				count: data.registered,
				label: "Registered & Email Verified",
			},
			{
				stage: "DOCUMENTS_UPLOADED",
				count: data.documents_uploaded,
				label: "Documents Uploaded",
			},
			{
				stage: "APPROVED_ACTIVE",
				count: data.approved_active,
				label: "Platform Approved & Live",
			},
			{
				stage: "FIRST_SUBSCRIPTION",
				count: data.first_subscription,
				label: "First Subscription Active",
			},
		];
	}

	/**
	 * Aggregates geographic distribution of restaurants across cities and states.
	 *
	 * Security Note:
	 * Parameter-free query using Prisma's tagged template literal.
	 *
	 * Technical Rationale:
	 * Requires cross-table join and text normalization (INITCAP(TRIM(...)))
	 * with DISTINCT counting not expressible in standard Prisma aggregations.
	 */
	async getGeographicBreakdown(): Promise<GeographicBreakdownPoint[]> {
		const results = await this.prisma.$queryRaw<GeographicBreakdownPoint[]>`
			SELECT
				INITCAP(TRIM(ra.city)) AS city,
				INITCAP(TRIM(ra.state)) AS state,
				COUNT(DISTINCT ra.restaurant_id)::int AS "restaurantCount"
			FROM restaurant_addresses ra
			INNER JOIN restaurants r ON r.id = ra.restaurant_id
			GROUP BY INITCAP(TRIM(ra.city)), INITCAP(TRIM(ra.state))
			ORDER BY "restaurantCount" DESC;
		`;

		return results;
	}

	async getActiveMenuItems(
		restaurantId: string,
	): Promise<ActiveMenuItemInfo[]> {
		const items = await this.prisma.menuItem.findMany({
			where: {
				restaurantId,
				isAvailable: true,
				isDeleted: false,
			},
			select: {
				id: true,
				name: true,
				isAvailable: true,
			},
			orderBy: {
				name: "asc",
			},
		});

		return items;
	}

	async getAllMenuItems(restaurantId: string): Promise<ActiveMenuItemInfo[]> {
		const items = await this.prisma.menuItem.findMany({
			where: {
				restaurantId,
				isDeleted: false,
			},
			select: {
				id: true,
				name: true,
				isAvailable: true,
			},
			orderBy: {
				name: "asc",
			},
		});

		return items;
	}

	async getTotalActiveProductsCount(restaurantId: string): Promise<number> {
		return await this.prisma.menuItem.count({
			where: {
				restaurantId,
				isAvailable: true,
				isDeleted: false,
			},
		});
	}
}
