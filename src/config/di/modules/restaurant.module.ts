import { ContainerModule } from "inversify";

import { ListCustomerRestaurantsUseCase } from "@/application/use-cases/list-customer-restaurant.use-case.ts";
import { TYPES } from "@/config/di/types.ts";
import { CustomerRestaurantController } from "@/presentation/http/controllers/customer-restaurant.controller.ts";

export const restaurantModule = new ContainerModule(({ bind }) => {
	bind(TYPES.UseCases.ListCustomerRestaurantsUseCase)
		.to(ListCustomerRestaurantsUseCase)
		.inSingletonScope();

	bind(TYPES.Controller.CustomerRestaurantController)
		.to(CustomerRestaurantController)
		.inSingletonScope();
});
