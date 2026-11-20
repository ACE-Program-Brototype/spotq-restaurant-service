import type {
	ANALYTICS_SECTION_STATUS,
	AnalyticsPeriod,
	AnalyticsSectionStatus,
	BillingCycle,
} from "@/shared/constants/analytics.constants.ts";

export interface GetPlatformDashboardAnalyticsInputDTO {
	period?: AnalyticsPeriod;
	day?: number | null;
	month?: number;
	year?: number;
	billingCycle?: BillingCycle;
}

export type { AnalyticsSectionStatus };

export interface SectionErrorDTO {
	code: string;
	message: string;
}

export interface CustomerGrowthSectionAvailableDTO {
	status: typeof ANALYTICS_SECTION_STATUS.AVAILABLE;
	totalRegisteredCustomers: number;
	newCustomersInPeriod: number;
}

export interface CustomerGrowthSectionUnavailableDTO {
	status: typeof ANALYTICS_SECTION_STATUS.UNAVAILABLE;
	error: SectionErrorDTO;
}

export type CustomerGrowthSectionDTO =
	| CustomerGrowthSectionAvailableDTO
	| CustomerGrowthSectionUnavailableDTO;

export interface RevenueTimelinePointDTO {
	bucketLabel: string;
	grossRevenueRupees: number;
	mrrRupees: number;
	newSubscriptionsCount: number;
}

export interface RevenueSectionAvailableDTO {
	status: typeof ANALYTICS_SECTION_STATUS.AVAILABLE;
	grossSubscriptionRevenueRupees: number;
	currentMrrRupees: number;
	currentArrRupees: number;
	growthPercentage: number | null;
	timeline: RevenueTimelinePointDTO[];
}

export interface RevenueSectionUnavailableDTO {
	status: typeof ANALYTICS_SECTION_STATUS.UNAVAILABLE;
	error: SectionErrorDTO;
}

export type RevenueSectionDTO =
	| RevenueSectionAvailableDTO
	| RevenueSectionUnavailableDTO;

export interface PlatformOverviewDTO {
	totalRestaurants: number;
	activeSubscribedRestaurants: number | null;
	subscriptionTierDistribution: Record<string, number> | null;
}

export interface FunnelStageItemDTO {
	stage: string;
	count: number;
	label: string;
}

export interface OnboardingTrendItemDTO {
	period: string;
	count: number;
}

export interface PlatformGrowthDTO {
	onboardingFunnel: FunnelStageItemDTO[];
	onboardingTrend: OnboardingTrendItemDTO[];
}

export interface PlatformDashboardFiltersDTO {
	period: AnalyticsPeriod;
	day: number | null;
	month: number;
	year: number;
	billingCycle: BillingCycle;
	from?: string | null;
	to?: string | null;
}

export interface PlatformDashboardAnalyticsOutputDTO {
	overview: PlatformOverviewDTO;
	customerGrowth: CustomerGrowthSectionDTO;
	revenue: RevenueSectionDTO;
	growth: PlatformGrowthDTO;
	filters: PlatformDashboardFiltersDTO;
	generatedAt: string;
}
