import type { ICreateTableSectionInputDTO } from "@application/dtos/table-section/create-table-section.dto";
import type { ICreateTableSectionUseCase } from "@application/ports/use-cases/table-section/create-table-section.use-case.port";
import { TYPES } from "@config/di/types";
import { TableSection } from "@domain/entities/table-section.entity";
import { RestaurantNotFoundError } from "@domain/errors/restaurant.errors";
import { ForbiddenAccessError } from "@domain/errors/staff.errors";
import { TableSectionAlreadyExists } from "@domain/errors/table-section.errors";
import type { IRestaurantRepository } from "@domain/repositories/restaurant.repository.interface";
import type { ITableSectionRepository } from "@domain/repositories/table-section.respository.interface";
import { inject } from "inversify";

export class CreateTableSectionUseCase implements ICreateTableSectionUseCase {
	constructor(
		@inject(TYPES.Repositories.TableSectionRepository)
		private readonly tableSectionRepo: ITableSectionRepository,
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepo: IRestaurantRepository,
	) {}
	async execute(dto: ICreateTableSectionInputDTO): Promise<void> {
		// is user belongs to the restaurant
		const restaurant = await this.restaurantRepo.findById(dto.restaurantId);

		if (!restaurant) {
			throw new RestaurantNotFoundError();
		}

		// is user restaurant admin
		// Checks by checking if restaurant id === dto.userId
		if (restaurant.id !== dto.userId) {
			throw new ForbiddenAccessError();
		}

		// is table section exists
		const existingTableSection = await this.tableSectionRepo.findBySectionName(
			dto.name,
		);

		if (existingTableSection) {
			throw new TableSectionAlreadyExists();
		}

		// create table section
		const tableSection = TableSection.create({
			name: dto.name,
			restaurantId: dto.restaurantId,
		});

		await this.tableSectionRepo.createTableSection(tableSection);
	}
}
