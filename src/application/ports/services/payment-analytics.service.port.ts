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

export interface IPaymentAnalyticsService {
	getSubscriptionSummary(
		query?: PaymentSubscriptionAnalyticsQueryDto,
		callerUserId?: string,
	): Promise<PaymentSubscriptionSummaryDto | null>;
}
