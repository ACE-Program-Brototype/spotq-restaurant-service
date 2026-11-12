import type {
	AnalyticsPeriod,
	BillingCycle,
} from "@/shared/constants/analytics.constants.ts";

export interface PaymentSubscriptionTimelineBucketDTO {
	bucketLabel: string;
	grossRevenueRupees: number;
	mrrRupees: number;
	newSubscriptionsCount: number;
}

export interface PaymentSubscriptionSummaryDTO {
	activeSubscribedRestaurants: number;
	currentMrrRupees: number;
	currentArrRupees: number;
	grossSubscriptionRevenueRupees: number;
	growthPercentage: number | null;
	subscriptionTierDistribution: Record<string, number>;
	timeline: PaymentSubscriptionTimelineBucketDTO[];
	filters?: {
		period: AnalyticsPeriod;
		day: number | null;
		month: number;
		year: number;
		billingCycle: BillingCycle;
	};
	generatedAt?: string;
}

export interface PaymentSubscriptionAnalyticsQueryDTO {
	period?: AnalyticsPeriod;
	day?: number | null;
	month?: number;
	year?: number;
	billingCycle?: BillingCycle;
}

export interface IPaymentAnalyticsService {
	getSubscriptionSummary(
		query?: PaymentSubscriptionAnalyticsQueryDTO,
		callerUserId?: string,
	): Promise<PaymentSubscriptionSummaryDTO | null>;
}
