import type {
	AnalyticsPeriod,
	BillingCycle,
} from "@/shared/constants/analytics.constants.ts";

export interface PaymentSubscriptionTimelineBucketDto {
	bucketLabel: string;
	grossRevenueRupees: number;
	mrrRupees: number;
	newSubscriptionsCount: number;
}

export interface PaymentSubscriptionSummaryDto {
	activeSubscribedRestaurants: number;
	currentMrrRupees: number;
	currentArrRupees: number;
	grossSubscriptionRevenueRupees: number;
	growthPercentage: number | null;
	subscriptionTierDistribution: Record<string, number>;
	timeline: PaymentSubscriptionTimelineBucketDto[];
	filters?: {
		period: AnalyticsPeriod;
		day: number | null;
		month: number;
		year: number;
		billingCycle: BillingCycle;
	};
	generatedAt?: string;
}

export interface PaymentSubscriptionAnalyticsQueryDto {
	period?: AnalyticsPeriod;
	day?: number | null;
	month?: number;
	year?: number;
	billingCycle?: BillingCycle;
}

export interface PaymentFinanceTimelinePointDto {
	month: string;
	grossRevenueRupees: number;
}

export interface PaymentFinanceSummaryDto {
	currentMrrRupees: number | null;
	currentArrRupees: number | null;
	grossRevenueYearToDateRupees: number | null;
	monthlyTimeline: PaymentFinanceTimelinePointDto[];
	activeVenuesCount: number | null;
	todayTurnoverRupees: number | null;
}

export interface PaymentFinanceSummaryQueryDto {
	from?: string;
	to?: string;
	billingCycle?: BillingCycle;
	fiscalYear?: number;
}

export interface IPaymentAnalyticsService {
	getSubscriptionSummary(
		query?: PaymentSubscriptionAnalyticsQueryDto,
		callerUserId?: string,
	): Promise<PaymentSubscriptionSummaryDto | null>;
	getFinanceSummary(
		query?: PaymentFinanceSummaryQueryDto,
		adminUserId?: string,
	): Promise<PaymentFinanceSummaryDto | null>;
}
