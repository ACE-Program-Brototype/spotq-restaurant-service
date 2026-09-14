import { ContainerModule } from "inversify";
import type { IGetRestaurantDetailsUseCase } from "@/application/ports/use-cases/admin/get-restaurant-details.use-case.port.ts";
import { GetRestaurantDetailsUseCase } from "@/application/use-cases/admin/get-restaurant-details.use-case.ts";
import { TYPES } from "@/config/di/types.ts";
import { AdminRestaurantController } from "@/presentation/http/controllers/admin-restaurant.controller.ts";

export const adminModule = new ContainerModule(({ bind }) => {
	// Controller
	bind(TYPES.Controller.AdminRestaurantController)
		.to(AdminRestaurantController)
		.inSingletonScope();

	// Use Case
	bind<IGetRestaurantDetailsUseCase>(
		TYPES.UseCases.GetRestaurantDetailsUseCase,
	)
		.to(GetRestaurantDetailsUseCase)
		.inSingletonScope();
});
