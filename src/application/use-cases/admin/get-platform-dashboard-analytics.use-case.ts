import { inject, injectable } from "inversify";
import type {
	CustomerGrowthSectionDto,
	FunnelStageItemDto,
	GetPlatformDashboardAnalyticsQueryDto,
	PlatformDashboardAnalyticsResponseDto,
	RevenueSectionDto,
} from "@/application/dtos/admin/get-platform-dashboard-analytics.dto.ts";
import type { ILogger } from "@/application/ports/services/logger.interface.ts";
import type { IPaymentAnalyticsService } from "@/application/ports/services/payment-analytics.service.port.ts";
import type { IUserAnalyticsService } from "@/application/ports/services/user-analytics.service.port.ts";
import type { IGetPlatformDashboardAnalyticsUseCase } from "@/application/ports/use-cases/admin/get-platform-dashboard-analytics.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import type { IRestaurantAnalyticsRepository } from "@/domain/repositories/restaurant-analytics.repository.interface.ts";
import type {
	AnalyticsPeriod,
	BillingCycle,
} from "@/shared/constants/analytics.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { resolveAnalyticsDateRange } from "@/shared/utils/date-range.util.ts";

@injectable()
export class GetPlatformDashboardAnalyticsUseCase
	implements IGetPlatformDashboardAnalyticsUseCase
{
	constructor(
		@inject(TYPES.Repositories.RestaurantAnalyticsRepository)
		private readonly restaurantAnalyticsRepository: IRestaurantAnalyticsRepository,
		@inject(TYPES.Services.PaymentAnalyticsService)
		private readonly paymentAnalyticsService: IPaymentAnalyticsService,
		@inject(TYPES.Services.UserAnalyticsService)
		private readonly userAnalyticsService: IUserAnalyticsService,
		@inject(TYPES.Logger.PinoClient)
		private readonly logger: ILogger,
	) {}

	public async execute(
		query: GetPlatformDashboardAnalyticsQueryDto,
		adminUserId?: string,
	): Promise<PlatformDashboardAnalyticsResponseDto> {
		const resolvedRange = resolveAnalyticsDateRange({
			period: query.period as AnalyticsPeriod | undefined,
			day: query.day,
			month: query.month,
			year: query.year,
			fiscalYear: query.fiscalYear,
			from: query.from,
			to: query.to,
		});

		const billingCycle: BillingCycle = (query.billingCycle ??
			"ALL") as BillingCycle;

		// 1. Fetch local database metrics using consistent timezone boundaries
		const totalRestaurants =
			await this.restaurantAnalyticsRepository.getTotalRestaurantsCount(
				resolvedRange.fromIso,
				resolvedRange.toIso,
			);
		const rawFunnel =
			await this.restaurantAnalyticsRepository.getOnboardingFunnel(
				resolvedRange.fromIso,
				resolvedRange.toIso,
			);
		const onboardingTrend =
			await this.restaurantAnalyticsRepository.getOnboardingTrend(
				resolvedRange.fromIso,
				resolvedRange.toIso,
			);
		const geographicBreakdown =
			await this.restaurantAnalyticsRepository.getGeographicBreakdown();

		// Format onboarding funnel stages in order
		const onboardingFunnel: FunnelStageItemDto[] = rawFunnel.map((item) => ({
			stage: item.stage,
			count: item.count,
			label: item.label || item.stage,
		}));

		// 2. Fetch external microservice metrics concurrently via Promise.allSettled
		const [paymentResultSettled, userResultSettled] = await Promise.allSettled([
			this.paymentAnalyticsService.getSubscriptionSummary(
				{
					period: resolvedRange.period,
					day: resolvedRange.day ?? undefined,
					month: resolvedRange.month,
					year: resolvedRange.year,
					billingCycle,
				},
				adminUserId,
			),
			this.userAnalyticsService.getUserSummary(
				{
					period: resolvedRange.period,
					day: resolvedRange.day ?? undefined,
					month: resolvedRange.month,
					year: resolvedRange.year,
				},
				adminUserId,
			),
		]);

		// 3. Process Payment Service response with Circuit Breaker resilience
		let activeSubscribedRestaurants: number | null = null;
		let subscriptionTierDistribution: Record<string, number> | null = null;
		let revenue: RevenueSectionDto;

		if (
			paymentResultSettled.status === "fulfilled" &&
			paymentResultSettled.value !== null
		) {
			const paymentData = paymentResultSettled.value;
			activeSubscribedRestaurants = paymentData.activeSubscribedRestaurants;
			// Authoritative subscription tier distribution from Payment Service (no fabricated categories)
			subscriptionTierDistribution = paymentData.subscriptionTierDistribution;

			revenue = {
				status: "AVAILABLE",
				grossSubscriptionRevenueRupees:
					paymentData.grossSubscriptionRevenueRupees,
				currentMrrRupees: paymentData.currentMrrRupees,
				currentArrRupees: paymentData.currentArrRupees,
				growthPercentage: paymentData.growthPercentage,
				timeline: paymentData.timeline,
			};
		} else {
			this.logger.warn(
				{
					adminUserId,
					reason:
						paymentResultSettled.status === "rejected"
							? paymentResultSettled.reason
							: "Payment service returned null",
				},
				messages.PAYMENT_SERVICE_FINANCE_SUMMARY_UNAVAILABLE,
			);

			// Explicitly null & UNAVAILABLE to avoid returning false zeros or stale local flags
			activeSubscribedRestaurants = null;
			subscriptionTierDistribution = null;
			revenue = {
				status: "UNAVAILABLE",
				error: {
					code: "PAYMENT_SERVICE_UNAVAILABLE",
					message: "Subscription revenue metrics unavailable",
				},
			};
		}

		// 4. Process User Service response with Circuit Breaker resilience
		let customerGrowth: CustomerGrowthSectionDto;

		if (
			userResultSettled.status === "fulfilled" &&
			userResultSettled.value !== null
		) {
			const userData = userResultSettled.value;
			customerGrowth = {
				status: "AVAILABLE",
				totalRegisteredCustomers: userData.totalRegisteredCustomers,
				newCustomersInPeriod: userData.newCustomersInPeriod,
			};
		} else {
			this.logger.warn(
				{
					adminUserId,
					reason:
						userResultSettled.status === "rejected"
							? userResultSettled.reason
							: "User service returned null",
				},
				messages.USER_SERVICE_ANALYTICS_UNAVAILABLE,
			);

			customerGrowth = {
				status: "UNAVAILABLE",
				error: {
					code: "USER_SERVICE_UNAVAILABLE",
					message: "Customer growth metrics unavailable",
				},
			};
		}

		return {
			overview: {
				totalRestaurants,
				activeSubscribedRestaurants,
				subscriptionTierDistribution,
			},
			customerGrowth,
			revenue,
			growth: {
				onboardingFunnel,
				onboardingTrend,
				geographicBreakdown,
			},
			filters: {
				period: resolvedRange.period,
				day: resolvedRange.day,
				month: resolvedRange.month,
				year: resolvedRange.year,
				billingCycle,
				from: query.from ?? resolvedRange.fromIso,
				to: query.to ?? resolvedRange.toIso,
			},
			generatedAt: new Date().toISOString(),
		};
	}
}
