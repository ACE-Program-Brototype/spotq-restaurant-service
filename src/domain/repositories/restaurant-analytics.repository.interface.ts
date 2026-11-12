export interface OnboardingTrendPoint {
	period: string;
	count: number;
}

export interface FunnelStageCount {
	stage: string;
	count: number;
	label?: string;
}

export interface ActiveMenuItemInfo {
	id: string;
	name: string;
	isAvailable: boolean;
}

export interface PlatformRestaurantGrowthData {
	totalRestaurants: number;
	onboardingFunnel: FunnelStageCount[];
	onboardingTrend: OnboardingTrendPoint[];
}

export interface IRestaurantAnalyticsRepository {
	getPlatformRestaurantGrowthMetrics(
		from?: string,
		to?: string,
	): Promise<PlatformRestaurantGrowthData>;
	getTotalRestaurantsCount(from?: string, to?: string): Promise<number>;
	getActiveSubscribedCount(): Promise<number>;
	getSubscriptionTierDistribution(): Promise<Record<string, number>>;
	getOnboardingTrend(
		from?: string,
		to?: string,
	): Promise<OnboardingTrendPoint[]>;
	getOnboardingFunnel(from?: string, to?: string): Promise<FunnelStageCount[]>;
	getActiveMenuItems(restaurantId: string): Promise<ActiveMenuItemInfo[]>;
	getAllMenuItems(restaurantId: string): Promise<ActiveMenuItemInfo[]>;
	getTotalActiveProductsCount(restaurantId: string): Promise<number>;
}
