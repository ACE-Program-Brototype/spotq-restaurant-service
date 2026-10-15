import type {
	IGetTableInputDTO,
	IGetTablesGroupedOutputDTO,
	IGetTablesOutputDTO,
} from "@application/dtos/table/get-table.dto";
import type { IGetTableUseCase } from "@application/ports/use-cases/table/get-table.usecase.port";
import { TYPES } from "@config/di/types";
import { TABLE_MODE } from "@domain/constants/table.constants";
import { RestaurantNotFoundError } from "@domain/errors/restaurant.errors";
import type { IRestaurantRepository } from "@domain/repositories/restaurant.repository.interface";
import type { ITableRepository } from "@domain/repositories/table.repository.interface";
import { inject } from "inversify";

export class GetTableUseCase implements IGetTableUseCase {
	constructor(
		@inject(TYPES.Repositories.RestaurantRepository)
		private readonly restaurantRepo: IRestaurantRepository,
		@inject(TYPES.Repositories.TableRepository)
		private readonly tableRepo: ITableRepository,
	) {}
	async execute(
		dto: IGetTableInputDTO,
	): Promise<IGetTablesOutputDTO | IGetTablesGroupedOutputDTO> {
		const { restaurantId, userId, page, limit, mode } = dto;
		const restaurant = await this.restaurantRepo.findById(restaurantId);

		if (!restaurant) {
			throw new RestaurantNotFoundError();
		}

		restaurant.ensureAdminAccess(userId);

		if (mode === TABLE_MODE.ADMIN) {
			const { tables, total } = await this.tableRepo.findManyWithSection({
				restaurantId,
				page,
				limit,
				sortBy: "createdAt",
				sortOrder: "desc",
			});

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

		const sections = await this.tableRepo.findAllGroupedBySection(restaurantId);

		return { sections };
	}
}
