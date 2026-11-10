import type {
	AnalyticsPeriod,
	BillingCycle,
} from "@/shared/constants/analytics.constants.ts";

export interface GetPlatformDashboardAnalyticsQueryDto {
	period?: AnalyticsPeriod;
	day?: number | null;
	month?: number;
	year?: number;
	billingCycle?: BillingCycle;
	// Legacy query parameters supported for backwards compatibility
	from?: string;
	to?: string;
	fiscalYear?: number;
}

export type AnalyticsSectionStatus = "AVAILABLE" | "UNAVAILABLE";

export interface SectionErrorDto {
	code: string;
	message: string;
}

export interface CustomerGrowthSectionDto {
	status: AnalyticsSectionStatus;
	totalRegisteredCustomers?: number;
	newCustomersInPeriod?: number;
	error?: SectionErrorDto;
}

export interface RevenueTimelinePointDto {
	bucketLabel: string;
	grossRevenueRupees: number;
	mrrRupees: number;
	newSubscriptionsCount: number;
}

export interface RevenueSectionDto {
	status: AnalyticsSectionStatus;
	grossSubscriptionRevenueRupees?: number;
	currentMrrRupees?: number;
	currentArrRupees?: number;
	growthPercentage?: number | null;
	timeline?: RevenueTimelinePointDto[];
	error?: SectionErrorDto;
}

export interface PlatformOverviewDto {
	totalRestaurants: number;
	activeSubscribedRestaurants: number | null;
	totalDinersServedToday: number | null;
	subscriptionTierDistribution: Record<string, number> | null;
}

export interface FunnelStageItemDto {
	stage: string;
	count: number;
	label: string;
}

export interface OnboardingTrendItemDto {
	period: string;
	count: number;
}

export interface GeographicBreakdownItemDto {
	city: string;
	state: string;
	restaurantCount: number;
}

export interface PlatformGrowthDto {
	onboardingFunnel: FunnelStageItemDto[];
	onboardingTrend: OnboardingTrendItemDto[];
	geographicBreakdown: GeographicBreakdownItemDto[];
}

export interface PlatformDashboardFiltersDto {
	period: AnalyticsPeriod;
	day: number | null;
	month: number;
	year: number;
	billingCycle: BillingCycle;
	from?: string | null;
	to?: string | null;
}

export interface PlatformDashboardAnalyticsResponseDto {
	overview: PlatformOverviewDto;
	customerGrowth: CustomerGrowthSectionDto;
	revenue: RevenueSectionDto;
	growth: PlatformGrowthDto;
	filters: PlatformDashboardFiltersDto;
	generatedAt: string;
}
