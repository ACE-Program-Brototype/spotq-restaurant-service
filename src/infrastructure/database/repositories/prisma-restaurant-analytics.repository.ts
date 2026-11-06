import { TYPES } from "@/config/di/types.ts";
import type {
	FunnelStageCount,
	GeographicBreakdownPoint,
	IRestaurantAnalyticsRepository,
	OnboardingTrendPoint,
} from "@/domain/repositories/restaurant-analytics.repository.interface.ts";
import type { Prisma, PrismaClient } from "@prisma/client";
import { inject, injectable } from "inversify";

@injectable()
export class PrismaRestaurantAnalyticsRepository
	implements IRestaurantAnalyticsRepository {
	constructor(
		@inject(TYPES.PrismaClient)
		private readonly prisma: PrismaClient,
	) { }

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

	async getOnboardingTrend(
		from?: string,
		to?: string,
	): Promise<OnboardingTrendPoint[]> {
		const fromDate = from ? new Date(from) : null;
		const toDate = to ? new Date(to) : null;

		const results = await this.prisma.$queryRaw<OnboardingTrendPoint[]>`
			SELECT
				TO_CHAR(created_at AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM') AS period,
				COUNT(*)::int AS count
			FROM restaurants
			WHERE (${fromDate}::timestamptz IS NULL OR created_at >= ${fromDate}::timestamptz)
			  AND (${toDate}::timestamptz IS NULL OR created_at <= ${toDate}::timestamptz)
			GROUP BY period
			ORDER BY period ASC;
		`;

		return results;
	}

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
				verified: number;
				first_subscription: number;
			}>
		>`
			SELECT
				COUNT(*)::int AS registered,
				COUNT(CASE WHEN onboarding_status = 'COMPLETED' THEN 1 END)::int AS documents_uploaded,
				COUNT(CASE WHEN status IN ('APPROVED', 'ACTIVE') THEN 1 END)::int AS verified,
				COUNT(CASE WHEN subscription_plan_code IS NOT NULL OR is_subscription_active = TRUE THEN 1 END)::int AS first_subscription
			FROM restaurants
			WHERE (${fromDate}::timestamptz IS NULL OR created_at >= ${fromDate}::timestamptz)
			  AND (${toDate}::timestamptz IS NULL OR created_at <= ${toDate}::timestamptz);
		`;

		const data = results[0] ?? {
			registered: 0,
			documents_uploaded: 0,
			verified: 0,
			first_subscription: 0,
		};

		return [
			{ stage: "REGISTERED", count: data.registered },
			{ stage: "DOCUMENTS_UPLOADED", count: data.documents_uploaded },
			{ stage: "VERIFIED", count: data.verified },
			{ stage: "FIRST_SUBSCRIPTION", count: data.first_subscription },
		];
	}

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
}
