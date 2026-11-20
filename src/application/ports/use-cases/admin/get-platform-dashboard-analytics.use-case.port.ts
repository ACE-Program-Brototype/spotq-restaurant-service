import type {
	GetPlatformDashboardAnalyticsInputDTO,
	PlatformDashboardAnalyticsOutputDTO,
} from "@/application/dtos/admin/get-platform-dashboard-analytics.dto.ts";

export interface IGetPlatformDashboardAnalyticsUseCase {
	execute(
		input?: GetPlatformDashboardAnalyticsInputDTO,
	): Promise<PlatformDashboardAnalyticsOutputDTO>;
}
