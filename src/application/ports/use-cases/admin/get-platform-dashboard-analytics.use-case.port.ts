import type {
	GetPlatformDashboardAnalyticsQueryDto,
	PlatformDashboardAnalyticsResponseDto,
} from "@/application/dtos/admin/get-platform-dashboard-analytics.dto.ts";

export interface IGetPlatformDashboardAnalyticsUseCase {
	execute(
		query: GetPlatformDashboardAnalyticsQueryDto,
		adminUserId?: string,
	): Promise<PlatformDashboardAnalyticsResponseDto>;
}

