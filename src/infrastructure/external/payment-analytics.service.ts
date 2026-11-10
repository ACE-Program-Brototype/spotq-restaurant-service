import { PAYMENT_SERVICE_ROUTES } from "@shared/constants/route.constants.ts";
import { generateToken, type TokenIssuerConfig } from "@spotq-org/s2s-core";
import axios from "axios";
import { inject, injectable } from "inversify";
import { z } from "zod";
import type { ILogger } from "@/application/ports/services/logger.interface.ts";
import type {
	IPaymentAnalyticsService,
	PaymentFinanceSummaryDto,
	PaymentFinanceSummaryQueryDto,
	PaymentSubscriptionAnalyticsQueryDto,
	PaymentSubscriptionSummaryDto,
} from "@/application/ports/services/payment-analytics.service.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { env } from "@/config/env.ts";
import { CircuitBreaker } from "@/infrastructure/resilience/circuit-breaker.ts";

const paymentSubscriptionSummarySchema = z.object({
	activeSubscribedRestaurants: z.number().int().nonnegative(),
	currentMrrRupees: z.number().nonnegative(),
	currentArrRupees: z.number().nonnegative(),
	grossSubscriptionRevenueRupees: z.number().nonnegative(),
	growthPercentage: z.number().nullable().optional(),
	subscriptionTierDistribution: z.record(z.string(), z.number()),
	timeline: z.array(
		z.object({
			bucketLabel: z.string(),
			grossRevenueRupees: z.number(),
			mrrRupees: z.number(),
			newSubscriptionsCount: z.number(),
		}),
	),
});

interface PaymentSummaryTimelinePointApiData {
	period: string;
	revenuePaise: string;
}

interface PaymentSummaryApiData {
	currency: string;
	masterBalancePaise: string;
	todayTurnoverPaise?: string;
	tonightEodPayoutQueuePaise?: string;
	lifetimeDisbursedPaise?: string;
	totalRefundsProcessedPaise?: string;
	saasSubscriptionMrrPaise?: string;
	saasSubscriptionArrPaise?: string;
	grossRevenueYearToDatePaise?: string;
	monthlyTimeline?: PaymentSummaryTimelinePointApiData[];
	activeVenuesCount?: number;
}

interface PaymentSummaryApiResponse {
	success?: boolean;
	data?: PaymentSummaryApiData | null;
}

interface SubscriptionSummaryApiResponse {
	success?: boolean;
	data?: PaymentSubscriptionSummaryDto | null;
}

@injectable()
export class PaymentAnalyticsService implements IPaymentAnalyticsService {
	private readonly baseUrl: string;
	private readonly serviceName: string;
	private readonly targetServiceName: string;
	private readonly privateKey: string;
	private readonly circuitBreaker: CircuitBreaker;

	constructor(
		@inject(TYPES.Logger.PinoClient)
		private readonly logger: ILogger,
		baseUrl: string = env.PAYMENT_SERVICE_URL,
		serviceName: string = env.S2S_AUDIENCE || "restaurant-service",
		targetServiceName: string = env.PAYMENT_SERVICE_NAME || "payment-service",
		privateKey?: string,
	) {
		this.baseUrl = baseUrl.replace(/\/$/, "");
		this.serviceName = serviceName;
		this.targetServiceName = targetServiceName;
		this.privateKey = privateKey ?? env.S2S_PRIVATE_KEY;
		this.circuitBreaker = new CircuitBreaker("payment-service", {
			failureThreshold: 5,
			cooldownPeriodMs: 30_000,
			requestTimeoutMs: 3_000,
		});
	}

	private getInternalHeaders(adminUserId?: string): Record<string, string> {
		const headers: Record<string, string> = {
			Accept: "application/json",
			"X-Caller-Service": this.serviceName,
			"x-user-id": adminUserId || "system-admin",
			"x-user-role": "admin",
		};

		if (this.privateKey) {
			try {
				const issuerConfig: TokenIssuerConfig = {
					serviceName: this.serviceName,
					privateKey: this.privateKey,
				};
				const token = generateToken(this.targetServiceName, issuerConfig);
				headers.Authorization = `Bearer ${token}`;
			} catch (error) {
				this.logger.error(
					{ error, targetServiceName: this.targetServiceName },
					"Failed to generate S2S token for payment-service",
				);
			}
		}

		return headers;
	}

	private isSuccessfulResponse(
		payload: unknown,
	): payload is PaymentSummaryApiResponse & {
		success: true;
		data: PaymentSummaryApiData;
	} {
		return (
			payload !== null &&
			typeof payload === "object" &&
			(payload as PaymentSummaryApiResponse).success === true &&
			"data" in payload &&
			typeof (payload as PaymentSummaryApiResponse).data === "object" &&
			(payload as PaymentSummaryApiResponse).data !== null
		);
	}

	private toFinanceSummary(
		data: PaymentSummaryApiData,
	): PaymentFinanceSummaryDto {
		const currentMrrRupees =
			data.saasSubscriptionMrrPaise != null
				? Number(BigInt(data.saasSubscriptionMrrPaise)) / 100
				: null;

		const currentArrRupees =
			data.saasSubscriptionArrPaise != null
				? Number(BigInt(data.saasSubscriptionArrPaise)) / 100
				: null;

		const grossRevenueYearToDateRupees =
			data.grossRevenueYearToDatePaise != null
				? Number(BigInt(data.grossRevenueYearToDatePaise)) / 100
				: null;

		const monthlyTimeline = (data.monthlyTimeline || []).map((point) => ({
			month: point.period,
			grossRevenueRupees: Number(BigInt(point.revenuePaise || "0")) / 100,
		}));

		const todayTurnoverRupees =
			data.todayTurnoverPaise != null
				? Number(BigInt(data.todayTurnoverPaise)) / 100
				: null;

		return {
			currentMrrRupees,
			currentArrRupees,
			grossRevenueYearToDateRupees,
			monthlyTimeline,
			activeVenuesCount: data.activeVenuesCount ?? null,
			todayTurnoverRupees,
		};
	}

	public async getSubscriptionSummary(
		query?: PaymentSubscriptionAnalyticsQueryDto,
		callerUserId?: string,
	): Promise<PaymentSubscriptionSummaryDto | null> {
		try {
			return await this.circuitBreaker.execute(async (signal) => {
				const url = `${this.baseUrl}${PAYMENT_SERVICE_ROUTES.ANALYTICS_SUBSCRIPTIONS_SUMMARY}`;
				const response = await axios.get<SubscriptionSummaryApiResponse>(url, {
					headers: this.getInternalHeaders(callerUserId),
					params: {
						period: query?.period,
						day: query?.day,
						month: query?.month,
						year: query?.year,
						billingCycle: query?.billingCycle,
					},
					signal,
				});

				if (response.data?.success && response.data?.data) {
					const validated = paymentSubscriptionSummarySchema.safeParse(
						response.data.data,
					);
					if (validated.success) {
						return validated.data as PaymentSubscriptionSummaryDto;
					}
					this.logger.warn(
						{
							issues: validated.error.issues,
							rawData: response.data.data,
						},
						"Payment service returned malformed subscription summary schema",
					);
					return null;
				}

				this.logger.warn(
					{ response: response.data },
					"Payment service returned unsuccessful subscription summary response",
				);
				return null;
			});
		} catch (error) {
			this.logger.warn(
				{ error, circuitState: this.circuitBreaker.getState() },
				"Failed to fetch subscription summary from payment-service",
			);
			return null;
		}
	}

	public async getFinanceSummary(
		query?: PaymentFinanceSummaryQueryDto,
		adminUserId?: string,
	): Promise<PaymentFinanceSummaryDto | null> {
		try {
			return await this.circuitBreaker.execute(async (signal) => {
				const url = `${this.baseUrl}${PAYMENT_SERVICE_ROUTES.FINANCE_SUMMARY}`;
				const response = await axios.get(url, {
					headers: this.getInternalHeaders(adminUserId),
					params: {
						billingCycle: query?.billingCycle,
						fiscalYear: query?.fiscalYear,
						from: query?.from,
						to: query?.to,
					},
					signal,
				});

				if (!this.isSuccessfulResponse(response.data)) {
					this.logger.warn(
						{ response: response.data },
						"Payment service returned unsuccessful summary response",
					);
					return null;
				}

				return this.toFinanceSummary(response.data.data);
			});
		} catch (error) {
			this.logger.warn(
				{ error, circuitState: this.circuitBreaker.getState() },
				"Failed to fetch finance summary from payment-service",
			);
			return null;
		}
	}

	public getCircuitBreaker(): CircuitBreaker {
		return this.circuitBreaker;
	}
}
