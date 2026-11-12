import type { AnalyticsPeriod } from "@/shared/constants/analytics.constants.ts";

export interface UserAnalyticsSummaryQueryDTO {
	period?: AnalyticsPeriod;
	day?: number;
	month?: number;
	year?: number;
}

export interface UserAnalyticsSummaryDTO {
	totalRegisteredCustomers: number;
	newCustomersInPeriod: number;
}

export interface IUserAnalyticsService {
	getUserSummary(
		query?: UserAnalyticsSummaryQueryDTO,
		callerUserId?: string,
	): Promise<UserAnalyticsSummaryDTO | null>;
}
