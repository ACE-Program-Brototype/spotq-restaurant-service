import { ContainerModule } from "inversify";
import type { IMenuItemRepository } from "@/application/ports/repositories/menu-item.repository.port.ts";
import type { ICreateMenuItemUseCase } from "@/application/ports/use-cases/create-menu-item.use-case.port.ts";
import { CreateMenuItemUseCase } from "@/application/use-cases/create-menu-item.use-case.ts";
import { TYPES } from "@/config/di/types.ts";
import { PrismaMenuItemRepository } from "@/infrastructure/database/repositories/prisma-menu-item.repository.ts";
import { MenuItemController } from "@/presentation/http/controllers/menu-item.controller.ts";

export const menuItemModule = new ContainerModule(({ bind }) => {
	// Repository
	bind<IMenuItemRepository>(TYPES.Repositories.MenuItemRepository)
		.to(PrismaMenuItemRepository)
		.inSingletonScope();

	// Use Cases
	bind<ICreateMenuItemUseCase>(TYPES.UseCases.CreateMenuItemUseCase)
		.to(CreateMenuItemUseCase)
		.inSingletonScope();

	// Controller
	bind(TYPES.Controller.MenuItemController)
		.to(MenuItemController)
		.inSingletonScope();
});
