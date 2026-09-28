import { ContainerModule } from "inversify";
import type { ICreateMenuCategoryUseCase } from "@/application/ports/use-cases/create-menu-category.use-case.port.ts";
import type { ICreateMenuItemUseCase } from "@/application/ports/use-cases/create-menu-item.use-case.port.ts";
import type { IListMenuItemsUseCase } from "@/application/ports/use-cases/list-menu-items.use-case.port.ts";
import type { IUpdateMenuCategoryUseCase } from "@/application/ports/use-cases/update-menu-category.use-case.port.ts";
import { CreateMenuCategoryUseCase } from "@/application/use-cases/create-menu-category.use-case.ts";
import { CreateMenuItemUseCase } from "@/application/use-cases/create-menu-item.use-case.ts";
import { ListMenuItemsUseCase } from "@/application/use-cases/list-menu-items.use-case.ts";
import { UpdateMenuCategoryUseCase } from "@/application/use-cases/update-menu-category.use-case.ts";
import { TYPES } from "@/config/di/types.ts";
import type { IMenuCategoryRepository } from "@/domain/repositories/menu-category.repository.interface.ts";
import type { IMenuItemRepository } from "@/domain/repositories/menu-item.repository.interface.ts";
import { PrismaMenuCategoryRepository } from "@/infrastructure/database/repositories/prisma-menu-category.repository.ts";
import { PrismaMenuItemRepository } from "@/infrastructure/database/repositories/prisma-menu-item.repository.ts";
import { MenuCategoryController } from "@/presentation/http/controllers/menu-category.controller.ts";
import { MenuItemController } from "@/presentation/http/controllers/menu-item.controller.ts";

export const menuModule = new ContainerModule(({ bind }) => {
	bind<IMenuCategoryRepository>(TYPES.Repositories.MenuCategoryRepository)
		.to(PrismaMenuCategoryRepository)
		.inSingletonScope();

	bind<ICreateMenuCategoryUseCase>(TYPES.UseCases.CreateMenuCategoryUseCase)
		.to(CreateMenuCategoryUseCase)
		.inSingletonScope();

	bind<IUpdateMenuCategoryUseCase>(TYPES.UseCases.UpdateMenuCategoryUseCase)
		.to(UpdateMenuCategoryUseCase)
		.inSingletonScope();

	bind<IMenuItemRepository>(TYPES.Repositories.MenuItemRepository)
		.to(PrismaMenuItemRepository)
		.inSingletonScope();

	bind<ICreateMenuItemUseCase>(TYPES.UseCases.CreateMenuItemUseCase)
		.to(CreateMenuItemUseCase)
		.inSingletonScope();

	bind<IListMenuItemsUseCase>(TYPES.UseCases.ListMenuItemsUseCase)
		.to(ListMenuItemsUseCase)
		.inSingletonScope();

	bind(TYPES.Controller.MenuCategoryController)
		.to(MenuCategoryController)
		.inSingletonScope();

	bind(TYPES.Controller.MenuItemController)
		.to(MenuItemController)
		.inSingletonScope();
});
