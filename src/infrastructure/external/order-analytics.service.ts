import type { CircuitBreaker } from "@spotq-org/circuit-breaker";
import axios from "axios";
import { inject, injectable } from "inversify";
import type { ILogger } from "@/application/ports/services/logger.interface.ts";
import type {
	GetRestaurantOrderSummaryQueryDTO,
	GetRestaurantProductAnalyticsQueryDTO,
	IOrderAnalyticsService,
	ProductPerformanceItemDTO,
	RestaurantOrderAnalyticsSummaryDTO,
	RestaurantProductAnalyticsDTO,
} from "@/application/ports/services/order-analytics.service.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { env } from "@/config/env.ts";
import { createServiceCircuitBreaker } from "@/infrastructure/resilience/circuit-breaker.factory.ts";
import { ORDER_SERVICE_ROUTES } from "@/shared/constants/route.constants.ts";
import { buildInternalS2SHeaders } from "@/shared/utils/s2s-headers.util.ts";

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
		this.circuitBreaker = createServiceCircuitBreaker({
			name: "order-service",
		});
	}

	private getHeaders(callerUserId?: string): Record<string, string> {
		return buildInternalS2SHeaders({
			serviceName: this.serviceName,
			targetServiceName: this.targetServiceName,
			privateKey: this.privateKey,
			callerUserId,
			logger: this.logger,
		});
	}

	public async getOrderSummary(
		restaurantId: string,
		query?: GetRestaurantOrderSummaryQueryDTO,
		callerUserId?: string,
	): Promise<RestaurantOrderAnalyticsSummaryDTO | null> {
		try {
			const result = await this.circuitBreaker.execute(async () => {
				const endpoint =
					ORDER_SERVICE_ROUTES.ANALYTICS_ORDERS_SUMMARY(restaurantId);
				const url = `${this.baseUrl}${endpoint}`;

				const response = await axios.get<
					ApiResponseEnvelope<RestaurantOrderAnalyticsSummaryDTO>
				>(url, {
					headers: this.getHeaders(callerUserId),
					params: {
						interval: query?.interval,
						day: query?.day,
						month: query?.month,
						year: query?.year,
					},
					timeout: env.CIRCUIT_BREAKER_TIMEOUT_MS,
				});

				if (response.data?.success && response.data?.data) {
					const raw = response.data.data as unknown as {
						restaurantId: string;
						revenue?: RestaurantOrderAnalyticsSummaryDTO["revenue"];
						orders?: RestaurantOrderAnalyticsSummaryDTO["orders"];
						operations?: RestaurantOrderAnalyticsSummaryDTO["operations"];
						orderStatusBreakdown?: RestaurantOrderAnalyticsSummaryDTO["orderStatusBreakdown"];
						filters?: RestaurantOrderAnalyticsSummaryDTO["filters"];
						generatedAt?: string;
						overview?: {
							revenue?: RestaurantOrderAnalyticsSummaryDTO["revenue"];
							orders?: RestaurantOrderAnalyticsSummaryDTO["orders"];
							operations?: RestaurantOrderAnalyticsSummaryDTO["operations"];
						};
					};
					return {
						restaurantId: raw.restaurantId,
						revenue: raw.overview?.revenue ?? raw.revenue,
						orders: raw.overview?.orders ?? raw.orders,
						operations: raw.overview?.operations ?? raw.operations,
						orderStatusBreakdown: raw.orderStatusBreakdown,
						filters: raw.filters,
						generatedAt: raw.generatedAt,
					};
				}

				this.logger.warn(
					{ response: response.data, restaurantId },
					"Order service returned unsuccessful order summary response",
				);
				return null;
			});
			return (result as RestaurantOrderAnalyticsSummaryDTO | null) ?? null;
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
		query?: GetRestaurantProductAnalyticsQueryDTO,
		callerUserId?: string,
	): Promise<RestaurantProductAnalyticsDTO | null> {
		try {
			const result = await this.circuitBreaker.execute(async () => {
				const endpoint =
					ORDER_SERVICE_ROUTES.ANALYTICS_ORDERS_PRODUCTS(restaurantId);
				const url = `${this.baseUrl}${endpoint}`;

				const response = await axios.get<
					ApiResponseEnvelope<RestaurantProductAnalyticsDTO>
				>(url, {
					headers: this.getHeaders(callerUserId),
					params: {
						interval: query?.interval,
						day: query?.day,
						month: query?.month,
						year: query?.year,
						page: query?.page,
						limit: query?.limit,
					},
					timeout: env.CIRCUIT_BREAKER_TIMEOUT_MS,
				});

				if (response.data?.success && response.data?.data) {
					const data = response.data.data;
					const mapProductItems = (
						items?: Array<
							ProductPerformanceItemDTO & { grossSalesRupees?: number }
						>,
					): ProductPerformanceItemDTO[] =>
						(items ?? []).map((item) => ({
							menuItemId: item.menuItemId,
							name: item.name,
							quantitySold: item.quantitySold,
							salesRupees: item.salesRupees ?? item.grossSalesRupees ?? 0,
							...(item.isAvailable !== undefined
								? { isAvailable: item.isAvailable }
								: {}),
							...(item.percentageOfTotalSales !== undefined
								? { percentageOfTotalSales: item.percentageOfTotalSales }
								: {}),
							...(item.classification !== undefined
								? { classification: item.classification }
								: {}),
						}));

					return {
						...data,
						topSelling: {
							items: mapProductItems(data.topSelling?.items),
							pagination: data.topSelling?.pagination,
						},
						slowMoving: {
							items: mapProductItems(data.slowMoving?.items),
							pagination: data.slowMoving?.pagination,
						},
					};
				}

				this.logger.warn(
					{ response: response.data, restaurantId },
					"Order service returned unsuccessful product analytics response",
				);
				return null;
			});
			return (result as RestaurantProductAnalyticsDTO | null) ?? null;
		} catch (error) {
			this.logger.warn(
				{ error, restaurantId, circuitState: this.circuitBreaker.state },
				"Failed to fetch product analytics from order-service",
			);
			return null;
		}
	}
}
