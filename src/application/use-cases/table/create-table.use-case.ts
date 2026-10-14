import type {
	ICreateTableInputDTO,
	ICreateTableOutputDTO,
} from "@application/dtos/table/create-table.dto";
import type { ICreateTableUseCase } from "@application/ports/use-cases/table/create-table.use-case.port";
import { TYPES } from "@config/di/types";
import { Table } from "@domain/entities/table.entity";
import { RestaurantNotFoundError } from "@domain/errors/restaurant.errors";
import { ForbiddenAccessError } from "@domain/errors/staff.errors";
import { TableAlreadyExistsError } from "@domain/errors/table.errors";
import { TableSectionNotFound } from "@domain/errors/table-section.errors";
import type { IRestaurantRepository } from "@domain/repositories/restaurant.repository.interface";
import type { ITableRepository } from "@domain/repositories/table.repository.interface";
import type { ITableSectionRepository } from "@domain/repositories/table-section.respository.interface";
import { inject, injectable } from "inversify";

@injectable()
export class CreateTableUseCase implements ICreateTableUseCase {
	constructor(
		@inject(TYPES.Repositories.TableRepository)
		private readonly tableRepo: ITableRepository,
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepo: IRestaurantRepository,
		@inject(TYPES.Repositories.TableSectionRepository)
		private readonly tableSectionRepo: ITableSectionRepository,
	) {}

	async execute(dto: ICreateTableInputDTO): Promise<ICreateTableOutputDTO> {
		// check if user belongs to the restaurant
		const restaurant = await this.restaurantRepo.findById(dto.restaurantId);

		if (!restaurant) {
			throw new RestaurantNotFoundError();
		}

		// is user restaurant admin
		// Checks by checking if restaurant.id == dto.userId
		// In Application Restaurant.id is same as restaurant admin userId from JWT
		if (restaurant.id !== dto.userId) {
			throw new ForbiddenAccessError();
		}

		// does table section exists
		const tableSection = await this.tableSectionRepo.findById(dto.sectionId);
		if (!tableSection) {
			throw new TableSectionNotFound();
		}

		// does this section exists in the restaurant
		if(tableSection.restaurantId !== restaurant.id){
			throw new TableSectionNotFound()
		}

		// is table already exists
		const existingTable = await this.tableRepo.findByTableNameAndRestaurant(
			dto.tableNumber,
			dto.restaurantId,
		);
		if (existingTable) {
			throw new TableAlreadyExistsError();
		}

		// creating table
		const table = Table.create({
			tableNumber: dto.tableNumber,
			tableShape: dto.tableType,
			restaurantId: restaurant.id,
			sectionId: tableSection.id,
			capacity: dto.capacity,
		});

		const tableResult = await this.tableRepo.create(table);

		// returns the output dto
		return {
			id: tableResult.id,
			tableNumber: tableResult.tableNumber,
			restaurantId: tableResult.restaurantId,
			capacity: tableResult.capacity,
			sectionId: tableResult.sectionId,
			type: tableResult.tableShape,
			isActive: tableResult.isActive,
			createdAt: tableResult.createdAt.toISOString(),
		};
	}
}
