import type {
	IUpdateTableStatusInputDTO,
	IUpdateTableStatusOutputDTO,
} from "@application/dtos/table/update-table-status.dto";
import { ensureActiveRestaurantStaff } from "@application/helpers/ensure-active-restaurant-staff";
import type { IUpdateTableStatusUseCase } from "@application/ports/use-cases/table/update-table-status.use-case.port";
import { TYPES } from "@config/di/types";
import { RestaurantNotFoundError } from "@domain/errors/restaurant.errors";
import { TableNotFoundError } from "@domain/errors/table.errors";
import type { IRestaurantRepository } from "@domain/repositories/restaurant.repository.interface";
import type { IRestaurantStaffRepository } from "@domain/repositories/restaurant-staff.repository.interface";
import type { ITableRepository } from "@domain/repositories/table.repository.interface";
import { inject, injectable } from "inversify";

@injectable()
export class UpdateTableStatusUseCase implements IUpdateTableStatusUseCase {
	constructor(
		@inject(TYPES.Repositories.TableRepository)
		private readonly _tableRepository: ITableRepository,
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly _restaurantRepository: IRestaurantRepository,
		@inject(TYPES.RestaurantStaffRepository)
		private readonly _staffRepository: IRestaurantStaffRepository,
	) {}

	async execute(
		input: IUpdateTableStatusInputDTO,
	): Promise<IUpdateTableStatusOutputDTO> {
		// Ensure restaurant exists
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

		// Ensure table exists
		const table = await this._tableRepository.findById(input.tableId);
		if (!table) {
			throw new TableNotFoundError();
		}

		// Ensure table belongs to the restaurant
		if (table.restaurantId !== restaurant.id) {
			throw new TableNotFoundError();
		}

		// Update Status
		table.transitionTo(input.status);

		await this._tableRepository.save(table);

		return {
			tableId: table.id,
			status: table.status,
			updatedAt: table.updatedAt.toISOString(),
		};
	}
}
