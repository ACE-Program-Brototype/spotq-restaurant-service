import { ContainerModule } from "inversify";
import type { ICreateAddonUseCase } from "@/application/ports/use-cases/create-addon.use-case.port.ts";
import type { IDeleteAddonUseCase } from "@/application/ports/use-cases/delete-addon.use-case.port.ts";
import type { IListRestaurantAddonsUseCase } from "@/application/ports/use-cases/list-restaurant-addons.use-case.port.ts";
import type { IUpdateAddonUseCase } from "@/application/ports/use-cases/update-addon.use-case.port.ts";
import { CreateAddonUseCase } from "@/application/use-cases/create-addon.use-case.ts";
import { DeleteAddonUseCase } from "@/application/use-cases/delete-addon.use-case.ts";
import { ListRestaurantAddonsUseCase } from "@/application/use-cases/list-restaurant-addons.use-case.ts";
import { UpdateAddonUseCase } from "@/application/use-cases/update-addon.use-case.ts";
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
