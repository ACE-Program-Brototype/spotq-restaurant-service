import type {
	CustomerGrowthSectionDTO,
	FunnelStageItemDTO,
	PlatformDashboardAnalyticsOutputDTO,
	PlatformDashboardFiltersDTO,
	PlatformOverviewDTO,
	RevenueSectionDTO,
} from "@/application/dtos/admin/get-platform-dashboard-analytics.dto.ts";
import type { OnboardingTrendPoint } from "@/domain/repositories/restaurant-analytics.repository.interface.ts";

export interface CreatePlatformDashboardAnalyticsParams {
	overview: PlatformOverviewDTO;
	customerGrowth: CustomerGrowthSectionDTO;
	revenue: RevenueSectionDTO;
	onboardingFunnel: FunnelStageItemDTO[];
	onboardingTrend: OnboardingTrendPoint[];
	filters: PlatformDashboardFiltersDTO;
	generatedAt?: string;
}

/**
 * Transforms platform database aggregation and cross-microservice results
 * into the standardized Platform Dashboard Analytics response output DTO.
 */
export const PlatformDashboardAnalyticsMapper = {
	toOutputDTO(
		params: CreatePlatformDashboardAnalyticsParams,
	): PlatformDashboardAnalyticsOutputDTO {
		return {
			overview: params.overview,
			customerGrowth: params.customerGrowth,
			revenue: params.revenue,
			growth: {
				onboardingFunnel: params.onboardingFunnel,
				onboardingTrend: params.onboardingTrend,
			},
			filters: params.filters,
			generatedAt: params.generatedAt ?? new Date().toISOString(),
		};
	},
};
