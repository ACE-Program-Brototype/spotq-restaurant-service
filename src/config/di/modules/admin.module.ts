import { ContainerModule } from "inversify";
import type { IBlockRestaurantUseCase } from "@/application/ports/use-cases/admin/block-restaurant.use-case.port.ts";
import type { IGetRestaurantDetailsUseCase } from "@/application/ports/use-cases/admin/get-restaurant-details.use-case.port.ts";
import type { IUnblockRestaurantUseCase } from "@/application/ports/use-cases/admin/unblock-restaurant.use-case.port.ts";
import { BlockRestaurantUseCase } from "@/application/use-cases/admin/block-restaurant.use-case.ts";
import { GetRestaurantDetailsUseCase } from "@/application/use-cases/admin/get-restaurant-details.use-case.ts";
import { UnblockRestaurantUseCase } from "@/application/use-cases/admin/unblock-restaurant.use-case.ts";
import { TYPES } from "@/config/di/types.ts";
import { AdminRestaurantController } from "@/presentation/http/controllers/admin-restaurant.controller.ts";

export const adminModule = new ContainerModule(({ bind }) => {
	// Controller
	bind(TYPES.Controller.AdminRestaurantController)
		.to(AdminRestaurantController)
		.inSingletonScope();

	// Use Cases
	bind<IGetRestaurantDetailsUseCase>(
		TYPES.UseCases.GetRestaurantDetailsUseCase,
	)
		.to(GetRestaurantDetailsUseCase)
		.inSingletonScope();

	bind<IBlockRestaurantUseCase>(TYPES.UseCases.BlockRestaurantUseCase)
		.to(BlockRestaurantUseCase)
		.inSingletonScope();

	bind<IUnblockRestaurantUseCase>(TYPES.UseCases.UnblockRestaurantUseCase)
		.to(UnblockRestaurantUseCase)
		.inSingletonScope();
});

