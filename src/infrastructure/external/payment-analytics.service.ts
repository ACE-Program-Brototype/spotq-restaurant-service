import type { ILogger } from "@/application/ports/services/logger.interface.ts";
import type {
	IPaymentAnalyticsService,
	PaymentFinanceSummaryDto,
} from "@/application/ports/services/payment-analytics.service.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { env } from "@/config/env.ts";
import { PAYMENT_SERVICE_ROUTES } from "@shared/constants/route.constants.ts";
import { generateToken, type TokenIssuerConfig } from "@spotq-org/s2s-core";
import axios from "axios";
import { inject, injectable } from "inversify";

interface PaymentSummaryApiData {
	currency: string;
	masterBalancePaise: string;
	todayTurnoverPaise: string;
	tonightEodPayoutQueuePaise: string;
	lifetimeDisbursedPaise: string;
	totalRefundsProcessedPaise: string;
	saasSubscriptionMrrPaise: string;
	activeVenuesCount: number;
}

interface PaymentSummaryApiResponse {
	success?: boolean;
	data?: PaymentSummaryApiData | null;
}

@injectable()
export class PaymentAnalyticsService implements IPaymentAnalyticsService {
	private readonly baseUrl: string;
	private readonly serviceName: string;
	private readonly targetServiceName: string;
	private readonly privateKey: string;
	private static readonly REQUEST_TIMEOUT_MS = 2500;

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
		const mrrPaise = BigInt(data.saasSubscriptionMrrPaise || "0");
		const currentMrrRupees = Number(mrrPaise / 100n);
		// Annualized MRR (MRR * 12)
		const currentArrRupees = currentMrrRupees * 12;

		const turnoverPaise = BigInt(data.todayTurnoverPaise || "0");
		const todayTurnoverRupees = Number(turnoverPaise / 100n);

		return {
			currentMrrRupees,
			currentArrRupees,
			activeVenuesCount: data.activeVenuesCount || 0,
			todayTurnoverRupees,
		};
	}

	public async getFinanceSummary(
		adminUserId?: string,
	): Promise<PaymentFinanceSummaryDto | null> {
		const controller = new AbortController();
		const timeoutId = setTimeout(
			() => controller.abort(),
			PaymentAnalyticsService.REQUEST_TIMEOUT_MS,
		);

		try {
			const url = `${this.baseUrl}${PAYMENT_SERVICE_ROUTES.FINANCE_SUMMARY}`;
			const response = await axios.get(url, {
				method: "GET",
				headers: this.getInternalHeaders(adminUserId),
				signal: controller.signal,
			});

			if (!this.isSuccessfulResponse(response.data)) {
				this.logger.warn(
					{ response: response.data },
					"Payment service returned unsuccessful summary response",
				);
				return null;
			}

			return this.toFinanceSummary(response.data.data);
		} catch (error) {
			this.logger.warn(
				{ error },
				"Failed to fetch finance summary from payment-service",
			);
			return null;
		} finally {
			clearTimeout(timeoutId);
		}
	}
}
