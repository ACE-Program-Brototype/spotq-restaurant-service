import { inject, injectable } from "inversify";
import type {
	CustomerGrowthSectionDTO,
	FunnelStageItemDTO,
	GetPlatformDashboardAnalyticsInputDTO,
	PlatformDashboardAnalyticsOutputDTO,
	RevenueSectionDTO,
} from "@/application/dtos/admin/get-platform-dashboard-analytics.dto.ts";
import type { ILogger } from "@/application/ports/services/logger.interface.ts";
import type { IPaymentAnalyticsService } from "@/application/ports/services/payment-analytics.service.port.ts";
import type { IUserAnalyticsService } from "@/application/ports/services/user-analytics.service.port.ts";
import type { IGetPlatformDashboardAnalyticsUseCase } from "@/application/ports/use-cases/admin/get-platform-dashboard-analytics.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import type { IRestaurantAnalyticsRepository } from "@/domain/repositories/restaurant-analytics.repository.interface.ts";
import {
	ANALYTICS_ERROR_CODES,
	ANALYTICS_SECTION_STATUS,
	BILLING_CYCLES,
	PROMISE_STATUS,
	type AnalyticsPeriod,
	type BillingCycle,
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
		input: GetPlatformDashboardAnalyticsInputDTO = {},
	): Promise<PlatformDashboardAnalyticsOutputDTO> {
		const resolvedRange = resolveAnalyticsDateRange({
			period: input.period as AnalyticsPeriod | undefined,
			day: input.day,
			month: input.month,
			year: input.year,
		});

		const billingCycle: BillingCycle =
			input.billingCycle ?? BILLING_CYCLES.ALL;

		// 1. Fetch local database metrics concurrently via single repository aggregation method
		const restaurantGrowth =
			await this.restaurantAnalyticsRepository.getPlatformRestaurantGrowthMetrics(
				resolvedRange.fromIso,
				resolvedRange.toIso,
			);

		// Format onboarding funnel stages in order
		const onboardingFunnel: FunnelStageItemDTO[] =
			restaurantGrowth.onboardingFunnel.map((item) => ({
				stage: item.stage,
				count: item.count,
				label: item.label || item.stage,
			}));

		// 2. Fetch external microservice metrics concurrently via Promise.allSettled
		const [paymentResultSettled, userResultSettled] = await Promise.allSettled([
			this.paymentAnalyticsService.getSubscriptionSummary({
				period: resolvedRange.period,
				day: resolvedRange.day ?? undefined,
				month: resolvedRange.month,
				year: resolvedRange.year,
				billingCycle,
			}),
			this.userAnalyticsService.getUserSummary({
				period: resolvedRange.period,
				day: resolvedRange.day ?? undefined,
				month: resolvedRange.month,
				year: resolvedRange.year,
			}),
		]);

		// 3. Process Payment Service response with Circuit Breaker resilience
		let activeSubscribedRestaurants: number | null = null;
		let subscriptionTierDistribution: Record<string, number> | null = null;
		let revenue: RevenueSectionDTO;

		if (
			paymentResultSettled.status === PROMISE_STATUS.FULFILLED &&
			paymentResultSettled.value !== null
		) {
			const paymentData = paymentResultSettled.value;
			activeSubscribedRestaurants = paymentData.activeSubscribedRestaurants;
			subscriptionTierDistribution = paymentData.subscriptionTierDistribution;

			revenue = {
				status: ANALYTICS_SECTION_STATUS.AVAILABLE,
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
					reason:
						paymentResultSettled.status === PROMISE_STATUS.REJECTED
							? paymentResultSettled.reason
							: "Payment service returned null",
				},
				messages.PAYMENT_SERVICE_FINANCE_SUMMARY_UNAVAILABLE,
			);

			// Explicitly null & UNAVAILABLE to avoid returning false zeros or stale local flags
			activeSubscribedRestaurants = null;
			subscriptionTierDistribution = null;
			revenue = {
				status: ANALYTICS_SECTION_STATUS.UNAVAILABLE,
				error: {
					code: ANALYTICS_ERROR_CODES.PAYMENT_SERVICE_UNAVAILABLE,
					message: messages.SUBSCRIPTION_REVENUE_METRICS_UNAVAILABLE,
				},
			};
		}

		// 4. Process User Service response with Circuit Breaker resilience
		let customerGrowth: CustomerGrowthSectionDTO;

		if (
			userResultSettled.status === PROMISE_STATUS.FULFILLED &&
			userResultSettled.value !== null
		) {
			const userData = userResultSettled.value;
			customerGrowth = {
				status: ANALYTICS_SECTION_STATUS.AVAILABLE,
				totalRegisteredCustomers: userData.totalRegisteredCustomers,
				newCustomersInPeriod: userData.newCustomersInPeriod,
			};
		} else {
			this.logger.warn(
				{
					reason:
						userResultSettled.status === PROMISE_STATUS.REJECTED
							? userResultSettled.reason
							: "User service returned null",
				},
				messages.USER_SERVICE_ANALYTICS_UNAVAILABLE,
			);

			customerGrowth = {
				status: ANALYTICS_SECTION_STATUS.UNAVAILABLE,
				error: {
					code: ANALYTICS_ERROR_CODES.USER_SERVICE_UNAVAILABLE,
					message: messages.CUSTOMER_GROWTH_METRICS_UNAVAILABLE,
				},
			};
		}

		return {
			overview: {
				totalRestaurants: restaurantGrowth.totalRestaurants,
				activeSubscribedRestaurants,
				subscriptionTierDistribution,
			},
			customerGrowth,
			revenue,
			growth: {
				onboardingFunnel,
				onboardingTrend: restaurantGrowth.onboardingTrend,
				geographicBreakdown: restaurantGrowth.geographicBreakdown,
			},
			filters: {
				period: resolvedRange.period,
				day: resolvedRange.day,
				month: resolvedRange.month,
				year: resolvedRange.year,
				billingCycle,
				from: resolvedRange.fromIso,
				to: resolvedRange.toIso,
			},
			generatedAt: new Date().toISOString(),
		};
	}
}
