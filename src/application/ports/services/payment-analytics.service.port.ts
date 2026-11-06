export interface PaymentFinanceSummaryDto {
	currentMrrRupees: number;
	/** Annualized MRR (currentMrrRupees * 12) */
	currentArrRupees: number;
	activeVenuesCount: number;
	todayTurnoverRupees: number;
}

export interface IPaymentAnalyticsService {
	getFinanceSummary(
		adminUserId?: string,
	): Promise<PaymentFinanceSummaryDto | null>;
}
