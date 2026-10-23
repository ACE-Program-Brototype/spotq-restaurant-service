import type {
	GetTableDetailsInputDTO,
	GetTableDetailsOutputDTO,
} from "@application/dtos/table/get-table-details.dto";
import { ensureActiveRestaurantStaff } from "@application/helpers/ensure-active-restaurant-staff";
import type { IGetTableDetailsUseCase } from "@application/ports/use-cases/table/get-table-details.use-case.port";
import { TYPES } from "@config/di/types";
import { RestaurantNotFoundError } from "@domain/errors/restaurant.errors";
import { TableNotFoundError } from "@domain/errors/table.errors";
import type { IRestaurantRepository } from "@domain/repositories/restaurant.repository.interface";
import type { IRestaurantStaffRepository } from "@domain/repositories/restaurant-staff.repository.interface";
import type { ITableRepository } from "@domain/repositories/table.repository.interface";
import { inject, injectable } from "inversify";

@injectable()
export class GetTableDetailsUseCase implements IGetTableDetailsUseCase {
	constructor(
		@inject(TYPES.Repositories.TableRepository)
		private readonly _tableRepository: ITableRepository,
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly _restaurantRepository: IRestaurantRepository,
		@inject(TYPES.RestaurantStaffRepository)
		private readonly _staffRepository: IRestaurantStaffRepository,
	) {}
	async execute(
		input: GetTableDetailsInputDTO,
	): Promise<GetTableDetailsOutputDTO> {
		const { userId, restaurantId, tableId } = input;

		const restaurant = await this._restaurantRepository.findById(restaurantId);

		if (!restaurant) {
			throw new RestaurantNotFoundError();
		}

		restaurant.ensureOperationalAccess();

		if (restaurant.isAdmin(userId)) {
			restaurant.ensureAdminAccess(userId);
		} else {
			await ensureActiveRestaurantStaff(
				this._staffRepository,
				userId,
				restaurant.id,
			);
		}

		const tableWithSectionName =
			await this._tableRepository.findByIdWithSectionName(tableId);

		if (!tableWithSectionName) {
			throw new TableNotFoundError();
		}

		const { table, sectionName } = tableWithSectionName;

		if (table.restaurantId !== restaurant.id) {
			throw new TableNotFoundError();
		}

		return {
			tableId: table.id,
			restaurantId: table.restaurantId,
			sectionId: table.sectionId,
			sectionName,
			tableCode: table.tableCode,
			capacity: table.capacity,
			shape: table.tableShape,
			currentOccupancy: table.currentOccupancy,
			status: table.status,
			createdAt: table.createdAt.toISOString(),
		};
	}
}
