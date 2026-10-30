import { GetCustomerRestaurantDetailsUseCase } from "@application/use-cases/restaurant/get-customer-restaurant-details.use-case";
import { ListCustomerRestaurantsUseCase } from "@application/use-cases/restaurant/list-customer-restaurant.use-case";
import { QueueService } from "@infrastructure/external/queue.service";
import { ContainerModule } from "inversify";
import type { IQueueService } from "@/application/ports/services/queue.service.port.ts";
import type { IGetCustomerRestaurantDetailsUseCase } from "@/application/ports/use-cases/restaurant/get-customer-restaurant-details.use-case.port.ts";
import { TYPES } from "@/config/di/types.ts";
import { CustomerRestaurantController } from "@/presentation/http/controllers/customer-restaurant.controller.ts";

export const restaurantModule = new ContainerModule(({ bind }) => {
	bind<IQueueService>(TYPES.Services.QueueService)
		.to(QueueService)
		.inSingletonScope();

	bind(TYPES.UseCases.ListCustomerRestaurantsUseCase)
		.to(ListCustomerRestaurantsUseCase)
		.inSingletonScope();

	bind<IGetCustomerRestaurantDetailsUseCase>(
		TYPES.UseCases.GetCustomerRestaurantDetailsUseCase,
	)
		.to(GetCustomerRestaurantDetailsUseCase)
		.inSingletonScope();

	bind(TYPES.Controller.CustomerRestaurantController)
		.to(CustomerRestaurantController)
		.inSingletonScope();
});
