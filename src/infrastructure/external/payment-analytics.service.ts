import { CircuitBreaker } from "@spotq-org/circuit-breaker";
import { generateToken, type TokenIssuerConfig } from "@spotq-org/s2s-core";
import axios from "axios";
import { inject, injectable } from "inversify";
import { z } from "zod";
import type { ILogger } from "@/application/ports/services/logger.interface.ts";
import type {
	IPaymentAnalyticsService,
	PaymentSubscriptionAnalyticsQueryDto,
	PaymentSubscriptionSummaryDto,
} from "@/application/ports/services/payment-analytics.service.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { env } from "@/config/env.ts";
import { PAYMENT_SERVICE_ROUTES } from "@/shared/constants/route.constants.ts";

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
	private readonly circuitBreaker: CircuitBreaker<
		[() => Promise<unknown>],
		unknown
	>;

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
		this.circuitBreaker = new CircuitBreaker(
			async (requestFn: () => Promise<unknown>) => await requestFn(),
			{
				name: "payment-service",
				timeoutMs: 3_000,
				resetTimeoutMs: 30_000,
				errorThresholdPercentage: 50,
				volumeThreshold: 5,
				checkIsFailure: (error: unknown) => {
					const status = (error as { response?: { status?: number } })?.response
						?.status;
					if (typeof status === "number") {
						if (
							status >= 400 &&
							status < 500 &&
							status !== 408 &&
							status !== 429
						) {
							return false;
						}
					}
					return true;
				},
			},
		);
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

	public async getSubscriptionSummary(
		query?: PaymentSubscriptionAnalyticsQueryDto,
		callerUserId?: string,
	): Promise<PaymentSubscriptionSummaryDto | null> {
		try {
			const result = await this.circuitBreaker.execute(async () => {
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
					timeout: 3_000,
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
			return (result as PaymentSubscriptionSummaryDto | null) ?? null;
		} catch (error) {
			this.logger.warn(
				{ error, circuitState: this.circuitBreaker.state },
				"Failed to fetch subscription summary from payment-service",
			);
			return null;
		}
	}
}
