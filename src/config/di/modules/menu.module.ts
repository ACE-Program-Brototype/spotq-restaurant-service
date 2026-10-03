import { ContainerModule } from "inversify";
import type { ICreateMenuCategoryUseCase } from "@/application/ports/use-cases/create-menu-category.use-case.port.ts";
import type { ICreateMenuItemUseCase } from "@/application/ports/use-cases/create-menu-item.use-case.port.ts";
import type { IDeleteMenuCategoryUseCase } from "@/application/ports/use-cases/delete-menu-category.use-case.port.ts";
import type { IDeleteMenuItemUseCase } from "@/application/ports/use-cases/delete-menu-item.use-case.port.ts";
import type { IGetCustomerMenuItemDetailsUseCase } from "@/application/ports/use-cases/get-customer-menu-item-details.use-case.port.ts";
import type { IGetRestaurantOwnerMenuItemDetailsUseCase } from "@/application/ports/use-cases/get-restaurant-owner-menu-item-details.use-case.port.ts";
import type { IListMenuItemsUseCase } from "@/application/ports/use-cases/list-menu-items.use-case.port.ts";
import type { IListRestaurantMenuCategoriesUseCase } from "@/application/ports/use-cases/list-restaurant-menu-categories.use-case.port.ts";
import type { IUpdateMenuCategoryUseCase } from "@/application/ports/use-cases/update-menu-category.use-case.port.ts";
import type { IUpdateMenuCategoryStatusUseCase } from "@/application/ports/use-cases/update-menu-category-status.use-case.port.ts";
import { CreateMenuCategoryUseCase } from "@/application/use-cases/create-menu-category.use-case.ts";
import { CreateMenuItemUseCase } from "@/application/use-cases/create-menu-item.use-case.ts";
import { DeleteMenuCategoryUseCase } from "@/application/use-cases/delete-menu-category.use-case.ts";
import { DeleteMenuItemUseCase } from "@/application/use-cases/delete-menu-item.use-case.ts";
import { GetCustomerMenuItemDetailsUseCase } from "@/application/use-cases/get-customer-menu-item-details.use-case.ts";
import { GetRestaurantOwnerMenuItemDetailsUseCase } from "@/application/use-cases/get-restaurant-owner-menu-item-details.use-case.ts";
import { ListMenuItemsUseCase } from "@/application/use-cases/list-menu-items.use-case.ts";
import { ListRestaurantMenuCategoriesUseCase } from "@/application/use-cases/list-restaurant-menu-categories.use-case.ts";
import { UpdateMenuCategoryUseCase } from "@/application/use-cases/update-menu-category.use-case.ts";
import { UpdateMenuCategoryStatusUseCase } from "@/application/use-cases/update-menu-category-status.use-case.ts";
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

	bind<IUpdateMenuCategoryStatusUseCase>(
		TYPES.UseCases.UpdateMenuCategoryStatusUseCase,
	)
		.to(UpdateMenuCategoryStatusUseCase)
		.inSingletonScope();

	bind<IListRestaurantMenuCategoriesUseCase>(
		TYPES.UseCases.ListRestaurantMenuCategoriesUseCase,
	)
		.to(ListRestaurantMenuCategoriesUseCase)
		.inSingletonScope();

	bind<IDeleteMenuCategoryUseCase>(TYPES.UseCases.DeleteMenuCategoryUseCase)
		.to(DeleteMenuCategoryUseCase)
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

	bind<IGetRestaurantOwnerMenuItemDetailsUseCase>(
		TYPES.UseCases.GetRestaurantOwnerMenuItemDetailsUseCase,
	)
		.to(GetRestaurantOwnerMenuItemDetailsUseCase)
		.inSingletonScope();

	bind<IGetCustomerMenuItemDetailsUseCase>(
		TYPES.UseCases.GetCustomerMenuItemDetailsUseCase,
	)
		.to(GetCustomerMenuItemDetailsUseCase)
		.inSingletonScope();

	bind<IDeleteMenuItemUseCase>(TYPES.UseCases.DeleteMenuItemUseCase)
		.to(DeleteMenuItemUseCase)
		.inSingletonScope();

	bind(TYPES.Controller.MenuCategoryController)
		.to(MenuCategoryController)
		.inSingletonScope();

	bind(TYPES.Controller.MenuItemController)
		.to(MenuItemController)
		.inSingletonScope();
});
