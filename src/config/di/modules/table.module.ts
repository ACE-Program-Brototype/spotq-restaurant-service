import type { ICreateTableUseCase } from "@application/ports/use-cases/table/create-table.use-case.port";
import type { IUpdateTableUseCase } from "@application/ports/use-cases/table/update-table.use-case.port";
import { CreateTableUseCase } from "@application/use-cases/table/create-table.use-case";
import { UpdateTableUseCase } from "@application/use-cases/table/update-table.use-case";
import type { ITableRepository } from "@domain/repositories/table.repository.interface";
import { PrismaTableRepository } from "@infrastructure/database/repositories/prisma-table.repository";
import { TableController } from "@presentation/http/controllers/table.controller";
import { ContainerModule } from "inversify";
import { TYPES } from "../types";

export const tableModule = new ContainerModule(({ bind }) => {
	// Repository
	bind<ITableRepository>(TYPES.Repositories.TableRepository)
		.to(PrismaTableRepository)
		.inSingletonScope();

	// UseCases
	bind<ICreateTableUseCase>(TYPES.UseCases.CreateTableUseCase)
		.to(CreateTableUseCase)
		.inSingletonScope();

	bind<IUpdateTableUseCase>(TYPES.UseCases.UpdateTableUseCase)
		.to(UpdateTableUseCase)
		.inSingletonScope();

	// controller
	bind<TableController>(TYPES.Controller.TableController)
		.to(TableController)
		.inSingletonScope();
});
