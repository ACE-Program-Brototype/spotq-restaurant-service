import type { ICreateTableUseCase } from "@application/ports/use-cases/table/create-table.use-case.port";
import type { IDeleteTableUseCase } from "@application/ports/use-cases/table/delete-table.use-case.port";
import type { IGetTableUseCase } from "@application/ports/use-cases/table/get-table.usecase.port";
import type { IGetTableAvailabilityUseCase } from "@application/ports/use-cases/table/get-table-availability.use-case.port";
import { CreateTableUseCase } from "@application/use-cases/table/create-table.use-case";
import { DeleteTableUseCase } from "@application/use-cases/table/delete-table.use-case";
import { GetTableUseCase } from "@application/use-cases/table/get-table.use-case";
import { GetTableAvailabilityUseCase } from "@application/use-cases/table/get-table-availability.use-case";
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

	bind<IGetTableUseCase>(TYPES.UseCases.GetTableUseCase)
		.to(GetTableUseCase)
		.inSingletonScope();

	bind<IGetTableAvailabilityUseCase>(TYPES.UseCases.GetTableAvailabilityUseCase)
		.to(GetTableAvailabilityUseCase)
		.inSingletonScope();

	bind<IDeleteTableUseCase>(TYPES.UseCases.DeleteTableUseCase)
		.to(DeleteTableUseCase)
		.inSingletonScope();

	// controller
	bind<TableController>(TYPES.Controller.TableController)
		.to(TableController)
		.inSingletonScope();
});
