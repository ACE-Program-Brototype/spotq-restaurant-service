export interface OnboardingTrendPoint {
	period: string;
	count: number;
}

export interface FunnelStageCount {
	stage: string;
	count: number;
}

export interface GeographicBreakdownPoint {
	city: string;
	state: string;
	restaurantCount: number;
}

export interface IRestaurantAnalyticsRepository {
	getTotalRestaurantsCount(from?: string, to?: string): Promise<number>;
	getActiveSubscribedCount(): Promise<number>;
	getSubscriptionTierDistribution(): Promise<Record<string, number>>;
	getOnboardingTrend(
		from?: string,
		to?: string,
	): Promise<OnboardingTrendPoint[]>;
	getOnboardingFunnel(
		from?: string,
		to?: string,
	): Promise<FunnelStageCount[]>;
	getGeographicBreakdown(): Promise<GeographicBreakdownPoint[]>;
}
