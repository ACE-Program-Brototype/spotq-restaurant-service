import { ContainerModule } from "inversify";
import type { IOrderAnalyticsService } from "@/application/ports/services/order-analytics.service.port.ts";
import type { IQueueService } from "@/application/ports/services/queue.service.port.ts";
import type { IGetCustomerRestaurantDetailsUseCase } from "@/application/ports/use-cases/restaurant/get-customer-restaurant-details.use-case.port.ts";
import type { IGetRestaurantAnalyticsDashboardUseCase } from "@/application/ports/use-cases/restaurant/get-restaurant-analytics-dashboard.use-case.port.ts";
import { GetCustomerRestaurantDetailsUseCase } from "@/application/use-cases/restaurant/get-customer-restaurant-details.use-case.ts";
import { GetRestaurantAnalyticsDashboardUseCase } from "@/application/use-cases/restaurant/get-restaurant-analytics-dashboard.use-case.ts";
import { ListCustomerRestaurantsUseCase } from "@/application/use-cases/restaurant/list-customer-restaurant.use-case.ts";
import { TYPES } from "@/config/di/types.ts";
import { OrderAnalyticsService } from "@/infrastructure/external/order-analytics.service.ts";
import { QueueService } from "@/infrastructure/external/queue.service.ts";
import { CustomerRestaurantController } from "@/presentation/http/controllers/customer-restaurant.controller.ts";
import { RestaurantAnalyticsController } from "@/presentation/http/controllers/restaurant-analytics.controller.ts";

export const restaurantModule = new ContainerModule(({ bind }) => {
	bind<IQueueService>(TYPES.Services.QueueService)
		.to(QueueService)
		.inSingletonScope();

	bind<IOrderAnalyticsService>(TYPES.Services.OrderAnalyticsService)
		.to(OrderAnalyticsService)
		.inSingletonScope();

	bind(TYPES.UseCases.ListCustomerRestaurantsUseCase)
		.to(ListCustomerRestaurantsUseCase)
		.inSingletonScope();

	bind<IGetCustomerRestaurantDetailsUseCase>(
		TYPES.UseCases.GetCustomerRestaurantDetailsUseCase,
	)
		.to(GetCustomerRestaurantDetailsUseCase)
		.inSingletonScope();

	bind<IGetRestaurantAnalyticsDashboardUseCase>(
		TYPES.UseCases.GetRestaurantAnalyticsDashboardUseCase,
	)
		.to(GetRestaurantAnalyticsDashboardUseCase)
		.inSingletonScope();

	bind(TYPES.Controller.CustomerRestaurantController)
		.to(CustomerRestaurantController)
		.inSingletonScope();

	bind(TYPES.Controller.RestaurantAnalyticsController)
		.to(RestaurantAnalyticsController)
		.inSingletonScope();
});
