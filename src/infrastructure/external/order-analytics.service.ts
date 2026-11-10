import { CircuitBreaker } from "@spotq-org/circuit-breaker";
import { generateToken, type TokenIssuerConfig } from "@spotq-org/s2s-core";
import axios from "axios";
import { inject, injectable } from "inversify";
import type { ILogger } from "@/application/ports/services/logger.interface.ts";
import type {
	GetRestaurantOrderSummaryQueryDto,
	GetRestaurantProductAnalyticsQueryDto,
	IOrderAnalyticsService,
	RestaurantOrderAnalyticsSummaryDto,
	RestaurantProductAnalyticsDto,
} from "@/application/ports/services/order-analytics.service.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { env } from "@/config/env.ts";
import { ORDER_SERVICE_ROUTES } from "@/shared/constants/route.constants.ts";

interface ApiResponseEnvelope<T> {
	success?: boolean;
	data?: T | null;
}

@injectable()
export class OrderAnalyticsService implements IOrderAnalyticsService {
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
		baseUrl: string = env.ORDER_SERVICE_URL,
		serviceName: string = env.S2S_AUDIENCE || "restaurant-service",
		targetServiceName: string = env.ORDER_SERVICE_NAME || "order-service",
		privateKey?: string,
	) {
		this.baseUrl = baseUrl.replace(/\/$/, "");
		this.serviceName = serviceName;
		this.targetServiceName = targetServiceName;
		this.privateKey = privateKey ?? env.S2S_PRIVATE_KEY;
		this.circuitBreaker = new CircuitBreaker(
			async (requestFn: () => Promise<unknown>) => await requestFn(),
			{
				name: "order-service",
				timeoutMs: 3_000,
				resetTimeoutMs: 30_000,
				errorThresholdPercentage: 50,
				volumeThreshold: 5,
				checkIsFailure: (error: unknown) => {
					const status = (error as { response?: { status?: number } })?.response
						?.status;
					if (typeof status === "number") {
						if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
							return false;
						}
					}
					return true;
				},
			},
		);
	}

	private getInternalHeaders(callerUserId?: string): Record<string, string> {
		const headers: Record<string, string> = {
			Accept: "application/json",
			"X-Caller-Service": this.serviceName,
			"x-user-id": callerUserId || "system-admin",
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
					"Failed to generate S2S token for order-service",
				);
			}
		}

		return headers;
	}

	public async getOrderSummary(
		restaurantId: string,
		query?: GetRestaurantOrderSummaryQueryDto,
		callerUserId?: string,
	): Promise<RestaurantOrderAnalyticsSummaryDto | null> {
		try {
			const result = await this.circuitBreaker.execute(async () => {
				const endpoint =
					ORDER_SERVICE_ROUTES.ANALYTICS_ORDERS_SUMMARY(restaurantId);
				const url = `${this.baseUrl}${endpoint}`;

				const response = await axios.get<
					ApiResponseEnvelope<RestaurantOrderAnalyticsSummaryDto>
				>(url, {
					headers: this.getInternalHeaders(callerUserId),
					params: {
						interval: query?.interval,
						day: query?.day,
						month: query?.month,
						year: query?.year,
						status: query?.status,
					},
					timeout: 3_000,
				});

				if (response.data?.success && response.data?.data) {
					return response.data.data;
				}

				this.logger.warn(
					{ response: response.data, restaurantId },
					"Order service returned unsuccessful order summary response",
				);
				return null;
			});
			return (result as RestaurantOrderAnalyticsSummaryDto | null) ?? null;
		} catch (error) {
			this.logger.warn(
				{ error, restaurantId, circuitState: this.circuitBreaker.state },
				"Failed to fetch order summary from order-service",
			);
			return null;
		}
	}

	public async getProductAnalytics(
		restaurantId: string,
		query?: GetRestaurantProductAnalyticsQueryDto,
		callerUserId?: string,
	): Promise<RestaurantProductAnalyticsDto | null> {
		try {
			const result = await this.circuitBreaker.execute(async () => {
				const endpoint =
					ORDER_SERVICE_ROUTES.ANALYTICS_ORDERS_PRODUCTS(restaurantId);
				const url = `${this.baseUrl}${endpoint}`;

				const response = await axios.get<
					ApiResponseEnvelope<RestaurantProductAnalyticsDto>
				>(url, {
					headers: this.getInternalHeaders(callerUserId),
					params: {
						interval: query?.interval,
						day: query?.day,
						month: query?.month,
						year: query?.year,
						page: query?.page,
						limit: query?.limit,
					},
					timeout: 3_000,
				});

				if (response.data?.success && response.data?.data) {
					return response.data.data;
				}

				this.logger.warn(
					{ response: response.data, restaurantId },
					"Order service returned unsuccessful product analytics response",
				);
				return null;
			});
			return (result as RestaurantProductAnalyticsDto | null) ?? null;
		} catch (error) {
			this.logger.warn(
				{ error, restaurantId, circuitState: this.circuitBreaker.state },
				"Failed to fetch product analytics from order-service",
			);
			return null;
		}
	}
}
