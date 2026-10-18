import type {
	IDeleteTableSectionInputDTO,
	IDeleteTableSectionOutputDTO,
} from "@application/dtos/table-section/delete-table-section.dto";
import type { IDeleteTableSectionUseCase } from "@application/ports/use-cases/table-section/delete-table-section.use-case.port";
import { TYPES } from "@config/di/types";
import { RestaurantNotFoundError } from "@domain/errors/restaurant.errors";
import {
	TableSectionInUseError,
	TableSectionNotFound,
} from "@domain/errors/table-section.errors";
import type { IRestaurantRepository } from "@domain/repositories/restaurant.repository.interface";
import type { ITableRepository } from "@domain/repositories/table.repository.interface";
import type { ITableSectionRepository } from "@domain/repositories/table-section.respository.interface";
import { inject } from "inversify";

export class DeleteTableSectionUseCase implements IDeleteTableSectionUseCase {
	constructor(
		@inject(TYPES.Repositories.TableSectionRepository)
		private readonly _tableSectionRepository: ITableSectionRepository,
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly _restaurantRepository: IRestaurantRepository,
		@inject(TYPES.Repositories.TableRepository)
		private readonly _tableRepository: ITableRepository,
	) {}
	async execute(
		input: IDeleteTableSectionInputDTO,
	): Promise<IDeleteTableSectionOutputDTO> {
		// Ensure restaurant exists
		const restaurant = await this._restaurantRepository.findById(
			input.restaurantId,
		);
		if (!restaurant) {
			throw new RestaurantNotFoundError();
		}

		// Ensure restaurant have admin access
		restaurant.ensureAdminAccess(input.userId);

		// Ensure table sectionId exists
		const tableSection =
			await this._tableSectionRepository.findTableSectionById(
				input.tableSectionId,
			);

		if (!tableSection) {
			throw new TableSectionNotFound();
		}

		if (tableSection.restaurantId !== restaurant.id) {
			throw new TableSectionNotFound();
		}

		// Ensure no tables are there for the section
		const countTablesWithTheSection =
			await this._tableRepository.countActiveBySectionId(tableSection.id);

		if (countTablesWithTheSection > 0) {
			throw new TableSectionInUseError();
		}

		await this._tableSectionRepository.deleteTableSection(tableSection.id);

		return { name: tableSection.sectionName, tableSectionId: tableSection.id };
	}
}
