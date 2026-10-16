import { GetCustomerRestaurantDetailsUseCase } from "@application/use-cases/restaurant/get-customer-restaurant-details.use-case";
import { ListCustomerRestaurantsUseCase } from "@application/use-cases/restaurant/list-customer-restaurant.use-case";
import { ContainerModule } from "inversify";
import { TYPES } from "@/config/di/types.ts";
import { CustomerRestaurantController } from "@/presentation/http/controllers/customer-restaurant.controller.ts";

export const restaurantModule = new ContainerModule(({ bind }) => {
	bind(TYPES.UseCases.ListCustomerRestaurantsUseCase)
		.to(ListCustomerRestaurantsUseCase)
		.inSingletonScope();

	bind(TYPES.UseCases.GetCustomerRestaurantDetailsUseCase)
		.to(GetCustomerRestaurantDetailsUseCase)
		.inSingletonScope();

	bind(TYPES.Controller.CustomerRestaurantController)
		.to(CustomerRestaurantController)
		.inSingletonScope();
});
