import type { ICreateTableSectionUseCase } from "@application/ports/use-cases/table-section/create-table-section.use-case.port";
import type { IDeleteTableSectionUseCase } from "@application/ports/use-cases/table-section/delete-table-section.use-case.port";
import type { IGetTableSectionUseCase } from "@application/ports/use-cases/table-section/get-table-section.use-case.port";
import { CreateTableSectionUseCase } from "@application/use-cases/table-section/create-table-section.use-case";
import { DeleteTableSectionUseCase } from "@application/use-cases/table-section/delete-table-section.use-case";
import { GetTableSectionUseCase } from "@application/use-cases/table-section/get-table-section.use-case";
import type { ITableSectionRepository } from "@domain/repositories/table-section.respository.interface";
import { PrismaTableSectionRepository } from "@infrastructure/database/repositories/prisma-table-section.repository";
import { TableSectionController } from "@presentation/http/controllers/table-section.controller";
import { ContainerModule } from "inversify";
import { TYPES } from "../types";

export const tableSectionModule = new ContainerModule(({ bind }) => {
	// Repository
	bind<ITableSectionRepository>(TYPES.Repositories.TableSectionRepository)
		.to(PrismaTableSectionRepository)
		.inSingletonScope();

	// UseCases
	bind<ICreateTableSectionUseCase>(TYPES.UseCases.CreateTableSectionUseCase)
		.to(CreateTableSectionUseCase)
		.inSingletonScope();

	bind<IGetTableSectionUseCase>(TYPES.UseCases.GetTableSectionUseCase)
		.to(GetTableSectionUseCase)
		.inSingletonScope();

	bind<IDeleteTableSectionUseCase>(TYPES.UseCases.DeleteTableSectionUseCase)
		.to(DeleteTableSectionUseCase)
		.inSingletonScope();

	// controller
	bind<TableSectionController>(TYPES.Controller.TableSectionController)
		.to(TableSectionController)
		.inSingletonScope();
});
