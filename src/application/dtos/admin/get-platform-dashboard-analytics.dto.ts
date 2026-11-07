export interface GetPlatformDashboardAnalyticsQueryDto {
	from?: string;
	to?: string;
	billingCycle?: "ALL" | "MONTHLY" | "YEARLY";
	fiscalYear?: number;
}

export interface PlatformDashboardAnalyticsOverviewDto {
	totalRestaurants: number;
	activeSubscribedRestaurants: number;
	mrrRupees: number | null;
	totalDinersServedToday: number | null;
	subscriptionTierDistribution: Record<string, number>;
	onboardingTrend: Array<{ period: string; count: number }>;
}

export interface PlatformDashboardAnalyticsRevenueDto {
	currentMrrRupees: number | null;
	currentArrRupees: number | null;
	grossRevenueYearToDateRupees: number | null;
	monthlyTimeline: Array<{ month: string; grossRevenueRupees: number }>;
}

export interface PlatformDashboardAnalyticsGrowthDto {
	funnel: Array<{ stage: string; count: number }>;
	geographicBreakdown: Array<{
		city: string;
		state: string;
		restaurantCount: number;
	}>;
}

export interface PlatformDashboardAnalyticsFiltersDto {
	from: string | null;
	to: string | null;
	billingCycle: string;
	fiscalYear: number | null;
}

export interface PlatformDashboardAnalyticsResponseDto {
	overview: PlatformDashboardAnalyticsOverviewDto;
	revenue: PlatformDashboardAnalyticsRevenueDto;
	growth: PlatformDashboardAnalyticsGrowthDto;
	filters: PlatformDashboardAnalyticsFiltersDto;
	generatedAt: string;
}
