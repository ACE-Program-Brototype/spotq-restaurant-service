import { ContainerModule } from "inversify";
import type { IAddonRepository } from "@/application/ports/repositories/addon.repository.port.ts";
import type { ICreateAddonUseCase } from "@/application/ports/use-cases/create-addon.use-case.port.ts";
import type { IListRestaurantAddonsUseCase } from "@/application/ports/use-cases/list-restaurant-addons.use-case.port.ts";
import { CreateAddonUseCase } from "@/application/use-cases/create-addon.use-case.ts";
import { ListRestaurantAddonsUseCase } from "@/application/use-cases/list-restaurant-addons.use-case.ts";
import { TYPES } from "@/config/di/types.ts";
import { PrismaAddonRepository } from "@/infrastructure/database/repositories/prisma-addon.repository.ts";
import { AddonController } from "@/presentation/http/controllers/addon.controller.ts";

export const addonModule = new ContainerModule(({ bind }) => {
	// Repository
	bind<IAddonRepository>(TYPES.Repositories.AddonRepository)
		.to(PrismaAddonRepository)
		.inSingletonScope();

	// Use Cases
	bind<ICreateAddonUseCase>(TYPES.UseCases.CreateAddonUseCase)
		.to(CreateAddonUseCase)
		.inSingletonScope();

	bind<IListRestaurantAddonsUseCase>(TYPES.UseCases.ListRestaurantAddonsUseCase)
		.to(ListRestaurantAddonsUseCase)
		.inSingletonScope();

	// Controller
	bind(TYPES.Controller.AddonController).to(AddonController).inSingletonScope();
});
