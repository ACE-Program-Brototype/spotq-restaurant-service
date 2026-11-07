import { inject, injectable } from "inversify";
import type {
	GetPlatformDashboardAnalyticsQueryDto,
	PlatformDashboardAnalyticsResponseDto,
} from "@/application/dtos/admin/get-platform-dashboard-analytics.dto.ts";
import type { ILogger } from "@/application/ports/services/logger.interface.ts";
import type { IPaymentAnalyticsService } from "@/application/ports/services/payment-analytics.service.port.ts";
import type { IGetPlatformDashboardAnalyticsUseCase } from "@/application/ports/use-cases/admin/get-platform-dashboard-analytics.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import type { IRestaurantAnalyticsRepository } from "@/domain/repositories/restaurant-analytics.repository.interface.ts";

@injectable()
export class GetPlatformDashboardAnalyticsUseCase
	implements IGetPlatformDashboardAnalyticsUseCase
{
	constructor(
		@inject(TYPES.Repositories.RestaurantAnalyticsRepository)
		private readonly restaurantAnalyticsRepository: IRestaurantAnalyticsRepository,
		@inject(TYPES.Services.PaymentAnalyticsService)
		private readonly paymentAnalyticsService: IPaymentAnalyticsService,
		@inject(TYPES.Logger.PinoClient)
		private readonly logger: ILogger,
	) {}

	public async execute(
		query: GetPlatformDashboardAnalyticsQueryDto,
		adminUserId?: string,
	): Promise<PlatformDashboardAnalyticsResponseDto> {
		// Run database queries sequentially to prevent connection pool exhaustion on limited database instances (e.g. Aiven)
		const totalRestaurants =
			await this.restaurantAnalyticsRepository.getTotalRestaurantsCount(
				query.from,
				query.to,
			);
		const activeSubscribedRestaurants =
			await this.restaurantAnalyticsRepository.getActiveSubscribedCount();
		const subscriptionTierDistribution =
			await this.restaurantAnalyticsRepository.getSubscriptionTierDistribution();
		const onboardingTrend =
			await this.restaurantAnalyticsRepository.getOnboardingTrend(
				query.from,
				query.to,
			);
		const onboardingFunnel =
			await this.restaurantAnalyticsRepository.getOnboardingFunnel(
				query.from,
				query.to,
			);
		const geographicBreakdown =
			await this.restaurantAnalyticsRepository.getGeographicBreakdown();
		const paymentSummary =
			await this.paymentAnalyticsService.getFinanceSummary(adminUserId);

		if (!paymentSummary) {
			this.logger.warn(
				{ adminUserId, query },
				"Payment service finance summary is unavailable. Fallback zero values applied for revenue metrics.",
			);
		}

		return {
			overview: {
				totalRestaurants,
				activeSubscribedRestaurants,
				mrrRupees: paymentSummary ? paymentSummary.currentMrrRupees : 0,
				// NOTE: Order Service does not yet expose a platform-wide diner metric.
				// Defaulted to 0 pending Order Service platform analytics integration.
				totalDinersServedToday: 0,
				subscriptionTierDistribution,
				onboardingTrend,
			},
			revenue: {
				currentMrrRupees: paymentSummary ? paymentSummary.currentMrrRupees : 0,
				currentArrRupees: paymentSummary ? paymentSummary.currentArrRupees : 0,
				// NOTE: Payment Service does not provide a Year-To-Date gross revenue metric.
				// Defaulted to 0 pending a dedicated YTD revenue endpoint from Payment Service.
				grossRevenueYearToDateRupees: 0,
				// NOTE: Payment Service GET /admin/finance/summary provides aggregate figures,
				// not monthly revenue timelines. Kept as empty array until endpoint is available.
				monthlyTimeline: [],
			},
			growth: {
				funnel: onboardingFunnel,
				geographicBreakdown,
			},
			filters: {
				from: query.from ?? null,
				to: query.to ?? null,
				billingCycle: query.billingCycle ?? "ALL",
				fiscalYear: query.fiscalYear ?? null,
			},
			generatedAt: new Date().toISOString(),
		};
	}
}
