import type { ICreateAddonUseCase } from "@application/ports/use-cases/addon/create-addon.use-case.port";
import type { IDeleteAddonUseCase } from "@application/ports/use-cases/addon/delete-addon.use-case.port";
import type { IListRestaurantAddonsUseCase } from "@application/ports/use-cases/addon/list-restaurant-addons.use-case.port";
import type { IUpdateAddonUseCase } from "@application/ports/use-cases/addon/update-addon.use-case.port";
import { CreateAddonUseCase } from "@application/use-cases/addon/create-addon.use-case";
import { DeleteAddonUseCase } from "@application/use-cases/addon/delete-addon.use-case";
import { ListRestaurantAddonsUseCase } from "@application/use-cases/addon/list-restaurant-addons.use-case";
import { UpdateAddonUseCase } from "@application/use-cases/addon/update-addon.use-case";
import { ContainerModule } from "inversify";
import { TYPES } from "@/config/di/types.ts";
import type { IAddonRepository } from "@/domain/repositories/addon.repository.interface.ts";
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

	bind<IUpdateAddonUseCase>(TYPES.UseCases.UpdateAddonUseCase)
		.to(UpdateAddonUseCase)
		.inSingletonScope();

	bind<IDeleteAddonUseCase>(TYPES.UseCases.DeleteAddonUseCase)
		.to(DeleteAddonUseCase)
		.inSingletonScope();

	// Controller
	bind(TYPES.Controller.AddonController).to(AddonController).inSingletonScope();
});
