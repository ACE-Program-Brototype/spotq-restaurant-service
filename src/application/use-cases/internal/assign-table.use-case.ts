import type { IAssignTableInputDTO } from "@application/dtos/internal/assign-table.dto";
import type { IAssignTableUseCase } from "@application/ports/use-cases/internal/assign-table.use-case.port";
import { TYPES } from "@config/di/types";
import {
	RestaurantAccountBlockedError,
	RestaurantNotFoundError,
} from "@domain/errors/restaurant.errors";
import { TableNotFoundError } from "@domain/errors/table.errors";
import type { IRestaurantRepository } from "@domain/repositories/restaurant.repository.interface";
import type { ITableRepository } from "@domain/repositories/table.repository.interface";
import { inject, injectable } from "inversify";

@injectable()
export class AssignTableUseCase implements IAssignTableUseCase {
	constructor(
		@inject(TYPES.Repositories.TableRepository)
		private readonly _tableRepository: ITableRepository,
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly _restaurantRepository: IRestaurantRepository,
	) {}
	async execute(input: IAssignTableInputDTO): Promise<void> {
		const restaurant = await this._restaurantRepository.findById(
			input.restaurantId,
		);
		if (!restaurant) {
			throw new RestaurantNotFoundError();
		}

		if (restaurant.isBlocked) {
			throw new RestaurantAccountBlockedError();
		}

		const tableIds = input.tables.map((t) => t.tableId);

		const tables = await this._tableRepository.findByIds(
			restaurant.id,
			tableIds,
		);

		if (tables.length !== input.tables.length) {
			throw new g();
		}

		for (const requestedTable of input.tables) {
			const table = tables.find((t) => t.id === requestedTable.tableId);

			if (!table) {
				throw new TableNotFoundError();
			}

			table.assignGuests(requestedTable.count);
		}

		await this._tableRepository.updateMany(tables);
	}
}
