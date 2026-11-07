import type { GetPlatformDashboardAnalyticsQueryDto } from "@/application/dtos/admin/get-platform-dashboard-analytics.dto.ts";

export interface PaymentFinanceTimelinePointDto {
	month: string;
	grossRevenueRupees: number;
}

export interface PaymentFinanceSummaryDto {
	currentMrrRupees: number | null;
	currentArrRupees: number | null;
	grossRevenueYearToDateRupees: number | null;
	monthlyTimeline: PaymentFinanceTimelinePointDto[];
	activeVenuesCount: number | null;
	todayTurnoverRupees: number | null;
}

export interface IPaymentAnalyticsService {
	getFinanceSummary(
		query?: GetPlatformDashboardAnalyticsQueryDto,
		adminUserId?: string,
	): Promise<PaymentFinanceSummaryDto | null>;
}
