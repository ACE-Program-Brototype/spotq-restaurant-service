import type { IUpdateTableInputDto } from "@application/dtos/table/update-table.dto";
import type { IUpdateTableUseCase } from "@application/ports/use-cases/table/update-table.use-case.port";
import { TYPES } from "@config/di/types";
import type { Table } from "@domain/entities/table.entity";
import { RestaurantNotFoundError } from "@domain/errors/restaurant.errors";
import {
	TableAlreadyExistsError,
	TableNotFoundError,
} from "@domain/errors/table.errors";
import { TableSectionNotFound } from "@domain/errors/table-section.errors";
import type { IRestaurantRepository } from "@domain/repositories/restaurant.repository.interface";
import type { ITableRepository } from "@domain/repositories/table.repository.interface";
import type { ITableSectionRepository } from "@domain/repositories/table-section.respository.interface";
import { inject, injectable } from "inversify";

@injectable()
export class UpdateTableUseCase implements IUpdateTableUseCase {
	constructor(
		@inject(TYPES.Repositories.TableRepository)
		private readonly tableRepo: ITableRepository,
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepo: IRestaurantRepository,
		@inject(TYPES.Repositories.TableSectionRepository)
		private readonly tableSectionRepo: ITableSectionRepository,
	) {}
	async execute(dto: IUpdateTableInputDto): Promise<Table> {
		// check if user belongs to the restaurant
		const restaurant = await this.restaurantRepo.findById(dto.restaurantId);

		if (!restaurant) {
			throw new RestaurantNotFoundError();
		}

		// ensures user have admin access to this restaurant
		restaurant.ensureAdminAccess(dto.userId);

		// ensures table exists
		const table = await this.tableRepo.findById(dto.tableId);

		if (!table) {
			throw new TableNotFoundError();
		}

		if (table.restaurantId !== dto.restaurantId) {
			throw new TableNotFoundError();
		}

		// Validate that the requested section exists and belongs to this restauarnt
		if (dto.sectionId !== undefined) {
			const tableSection = await this.tableSectionRepo.findById(dto.sectionId);

			if (!tableSection || tableSection.restaurantId !== dto.restaurantId) {
				throw new TableSectionNotFound();
			}
		}

		// Ensure that the updated table code is unique within the restaurant
		const tableCode = dto.tableCode?.trim();
		if (tableCode !== undefined && tableCode !== table.tableCode) {
			const existingTable = await this.tableRepo.findByTableCodeAndRestaurant(
				tableCode,
				dto.restaurantId,
			);
			console.log(11122333, existingTable)
			if (existingTable && existingTable.id !== dto.tableId) {
				throw new TableAlreadyExistsError();
			}
		}

		// Update only the fields provided inthe request

		table.update({
			sectionId: dto.sectionId,
			tableCode: tableCode,
			tableShape: dto.type,
			capacity: dto.capacity,
		});

		await this.tableRepo.save(table);

		return table;
	}
}
