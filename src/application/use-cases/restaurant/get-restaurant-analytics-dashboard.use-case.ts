import { inject, injectable } from "inversify";
import type {
	GetRestaurantAnalyticsDashboardQueryDto,
	OperationSectionResultDto,
	OrderSectionResultDto,
	OrderStatusBreakdownResultDto,
	ProductItemDto,
	ProductSectionResultDto,
	RestaurantAnalyticsDashboardResponseDto,
	RevenueSectionResultDto,
} from "@/application/dtos/restaurant/get-restaurant-analytics-dashboard.dto.ts";
import type { ILogger } from "@/application/ports/services/logger.interface.ts";
import type { IOrderAnalyticsService } from "@/application/ports/services/order-analytics.service.port.ts";
import type { IGetRestaurantAnalyticsDashboardUseCase } from "@/application/ports/use-cases/restaurant/get-restaurant-analytics-dashboard.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import type { IRestaurantAnalyticsRepository } from "@/domain/repositories/restaurant-analytics.repository.interface.ts";
import type {
	AnalyticsPeriod,
	OrderStatusFilter,
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
		query: GetRestaurantAnalyticsDashboardQueryDto,
		callerUserId?: string,
	): Promise<RestaurantAnalyticsDashboardResponseDto> {
		const resolvedRange = resolveAnalyticsDateRange({
			period: query.interval as AnalyticsPeriod | undefined,
			day: query.day,
			month: query.month,
			year: query.year,
		});

		const status: OrderStatusFilter = (query.status ??
			"ALL") as OrderStatusFilter;
		const page: number = Math.max(1, query.page ?? 1);
		const limit: number = Math.max(1, Math.min(100, query.limit ?? 10));
		const restaurantId = query.restaurantId;

		// 1. Fetch local menu items and active product count concurrently
		const [totalProductsCount, allMenuItems] = await Promise.all([
			this.restaurantAnalyticsRepository.getTotalActiveProductsCount(
				restaurantId,
			),
			this.restaurantAnalyticsRepository.getAllMenuItems(restaurantId),
		]);

		// 2. Fetch Order Service metrics concurrently via Promise.allSettled
		const [orderSummarySettled, productAnalyticsSettled] =
			await Promise.allSettled([
				this.orderAnalyticsService.getOrderSummary(
					restaurantId,
					{
						interval: resolvedRange.period,
						day: resolvedRange.day ?? undefined,
						month: resolvedRange.month,
						year: resolvedRange.year,
						status,
					},
					callerUserId,
				),
				this.orderAnalyticsService.getProductAnalytics(
					restaurantId,
					{
						interval: resolvedRange.period,
						day: resolvedRange.day ?? undefined,
						month: resolvedRange.month,
						year: resolvedRange.year,
						page,
						limit,
					},
					callerUserId,
				),
			]);

		// 3. Process Order Summary with Circuit Breaker resilience
		let revenue: RevenueSectionResultDto;
		let orders: OrderSectionResultDto;
		let operations: OperationSectionResultDto;
		let orderStatusBreakdown: OrderStatusBreakdownResultDto;

		if (
			orderSummarySettled.status === "fulfilled" &&
			orderSummarySettled.value !== null
		) {
			const summary = orderSummarySettled.value;
			revenue = {
				status: "AVAILABLE",
				netSalesRupees: summary.revenue.netSalesRupees,
				discountRupees: summary.revenue.discountRupees,
				totalBillAmountRupees: summary.revenue.totalBillAmountRupees,
				growthPercentage: summary.revenue.growthPercentage,
			};
			orders = {
				status: "AVAILABLE",
				totalOrderCount: summary.orders.totalOrderCount,
				dineInCount: summary.orders.dineInCount,
				takeawayCount: summary.orders.takeawayCount,
				growthPercentage: summary.orders.growthPercentage,
			};
			operations = {
				status: "AVAILABLE",
				dinersServedCount: summary.operations.dinersServedCount,
				uniqueCustomersCount: summary.operations.uniqueCustomersCount,
			};
			orderStatusBreakdown = {
				status: "AVAILABLE",
				totalOrdersTracked: summary.orderStatusBreakdown.totalOrdersTracked,
				distribution: summary.orderStatusBreakdown.distribution,
			};
		} else {
			this.logger.warn(
				{
					restaurantId,
					callerUserId,
					reason:
						orderSummarySettled.status === "rejected"
							? orderSummarySettled.reason
							: "Order service returned null",
				},
				messages.ORDER_SERVICE_ANALYTICS_UNAVAILABLE,
			);

			revenue = {
				status: "UNAVAILABLE",
				error: {
					code: "ORDER_SERVICE_UNAVAILABLE",
					message: "Revenue metrics unavailable",
				},
			};
			orders = {
				status: "UNAVAILABLE",
				error: {
					code: "ORDER_SERVICE_UNAVAILABLE",
					message: "Order metrics unavailable",
				},
			};
			operations = {
				status: "UNAVAILABLE",
				error: {
					code: "ORDER_SERVICE_UNAVAILABLE",
					message: "Operations metrics unavailable",
				},
			};
			orderStatusBreakdown = {
				status: "UNAVAILABLE",
				error: {
					code: "ORDER_SERVICE_UNAVAILABLE",
					message: "Order status breakdown unavailable",
				},
			};
		}

		// 4. Process Product Analytics with Circuit Breaker resilience and Local Catalog Decoration
		let products: ProductSectionResultDto;

		if (
			productAnalyticsSettled.status === "fulfilled" &&
			productAnalyticsSettled.value !== null
		) {
			const productData = productAnalyticsSettled.value;
			const availabilityMap = new Map(
				allMenuItems.map((item) => [item.id, item.isAvailable]),
			);
			const nameMap = new Map(allMenuItems.map((item) => [item.id, item.name]));

			if (productData.totalProductsSold === 0) {
				// Zero-sales scenario: all active dishes in catalog classified as ZERO_SALES with slice pagination
				const activeDishes: ProductItemDto[] = allMenuItems
					.filter((item) => item.isAvailable)
					.map((item) => ({
						menuItemId: item.id,
						name: item.name,
						quantitySold: 0,
						salesRupees: 0,
						isAvailable: true,
						classification: "ZERO_SALES",
					}));

				const totalItems = activeDishes.length;
				const totalPages = Math.ceil(totalItems / limit) || 1;
				const startIndex = (page - 1) * limit;
				const paginatedZeroSales = activeDishes.slice(
					startIndex,
					startIndex + limit,
				);

				products = {
					status: "AVAILABLE",
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
				// Sales exist: decorate with local live availability and catalog name fallback
				const decorateItem = (item: {
					menuItemId: string;
					name: string;
					quantitySold: number;
					salesRupees: number;
					isAvailable?: boolean;
					percentageOfTotalSales?: number;
					classification?: "ZERO_SALES" | "LOW_VOLUME" | "NORMAL";
				}): ProductItemDto => ({
					menuItemId: item.menuItemId,
					name: item.name || nameMap.get(item.menuItemId) || "Unknown Item",
					quantitySold: item.quantitySold,
					salesRupees: item.salesRupees,
					isAvailable:
						availabilityMap.get(item.menuItemId) ?? item.isAvailable ?? false,
					percentageOfTotalSales: item.percentageOfTotalSales,
					classification: item.classification,
				});

				products = {
					status: "AVAILABLE",
					totalProductsCount,
					topSelling: {
						items: productData.topSelling.items.map(decorateItem),
						pagination: productData.topSelling.pagination,
					},
					slowMoving: {
						items: productData.slowMoving.items.map(decorateItem),
						pagination: productData.slowMoving.pagination,
					},
				};
			}
		} else {
			this.logger.warn(
				{
					restaurantId,
					callerUserId,
					reason:
						productAnalyticsSettled.status === "rejected"
							? productAnalyticsSettled.reason
							: "Order service returned null",
				},
				messages.ORDER_SERVICE_ANALYTICS_UNAVAILABLE,
			);

			products = {
				status: "UNAVAILABLE",
				error: {
					code: "ORDER_SERVICE_UNAVAILABLE",
					message: "Product performance metrics unavailable",
				},
			};
		}

		return {
			restaurantId,
			overview: {
				revenue,
				orders,
				operations,
			},
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
			generatedAt: new Date().toISOString(),
		};
	}
}
