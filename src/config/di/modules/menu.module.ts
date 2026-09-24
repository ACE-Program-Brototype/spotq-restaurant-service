import { ContainerModule } from "inversify";
import type { IMenuCategoryRepositoryPort } from "@/application/ports/repositories/menu-category.repository.port.ts";
import type { ICreateMenuCategoryUseCase } from "@/application/ports/use-cases/create-menu-category.use-case.port.ts";
import type { IListRestaurantMenuCategoriesUseCase } from "@/application/ports/use-cases/list-restaurant-menu-categories.use-case.port.ts";
import { CreateMenuCategoryUseCase } from "@/application/use-cases/create-menu-category.use-case.ts";
import { ListRestaurantMenuCategoriesUseCase } from "@/application/use-cases/list-restaurant-menu-categories.use-case.ts";
import { TYPES } from "@/config/di/types.ts";
import type { IMenuCategoryRepository } from "@/domain/repositories/menu-category.repository.interface.ts";
import { PrismaMenuCategoryRepository } from "@/infrastructure/database/repositories/prisma-menu-category.repository.ts";
import { MenuCategoryController } from "@/presentation/http/controllers/menu-category.controller.ts";

export const menuModule = new ContainerModule(({ bind }) => {
	bind<IMenuCategoryRepository & IMenuCategoryRepositoryPort>(
		TYPES.Repositories.MenuCategoryRepository,
	)
		.to(PrismaMenuCategoryRepository)
		.inSingletonScope();

	bind<ICreateMenuCategoryUseCase>(TYPES.UseCases.CreateMenuCategoryUseCase)
		.to(CreateMenuCategoryUseCase)
		.inSingletonScope();

	bind<IListRestaurantMenuCategoriesUseCase>(
		TYPES.UseCases.ListRestaurantMenuCategoriesUseCase,
	)
		.to(ListRestaurantMenuCategoriesUseCase)
		.inSingletonScope();

	bind(TYPES.Controller.MenuCategoryController)
		.to(MenuCategoryController)
		.inSingletonScope();
});
