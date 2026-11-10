import type { AnalyticsPeriod } from "@/shared/constants/analytics.constants.ts";

export interface UserAnalyticsSummaryQueryDto {
	period?: AnalyticsPeriod;
	day?: number;
	month?: number;
	year?: number;
}

export interface UserAnalyticsSummaryDto {
	totalRegisteredCustomers: number;
	newCustomersInPeriod: number;
}

export interface IUserAnalyticsService {
	getUserSummary(
		query?: UserAnalyticsSummaryQueryDto,
		callerUserId?: string,
	): Promise<UserAnalyticsSummaryDto | null>;
}
