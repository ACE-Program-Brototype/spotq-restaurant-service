import type { DeleteTableInput } from "@application/dtos/table/delete-table.dto";
import type { IDeleteTableUseCase } from "@application/ports/use-cases/table/delete-table.use-case.port";
import { TYPES } from "@config/di/types";
import { RestaurantNotFoundError } from "@domain/errors/restaurant.errors";
import {
	TableInUseError,
	TableNotFoundError,
} from "@domain/errors/table.errors";
import type { IRestaurantRepository } from "@domain/repositories/restaurant.repository.interface";
import type { ITableRepository } from "@domain/repositories/table.repository.interface";
import { inject, injectable } from "inversify";

@injectable()
export class DeleteTableUseCase implements IDeleteTableUseCase {
	constructor(
        @inject(TYPES.Repositories.TableRepository)
		private readonly _tableRepository: ITableRepository,
        @inject(TYPES.Repositories.RestaurantRepository)
		private readonly _restaurantRepository: IRestaurantRepository,
	) {}
	async execute(input: DeleteTableInput): Promise<void> {
		// Ensure restaurant exists
		const restaurant = await this._restaurantRepository.findById(
			input.restaurantId,
		);

		if (!restaurant) {
			throw new RestaurantNotFoundError();
		}

		// Check user have admin privileges
		restaurant.ensureAdminAccess(input.userId);

		// Check if table is Available
		const table = await this._tableRepository.findById(input.tableId);

		if (!table) {
			throw new TableNotFoundError();
		}

		// Check if table belongs to the restaurant
		if (table.restaurantId !== restaurant.id) {
			throw new TableNotFoundError();
		}

		if (!table.isAvailable()) {
			throw new TableInUseError();
		}

		// delete table
		await this._tableRepository.softDelete(table.id);
	}
}
