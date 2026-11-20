import type {
	IReleaseTableInputDTO,
	IReleaseTableOutputDTO,
} from "@application/dtos/internal/release-table.dto";
import type { IReleaseTableUseCase } from "@application/ports/use-cases/internal/release-table.use-case.port";
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
export class ReleaseTableUseCase implements IReleaseTableUseCase {
	constructor(
		@inject(TYPES.Repositories.TableRepository)
		private readonly _tableRepository: ITableRepository,
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly _restaurantRepository: IRestaurantRepository,
	) {}
	async execute(input: IReleaseTableInputDTO): Promise<IReleaseTableOutputDTO> {
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

		if (tables.length !== tableIds.length) {
			throw new TableNotFoundError();
		}

		for (const requestedTable of input.tables) {
			const table = tables.find((t) => t.id === requestedTable.tableId);

			if (!table) {
				throw new TableNotFoundError();
			}

			table.releaseGuest(requestedTable.occupancyToRelease);
		}

		await this._tableRepository.updateMany(tables);

		return {
			releasedTables: tables.map((t) => ({
				tableId: t.id,
				status: t.status,
				currentOccupancy: t.currentOccupancy,
			})),
		};
	}
}
