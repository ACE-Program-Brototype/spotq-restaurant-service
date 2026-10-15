import type {
	IGetTableInputDTO,
	IGetTablesGroupedOutputDTO,
	IGetTablesOutputDTO,
} from "@application/dtos/table/get-table.dto";
import type { IGetTableUseCase } from "@application/ports/use-cases/table/get-table.usecase.port";
import { TYPES } from "@config/di/types";
import {
	RestaurantAccountBlockedError,
	RestaurantNotFoundError,
} from "@domain/errors/restaurant.errors";
import {
	StaffInactiveError,
	StaffNotFoundError,
} from "@domain/errors/staff.errors";
import type { IRestaurantRepository } from "@domain/repositories/restaurant.repository.interface";
import type { IRestaurantStaffRepository } from "@domain/repositories/restaurant-staff.repository.interface";
import type {
	ITableRepository,
	TableFilterParams,
} from "@domain/repositories/table.repository.interface";
import { inject } from "inversify";

/**
 * Get Tables Data Based for Admin or Staff
 * Admin Would have pagination and will get array of Tables
 * Staff Would get record with key being sectionName and value being array of Table
 */
export class GetTableUseCase implements IGetTableUseCase {
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepo: IRestaurantRepository,
		@inject(TYPES.Repositories.TableRepository)
		private readonly tableRepo: ITableRepository,
		@inject(TYPES.RestaurantStaffRepository)
		private readonly staffRepo: IRestaurantStaffRepository,
	) {}
	async execute(
		dto: IGetTableInputDTO,
	): Promise<IGetTablesOutputDTO | IGetTablesGroupedOutputDTO> {
		const {
			restaurantId,
			page,
			limit,
			userId,
			sectionId,
			status,
			minCapacity,
		} = dto;
		const restaurant = await this.restaurantRepo.findById(restaurantId);

		if (!restaurant) {
			throw new RestaurantNotFoundError();
		}

		if (restaurant.isBlocked) {
			throw new RestaurantAccountBlockedError();
		}

		// if userId is same as restaurantId then its considered that the user is restaurantAdmin
		if (userId === restaurant.id) {
			const filter: TableFilterParams = {
				restaurantId,
				page,
				limit,
				sortBy: "tableCode",
				sortOrder: "asc",
				...(sectionId !== undefined && { sectionId }),
				...(status !== undefined && { status }),
				...(minCapacity !== undefined && { minCapacity }),
			};

			const { tables, total } =
				await this.tableRepo.findManyWithSection(filter);

			return {
				tables: tables.map((t) => ({
					id: t.table.id,
					tableCode: t.table.tableCode,
					capacity: t.table.capacity,
					status: t.table.status,
					sectionId: t.table.sectionId,
					tableShape: t.table.tableShape,
					sectionName: t.sectionName,
				})),
				total,
			};
		}

		// STAFF VALIDATION
		const staff = await this.staffRepo.findByStaffIdAndRestaurantId(
			userId,
			restaurant.id,
		);

		if (!staff) {
			throw new StaffNotFoundError();
		}

		if (!staff.isActive()) {
			throw new StaffInactiveError();
		}

		const sections = await this.tableRepo.findAllGroupedBySection(restaurantId);

		return {
			sections: Object.fromEntries(
				Object.entries(sections).map(([sectionName, tables]) => [
					sectionName,
					tables.map((table) => ({
						id: table.id,
						tableCode: table.tableCode,
						capacity: table.capacity,
						status: table.status,
						sectionId: table.sectionId,
						tableShape: table.tableShape,
						currentOccupancy: table.currentOccupancy,
						isActive: table.isActive,
					})),
				]),
			),
		};
	}
}
