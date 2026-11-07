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
import { messages } from "@/shared/constants/message.constants.ts";

@injectable()
export class GetPlatformDashboardAnalyticsUseCase
	implements IGetPlatformDashboardAnalyticsUseCase {
	constructor(
		@inject(TYPES.Repositories.RestaurantAnalyticsRepository)
		private readonly restaurantAnalyticsRepository: IRestaurantAnalyticsRepository,
		@inject(TYPES.Services.PaymentAnalyticsService)
		private readonly paymentAnalyticsService: IPaymentAnalyticsService,
		@inject(TYPES.Logger.PinoClient)
		private readonly logger: ILogger,
	) { }

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
		const paymentSummary = await this.paymentAnalyticsService.getFinanceSummary(
			query,
			adminUserId,
		);

		if (!paymentSummary) {
			this.logger.warn(
				{ adminUserId, query },
				messages.PAYMENT_SERVICE_FINANCE_SUMMARY_UNAVAILABLE,
			);
		}

		return {
			overview: {
				totalRestaurants,
				activeSubscribedRestaurants:
					paymentSummary?.activeVenuesCount != null
						? paymentSummary.activeVenuesCount
						: activeSubscribedRestaurants,
				mrrRupees: paymentSummary?.currentMrrRupees ?? null,
				// NOTE: Order Service does not store guest count or party size.
				// Explicitly null to distinguish lack of measurement from a measured 0.
				totalDinersServedToday: null,
				subscriptionTierDistribution,
				onboardingTrend,
			},
			revenue: {
				currentMrrRupees: paymentSummary?.currentMrrRupees ?? null,
				currentArrRupees: paymentSummary?.currentArrRupees ?? null,
				grossRevenueYearToDateRupees:
					paymentSummary?.grossRevenueYearToDateRupees ?? null,
				monthlyTimeline: paymentSummary?.monthlyTimeline ?? [],
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
