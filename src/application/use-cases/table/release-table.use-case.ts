import type {
	ReleaseTableInputDTO,
	ReleaseTableResponseDTO,
} from "@application/dtos/table/release-table.dto";
import { ensureActiveRestaurantStaff } from "@application/helpers/ensure-active-restaurant-staff";
import { ReleaseTableMapper } from "@application/mappers/table/release-table.mapper";
import type { IReleaseTableUseCase } from "@application/ports/use-cases/table/release-table.use-case.port";
import { TYPES } from "@config/di/types";
import { RestaurantNotFoundError } from "@domain/errors/restaurant.errors";
import { TableNotFoundError } from "@domain/errors/table.errors";
import type { IRestaurantRepository } from "@domain/repositories/restaurant.repository.interface";
import type { IRestaurantStaffRepository } from "@domain/repositories/restaurant-staff.repository.interface";
import type { ITableRepository } from "@domain/repositories/table.repository.interface";
import { inject, injectable } from "inversify";

@injectable()
export class ReleaseTableUseCase implements IReleaseTableUseCase {
	constructor(
		@inject(TYPES.Repositories.TableRepository)
		private readonly _tableRepository: ITableRepository,
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly _restaurantRepository: IRestaurantRepository,
		@inject(TYPES.RestaurantStaffRepository)
		private readonly _staffRepository: IRestaurantStaffRepository,
	) {}

	async execute(input: ReleaseTableInputDTO): Promise<ReleaseTableResponseDTO> {
		const restaurant = await this._restaurantRepository.findById(
			input.restaurantId,
		);
		if (!restaurant) {
			throw new RestaurantNotFoundError();
		}

		restaurant.ensureOperationalAccess();

		if (restaurant.isAdmin(input.userId)) {
			restaurant.ensureAdminAccess(input.userId);
		} else {
			await ensureActiveRestaurantStaff(
				this._staffRepository,
				input.userId,
				input.restaurantId,
			);
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
			if (!table || table.restaurantId !== restaurant.id) {
				throw new TableNotFoundError();
			}

			table.releaseGuest(requestedTable.occupancyToRelease);
		}

		await this._tableRepository.updateMany(tables);

		return ReleaseTableMapper.toResponseDTO(tables);
	}
}
