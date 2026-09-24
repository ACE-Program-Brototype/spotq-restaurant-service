import { ContainerModule } from "inversify";
import type { IMenuCategoryRepositoryPort } from "@/application/ports/repositories/menu-category.repository.port.ts";
import type { ICreateMenuCategoryUseCase } from "@/application/ports/use-cases/create-menu-category.use-case.port.ts";
import type { IUpdateMenuCategoryUseCase } from "@/application/ports/use-cases/update-menu-category.use-case.port.ts";
import { CreateMenuCategoryUseCase } from "@/application/use-cases/create-menu-category.use-case.ts";
import { UpdateMenuCategoryUseCase } from "@/application/use-cases/update-menu-category.use-case.ts";
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

	bind<IUpdateMenuCategoryUseCase>(TYPES.UseCases.UpdateMenuCategoryUseCase)
		.to(UpdateMenuCategoryUseCase)
		.inSingletonScope();

	bind(TYPES.Controller.MenuCategoryController)
		.to(MenuCategoryController)
		.inSingletonScope();
});
