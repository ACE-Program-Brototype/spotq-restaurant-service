import { inject, injectable } from "inversify";
import type {
	GetRestaurantAnalyticsDashboardInputDTO,
	OperationSectionResultDTO,
	OrderSectionResultDTO,
	OrderStatusBreakdownResultDTO,
	ProductItemDTO,
	ProductSectionResultDTO,
	RestaurantAnalyticsDashboardOutputDTO,
	RevenueSectionResultDTO,
} from "@/application/dtos/restaurant/get-restaurant-analytics-dashboard.dto.ts";
import { RestaurantAnalyticsDashboardMapper } from "@/application/mappers/restaurant/restaurant-analytics-dashboard.mapper.ts";
import type { ILogger } from "@/application/ports/services/logger.interface.ts";
import type { IOrderAnalyticsService } from "@/application/ports/services/order-analytics.service.port.ts";
import type { IGetRestaurantAnalyticsDashboardUseCase } from "@/application/ports/use-cases/restaurant/get-restaurant-analytics-dashboard.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import type { IRestaurantAnalyticsRepository } from "@/domain/repositories/restaurant-analytics.repository.interface.ts";
import {
	ANALYTICS_ERROR_CODES,
	ANALYTICS_FALLBACKS,
	ANALYTICS_PAGINATION,
	ANALYTICS_SECTION_STATUS,
	ORDER_STATUS_FILTERS,
	PRODUCT_CLASSIFICATIONS,
	PROMISE_STATUS,
	type AnalyticsPeriod,
	type OrderStatusFilter,
} from "@/shared/constants/analytics.constants.ts";
import { messages } from "@/shared/constants/message.constants.ts";
import { resolveAnalyticsDateRange } from "@/shared/utils/date-range.util.ts";

@injectable()
export class GetRestaurantAnalyticsDashboardUseCase
	implements IGetRestaurantAnalyticsDashboardUseCase
{
	constructor(
		@inject(TYPES.Repositories.RestaurantAnalyticsRepository)
		private readonly restaurantAnalyticsRepository: IRestaurantAnalyticsRepository,
		@inject(TYPES.Services.OrderAnalyticsService)
		private readonly orderAnalyticsService: IOrderAnalyticsService,
		@inject(TYPES.Logger.PinoClient)
		private readonly logger: ILogger,
	) {}

	public async execute(
		restaurantIdOrInput: string | GetRestaurantAnalyticsDashboardInputDTO,
		inputDto?: GetRestaurantAnalyticsDashboardInputDTO,
	): Promise<RestaurantAnalyticsDashboardOutputDTO> {
		const restaurantId =
			typeof restaurantIdOrInput === "string"
				? restaurantIdOrInput
				: (restaurantIdOrInput.restaurantId ?? "");
		const input =
			typeof restaurantIdOrInput === "string"
				? (inputDto ?? {})
				: restaurantIdOrInput;

		const resolvedRange = resolveAnalyticsDateRange({
			period: input.interval as AnalyticsPeriod | undefined,
			day: input.day,
			month: input.month,
			year: input.year,
		});

		const status: OrderStatusFilter =
			input.status ?? ORDER_STATUS_FILTERS.ALL;
		const page: number = Math.max(
			ANALYTICS_PAGINATION.MIN_PAGE,
			input.page ?? ANALYTICS_PAGINATION.DEFAULT_PAGE,
		);
		const limit: number = Math.max(
			ANALYTICS_PAGINATION.MIN_LIMIT,
			Math.min(
				ANALYTICS_PAGINATION.MAX_LIMIT,
				input.limit ?? ANALYTICS_PAGINATION.DEFAULT_LIMIT,
			),
		);

		/**
		 * 1. Fetch local menu items and active product count concurrently
		 * to enrich downstream product analytics with local catalog status.
		 */
		const [totalProductsCount, allMenuItems] = await Promise.all([
			this.restaurantAnalyticsRepository.getTotalActiveProductsCount(
				restaurantId,
			),
			this.restaurantAnalyticsRepository.getAllMenuItems(restaurantId),
		]);

		/**
		 * 2. Fetch Order Service metrics concurrently via Promise.allSettled
		 * ensuring failure in one query does not break the other.
		 */
		const [orderSummarySettled, productAnalyticsSettled] =
			await Promise.allSettled([
				this.orderAnalyticsService.getOrderSummary(restaurantId, {
					interval: resolvedRange.period,
					day: resolvedRange.day ?? undefined,
					month: resolvedRange.month,
					year: resolvedRange.year,
					status,
				}),
				this.orderAnalyticsService.getProductAnalytics(restaurantId, {
					interval: resolvedRange.period,
					day: resolvedRange.day ?? undefined,
					month: resolvedRange.month,
					year: resolvedRange.year,
					page,
					limit,
				}),
			]);

		/**
		 * 3. Process Order Summary with Circuit Breaker resilience.
		 */
		let revenue: RevenueSectionResultDTO;
		let orders: OrderSectionResultDTO;
		let operations: OperationSectionResultDTO;
		let orderStatusBreakdown: OrderStatusBreakdownResultDTO;

		if (
			orderSummarySettled.status === PROMISE_STATUS.FULFILLED &&
			orderSummarySettled.value !== null
		) {
			const summary = orderSummarySettled.value;
			const summaryObj = summary as unknown as {
				revenue?: typeof summary.revenue;
				orders?: typeof summary.orders;
				operations?: typeof summary.operations;
				orderStatusBreakdown?: typeof summary.orderStatusBreakdown;
				overview?: {
					revenue?: typeof summary.revenue;
					orders?: typeof summary.orders;
					operations?: typeof summary.operations;
					orderStatusBreakdown?: typeof summary.orderStatusBreakdown;
				};
			};
			const rev = summary.revenue ?? summaryObj.overview?.revenue ?? {};
			const ord = summary.orders ?? summaryObj.overview?.orders ?? {};
			const ops = summary.operations ?? summaryObj.overview?.operations ?? {};
			const osb =
				summary.orderStatusBreakdown ??
				summaryObj.overview?.orderStatusBreakdown ??
				{};

			revenue = {
				status: ANALYTICS_SECTION_STATUS.AVAILABLE,
				netSalesRupees: rev.netSalesRupees ?? 0,
				discountRupees: rev.discountRupees ?? 0,
				totalBillAmountRupees: rev.totalBillAmountRupees ?? 0,
				growthPercentage: rev.growthPercentage ?? 0,
			};
			orders = {
				status: ANALYTICS_SECTION_STATUS.AVAILABLE,
				totalOrderCount: ord.totalOrderCount ?? 0,
				dineInCount: ord.dineInCount ?? 0,
				takeawayCount: ord.takeawayCount ?? 0,
				growthPercentage: ord.growthPercentage ?? 0,
			};
			operations = {
				status: ANALYTICS_SECTION_STATUS.AVAILABLE,
				dinersServedCount: ops.dinersServedCount ?? 0,
				uniqueCustomersCount: ops.uniqueCustomersCount ?? 0,
			};
			orderStatusBreakdown = {
				status: ANALYTICS_SECTION_STATUS.AVAILABLE,
				totalOrdersTracked: osb.totalOrdersTracked ?? 0,
				distribution: osb.distribution ?? [],
			};
		} else {
			this.logger.warn(
				{
					restaurantId,
					reason:
						orderSummarySettled.status === PROMISE_STATUS.REJECTED
							? orderSummarySettled.reason
							: "Order service returned null",
				},
				messages.ORDER_SERVICE_ANALYTICS_UNAVAILABLE,
			);

			revenue = {
				status: ANALYTICS_SECTION_STATUS.UNAVAILABLE,
				error: {
					code: ANALYTICS_ERROR_CODES.ORDER_SERVICE_UNAVAILABLE,
					message: messages.REVENUE_METRICS_UNAVAILABLE,
				},
			};
			orders = {
				status: ANALYTICS_SECTION_STATUS.UNAVAILABLE,
				error: {
					code: ANALYTICS_ERROR_CODES.ORDER_SERVICE_UNAVAILABLE,
					message: messages.ORDER_METRICS_UNAVAILABLE,
				},
			};
			operations = {
				status: ANALYTICS_SECTION_STATUS.UNAVAILABLE,
				error: {
					code: ANALYTICS_ERROR_CODES.ORDER_SERVICE_UNAVAILABLE,
					message: messages.OPERATIONS_METRICS_UNAVAILABLE,
				},
			};
			orderStatusBreakdown = {
				status: ANALYTICS_SECTION_STATUS.UNAVAILABLE,
				error: {
					code: ANALYTICS_ERROR_CODES.ORDER_SERVICE_UNAVAILABLE,
					message: messages.ORDER_STATUS_BREAKDOWN_UNAVAILABLE,
				},
			};
		}

		/**
		 * 4. Process Product Analytics with Circuit Breaker resilience and Local Catalog Decoration.
		 */
		let products: ProductSectionResultDTO;

		if (
			productAnalyticsSettled.status === PROMISE_STATUS.FULFILLED &&
			productAnalyticsSettled.value !== null
		) {
			const productData = productAnalyticsSettled.value;
			const availabilityMap = new Map(
				allMenuItems.map((item) => [item.id, item.isAvailable]),
			);
			const nameMap = new Map(allMenuItems.map((item) => [item.id, item.name]));

			if (productData.totalProductsSold === 0) {
				/**
				 * Zero-sales scenario: all active dishes in catalog classified as ZERO_SALES with pagination.
				 */
				const activeDishes: ProductItemDTO[] = allMenuItems
					.filter((item) => item.isAvailable)
					.map((item) => ({
						menuItemId: item.id,
						name: item.name,
						quantitySold: 0,
						salesRupees: 0,
						isAvailable: true,
						classification: PRODUCT_CLASSIFICATIONS.ZERO_SALES,
					}));

				const totalItems = activeDishes.length;
				const totalPages = Math.ceil(totalItems / limit) || 1;
				const startIndex = (page - 1) * limit;
				const paginatedZeroSales = activeDishes.slice(
					startIndex,
					startIndex + limit,
				);

				products = {
					status: ANALYTICS_SECTION_STATUS.AVAILABLE,
					totalProductsCount,
					topSelling: {
						items: [],
						pagination: {
							totalItems: 0,
							totalPages: 0,
							currentPage: page,
							limit,
							hasNextPage: false,
							hasPrevPage: false,
						},
					},
					slowMoving: {
						items: paginatedZeroSales,
						pagination: {
							totalItems,
							totalPages,
							currentPage: page,
							limit,
							hasNextPage: page < totalPages,
							hasPrevPage: page > 1,
						},
					},
				};
			} else {
				/**
				 * Sales exist: decorate with local live availability and catalog name fallback.
				 */
				const decorateItem = (item: {
					menuItemId: string;
					name: string;
					quantitySold: number;
					salesRupees?: number;
					grossSalesRupees?: number;
					isAvailable?: boolean;
					percentageOfTotalSales?: number;
					classification?: "ZERO_SALES" | "LOW_VOLUME" | "NORMAL";
				}): ProductItemDTO => ({
					menuItemId: item.menuItemId,
					name:
						item.name ||
						nameMap.get(item.menuItemId) ||
						ANALYTICS_FALLBACKS.UNKNOWN_MENU_ITEM,
					quantitySold: item.quantitySold,
					salesRupees: item.salesRupees ?? item.grossSalesRupees ?? 0,
					isAvailable:
						availabilityMap.get(item.menuItemId) ?? item.isAvailable ?? false,
					percentageOfTotalSales: item.percentageOfTotalSales,
					classification: item.classification,
				});

				products = {
					status: ANALYTICS_SECTION_STATUS.AVAILABLE,
					totalProductsCount,
					topSelling: {
						items: (productData.topSelling?.items ?? []).map(decorateItem),
						pagination: productData.topSelling?.pagination ?? {
							totalItems: 0,
							totalPages: 0,
							currentPage: page,
							limit,
							hasNextPage: false,
							hasPrevPage: false,
						},
					},
					slowMoving: {
						items: (productData.slowMoving?.items ?? []).map(decorateItem),
						pagination: productData.slowMoving?.pagination ?? {
							totalItems: 0,
							totalPages: 0,
							currentPage: page,
							limit,
							hasNextPage: false,
							hasPrevPage: false,
						},
					},
				};
			}
		} else {
			this.logger.warn(
				{
					restaurantId,
					reason:
						productAnalyticsSettled.status === PROMISE_STATUS.REJECTED
							? productAnalyticsSettled.reason
							: "Order service returned null",
				},
				messages.ORDER_SERVICE_ANALYTICS_UNAVAILABLE,
			);

			products = {
				status: ANALYTICS_SECTION_STATUS.UNAVAILABLE,
				error: {
					code: ANALYTICS_ERROR_CODES.ORDER_SERVICE_UNAVAILABLE,
					message: messages.PRODUCT_PERFORMANCE_METRICS_UNAVAILABLE,
				},
			};
		}

		return RestaurantAnalyticsDashboardMapper.toOutputDTO({
			restaurantId,
			revenue,
			orders,
			operations,
			orderStatusBreakdown,
			products,
			filters: {
				interval: resolvedRange.period,
				day: resolvedRange.day,
				month: resolvedRange.month,
				year: resolvedRange.year,
				status,
				page,
				limit,
			},
		});
	}
}
